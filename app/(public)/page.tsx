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
            You start with one folder in each department. They are Time, Inventory, Salary and
            Standards. Your agent works across all four with you and reviews them every week.
          </p>
          <div className="hero-actions">
            <Link className="btn" href="/join">Start your file</Link>
            <Link className="btn ghost" href="/how-it-works">See how it works</Link>
          </div>
        </div>
      </section>

      <section className="systems-section">
        <div className="wrap">
          <p className="kick">Four folders</p>
          <h2 className="systems-heading">
            One folder in each department.
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
          <ul className="rows">
            <li><span className="rn">01</span><span>Your file changes as your life changes.</span></li>
            <li><span className="rn">02</span><span>Time changes with your schedule. Inventory changes with your home.</span></li>
            <li><span className="rn">03</span><span>Salary changes with your work. Standards change with what you require.</span></li>
            <li><span className="rn">04</span><span>Each week, your agent reviews the whole file with you and identifies what needs attention next.</span></li>
          </ul>
        </div>
      </section>

      <section className="membership-section">
        <div className="wrap membership-layout">
          <div className="membership-copy">
            <p className="kick">Membership</p>
            <h2>$48 a month includes four folders and one weekly review.</h2>
            <p>
              Time, Inventory, Salary and Standards are included. Your agent reviews all four with
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
