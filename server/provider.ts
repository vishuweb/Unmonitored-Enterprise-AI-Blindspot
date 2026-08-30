export interface ProviderUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  costUsd?: number;
}

export interface DownstreamResponse {
  output: string;
  usage?: ProviderUsage;
  model?: string;
}

export interface DownstreamProvider {
  readonly name: string;
  readonly model: string;
  complete(prompt: string): Promise<DownstreamResponse>;
}

export interface OpenAICompatibleProviderOptions {
  baseUrl: string;
  apiKey: string;
  model: string;
}

function numberValue(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

/**
 * OpenAI-compatible chat completion adapter. It is deliberately only created
 * when all provider settings are present, so an unconfigured server never
 * makes a network call or pretends that inference happened.
 */
export class OpenAICompatibleProvider implements DownstreamProvider {
  public readonly name = 'openai-compatible';
  public readonly model: string;
  private readonly endpoint: string;
  private readonly apiKey: string;

  public constructor(options: OpenAICompatibleProviderOptions) {
    this.model = options.model;
    this.apiKey = options.apiKey;
    this.endpoint = `${options.baseUrl.replace(/\/+$/, '')}/chat/completions`;
  }

  public async complete(prompt: string): Promise<DownstreamResponse> {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      throw new Error(`Downstream provider returned ${response.status}${detail ? `: ${detail.slice(0, 300)}` : ''}`);
    }

    const payload = await response.json() as {
      choices?: Array<{ message?: { content?: unknown }; text?: unknown }>;
      model?: unknown;
      usage?: {
        prompt_tokens?: unknown;
        completion_tokens?: unknown;
        total_tokens?: unknown;
        input_tokens?: unknown;
        output_tokens?: unknown;
        cost?: unknown;
        cost_usd?: unknown;
      };
    };
    const choice = payload.choices?.[0];
    const content = choice?.message?.content ?? choice?.text;
    if (typeof content !== 'string') {
      throw new Error('Downstream provider returned no text content');
    }

    if (!payload.usage) {
      return { output: content, model: typeof payload.model === 'string' ? payload.model : this.model };
    }

    const inputTokens = numberValue(payload.usage.prompt_tokens)
      ?? numberValue(payload.usage.input_tokens)
      ?? 0;
    const outputTokens = numberValue(payload.usage.completion_tokens)
      ?? numberValue(payload.usage.output_tokens)
      ?? 0;
    const totalTokens = numberValue(payload.usage.total_tokens) ?? inputTokens + outputTokens;
    const costUsd = numberValue(payload.usage.cost_usd) ?? numberValue(payload.usage.cost);

    return {
      output: content,
      model: typeof payload.model === 'string' ? payload.model : this.model,
      usage: { inputTokens, outputTokens, totalTokens, costUsd }
    };
  }
}

export function createConfiguredProvider(
  env: Record<string, string | undefined> = process.env
): OpenAICompatibleProvider | undefined {
  const baseUrl = env.OPENAI_BASE_URL?.trim();
  const apiKey = env.OPENAI_API_KEY?.trim();
  const model = env.OPENAI_MODEL?.trim();
  if (!baseUrl || !apiKey || !model) {
    return undefined;
  }
  return new OpenAICompatibleProvider({ baseUrl, apiKey, model });
}
