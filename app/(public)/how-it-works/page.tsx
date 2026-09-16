import DeskCards from '@/components/DeskCards';
import { DEPARTMENTS, LIVE_FOLDERS } from '@/lib/domain/folders';

const DEPARTMENT_DESCRIPTIONS: Record<string, string> = {
  I: 'Understand your current situation.',
  II: 'Manage your living environment.',
  III: 'Expand your work options.',
  IV: 'Set your priorities.'
};

const FOLDER_CHANGE_COPY: Record<string, string> = {
  I: 'Time changes with your schedule.',
  II: 'Inventory changes with your home.',
  III: 'Salary changes with your work.',
  IV: 'Standards change with what you require.'
};

export default function HowItWorks() {
  return (
    <>
      <section className="how-hero">
        <div className="wrap">
          <p className="kick">How it works</p>
          <h1 style={{ marginTop: 12, maxWidth: '18ch' }}>Universe City starts with four folders.</h1>
          <p className="lede">
            Time, Inventory, Salary and Standards are one folder in each department. Your agent
            works across all four with you and keeps the information current as your life changes.
          </p>
        </div>
      </section>

      <section className="how-folders-section">
        <div className="wrap">
          <p className="kick">Four folders</p>
          <h2 style={{ marginTop: 10 }}>One in each department.</h2>
          <DeskCards />
          <p className="note" style={{ marginTop: 26, maxWidth: 'var(--text)' }}>
            Universe City has 48 folders across four departments. Time, Inventory, Salary and
            Standards are available in this version.
          </p>
        </div>
      </section>

      <section className="how-departments-section">
        <div className="wrap">
          <p className="kick">Four departments</p>
          <h2 style={{ marginTop: 10, maxWidth: '25ch' }}>Each folder belongs to one department and changes as your life changes.</h2>
          <div className="how-department-grid">
            {DEPARTMENTS.map(d => {
              const folder = LIVE_FOLDERS.find(f => f.dept === d.key);
              return (
                <article className="how-department-card" style={{ background: d.color }} key={d.key}>
                  <div className="how-department-number">{d.key}</div>
                  <div>
                    <h3>{d.name}</h3>
                    <p className="how-department-description">{DEPARTMENT_DESCRIPTIONS[d.key]}</p>
                    {folder && (
                      <div className="how-department-folder">
                        <span>Folder 01 · {folder.name}</span>
                        <p>{FOLDER_CHANGE_COPY[d.key]}</p>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <style>{`
        .how-hero{background:var(--hero)}
        .how-folders-section{background:#fff}
        .how-departments-section{background:var(--paper)}

        .how-department-grid{
          display:grid;
          grid-template-columns:repeat(2,minmax(0,1fr));
          gap:18px;
          margin-top:34px;
        }
        .how-department-card{
          color:#fff;
          min-height:240px;
          padding:26px;
          display:grid;
          grid-template-columns:56px 1fr;
          gap:18px;
          border:2px solid var(--ink);
          box-shadow:4px 4px 0 var(--ink);
        }
        .how-department-number{
          font-family:'VT323',monospace;
          font-size:42px;
          line-height:1;
          opacity:.9;
        }
        .how-department-card h3{
          font-size:25px;
          margin-top:0;
          color:#fff;
        }
        .how-department-description{
          margin-top:14px;
          max-width:34ch;
          font-size:16px;
        }
        .how-department-folder{
          margin-top:24px;
          padding-top:14px;
          border-top:1px solid rgba(255,255,255,.42);
        }
        .how-department-folder>span{
          display:block;
          font-size:11px;
          font-weight:700;
          letter-spacing:.1em;
          text-transform:uppercase;
        }
        .how-department-folder p{
          margin-top:7px;
          font-size:15px;
          line-height:1.45;
        }

        @media (max-width:760px){
          .how-department-grid{grid-template-columns:1fr}
          .how-department-card{min-height:0;padding:22px;grid-template-columns:42px 1fr}
          .how-department-number{font-size:34px}
        }
      `}</style>
    </>
  );
}
