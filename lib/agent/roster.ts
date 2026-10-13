// The clients an agent serves in the founder test, each read from its own File.
//
// The list is the agent's own File and the made up residents of the test. Each made up resident is checked against its
// own access row before it is listed: it must be in the test list and marked made up.

import { withResident } from '../pilot/db';
import { loadAccess, type Access } from '../pilot/file';
import { demoClientIds } from './clients';
import { loadLiveClient } from './live';
import type { Client } from './types';

export async function roster(agentId: string, agentAccess: Access): Promise<Client[]> {
  const out: Client[] = [await loadLiveClient(agentId, agentAccess, { id: agentId, mode: 'live' })];
  for (const id of demoClientIds()) {
    if (id === agentId) continue;
    try {
      const access = await withResident({ userId: id, actor: 'resident' }, q => loadAccess(q));
      if (!access || !access.synthetic) continue;
      out.push(await loadLiveClient(id, access, { id, mode: 'demo' }));
    } catch { /* a client that does not load is left out of the list */ }
  }
  return out;
}

/** The short form the frame needs for the switcher. */
export type RosterRow = { id: string; name: string; mode: 'live' | 'demo'; waiting: number };
export const rows = (list: Client[]): RosterRow[] => list.map(c => ({ id: c.id, name: c.name, mode: c.mode, waiting: c.needs.length }));
