'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { guidedProgress } from '@/lib/pilot/guided';

export type GuidedStep = {
  id:string; label:string; instructions:string|null; position:number;
  origin:'resident'|'agent_suggestion';
  state:'proposed'|'ready'|'done'|'skipped'|'rejected';
};
type Parent = { id:string;label:string;execution:string;on_date:string;completion:string|null;withdrawn_at:string|null };
type GuidedData = { enabled:boolean;parent:Parent|null;steps:GuidedStep[];session:'idle'|'active'|'paused' };
type Props = { commitmentId:string;label:string;mode?:'resident'|'agent';agentLink?:boolean;initialView?:'plan'|'guide' };
const newId=()=>crypto.randomUUID();
const firstData=(commitmentId:string,label:string):GuidedData=>({
  enabled:false,parent:{id:commitmentId,label,execution:'planned',on_date:'',completion:null,withdrawn_at:null},
  steps:[],session:'idle'
});
const nudge='What usually happens during this commitment?';

export default function PilotGuidedLife({commitmentId,label,mode='resident',agentLink=false,initialView='plan'}:Props) {
  const router=useRouter();
  const [data,setData]=useState<GuidedData>(()=>firstData(commitmentId,label));
  const [view,setView]=useState<'plan'|'guide'>(initialView);
  const [loading,setLoading]=useState(true);
  const [busy,setBusy]=useState(false);
  const [newLabel,setNewLabel]=useState('');
  const [newInstructions,setNewInstructions]=useState('');
  const [error,setError]=useState<string|null>(null);
  const [notice,setNotice]=useState<string|null>(null);
  const agent=mode==='agent';

  useEffect(()=>{
    let cancelled=false;
    setLoading(true);setError(null);
    fetch(`/api/pilot/guided?commitment=${encodeURIComponent(commitmentId)}`,{cache:'no-store'})
      .then(async res=>{const j=await res.json();if(!res.ok)throw new Error(j.error||'The plan did not load.');return j;})
      .then(j=>{if(!cancelled)setData(j.enabled?j:firstData(commitmentId,label));})
      .catch(e=>{if(!cancelled)setError(e instanceof Error?e.message:'The plan did not load.');})
      .finally(()=>{if(!cancelled)setLoading(false);});
    return ()=>{cancelled=true};
  },[commitmentId,label]);

  const approved=useMemo(()=>data.steps.filter(s=>s.state==='ready'||s.state==='done'||s.state==='skipped'),[data.steps]);
  const proposed=data.steps.filter(s=>s.state==='proposed');
  const progress=guidedProgress(data.steps);
  const done=progress.done;
  const handled=progress.handled;
  const active=approved.find(s=>s.id===progress.currentId);
  const pct=progress.percentHandled;

  async function act(action:'add'|'decision'|'step'|'session', values:Record<string,unknown>) {
    if(busy)return;
    setBusy(true);setError(null);setNotice(null);
    if(!data.enabled) {
      setData(old=>{
        if(action==='add') {
          return {...old,steps:[...old.steps,{id:String(values.stepId),position:old.steps.length,
            label:String(values.label),instructions:String(values.instructions||'')||null,
            origin:agent?'agent_suggestion':'resident',state:agent?'proposed':'ready'}]};
        }
        if(action==='session')return {...old,session:values.state as GuidedData['session']};
        return {...old,steps:old.steps.map(s=>s.id!==values.stepId?s:{...s,state:values.state as GuidedStep['state']})};
      });
      setNotice('Preview updated. Nothing was saved to your File.');
      setBusy(false);return;
    }
    try {
      const r=await fetch('/api/pilot/guided',{method:'POST',headers:{'content-type':'application/json'},
        body:JSON.stringify({commitment:commitmentId,mode,action,...values})});
      const j=await r.json();
      if(!r.ok)throw new Error(j.error||'The change was not saved.');
      setData(j);
      setNotice('Guided Life updated on your File.');
      router.refresh();
    } catch(e){setError(e instanceof Error?e.message:'The change was not saved.');}
    finally{setBusy(false)}
  }

  async function add(e:React.FormEvent) {
    e.preventDefault();
    const title=newLabel.trim(),instructions=newInstructions.trim();
    if(!title||title.length>220)return;
    await act('add',{stepId:newId(),label:title,instructions});
    setNewLabel('');setNewInstructions('');
  }

  const hidden=data.steps.filter(s=>s.state==='rejected');
  return (
    <section className="gl" aria-label="Guided Life">
      <header className="gl-header">
        <div><p className="gl-overline">{agent?'AGENT SUPPORT':'YOUR COMMITMENT'} / GUIDED LIFE</p>
          <h2>{label}</h2><p className="gl-muted">{agent?'Help prepare the steps. The resident reports their own progress.':'A plan for carrying out this commitment, at your own pace.'}</p>
        </div>
        {agentLink&&<Link className="gl-link" href={`/portal/agent-guided/${commitmentId}`}>Agent view →</Link>}
      </header>
      {!data.enabled&&<div className="gl-preview" role="status"><strong>Interactive preview.</strong> These steps are local to this screen. They are not yet saved or synced to your File.</div>}
      {loading&&<p className="gl-muted">Opening Guided Life…</p>}
      {error&&<p role="alert" className="pt-err">{error}</p>}
      {notice&&<p role="status" className="gl-notice">{notice}</p>}
      <div className="gl-tabs" role="group" aria-label="Guided Life view">
        <button type="button" className={view==='plan'?'sel':''} onClick={()=>setView('plan')}>Task plan <span>{approved.length}</span></button>
        <button type="button" className={view==='guide'?'sel':''} onClick={()=>setView('guide')}>Guided session</button>
      </div>
      <div className="gl-progress">
        <div><span>Reported step progress</span><strong>{done} of {approved.length} done{approved.some(s=>s.state==='skipped')?' · some skipped':''}</strong></div>
        <div className="gl-progress-track" role="progressbar" aria-label="Steps handled" aria-valuenow={handled} aria-valuemin={0} aria-valuemax={approved.length||1}>
          <div style={{width:`${pct}%`}}/>
        </div>
        <p className="gl-muted">Step progress does not decide whether the whole commitment is complete.</p>
      </div>

      {view==='plan'&&<div className="gl-plan">
        {data.steps.length===0&&!loading&&<div className="gl-question">
          <strong>Build the sequence together</strong>
          <p>{nudge}</p>
          <p className="gl-muted">You can begin with a single step. The plan can grow as you work.</p>
        </div>}
        {proposed.length>0&&<div className="gl-proposed">
          <h3>Suggested steps · Waiting for resident</h3>
          {proposed.map(s=><div className="gl-step" key={s.id}>
            <span className="gl-step-num">?</span><div className="gl-step-copy">
              <strong>{s.label}</strong>{s.instructions&&<p>{s.instructions}</p>}
              <small>Agent suggestion · Not yet part of the resident's plan</small>
            </div>
            {!agent&&<div className="gl-actions">
              <button disabled={busy} onClick={()=>act('decision',{stepId:s.id,state:'ready'})}>Keep</button>
              <button disabled={busy} className="light" onClick={()=>act('decision',{stepId:s.id,state:'rejected'})}>Decline</button>
            </div>}
          </div>)}
        </div>}
        {approved.length>0&&<ol className="gl-step-list">
          {approved.map((s,i)=><li className="gl-step" key={s.id}>
            <span className="gl-step-num">{i+1}</span><div className="gl-step-copy">
              <strong className={s.state==='done'?'done':''}>{s.label}</strong>
              {s.instructions&&<p>{s.instructions}</p>}
              <small>{s.origin==='agent_suggestion'?'Agent suggested · Resident accepted':'Resident added'} · {s.state==='done'?'Done':s.state==='skipped'?'Skipped':'To do'}</small>
            </div>
            {!agent&&<div className="gl-actions">
              {s.state!=='done'&&<button disabled={busy} onClick={()=>act('step',{stepId:s.id,state:'done'})}>Done</button>}
              {s.state!=='ready'&&<button className="light" disabled={busy} onClick={()=>act('step',{stepId:s.id,state:'ready'})}>Undo</button>}
              {s.state==='ready'&&<button className="light" disabled={busy} onClick={()=>act('step',{stepId:s.id,state:'skipped'})}>Skip</button>}
            </div>}
          </li>)}
        </ol>}
        <form className="gl-add" onSubmit={e=>void add(e)}>
          <h3>{agent?'Suggest a step':'Add a step'}</h3>
          <label htmlFor={agent?'gl-agent-label':'gl-res-label'}>What needs to happen?</label>
          <input id={agent?'gl-agent-label':'gl-res-label'} value={newLabel} maxLength={220}
            onChange={e=>setNewLabel(e.target.value)} placeholder={agent?'A step to offer the resident':'For example, gather the materials'}/>
          <label htmlFor={agent?'gl-agent-how':'gl-res-how'}>Helpful instructions (optional)</label>
          <textarea id={agent?'gl-agent-how':'gl-res-how'} value={newInstructions} maxLength={2000} rows={2}
            onChange={e=>setNewInstructions(e.target.value)} placeholder="Only what is known or confirmed about this task."/>
          <button disabled={busy||!newLabel.trim()} className="pt-btn" type="submit">
            {agent?'Prepare suggested step':'Add to my plan'}
          </button>
          {agent&&<p className="gl-muted">A suggested step appears for resident approval. No work is marked done.</p>}
        </form>
        {hidden.length>0&&<p className="gl-muted">{hidden.length} declined suggestion{hidden.length===1?'':'s'} kept in history.</p>}
      </div>}

      {view==='guide'&&<div className="gl-guide">
        {agent&&<div className="gl-question">
          <strong>Support the resident's current work</strong>
          <p>{active?active.label:approved.length?'The current step sequence has no remaining to-do steps.':'There are no accepted steps yet.'}</p>
          <p className="gl-muted">Use Task plan to prepare a relevant question or propose another step. The resident controls the work.</p>
          <Link className="gl-link" href="/portal/home">Open the conversation →</Link>
        </div>}
        {!agent&&<div className="gl-now">
          <p className="gl-overline">{data.session==='paused'?'PAUSED':data.session==='active'?'CURRENT ACTION':'READY WHEN YOU ARE'}</p>
          <h3>{active?active.label:approved.length?'All available steps handled':'What should we begin with?'}</h3>
          <p>{active?.instructions||'Work through one action at a time. You can pause or adjust your plan.'}</p>
          <div className="gl-actions">
            {data.session!=='active'&&<button disabled={busy||!active} onClick={()=>act('session',{state:'active'})}>
              {data.session==='paused'?'Resume':'Start Guided Life'}
            </button>}
            {data.session==='active'&&<button disabled={busy} className="light" onClick={()=>act('session',{state:'paused'})}>Pause</button>}
            {data.session==='active'&&active&&<button disabled={busy} onClick={()=>act('step',{stepId:active.id,state:'done'})}>Done · Next</button>}
            {data.session==='active'&&active&&<button disabled={busy} className="light" onClick={()=>act('step',{stepId:active.id,state:'skipped'})}>Skip step</button>}
          </div>
        </div>}
        <p className="gl-muted">The current step is the first accepted, unfinished action. Pausing does not change the calendar block or its outcome.</p>
      </div>}
    </section>
  );
}
