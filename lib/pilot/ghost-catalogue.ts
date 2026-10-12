import type { Q } from './db';
import { DEFAULT_GHOSTS, type GhostTemplate, type MissingKey } from './ghosts';

export const MISSING_KEYS = ['sleep', 'morning', 'work', 'meals', 'night'] as const;
export const isMissingKey = (x: unknown): x is MissingKey => x === null || MISSING_KEYS.some(k => k === x);
export const isDefaultGhost = (key: string) => DEFAULT_GHOSTS.some(t => t.key === key);

export async function loadGhostCatalogue(q: Q): Promise<{ templates: GhostTemplate[]; ready: boolean }> {
  let rows: { key: string; label: string; ask: string; at: number; when_missing: MissingKey; enabled: boolean }[];
  try {
    rows = await q('select key, label, ask, at, when_missing, enabled from uc_pilot.ghost_suggestions order by at, key');
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    if (!/ghost_suggestions|42P01/.test(message)) throw e;
    return { templates: DEFAULT_GHOSTS, ready: false };
  }
  const byKey = new Map<string, GhostTemplate>(DEFAULT_GHOSTS.map(t => [t.key, t]));
  for (const r of rows) byKey.set(r.key, { key: r.key, label: r.label, ask: r.ask, at: r.at, whenMissing: r.when_missing, enabled: r.enabled });
  return { templates: [...byKey.values()].sort((a, b) => a.at - b.at || a.key.localeCompare(b.key)), ready: true };
}
