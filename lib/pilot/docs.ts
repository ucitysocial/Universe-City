// The guide's reading of the five Time documents.
//
// The five documents govern Folder 01 Time: Folder 01 Time, Operations, Developments, Curriculum, and Research. GitHub
// holds the copy that governs, in docs/systems. scripts/pilot-docs.mjs copies them into the app as text. The guide reads
// them through the read_time_document action: an outline, one section, or the lines that hold given words.
// Reading changes nothing and is not shown to the resident.

import { TIME_DOCS, type TimeDoc } from './time-docs';

export const DOC_KEYS = TIME_DOCS.map(d => d.key);
const CAP = 14000;

type Part = { level: number; heading: string; from: number; to: number };

function partsOf(doc: TimeDoc): Part[] {
  const lines = doc.text.split('\n');
  const heads: { level: number; heading: string; line: number }[] = [];
  lines.forEach((l, i) => {
    const m = /^(#{1,4})\s+(.+?)\s*$/.exec(l);
    if (m) heads.push({ level: m[1].length, heading: m[2].replace(/\*\*/g, '').trim(), line: i });
  });
  return heads.map((h, i) => {
    let end = lines.length;
    for (let j = i + 1; j < heads.length; j++) if (heads[j].level <= h.level) { end = heads[j].line; break; }
    return { level: h.level, heading: h.heading, from: h.line, to: end };
  });
}

const lineSlice = (doc: TimeDoc, from: number, to: number) => doc.text.split('\n').slice(from, to).join('\n').trim();
const clip = (s: string) => (s.length > CAP ? `${s.slice(0, CAP)}\n\n(The section goes on. Ask for one of its subsections to read the rest.)` : s);

export const docBy = (key: string) => TIME_DOCS.find(d => d.key === key) || null;

/** The headings of one document, three levels deep. */
export function outline(doc: TimeDoc): string[] {
  return partsOf(doc).filter(p => p.level <= 3).map(p => `${'  '.repeat(Math.max(0, p.level - 1))}${p.heading}`);
}

/**
 * One section, by its number (18, 6.4) or by words in its heading. A numbered paragraph inside a section, such as
 * 18.4 in the Curriculum, is found as well: the text runs from that paragraph to the next numbered paragraph.
 */
export function section(doc: TimeDoc, wanted: string): { heading: string; text: string } | null {
  const w = wanted.trim().replace(/\.$/, '');
  const parts = partsOf(doc);
  const num = /^\d+(\.\d+)*$/.test(w);
  const byNumber = num ? parts.find(p => new RegExp(`^${w.replace(/\./g, '\\.')}(\\.|\\s|$)`).test(p.heading)) : null;
  const byWords = byNumber || parts.find(p => p.heading.toLowerCase().includes(w.toLowerCase()));
  if (byWords) return { heading: byWords.heading, text: clip(lineSlice(doc, byWords.from, byWords.to)) };
  if (!num) return null;
  // A numbered paragraph: **18.4** or 18.4 at the start of a line.
  const lines = doc.text.split('\n');
  const starts = (l: string, n: string) => new RegExp(`^(\\*\\*)?${n.replace(/\./g, '\\.')}(\\*\\*)?\\s`).test(l);
  const at = lines.findIndex(l => starts(l, w));
  if (at < 0) return null;
  let end = lines.length;
  for (let i = at + 1; i < lines.length; i++) {
    if (/^#{1,4}\s/.test(lines[i]) || /^(\*\*)?\d+\.\d+(\.\d+)*(\*\*)?\s/.test(lines[i])) { end = i; break; }
  }
  const under = [...parts].reverse().find(p => p.from < at);
  return { heading: `${under ? `${under.heading}, ` : ''}paragraph ${w}`, text: clip(lineSlice(doc, at, end)) };
}

/** The lines of every document, or one, that hold each of the given words, with the heading they sit under. */
export function findIn(docs: TimeDoc[], query: string, limit = 12): { document: string; under: string; line: string }[] {
  const words = query.toLowerCase().split(/\s+/).filter(x => x.length > 1).slice(0, 8);
  if (!words.length) return [];
  const out: { document: string; under: string; line: string }[] = [];
  for (const doc of docs) {
    const parts = partsOf(doc);
    doc.text.split('\n').forEach((l, i) => {
      if (out.length >= limit) return;
      const low = l.toLowerCase();
      if (!l.trim() || !words.every(x => low.includes(x))) return;
      const under = [...parts].reverse().find(p => p.from <= i);
      out.push({ document: doc.key, under: under?.heading || doc.title, line: l.length > 400 ? `${l.slice(0, 400)} (the line goes on)` : l });
    });
  }
  return out;
}
