import Link from 'next/link';
import DeskCards from '@/components/DeskCards';

export default function HomePage() {
  return (
    <>
      <section className="hero-block">
        <div className="wrap hero-grid">
          <div>
            <p className="kick">Universe City</p>
            <h1>A life management agency for everyday people.</h1>
            <p className="lede">
              You start with one folder in each department. They are Time, Inventory, Salary and
              Standards. Your agent works across all four with you and reviews them every week.
            </p>
            <div className="hero-actions">
              <Link className="btn" href="/join">Apply</Link>
              <Link className="text-link" href="/how-it-works">See how it works</Link>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <p className="kick">Four folders</p>
          <h2 style={{ marginTop: 10 }}>One folder in each department.</h2>
          <DeskCards />
        </div>
      </section>

      <section className="review-block">
        <div className="wrap">
          <p className="kick">Weekly review</p>
          <h2>Fifteen minutes a week with your agent.</h2>
          <ol className="review-rows">
            <li><span>01</span><p>Your file changes as your life changes.</p></li>
            <li><span>02</span><p>Time changes with your schedule. Inventory changes with your home.</p></li>
            <li><span>03</span><p>Salary changes with your work. Standards change with what you require.</p></li>
            <li><span>04</span><p>Each week, your agent reviews the whole file with you and identifies what needs attention next.</p></li>
          </ol>
        </div>
      </section>
    </>
  );
}
