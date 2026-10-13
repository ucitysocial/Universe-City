import { admit } from '@/lib/pilot/auth';
import { isUuid, withResident, type Q } from '@/lib/pilot/db';

export const dynamic = 'force-dynamic';

type Step = {
  id: string; label: string; instructions: string | null; position: number;
  origin: 'resident' | 'agent_suggestion'; state: 'proposed' | 'ready' | 'done' | 'skipped' | 'rejected';
};
const enabled = () => process.env.PILOT_GUIDED_LIFE === '1';

async function load(q: Q, commitment: string) {
  const parent = (await q<{id:string;label:string;execution:string;on_date:string;completion:string|null;withdrawn_at:string|null}>(
    "select id,label,execution,on_date::text as on_date,completion,withdrawn_at::text as withdrawn_at from uc_pilot.commitments where id=$1",
    [commitment]
  ))[0];
  if (!parent) return null;
  const steps = await q<Step>(
    "select id,label,instructions,position,origin,state from uc_pilot.guided_steps where commitment_id=$1 order by position,id",
    [commitment]
  );
  const session = (await q<{state:'idle'|'active'|'paused'}>(
    "select state from uc_pilot.guided_sessions where commitment_id=$1", [commitment]
  ))[0]?.state || 'idle';
  return { parent, steps, session };
}

export async function GET(req: Request) {
  const a = await admit(req);
  if (a instanceof Response) return a;
  const commitment = new URL(req.url).searchParams.get('commitment') || '';
  if (!isUuid(commitment)) return Response.json({ error: 'Choose one commitment.' }, { status: 400 });
  if (!enabled()) return Response.json({ enabled: false, reason: 'Guided Life is available in preview until its database setup is complete.' });
  try {
    const data = await withResident({ userId:a.userId, actor:'resident' }, q => load(q,commitment));
    if (!data) return Response.json({ error:'That commitment is not in this File.' }, { status:404 });
    return Response.json({ enabled:true, ...data }, { headers: { 'cache-control':'no-store' } });
  } catch {
    return Response.json({ error:'Guided Life could not read the File. No change was made.' }, { status:503 });
  }
}

export async function POST(req: Request) {
  const a = await admit(req);
  if (a instanceof Response) return a;
  if (!enabled()) return Response.json({ error:'Guided Life changes are not enabled.' }, { status:503 });
  let b: any;
  try { b = await req.json(); } catch { return Response.json({ error:'The request was not understood.' }, { status:400 }); }
  const commitment=String(b?.commitment||'');
  if (!isUuid(commitment)) return Response.json({ error:'Choose one commitment.' }, { status:400 });
  const action=String(b?.action||'');
  const agent=b?.mode==='agent';
  if (agent && (!a.access.decides_proposals || action!=='add')) {
    return Response.json({ error:'The agent can prepare suggestions, not file resident progress.' }, { status:403 });
  }
  const actor=agent?'agent':'resident';
  try {
    const data=await withResident({userId:a.userId,actor,reason:agent?'Agent proposed a Guided Life step.':'Resident updated Guided Life.'},async q=>{
      const parent=(await q<{execution:string;withdrawn_at:string|null}>(
        'select execution,withdrawn_at::text as withdrawn_at from uc_pilot.commitments where id=$1 for update',[commitment]))[0];
      if(!parent) throw new Error('That commitment is not in this File.');
      if(parent.withdrawn_at) throw new Error('This commitment was withdrawn. Its steps stay on file.');
      if(action==='add'){
        const stepId=String(b?.stepId||'');
        const label=typeof b?.label==='string'?b.label.trim():'';
        const instructions=typeof b?.instructions==='string'?b.instructions.trim():'';
        if(!isUuid(stepId)||!label||label.length>220||instructions.length>2000)
          throw new Error('Enter a short step and try again.');
        const last=(await q<{position:number}>('select coalesce(max(position),-1) as position from uc_pilot.guided_steps where commitment_id=$1',[commitment]))[0];
        const position=Math.min(9999,Number(last?.position??-1)+1);
        await q(`insert into uc_pilot.guided_steps (id,commitment_id,position,label,instructions,origin,state)
          values ($1,$2,$3,$4,$5,$6,$7) on conflict(id) do nothing`,
          [stepId,commitment,position,label,instructions||null,agent?'agent_suggestion':'resident',agent?'proposed':'ready']);
      } else if(action==='decision'){
        if(agent) throw new Error('The resident decides whether a proposed step belongs.');
        const stepId=String(b?.stepId||''),state=String(b?.state||'');
        if(!isUuid(stepId)||!['ready','rejected'].includes(state)) throw new Error('Choose whether to keep that step.');
        await q("update uc_pilot.guided_steps set state=$3 where id=$1 and commitment_id=$2 and state='proposed'",[stepId,commitment,state]);
      } else if(action==='step'){
        if(agent) throw new Error('Only the resident can report step progress.');
        const stepId=String(b?.stepId||''),state=String(b?.state||'');
        if(!isUuid(stepId)||!['ready','done','skipped'].includes(state)) throw new Error('Choose an action for this step.');
        await q("update uc_pilot.guided_steps set state=$3 where id=$1 and commitment_id=$2 and state in ('ready','done','skipped')",[stepId,commitment,state]);
      } else if(action==='session'){
        if(agent) throw new Error('Only the resident can begin or pause the work.');
        const state=String(b?.state||'');
        if(!['idle','active','paused'].includes(state)) throw new Error('Choose how to continue.');
        await q(`insert into uc_pilot.guided_sessions(commitment_id,state) values($1,$2)
          on conflict(user_id,commitment_id) do update set state=excluded.state,changed_at=now()`,[commitment,state]);
      } else {
        throw new Error('That Guided Life action is not supported.');
      }
      return load(q,commitment);
    });
    return Response.json({ enabled:true,...data }, { headers:{'cache-control':'no-store'} });
  } catch(e:any){
    const msg=typeof e?.message==='string'?e.message:'Guided Life did not update the File.';
    const safe=/^That commitment|^This commitment|^Enter a short|^The resident|^Only the resident|^Choose|^That Guided Life/.test(msg);
    return Response.json({error:safe?msg:'Guided Life could not save the change. Nothing new was filed.'},{status:safe?400:503});
  }
}
