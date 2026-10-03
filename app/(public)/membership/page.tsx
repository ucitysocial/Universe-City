import Link from 'next/link';
import DeskCards from '@/components/DeskCards';

export default function Membership() {
  return (
    <>
      <section>
        <div className="wrap">
          <p className="kick">Membership</p>
          <h1 style={{ marginTop: 12, maxWidth: '16ch' }}>$48.</h1>
          <p className="lede" style={{ maxWidth: 'var(--text)' }}>
            Membership includes Time, Inventory, Salary and Standards, plus one fifteen minute
            review with your agent every week.
          </p>
          <ul className="rows" style={{ maxWidth: 'var(--text)' }}>
            <li><span className="rn">I</span><span><strong>Time.</strong> Your agent establishes and maintains your calendar.</span></li>
            <li><span className="rn">II</span><span><strong>Inventory.</strong> Your agent maintains the household items you normally need available.</span></li>
            <li><span className="rn">III</span><span><strong>Salary.</strong> Your agent maintains a working view of income and regular expenses.</span></li>
            <li><span className="rn">IV</span><span><strong>Standards.</strong> Your agent records the rules you confirm, why they matter and the impact you expect.</span></li>
            <li><span className="rn">&#9733;</span><span><strong>Weekly review.</strong> Fifteen minutes with your agent.</span></li>
          </ul>
          <Link className="btn" href="/join" style={{ marginTop: 30 }}>Apply</Link>
          <p className="note">Cancel any time. Your file stays on record.</p>
        </div>
      </section>
      <section>
        <div className="wrap">
          <p className="kick">Four folders</p>
          <h2 style={{ marginTop: 10 }}>One folder in each department.</h2>
          <DeskCards />
        </div>
      </section>
    </>
  );
}
