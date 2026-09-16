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
            You are running a whole life by yourself. Universe City is an agency for everyday
            people. You get four working systems and a real person who holds your file.
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
            Nothing here is advice. Every one of them leaves you something.
          </h2>
          <DeskCards />
        </div>
      </section>

      <section className="dark agent-section">
        <div className="wrap agent-copy">
          <p className="kick">The part that is not software</p>
          <h2>
            Fifteen minutes a week with your agent.
          </h2>
          <p className="lede">
            A person reads your file, not a dashboard. We go through what changed, what is still
            a guess, and what to do about it. Software keeps the record between those conversations.
          </p>
          <ul className="rows">
            <li><span className="rn">01</span><span>You tell us about your week, in your own words.</span></li>
            <li><span className="rn">02</span><span>It goes on file as what it is. Observed, planned, or still an estimate.</span></li>
            <li><span className="rn">03</span><span>Once a week we sit down for fifteen minutes and work out what it means.</span></li>
            <li><span className="rn">04</span><span>Nothing is ever recorded that you did not say.</span></li>
          </ul>
        </div>
      </section>

      <section className="membership-section">
        <div className="wrap membership-layout">
          <div className="membership-copy">
            <p className="kick">Membership</p>
            <h2>One membership. Four systems. One weekly review.</h2>
            <p>
              Time, Inventory, Salary and Standards, and one fifteen minute review every week
              with your agent. One price. Cancel whenever you want, and your record stays yours.
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
