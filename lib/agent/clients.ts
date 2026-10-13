// Which clients an agent may open in the founder test.
//
// The founder set on October 13, 2026 that the Agent Portal opens her own File and the made up residents of the test,
// and nothing else. Row level security lets a login read only its own access row, so the made up residents are named
// here by id. Each one is checked against its own access row before it opens: it must be in the test list and marked
// made up. The ids are no secret. They point at made up people.

import { MEM_RESIDENTS } from '../pilot/memdb';
import { localMode } from '../pilot/local';

export const DEMO_CLIENTS = [
  'c91d4bae-0e22-4b6d-b6dd-ac9f7cfe0d3f',   // Dana, made up resident one
  '0631c812-4af8-4835-9d36-9b1847b3a30c'    // Marcus, made up resident two
];

export function demoClientIds(): string[] {
  return localMode() ? MEM_RESIDENTS : DEMO_CLIENTS;
}

export const VIEW_COOKIE = 'uc_agent_view';
