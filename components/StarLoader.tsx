/**
 * Five stars in a row, the star of the Universe City name. Each one fills in turn, in the colors of the four
 * departments and then ink, while a page loads. With reduced motion the five stars stay filled.
 */
const STAR = 'M12 1.6l3.1 6.6 7.2.9-5.3 5 1.4 7.1L12 17.7l-6.4 3.5 1.4-7.1-5.3-5 7.2-.9z';
const COLORS = ['var(--I)', 'var(--II)', 'var(--III)', 'var(--IV)', 'var(--ink)'];

export default function StarLoader({ label }: { label: string }) {
  return (
    <div className="stars" role="status" aria-label={label}>
      {COLORS.map((c, i) => (
        <svg key={c} className="star" viewBox="0 0 24 24" aria-hidden="true" style={{ ['--c' as string]: c, ['--i' as string]: i }}>
          <path d={STAR} />
        </svg>
      ))}
    </div>
  );
}
