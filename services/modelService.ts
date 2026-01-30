import { ModelDefinition } from "../types";

export const SUPPORTED_MODELS: ModelDefinition[] = [
  // --- FREE MODELS ---
  {
    id: 'nvidia/nemotron-nano-9b-v2:free',
    name: 'Nemotron Nano 9B V2',
    provider: 'openrouter',
    description: 'NVIDIA - Optimized for speed and small-scale tasks.',
    size: 'small',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/8/8e/Logo-nvidia-transparent-PNG.png',
    isFree: true,
    metadata: {
      author: 'NVIDIA',
      context: '128K',
      inputPrice: '$0.00/M',
      outputPrice: '$0.00/M',
      latency: '0.80s',
      throughput: '120tps'
    }
  },
  {
    id: 'qwen/qwen3-4b:free',
    name: 'Qwen3 4B',
    provider: 'openrouter',
    description: 'Qwen - Ultra-fast small language model.',
    size: 'small',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Qwen_logo.svg/2048px-Qwen_logo.svg.png',
    isFree: true,
    metadata: {
      author: 'Qwen',
      context: '32K',
      inputPrice: '$0.00/M',
      outputPrice: '$0.00/M',
      latency: '0.40s',
      throughput: '180tps'
    }
  },
  {
    id: 'google/gemma-3-4b-it:free',
    name: 'Gemma 3 4B',
    provider: 'openrouter',
    description: 'Google - Efficient and capable small model.',
    size: 'small',
    logo: 'https://registry.npmmirror.com/@lobehub/icons-static-png/latest/files/dark/gemma-color.png',
    isFree: true,
    metadata: {
      author: 'Google',
      context: '128K',
      inputPrice: '$0.00/M',
      outputPrice: '$0.00/M',
      latency: '0.60s',
      throughput: '150tps'
    }
  },
  {
    id: 'deepseek/deepseek-r1-0528:free',
    name: 'DeepSeek R1 0528',
    provider: 'openrouter',
    description: 'DeepSeek - High-performance reasoning model.',
    size: 'large',
    logo: 'https://images.seeklogo.com/logo-png/61/1/deepseek-ai-icon-logo-png_seeklogo-611473.png',
    isFree: true,
    metadata: {
      author: 'DeepSeek',
      context: '64K',
      inputPrice: '$0.00/M',
      outputPrice: '$0.00/M',
      latency: '2.50s',
      throughput: '45tps'
    }
  },
  {
    id: 'nvidia/nemotron-3-nano-30b-a3b:free',
    name: 'Nemotron-3 Nano 30B',
    provider: 'openrouter',
    description: 'NVIDIA - Supports extended reasoning flags.',
    size: 'large',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/8/8e/Logo-nvidia-transparent-PNG.png',
    isFree: true,
    metadata: {
      author: 'NVIDIA',
      context: '128K',
      inputPrice: '$0.00/M',
      outputPrice: '$0.00/M',
      latency: '1.40s',
      throughput: '85tps'
    }
  },
  {
    id: 'openai/gpt-oss-20b:free',
    name: 'GPT OSS 20B',
    provider: 'openrouter',
    description: 'OpenAI - Open architecture with reasoning support.',
    size: 'large',
    logo: 'https://cdn.worldvectorlogo.com/logos/openai-2.svg',
    isFree: true,
    metadata: {
      author: 'OpenAI',
      context: '128K',
      inputPrice: '$0.00/M',
      outputPrice: '$0.00/M',
      latency: '0.90s',
      throughput: '110tps'
    }
  },

  // --- PAID MODELS ---
  {
    id: 'mistralai/ministral-8b',
    name: 'Ministral 8B',
    provider: 'openrouter',
    description: 'Mistral - Ultra-fast, high-throughput efficiency.',
    size: 'small',
    logo: 'https://avatars.githubusercontent.com/u/139365611?s=200&v=4',
    metadata: {
      author: 'Mistral',
      context: '131K',
      inputPrice: '$0.10/M',
      outputPrice: '$0.10/M',
      latency: '0.13s',
      throughput: '163.1tps'
    }
  },
  {
    id: 'cohere/command-r7b-12-2024',
    name: 'Command R7B (12-2024)',
    provider: 'openrouter',
    description: 'Cohere - Balanced performance and low latency.',
    size: 'small',
    logo: 'https://registry.npmmirror.com/@lobehub/icons-static-png/latest/files/dark/cohere-color.png',
    metadata: {
      author: 'Cohere',
      context: '128K',
      inputPrice: '$0.0375/M',
      outputPrice: '$0.15/M',
      latency: '0.19s',
      throughput: '134.6tps'
    }
  },
  {
    id: 'qwen/qwen2.5-coder-7b-instruct',
    name: 'Qwen2.5 Coder 7B',
    provider: 'openrouter',
    description: 'Qwen - Specialized instruct model with high throughput.',
    size: 'small',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Qwen_logo.svg/2048px-Qwen_logo.svg.png',
    metadata: {
      author: 'Qwen',
      context: '33K',
      inputPrice: '$0.03/M',
      outputPrice: '$0.09/M',
      latency: '0.33s',
      throughput: '211.3tps'
    }
  },
  {
    id: 'nvidia/nemotron-nano-12b-v2-vl',
    name: 'Nemotron Nano 12B VL',
    provider: 'openrouter',
    description: 'NVIDIA - Advanced Reasoning & Visual Understanding.',
    size: 'large',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/8/8e/Logo-nvidia-transparent-PNG.png',
    metadata: {
      author: 'NVIDIA',
      context: '131K',
      inputPrice: '$0.20/M',
      outputPrice: '$0.60/M',
      latency: '1.20s',
      throughput: '105.7tps'
    }
  },
  {
    id: 'openai/gpt-oss-safeguard-20b',
    name: 'GPT OSS Safeguard 20B',
    provider: 'openrouter',
    description: 'OpenAI - High-fidelity reasoning with safeguards.',
    size: 'large',
    logo: 'https://cdn.worldvectorlogo.com/logos/openai-2.svg',
    metadata: {
      author: 'OpenAI',
      context: '131K',
      inputPrice: '$0.075/M',
      outputPrice: '$0.30/M',
      latency: '0.11s',
      throughput: '945.8tps'
    }
  },
];

