import DeskCards from '@/components/DeskCards';
import { DEPARTMENTS, LIVE_FOLDERS } from '@/lib/domain/folders';

const DEPARTMENT_DESCRIPTIONS: Record<string, string> = {
  I: 'Understand your current situation.',
  II: 'Manage your living environment.',
  III: 'Expand your work options.',
  IV: 'Set your priorities.'
};

const CHANGE_EXAMPLES: Record<string, string> = {
  I: 'A new shift changes Time.',
  II: 'A household purchase changes Inventory.',
  III: 'A change in pay or living costs changes Salary.',
  IV: 'A new minimum changes Standards.'
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
          <h2 style={{ marginTop: 10 }}>Each folder belongs to one department.</h2>
          <div className="how-department-grid">
            {DEPARTMENTS.map(d => {
              const folder = LIVE_FOLDERS.find(f => f.dept === d.key);
              return (
                <article className="how-department-card" style={{ background: d.color }} key={d.key}>
                  <div className="how-department-number">{d.key}</div>
                  <div>
                    <p className="how-department-label">Department</p>
                    <h3>{d.name}</h3>
                    <p className="how-department-description">{DEPARTMENT_DESCRIPTIONS[d.key]}</p>
                    {folder && <p className="how-department-folder">Folder 01 · {folder.name}</p>}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="how-current-section">
        <div className="wrap">
          <p className="kick">Keeping them current</p>
          <h2 style={{ marginTop: 10, maxWidth: '24ch' }}>The folders change when the information inside them changes.</h2>
          <div className="how-change-grid">
            {DEPARTMENTS.map(d => (
              <div className="how-change-card" style={{ borderTopColor: d.color }} key={d.key}>
                <span className="how-change-number" style={{ color: d.color }}>{d.key}</span>
                <p>{CHANGE_EXAMPLES[d.key]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        .how-hero{background:var(--hero)}
        .how-folders-section{background:#fff}
        .how-departments-section{background:var(--paper)}
        .how-current-section{background:#fff}

        .how-department-grid{
          display:grid;
          grid-template-columns:repeat(2,minmax(0,1fr));
          gap:18px;
          margin-top:34px;
        }
        .how-department-card{
          color:#fff;
          min-height:220px;
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
        .how-department-label{
          font-size:10px;
          font-weight:700;
          letter-spacing:.18em;
          text-transform:uppercase;
          opacity:.68;
        }
        .how-department-card h3{
          font-size:25px;
          margin-top:5px;
          color:#fff;
        }
        .how-department-description{
          margin-top:14px;
          max-width:34ch;
          font-size:16px;
        }
        .how-department-folder{
          margin-top:24px;
          padding-top:12px;
          border-top:1px solid rgba(255,255,255,.4);
          font-size:12px;
          font-weight:700;
          letter-spacing:.08em;
          text-transform:uppercase;
        }

        .how-change-grid{
          display:grid;
          grid-template-columns:repeat(4,minmax(0,1fr));
          gap:14px;
          margin-top:32px;
        }
        .how-change-card{
          border:1px solid var(--rule);
          border-top:7px solid;
          background:var(--paper);
          padding:18px;
          min-height:132px;
        }
        .how-change-number{
          display:block;
          font-family:'VT323',monospace;
          font-size:24px;
          line-height:1;
          margin-bottom:14px;
        }
        .how-change-card p{font-size:14px;line-height:1.5}

        @media (max-width:760px){
          .how-department-grid{grid-template-columns:1fr}
          .how-department-card{min-height:0;padding:22px;grid-template-columns:42px 1fr}
          .how-department-number{font-size:34px}
          .how-change-grid{grid-template-columns:1fr 1fr}
        }
        @media (max-width:480px){
          .how-change-grid{grid-template-columns:1fr}
        }
      `}</style>
    </>
  );
}
