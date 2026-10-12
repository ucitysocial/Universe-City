// The dashboard in the right part of the frame. It reads the File and keeps no entry.
//
// The founder set it on October 11, 2026: the conversation is home, and the dashboard sits at the right of every page.
// It shows what is happening now, one view the resident picks, and what waits for the resident. The views are the
// calendar for today and the six days after it, and the four departments. A department shows the folders the resident
// checked, and at first each folder that holds entries. Only folders that hold entries are read here.

import { FOLDERS } from '../domain/folders';
import { loadPanel, type FileIndex, type PanelView } from './browse';
import { DAY_FIT, loadCalendar, type CalItem } from './calendar';
import type { Q } from './db';
import { belongsTo } from './dept';
import { folderPath, TIME_PATH } from './paths';
import { loadIntake, type Intake } from './intake';
import { loadGhostCatalogue } from './ghost-catalogue';
import { ghostsOf, type Ghost } from './ghosts';
import { addDays, localNow } from './time';

export type BoardDay = { date: string; items: CalItem[] };
export type BoardLine = { key: string; href: string; title: string; sub: string };
export type BoardFolder = { name: string; dept: string; color: string; href: string; lines: BoardLine[] };
export type Board = { today: string; panel: PanelView; days: BoardDay[]; folders: BoardFolder[]; intake: Intake; ghosts: Ghost[] };

export async function loadBoard(q: Q, zone: string, ix: FileIndex): Promise<Board> {
  const today = localNow(zone).date;
  const panel = await loadPanel(q, zone);
  const cal = await loadCalendar(q, today, addDays(today, 6), today, DAY_FIT);
  const days = cal.days.map(d => ({ date: d.date, items: [...d.untimed, ...d.timed].sort((a, b) => (a.start ?? -1) - (b.start ?? -1)) }));

  const names = FOLDERS.filter(f => f.name !== 'Time')
    .filter(f => { const x = ix.folders[f.name]; return !!x && x.said + x.work + x.cal > 0; })
    .map(f => f.name);
  let folders: BoardFolder[] = [];
  if (names.length) {
    const ahead = await q<{ id: string; label: string; on_date: string; start_min: number | null; folder: string | null }>(
      `select id, label, on_date::text as on_date, start_min, folder from uc_pilot.commitments
        where withdrawn_at is null and on_date >= $1::date order by on_date, start_min nulls last limit 400`, [today]);
    const said = await q<{ id: string; topic: string; said: string; entry: string | null; folder: string }>(
      `select id, topic, said, entry, folder from uc_pilot.statements where state = 'current' and folder = any ($1::text[])
        order by created_at desc limit 400`, [names]);
    const day = (date: string) => new Date(`${date}T12:00:00Z`).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' });
    folders = names.map(name => ({
      name,
      dept: FOLDERS.find(f => f.name === name)!.dept,
      color: belongsTo(name, '').color,
      href: folderPath(name),
      lines: [
        ...ahead.filter(c => belongsTo(c.folder, c.label).folder === name).slice(0, 6)
          .map(c => ({ key: c.id, href: `${TIME_PATH}/${c.on_date}/${c.id}`, title: c.label, sub: c.on_date === today ? 'Today' : day(c.on_date) })),
        ...said.filter(s => s.folder === name).slice(0, 8)
          .map(s => ({ key: s.id, href: `${folderPath(name)}/said/${s.id}`, title: s.topic, sub: s.entry ?? (s.said.length > 140 ? `${s.said.slice(0, 140)} (more text follows)` : s.said) }))
      ]
    }));
  }
  const intake = await loadIntake(q, today);
  const catalogue = await loadGhostCatalogue(q);
  return { today, panel, days, folders, intake, ghosts: ghostsOf(intake, catalogue.templates) };
}
