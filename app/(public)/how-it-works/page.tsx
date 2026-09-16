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
          <h1 style={{ marginTop: 12, maxWidth: '18ch' }}>Universe City keeps the record.</h1>
          <p className="lede">
            You tell Universe City what is happening. We record the information you establish.
            Your systems organize that record.
          </p>
        </div>
      </section>

      <section>
        <div className="wrap">
          <p className="kick">What is available now</p>
          <h2 style={{ marginTop: 10 }}>Four working systems.</h2>
          <DeskCards />
          <p className="note" style={{ marginTop: 26, maxWidth: 'var(--text)' }}>
            Universe City has 48 folders across four departments. Four are available in this
            version: Time, Inventory, Salary and Standards.
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
          <p className="kick">The record</p>
          <h2 style={{ marginTop: 10 }}>Confirmed information stays separate from estimates.</h2>
          <p style={{ marginTop: 18 }}>
            We do not invent times or turn estimates into observed facts. Changes that require
            interpretation are proposed before they become part of the record. Corrections keep
            their history.
          </p>
        </div>
      </section>
    </>
  );
}
