import Link from 'next/link';
import DeskCards from '@/components/DeskCards';

export default function Membership() {
  return (
    <>
      <section>
        <div className="wrap">
          <p className="kick">Membership</p>
          <h1 style={{ marginTop: 12, maxWidth: '16ch' }}>$48 a month.</h1>
          <p className="lede" style={{ maxWidth: 'var(--text)' }}>
            Membership includes Time, Inventory, Salary and Standards, plus one fifteen minute
            review with your agent every week.
          </p>
          <ul className="rows" style={{ maxWidth: 'var(--text)' }}>
            <li><span className="rn">I</span><span><strong>Time.</strong> Your week, recorded and organized.</span></li>
            <li><span className="rn">II</span><span><strong>Inventory.</strong> What you own, what is low and what needs replacing.</span></li>
            <li><span className="rn">III</span><span><strong>Salary.</strong> Your income, your costs and what an hour of work returns.</span></li>
            <li><span className="rn">IV</span><span><strong>Standards.</strong> Your minimums, exceptions and the date each standard was set.</span></li>
            <li><span className="rn">&#9733;</span><span><strong>Weekly review.</strong> Fifteen minutes with your agent.</span></li>
          </ul>
          <Link className="btn" href="/join" style={{ marginTop: 30 }}>Start your file</Link>
          <p className="note">Cancel any time. Your file stays on record.</p>
        </div>
      </section>
      <section>
        <div className="wrap">
          <p className="kick">Four systems</p>
          <h2 style={{ marginTop: 10 }}>What you work on each week.</h2>
          <DeskCards />
        </div>
      </section>
    </>
  );
}
