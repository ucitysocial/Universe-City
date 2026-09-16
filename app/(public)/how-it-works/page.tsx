import DeskCards from '@/components/DeskCards';
import { DEPARTMENTS } from '@/lib/domain/folders';

const DEPARTMENT_DESCRIPTIONS: Record<string, string> = {
  I: 'Understand your current situation.',
  II: 'Manage your living environment.',
  III: 'Expand your work options.',
  IV: 'Set your priorities.'
};

export default function HowItWorks() {
  return (
    <>
      <section>
        <div className="wrap">
          <p className="kick">How it works</p>
          <h1 style={{ marginTop: 12, maxWidth: '18ch' }}>Universe City starts with four folders.</h1>
          <p className="lede">
            Time, Inventory, Salary and Standards are one folder in each department. Your agent
            works across all four with you and keeps the information current as your life changes.
          </p>
        </div>
      </section>

      <section>
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

      <section className="dark">
        <div className="wrap">
          <p className="kick">The four departments</p>
          <ul className="rows">
            {DEPARTMENTS.map(d => (
              <li key={d.key}>
                <span className="rn" style={{ color: d.color, filter: 'brightness(2)' }}>{d.key}</span>
                <span><strong>{d.name}</strong>. {DEPARTMENT_DESCRIPTIONS[d.key]}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section>
        <div className="wrap prose">
          <p className="kick">Keeping them current</p>
          <h2 style={{ marginTop: 10 }}>Each folder is updated when the information inside it changes.</h2>
          <p style={{ marginTop: 18 }}>
            A new shift updates Time. A household purchase updates Inventory. A change in pay or
            living costs updates Salary. A new minimum updates Standards.
          </p>
        </div>
      </section>
    </>
  );
}
