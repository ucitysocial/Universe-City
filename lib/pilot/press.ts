// A press on the screen: the resident confirms or declines an item that waits for the resident, or a person who
// decides proposals in this test confirms or declines a proposal.
//
// The press and its line in the activity list are written in one transaction. A second press on an item that is
// already decided changes nothing, and the list keeps the first press alone.

import { withResident } from './db';
import type { Access } from './file';
import { clip } from './guard';
import { localNow } from './time';
import { decide, decideProposal, type Env, type Result } from './tools';

export async function press(userId: string, access: Access, id: string, decision: 'confirm' | 'decline', desk = false): Promise<Result> {
  return withResident({ userId, actor: desk ? 'agent' : 'resident' }, async q => {
    const env: Env = { q, userId, messageId: null, messageText: '', now: localNow(access.timezone), basis: 'resident_confirmation', via: 'screen' };
    const r = desk ? await decideProposal(env, id, decision) : await decide(env, id, decision);
    await q(
      `insert into uc_pilot.actions (tool, args, outcome, detail, brief, target, target_id, idem_key)
       values ($1, $2::jsonb, $3, $4, $5, $6, $7, $8) on conflict (user_id, idem_key) do nothing`,
      [desk ? 'desk_decision' : 'screen_decision', JSON.stringify({ id, decision }), r.outcome === 'unchanged' ? 'unchanged' : 'decided',
        clip(r.detail, 900), r.brief ? clip(r.brief, 300) : null, r.target || null, r.targetId || null, `screen:${id}`]);
    return r;
  });
}
