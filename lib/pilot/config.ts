// Settings for the founder test. Every value has a default, so a missing variable never opens the test wider.

/** Where this build runs. Netlify names it while building: production, deploy-preview, or branch-deploy. */
export function deployContext(): string {
  return process.env.PILOT_CONTEXT || '';
}

/** The founder test runs on a preview that holds its database address. It never runs on a production deploy. */
export function pilotEnabled(): boolean {
  if (process.env.PILOT_LOCAL === '1' && process.env.NODE_ENV === 'development') return true;
  if (deployContext() === 'production') return false;
  return !!process.env.PILOT_DATABASE_URL;
}

export function modelName(): string {
  return process.env.PILOT_MODEL || 'claude-sonnet-5-5';
}

/** United States dollars for each million tokens, as the provider lists them. */
const PRICES: Record<string, { input: number; output: number; read: number; write: number }> = {
  'claude-sonnet-5-5': { input: 2, output: 10, read: 0.2, write: 2.5 },
  'claude-sonnet-5': { input: 2, output: 10, read: 0.2, write: 2.5 },
  'claude-sonnet-4-6': { input: 3, output: 15, read: 0.3, write: 3.75 },
  'claude-sonnet-4-5': { input: 3, output: 15, read: 0.3, write: 3.75 },
  'claude-haiku-4-5': { input: 1, output: 5, read: 0.1, write: 1.25 },
  'claude-haiku-5-5': { input: 0.1, output: 0.5, read: 0.01, write: 0.12 },
  'claude-opus-5-5': { input: 4, output: 20, read: 0.2, write: 5 }
};

export type Usage = { input: number; output: number; cacheRead: number; cacheWrite: number };

/** Cost in millionths of a dollar. A model with no listed price is counted at the highest listed price. */
export function costMicro(model: string, u: Usage): number {
  const p = PRICES[model] || PRICES[model.replace(/-\d{8}$/, '')] || PRICES['claude-opus-5-5'];
  return Math.round(u.input * p.input + u.output * p.output + u.cacheRead * p.read + u.cacheWrite * p.write);
}

/** The most the test spends on the language model in one day for one resident. */
export function dailyCapMicro(): number {
  const usd = parseFloat(process.env.PILOT_DAILY_CAP_USD || '1.00');
  return Math.round((Number.isFinite(usd) && usd > 0 ? usd : 1) * 1_000_000);
}

export const LIMITS = {
  messageChars: 4000,       // one resident message
  steps: 6,                 // model calls in one reply
  actionsPerReply: 12,      // actions in one reply
  recentMessages: 30,       // messages sent to the model as the conversation in view
  softDeadlineMs: 38_000,   // after this, the reply is finished with no further action
  runningStaleMs: 75_000    // a reply still marked running after this is treated as interrupted
};