interface ExecutionParams {
  modelId: string;
  systemInstruction: string;
  prompt: string;
  temperature: number;
  thinkingBudget?: number;
  openRouterKey?: string;
}

class ModelService {
  private async executeOpenRouter(params: ExecutionParams): Promise<string> {
    if (!params.openRouterKey) {
      throw new Error("OpenRouter API Key is missing. Please configure it in the API Management settings.");
    }

    const reasoningModels = [
      'nvidia/nemotron-3-nano-30b-a3b:free',
      'openai/gpt-oss-20b:free',
      'nvidia/nemotron-nano-12b-v2-vl',
      'openai/gpt-oss-safeguard-20b'
    ];
    const isReasoningEnabled = reasoningModels.includes(params.modelId);

    const body: any = {
      model: params.modelId,
      messages: [
        { role: "system", content: params.systemInstruction },
        { role: "user", content: params.prompt }
      ],
      temperature: params.temperature,
    };

    if (isReasoningEnabled) {
      body.reasoning = { enabled: true };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${params.openRouterKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": window.location.origin,
          "X-Title": "Dual-Brain RAG",
        },
        body: JSON.stringify(body),
        signal: controller.signal
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `OpenRouter API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || "";
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error('Request timed out after 60 seconds.');
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private async *streamOpenRouter(params: ExecutionParams): AsyncGenerator<string, void, unknown> {
    if (!params.openRouterKey) {
      throw new Error("OpenRouter API Key is missing.");
    }

    const reasoningModels = [
      'nvidia/nemotron-3-nano-30b-a3b:free',
      'openai/gpt-oss-20b:free',
      'nvidia/nemotron-nano-12b-v2-vl',
      'openai/gpt-oss-safeguard-20b'
    ];
    const isReasoningEnabled = reasoningModels.includes(params.modelId);

    const body: any = {
      model: params.modelId,
      messages: [
        { role: "system", content: params.systemInstruction },
        { role: "user", content: params.prompt }
      ],
      temperature: params.temperature,
      stream: true
    };

    if (isReasoningEnabled) {
      body.reasoning = { enabled: true };
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${params.openRouterKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.origin,
        "X-Title": "Dual-Brain RAG",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `OpenRouter API error: ${response.status}`);
    }

    if (!response.body) throw new Error("No response body");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            const dataStr = trimmed.slice(6);
            if (dataStr === '[DONE]') continue;
            try {
              const data = JSON.parse(dataStr);
              const content = data.choices[0]?.delta?.content;
              if (content) yield content;
            } catch (e) {
              // Ignore parse errors for partial chunks
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  public async run(params: ExecutionParams): Promise<string> {
    const definition = SUPPORTED_MODELS.find(m => m.id === params.modelId);
    if (!definition) throw new Error(`Unsupported model: ${params.modelId}`);

    if (definition.provider === 'openrouter') {
      return this.executeOpenRouter(params);
    } else {
      throw new Error(`Provider ${definition.provider} is not currently supported.`);
    }
  }

  public async *stream(params: ExecutionParams): AsyncGenerator<string, void, unknown> {
    const definition = SUPPORTED_MODELS.find(m => m.id === params.modelId);
    if (!definition) throw new Error(`Unsupported model: ${params.modelId}`);

    if (definition.provider === 'openrouter') {
      yield* this.streamOpenRouter(params);
    } else {
      throw new Error(`Provider ${definition.provider} is not currently supported.`);
    }
  }
}

export const modelService = new ModelService();