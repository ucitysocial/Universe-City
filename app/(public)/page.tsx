import Link from 'next/link';
import DeskCards from '@/components/DeskCards';

export default function Home() {
  return (
    <>
      <section className="hero-section">
        <div className="wrap hero-copy">
          <h1>
            Artists have teams. Athletes have teams.
          </h1>
          <p className="lede">
            Universe City is a life management agency for everyday people. We keep the record,
            organize four working systems, and review your file with you every week.
          </p>
          <div className="hero-actions">
            <Link className="btn" href="/join">Start your file</Link>
            <Link className="btn ghost" href="/how-it-works">See how it works</Link>
          </div>
        </div>
      </section>

      <section className="systems-section">
        <div className="wrap">
          <p className="kick">Four systems</p>
          <h2 className="systems-heading">
            Four systems are running now.
          </h2>
          <DeskCards />
        </div>
      </section>

      <section className="dark agent-section">
        <div className="wrap agent-copy">
          <p className="kick">Weekly review</p>
          <h2>
            Fifteen minutes a week with your agent.
          </h2>
          <p className="lede">
            Your agent reviews what changed, what is confirmed, what is still uncertain, and what
            needs attention next.
          </p>
          <ul className="rows">
            <li><span className="rn">01</span><span>The systems show what happened.</span></li>
            <li><span className="rn">02</span><span>The record shows what is known and what is still uncertain.</span></li>
            <li><span className="rn">03</span><span>Your agent reviews the file with you once a week.</span></li>
            <li><span className="rn">04</span><span>Corrections update the record without erasing history.</span></li>
          </ul>
        </div>
      </section>

      <section className="membership-section">
        <div className="wrap membership-layout">
          <div className="membership-copy">
            <p className="kick">Membership</p>
            <h2>One membership. Four systems. One weekly review.</h2>
            <p>
              Time, Inventory, Salary and Standards, plus one fifteen minute review every week
              with your agent.
            </p>
          </div>

          <div className="membership-price-card">
            <div className="price">
              <span className="n vt">$48</span>
              <span className="lab">a month</span>
            </div>
            <Link className="membership-cta" href="/join">Start your file</Link>
          </div>
        </div>
      </section>
    </>
  );
}
