// Guided Life is the optional execution sequence INSIDE a commitment, not its outcome.
export type GuidedStepState = 'proposed' | 'ready' | 'done' | 'skipped' | 'rejected';
export type GuidedStepLike = { id: string; state: GuidedStepState };
export type GuidedProgress = {
  total: number; done: number; skipped: number; handled: number;
  proposed: number; currentId: string | null; percentHandled: number;
};

/** Only resident-accepted steps count. A suggested or rejected task is not progress. */
export function guidedProgress<T extends GuidedStepLike>(steps: T[]): GuidedProgress {
  const accepted = steps.filter(s => s.state === 'ready' || s.state === 'done' || s.state === 'skipped');
  const done = accepted.filter(s => s.state === 'done').length;
  const skipped = accepted.filter(s => s.state === 'skipped').length;
  return {
    total: accepted.length, done, skipped, handled: done + skipped,
    proposed: steps.filter(s => s.state === 'proposed').length,
    currentId: accepted.find(s => s.state === 'ready')?.id || null,
    percentHandled: accepted.length ? Math.round(100 * (done + skipped) / accepted.length) : 0
  };
}
