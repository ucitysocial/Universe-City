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
            <li><span className="rn">I</span><span>Time. A seven day operating schedule built out of conversation.</span></li>
            <li><span className="rn">II</span><span>Inventory. What runs out, what it costs, and when it is due again.</span></li>
            <li><span className="rn">III</span><span>Salary. What an hour of your work actually returns.</span></li>
            <li><span className="rn">IV</span><span>Standards. Your minimums, written down and dated.</span></li>
            <li><span className="rn">&#9733;</span><span>Fifteen minutes every week with your agent.</span></li>
          </ul>
          <Link className="btn" href="/join" style={{ marginTop: 30 }}>Join Universe City</Link>
          <p className="note">Cancel any time. Your record stays yours either way.</p>
        </div>
      </section>
      <section>
        <div className="wrap">
          <p className="kick">What is running today</p>
          <DeskCards />
        </div>
      </section>
    </>
  );
}
