import StarLoader from '@/components/StarLoader';

/** What the center of the frame shows while a page of the Resident Portal loads. */
export default function Loading() {
  return (
    <div className="pt-loading">
      <StarLoader label="The page is loading" />
    </div>
  );
}
