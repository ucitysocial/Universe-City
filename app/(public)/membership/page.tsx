import Link from 'next/link';
import DeskCards from '@/components/DeskCards';

export default function Membership() {
  return (
    <>
      <section>
        <div className="wrap">
          <p className="kick">Membership</p>
          <h1 style={{ marginTop: 12, maxWidth: '16ch' }}>One membership. One price.</h1>
          <div className="price" style={{ marginTop: 26 }}>
            <span className="n vt" style={{ color: 'var(--I)' }}>$48</span>
            <span className="lab" style={{ color: 'var(--dim)' }}>a month</span>
          </div>
          <ul className="rows" style={{ maxWidth: 'var(--text)' }}>
            <li><span className="rn">I</span><span><strong>Time.</strong> Your week, recorded and organized.</span></li>
            <li><span className="rn">II</span><span><strong>Inventory.</strong> Household needs, low items and replenishment.</span></li>
            <li><span className="rn">III</span><span><strong>Salary.</strong> Current income, actual costs, required income and desired income.</span></li>
            <li><span className="rn">IV</span><span><strong>Standards.</strong> Your rules, minimums and exceptions.</span></li>
            <li><span className="rn">&#9733;</span><span><strong>Weekly review.</strong> Fifteen minutes with your agent.</span></li>
          </ul>
          <Link className="btn" href="/join" style={{ marginTop: 30 }}>Start your file</Link>
          <p className="note">Cancel any time. Your record stays yours.</p>
        </div>
      </section>
      <section>
        <div className="wrap">
          <p className="kick">What is running now</p>
          <DeskCards />
        </div>
      </section>
    </>
  );
}
