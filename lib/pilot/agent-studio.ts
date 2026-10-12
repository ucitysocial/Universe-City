// Founder-only Agent Studio. This is not a general multi-resident agent impersonation permission.
// The founder's test access must already explicitly allow agent decisions, and the site owner
// must enable the Studio for this deployment. A future staff console needs its own assignments.
import type { Who } from './auth';

export function canUseAgentStudio(w: Who): boolean {
  return w.ok &&
    w.access.decides_proposals === true &&
    process.env.PILOT_AGENT_STUDIO === '1';
}
