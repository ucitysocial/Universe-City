import Link from 'next/link';
import DeskCards from '@/components/DeskCards';

export default function HowItWorks() {
  return (
    <>
      <section>
        <div className="wrap">
          <p className="kick">How it works</p>
          <h1 style={{ maxWidth: '17ch' }}>Universe City starts with four folders.</h1>
          <p className="lede" style={{ maxWidth: 'var(--text)' }}>
            Time, Inventory, Salary and Standards start together, one in each department. Your
            agent works across all four and keeps the information current as your life changes.
          </p>
          <Link className="btn" href="/join" style={{ marginTop: 28 }}>Apply</Link>
        </div>
      </section>

      <section>
        <div className="wrap">
          <p className="kick">Four folders</p>
          <h2 style={{ marginTop: 10 }}>The starting file.</h2>
          <DeskCards />
          <p className="note" style={{ marginTop: 24 }}>Each department contains twelve folders. The full agency has forty-eight.</p>
        </div>
      </section>

      <section>
        <div className="wrap">
          <p className="kick">Departments</p>
          <h2 style={{ marginTop: 10 }}>Four areas of work.</h2>
          <div className="department-grid" style={{ marginTop: 28 }}>
            <article className="department-card pa">
              <p className="department-number">I</p>
              <h3>Agency Assessment</h3>
              <p>Understand your current situation.</p>
              <div className="folder-01"><span>Folder 01</span><strong>Time</strong><p>Establish and maintain your calendar.</p></div>
            </article>
            <article className="department-card hs">
              <p className="department-number">II</p>
              <h3>Housing Stability</h3>
              <p>Manage your living environment.</p>
              <div className="folder-01"><span>Folder 01</span><strong>Inventory</strong><p>Maintain the household items you normally need available.</p></div>
            </article>
            <article className="department-card cd">
              <p className="department-number">III</p>
              <h3>Career Development</h3>
              <p>Expand your work options.</p>
              <div className="folder-01"><span>Folder 01</span><strong>Salary</strong><p>Maintain a working view of income and regular expenses.</p></div>
            </article>
            <article className="department-card lm">
              <p className="department-number">IV</p>
              <h3>Life Management</h3>
              <p>Set your priorities.</p>
              <div className="folder-01"><span>Folder 01</span><strong>Standards</strong><p>Record the rules you confirm and why they matter.</p></div>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}
