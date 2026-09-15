import { DEPARTMENTS, LIVE_FOLDERS, deptOf } from '@/lib/domain/folders';

export default function DeskCards() {
  return (
    <div className="grid4">
      {LIVE_FOLDERS.map(f => {
        const d = deptOf(f.dept);
        return (
          <article key={f.name} className="deskcard" style={{ borderLeft: `8px solid ${d.color}` }}>
            <div className="top" style={{ background: d.color }}>
              <span className="rn">{f.dept}</span>
              <span className="nm">{f.name}</span>
            </div>
            <div className="in">
              <p className="kick">{d.name}</p>
              <h3 style={{ marginTop: 4 }}>{f.system}</h3>
              <p className="sys">{copy[f.name]}</p>
              <p className="q"><em>{f.question}?</em></p>
            </div>
          </article>
        );
      })}
    </div>
  );
}

const copy: Record<string, string> = {
  Time: 'Where your time actually goes, and what is already committed.',
  Inventory: 'What your household needs, what is running low, and what keeps getting replaced.',
  Salary: 'What your work returns against what your life costs and what you want to earn.',
  Standards: 'The rules and minimums you set for your own life, written down and dated.'
};
