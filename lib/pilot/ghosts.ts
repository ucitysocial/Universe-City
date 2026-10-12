// Faded ideas are suggestions, never actual scheduled commitments.
// Agent Studio may maintain resident-scoped overrides without changing the user's File.
import type { Intake } from './intake';

export type MissingKey = 'sleep' | 'morning' | 'work' | 'meals' | 'night' | null;
export type GhostTemplate = {
  key: string; label: string; ask: string; at: number;
  whenMissing: MissingKey; enabled: boolean;
};
export type Ghost = { key: string; label: string; ask: string; at: number };

export const DEFAULT_GHOSTS: GhostTemplate[] = [
  { key: 'wake', label: 'Wake up', ask: 'Help me put my sleep and wake times on file.', at: -3, whenMissing: 'sleep', enabled: true },
  { key: 'morning', label: 'Morning routine', ask: 'Help me put my morning routine on file.', at: -2, whenMissing: 'morning', enabled: true },
  { key: 'work', label: 'Work schedule', ask: 'Help me put my work schedule on file.', at: 540, whenMissing: 'work', enabled: true },
  { key: 'meals', label: 'Meals', ask: 'Help me put my meal times on file.', at: 720, whenMissing: 'meals', enabled: true },
  { key: 'night', label: 'Night routine', ask: 'Help me put my night routine on file.', at: 1438, whenMissing: 'night', enabled: true },
  { key: 'bed', label: 'Bedtime', ask: 'Help me put my sleep and wake times on file.', at: 1439, whenMissing: 'sleep', enabled: true }
];

/** Null whenMissing means a general optional idea. Only conditions not yet on file display. */
export function ghostsOf(intake: Intake, templates: GhostTemplate[] = DEFAULT_GHOSTS): Ghost[] {
  const open = new Set(intake.items.filter(i => !i.done).map(i => i.key));
  return templates.filter(t => t.enabled && (t.whenMissing === null || open.has(t.whenMissing)))
    .sort((a, b) => a.at - b.at || a.label.localeCompare(b.label))
    .map(t => ({ key: t.key, label: t.label, ask: t.ask, at: t.at }));
}

/** Entries and suggestions are never conflated even when displayed in one order. */
export function withGhosts<T extends { start: number | null }>(items: T[], ghosts: Ghost[]): ({ item: T } | { ghost: Ghost })[] {
  const rows = [...items.map(item => ({ item, at: item.start ?? -1 })), ...ghosts.map(ghost => ({ ghost, at: ghost.at }))];
  return rows.sort((a, b) => a.at - b.at).map(r => 'item' in r ? { item: r.item } : { ghost: r.ghost });
}
