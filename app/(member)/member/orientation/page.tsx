import OrientationTour from '@/components/OrientationTour';

export default function OrientationPage() {
  return (
    <div className="orientation-workspace">
      <p className="kick">Welcome to Universe City</p>
      <h1>Welcome. We start with Time.</h1>
      <p className="lede">
        The walkthrough uses the real resident interface. Nothing here is a separate demo you have
        to relearn later.
      </p>

      <div className="orientation-sample">
        <div>
          <span className="lab">Current focus</span>
          <strong>Time</strong>
        </div>
        <div>
          <span className="lab">Next</span>
          <strong>Plan tomorrow</strong>
        </div>
      </div>

      <OrientationTour />
    </div>
  );
}
