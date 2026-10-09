import DeskCards from '@/components/DeskCards';
import { DEPARTMENTS } from '@/lib/domain/folders';

export default function HowItWorks() {
  return (
    <>
      <section>
        <div className="wrap">
          <p className="kick">How it works</p>
          <h1 style={{ marginTop: 12, maxWidth: '18ch' }}>Your life changes. Your systems should too.</h1>
          <p className="lede">
            Most tools ask you to build the thing yourself and then blame you when the grid stays
            empty. Universe City works the other way round. You talk, it gets recorded, and the
            systems assemble out of what you actually said.
          </p>
        </div>
      </section>

      <section>
        <div className="wrap">
          <p className="kick">What you get at launch</p>
          <h2 style={{ marginTop: 10 }}>Four systems, running.</h2>
          <DeskCards />
          <p className="note" style={{ marginTop: 26, maxWidth: 'var(--text)' }}>
            Universe City is built as four departments of twelve folders each. Forty eight in
            total, and they all exist in the architecture. Four of them are operational today.
            Depth before breadth, because a folder that does not leave you a system is a topic.
          </p>
        </div>
      </section>

      <section className="dark">
        <div className="wrap">
          <p className="kick">The four departments</p>
          <ul className="rows">
            {DEPARTMENTS.map(d => (
              <li key={d.key}>
                <span className="rn" style={{ color: d.color, filter: 'brightness(2)' }}>{d.key}</span>
                <span><strong>{d.name}</strong>. {d.mandate}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section>
        <div className="wrap prose">
          <p className="kick">What we will never do</p>
          <h2 style={{ marginTop: 10 }}>We don’t turn guesses into facts.</h2>
          <p style={{ marginTop: 18 }}>
            No times are invented. An estimate stays an estimate until you say what actually
            happened. Software can propose a change. It cannot quietly make one. Your agent
            approves anything consequential, and you can see every version of every correction.
          </p>
        </div>
      </section>
    </>
  );
}
