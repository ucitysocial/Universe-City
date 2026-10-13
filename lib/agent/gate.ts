// Who may open the Agent Portal.
//
// For the founder test the agent is the founder: a login in the test list that may decide proposals for a person on
// the team, and that is no made up resident. The founder set this on October 13, 2026. The live client the portal
// opens is that same login's own File, so no agent reads any other resident's rows.

import { who, type Who } from '../pilot/auth';
import { localMode } from '../pilot/local';

export type AgentWho = Who | { ok: false; why: 'not_agent'; email: string | null };

export async function whoAgent(): Promise<AgentWho> {
  const w = await who({ own: true });
  if (!w.ok) return w;
  const agent = w.access.decides_proposals && (!w.access.synthetic || localMode());
  return agent ? w : { ok: false, why: 'not_agent', email: w.email };
}
