import Link from 'next/link';
import DeskCards from '@/components/DeskCards';

export default function Home() {
  return (
    <>
      <section className="hero-section">
        <div className="wrap hero-copy">
          <p className="kick">Universe City &middot; Life Management Agency</p>
          <h1 style={{ marginTop: 14, maxWidth: '16ch' }}>
            Artists have teams. Athletes have teams.
          </h1>
          <p className="lede">
            You are running a whole life by yourself. Universe City is an agency for everyday
            people. You get four working systems and a real person who helps keep them current.
          </p>
          <div className="hero-actions">
            <Link className="btn" href="/apply">Apply for membership</Link>
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

      <section className="agent-section">
        <div className="wrap">
          <div className="agent-copy">
          <p className="kick">The part that is not software</p>
          <h2 style={{ marginTop: 10, maxWidth: '20ch' }}>
            Fifteen minutes a week with your agent.
          </h2>
          <p className="lede">
            A person reviews what is changing in your life, not just a dashboard. We go through what changed, what is still
            a guess, and what to do about it. Your systems stay current between those conversations.
          </p>
          <ul className="rows">
            <li><span className="rn">01</span><span>You tell us about your week, in your own words.</span></li>
            <li><span className="rn">02</span><span>We keep it as what it is: observed, planned, or still an estimate.</span></li>
            <li><span className="rn">03</span><span>Once a week we sit down for fifteen minutes and work out what it means.</span></li>
            <li><span className="rn">04</span><span>Nothing is ever recorded that you did not say.</span></li>
          </ul>
          </div>
        </div>
      </section>

      <section className="membership-section">
        <div className="wrap" style={{ display: 'flex', gap: 40, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div className="prose">
            <p className="kick">Membership</p>
            <h2 style={{ marginTop: 10 }}>What membership includes.</h2>
            <p style={{ marginTop: 18 }}>
              Time, Inventory, Salary and Standards, and one fifteen minute review every week
              with your agent. Cancel whenever you want, and your information stays yours.
            </p>
            <Link className="btn" href="/apply" style={{ marginTop: 22 }}>Apply</Link>
          </div>
        </div>
      </section>
    </>
  );
}
