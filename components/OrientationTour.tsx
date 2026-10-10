'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

type Step = {
  target: string;
  eyebrow: string;
  title: string;
  body: string;
};

export default function OrientationTour() {
  const router = useRouter();
  const [index, setIndex] = useState(0);

  const steps = useMemo<Step[]>(() => [
    {
      target: 'file',
      eyebrow: '01 · Your systems',
      title: 'Everything has a place.',
      body: 'Your life is organized across four departments and 48 folders. You do not have to set them all up. Universe City builds and maintains the systems with you over time.'
    },
    {
      target: 'workspace',
      eyebrow: '02 · Your workspace',
      title: 'One thing in front of you.',
      body: 'The center is where you see the Dashboard, a system, or a Session. It changes with what you are working on; the rest of the frame stays put.'
    },
    {
      target: 'agent',
      eyebrow: '03 · Your Agent',
      title: 'Talk to us without doing the filing.',
      body: 'Your Agent stays beside your work. It can use the context of the system you are viewing, follow up on Plans, and help keep your systems current.'
    },
    {
      target: 'time',
      eyebrow: '04 · We start here',
      title: 'Time comes first.',
      body: 'Before we work on the rest of your systems, we need a believable Plan for your time. Your first job is simple: plan tomorrow.'
    }
  ], []);

  useEffect(() => {
    const step = steps[index];
    document.body.classList.add('tour-active');
    const target = document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`);
    target?.classList.add('tour-highlight');
    target?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    return () => {
      target?.classList.remove('tour-highlight');
      if (index === steps.length - 1) document.body.classList.remove('tour-active');
    };
  }, [index, steps]);

  useEffect(() => () => {
    document.body.classList.remove('tour-active');
    document.querySelectorAll('.tour-highlight').forEach(el => el.classList.remove('tour-highlight'));
  }, []);

  const step = steps[index];
  const finish = () => {
    document.body.classList.remove('tour-active');
    router.push('/member/time/setup');
    router.refresh();
  };

  return (
    <>
      <div className="tour-scrim" aria-hidden="true" />
      <div className="tour-card" role="dialog" aria-modal="true" aria-label="Universe City orientation">
        <div className="tour-progress">
          {steps.map((_, i) => <span key={i} className={i <= index ? 'on' : ''} />)}
        </div>
        <p className="kick">{step.eyebrow}</p>
        <h2>{step.title}</h2>
        <p>{step.body}</p>
        <div className="tour-actions">
          <button className="text-button" type="button" onClick={finish}>Skip orientation</button>
          {index > 0 && (
            <button className="btn ghost compact" type="button" onClick={() => setIndex(v => v - 1)}>
              Back
            </button>
          )}
          <button
            className="btn compact"
            type="button"
            onClick={() => index === steps.length - 1 ? finish() : setIndex(v => v + 1)}
          >
            {index === steps.length - 1 ? 'Plan tomorrow' : 'Next'}
          </button>
        </div>
      </div>
    </>
  );
}
