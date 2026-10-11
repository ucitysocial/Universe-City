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

const G = globalThis as unknown as { __ucPilotModel?: { override: Model | null; client: any } };
const state = (G.__ucPilotModel ||= { override: null, client: null });
export function useModel(m: Model | null) { state.override = m; }

const anthropic: Model = {
  name: () => modelName(),
  async create(req) {
    if (!state.client) {
      const { default: Anthropic } = await import('@anthropic-ai/sdk');
      // The key and the address come from the server's environment. Neither reaches the browser.
      state.client = new Anthropic({ maxRetries: 1, timeout: 45_000 });
    }
    const tools = req.tools.map((t, i) =>
      i === req.tools.length - 1 ? { ...t, cache_control: { type: 'ephemeral' as const } } : t);
    const res = await state.client.messages.create({
      model: modelName(),
      max_tokens: req.maxTokens,
      system: req.system,
      tools,
      tool_choice: req.allowActions ? { type: 'auto' } : { type: 'none' },
      messages: req.messages
    });
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
  return !!state.override || !!process.env.ANTHROPIC_API_KEY;
}
