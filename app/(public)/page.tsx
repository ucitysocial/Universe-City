import Link from 'next/link';
import DeskCards from '@/components/DeskCards';

export default function Home() {
  return (
    <>
      <section>
        <div className="wrap">
          <h1 style={{ maxWidth: '16ch' }}>
            Artists have teams. Athletes have teams.
          </h1>
          <p className="lede">
            You are running a whole life by yourself. Universe City is an agency for everyday
            people. You get four working systems and a real person who holds your file.
          </p>
          <div style={{ display: 'flex', gap: 14, marginTop: 34, flexWrap: 'wrap' }}>
            <Link className="btn" href="/join">Join for $48 a month</Link>
            <Link className="btn ghost" href="/how-it-works">See how it works</Link>
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <p className="kick">Four systems</p>
          <h2 style={{ marginTop: 10, maxWidth: '22ch' }}>
            Nothing here is advice. Every one of them leaves you something.
          </h2>
          <DeskCards />
        </div>
      </section>

      <section className="dark">
        <div className="wrap">
          <p className="kick">The part that is not software</p>
          <h2 style={{ marginTop: 10, maxWidth: '20ch' }}>
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

      <section>
        <div className="wrap" style={{ display: 'flex', gap: 40, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div className="prose">
            <p className="kick">Membership</p>
            <div className="price">
              <span className="n vt" style={{ color: 'var(--I)' }}>$48</span>
              <span className="lab" style={{ color: 'var(--dim)' }}>a month</span>
            </div>
            <p>
              Time, Inventory, Salary and Standards, and one fifteen minute review every week
              with your agent. One price. Cancel whenever you want, and your record stays yours.
            </p>
            <Link className="btn" href="/join" style={{ marginTop: 22 }}>Join Universe City</Link>
          </div>
        </div>
      </section>
    </>
  );
}
