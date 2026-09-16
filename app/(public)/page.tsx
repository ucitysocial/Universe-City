import Link from 'next/link';
import DeskCards from '@/components/DeskCards';

export default function Home() {
  return (
    <>
      <section className="hero-section">
        <div className="wrap hero-copy">
          <h1>
            A life management agency for everyday people.
          </h1>
          <p className="lede">
            Universe City keeps a record of what is happening in your life. Four systems organize
            that record. Your agent reviews it with you every week.
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
            Four systems are included in membership.
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
            Your file changes as your life changes. Once a week, your agent reviews those changes
            with you and updates the record.
          </p>
          <ul className="rows">
            <li><span className="rn">01</span><span>Time changes when your schedule changes.</span></li>
            <li><span className="rn">02</span><span>Inventory changes when your household changes.</span></li>
            <li><span className="rn">03</span><span>Salary changes when your work or living costs change.</span></li>
            <li><span className="rn">04</span><span>Standards change when what you require changes.</span></li>
          </ul>
        </div>
      </section>

      <section className="membership-section">
        <div className="wrap membership-layout">
          <div className="membership-copy">
            <p className="kick">Membership</p>
            <h2>Membership includes four systems and one weekly review.</h2>
            <p>
              Time, Inventory, Salary and Standards are included. Your agent reviews the file with
              you for fifteen minutes each week.
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
