// The language model, behind one small interface so a test can supply a scripted one.

import { modelName, type Usage } from './config';

export type Block =
  | { type: 'text'; text: string; cache_control?: { type: 'ephemeral' } }
  | { type: 'tool_use'; id: string; name: string; input: Record<string, unknown> }
  | { type: 'tool_result'; tool_use_id: string; content: string; is_error?: boolean };

export type Turn = { role: 'user' | 'assistant'; content: string | Block[] };

export type ModelRequest = {
  system: { type: 'text'; text: string; cache_control?: { type: 'ephemeral' } }[];
  tools: { name: string; description: string; input_schema: Record<string, unknown> }[];
  messages: Turn[];
  maxTokens: number;
  allowActions: boolean;
};

export type ModelReply = { content: Block[]; stop: string; usage: Usage; model: string };

export interface Model {
  name(): string;
  create(req: ModelRequest): Promise<ModelReply>;
}

const G = globalThis as unknown as { __ucPilotModel?: { override: Model | null; noQuick: Set<string> } };
const state = (G.__ucPilotModel ||= { override: null, noQuick: new Set<string>() });
state.noQuick ||= new Set<string>();
export function useModel(m: Model | null) { state.override = m; }

// The site's own address. A request that reaches this site through the proxy at ucitysocial.com carries that host,
// and the gateway address the platform supplies for that request then points at the other site. The gateway refuses
// it with mismatched_site_id. The model call then goes to the same gateway path on this site's own address.
const OWN = (process.env.NEXT_PUBLIC_SITE_URL || process.env.URL || '').replace(/\/+$/, '');

function gatewayOnOwnSite(base: string | undefined): string | null {
  if (!base || !OWN) return null;
  try {
    const b = new URL(base);
    const own = new URL(OWN);
    if (b.host === own.host) return null;
    return `${own.origin}${b.pathname}${b.search}`;
  } catch { return null; }
}

/** The host and path a request went to, for the record of a failed reply. It holds no key. */
function where(base: string | undefined): string {
  try { const u = new URL(base || ''); return `${u.host}${u.pathname}`; } catch { return 'no address'; }
}

const anthropic: Model = {
  name: () => modelName(),
  async create(req) {
    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    // The key comes from the server's environment. It never reaches the browser.
    // With PILOT_ANTHROPIC_KEY set, requests go straight to Anthropic under that account.
    // With it unset, they go through the Netlify gateway, which supplies its own key and address for each request,
    // so the client is made for each call.
    const own = (process.env.PILOT_ANTHROPIC_KEY || '').trim();
    const make = (baseURL?: string) => own
      ? new Anthropic({ apiKey: own, baseURL: 'https://api.anthropic.com', maxRetries: 1, timeout: 45_000 })
      : new Anthropic({ maxRetries: 1, timeout: 45_000, ...(baseURL ? { baseURL } : {}) });
    const tools = req.tools.map((t, i) =>
      i === req.tools.length - 1 ? { ...t, cache_control: { type: 'ephemeral' as const } } : t);
    const body = {
      model: modelName(),
      max_tokens: req.maxTokens,
      system: req.system,
      tools,
      tool_choice: req.allowActions ? { type: 'auto' } : { type: 'none' },
      messages: req.messages
    };
    // The reply is short, and the time a resident waits is most of the cost of a turn. The model is asked to answer
    // without a separate thinking pass. A model that refuses that setting is asked again without it, and the setting
    // stays off for that model from then on.
    const quick = !state.noQuick.has(body.model);
    const send = async (client: any) => {
      try {
        return await client.messages.create((quick ? { ...body, thinking: { type: 'disabled' } } : body) as any);
      } catch (e: any) {
        if (quick && e?.status === 400 && /thinking/i.test(String(e?.message || ''))) {
          state.noQuick.add(body.model);
          return await client.messages.create(body as any);
        }
        throw e;
      }
    };
    let res: any;
    try {
      res = await send(make());
    } catch (e: any) {
      const base = process.env.ANTHROPIC_BASE_URL;
      const retry = !own && /mismatched_site_id|Mismatched site ID/.test(String(e?.message || '')) ? gatewayOnOwnSite(base) : null;
      if (!retry) throw new Error(`${String(e?.message || e).slice(0, 300)} [address ${where(base)}]`);
      try {
        res = await send(make(retry));
      } catch (e2: any) {
        throw new Error(`${String(e2?.message || e2).slice(0, 300)} [address ${where(base)}, then ${where(retry)}]`);
      }
    }
    const u = res.usage || {};
    return {
      content: (res.content || []).filter((b: any) => b.type === 'text' || b.type === 'tool_use') as Block[],
      stop: res.stop_reason || 'end_turn',
      usage: {
        input: u.input_tokens || 0,
        output: u.output_tokens || 0,
        cacheRead: u.cache_read_input_tokens || 0,
        cacheWrite: u.cache_creation_input_tokens || 0
      },
      model: res.model || modelName()
    };
  }
};

export function getModel(): Model {
  return state.override || anthropic;
}

export function modelAvailable(): boolean {
  return !!state.override || !!process.env.PILOT_ANTHROPIC_KEY || !!process.env.ANTHROPIC_API_KEY;
}

/** Where a request to the model goes: the founder's own Anthropic account, or the Netlify gateway. */
export function modelRoute(): 'own account' | 'netlify gateway' | 'none' {
  if ((process.env.PILOT_ANTHROPIC_KEY || '').trim()) return 'own account';
  return process.env.ANTHROPIC_API_KEY ? 'netlify gateway' : 'none';
}
