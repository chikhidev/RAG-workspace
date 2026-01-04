import { ModelDefinition } from "../types";

export const SUPPORTED_MODELS: ModelDefinition[] = [
  { 
    id: 'nvidia/nemotron-nano-9b-v2:free', 
    name: 'Nemotron Nano 9B V2', 
    provider: 'openrouter', 
    description: 'NVIDIA - Optimized for speed and small-scale tasks.',
    size: 'small',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/8/8e/Logo-nvidia-transparent-PNG.png'
  },
  { 
    id: 'qwen/qwen3-4b:free', 
    name: 'Qwen3 4B', 
    provider: 'openrouter', 
    description: 'Qwen - Ultra-fast small language model.',
    size: 'small',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Qwen_logo.svg/2048px-Qwen_logo.svg.png'
  },
  { 
    id: 'google/gemma-3-4b-it:free', 
    name: 'Gemma 3 4B', 
    provider: 'openrouter', 
    description: 'Google - Efficient and capable small model.',
    size: 'small',
    logo: 'https://registry.npmmirror.com/@lobehub/icons-static-png/latest/files/dark/gemma-color.png'
  },
  { 
    id: 'deepseek/deepseek-r1-0528:free', 
    name: 'DeepSeek R1 0528', 
    provider: 'openrouter', 
    description: 'DeepSeek - High-performance reasoning model.',
    size: 'large',
    logo: 'https://images.seeklogo.com/logo-png/61/1/deepseek-ai-icon-logo-png_seeklogo-611473.png'
  },
  { 
    id: 'nvidia/nemotron-3-nano-30b-a3b:free', 
    name: 'Nemotron-3 Nano 30B', 
    provider: 'openrouter', 
    description: 'NVIDIA - Supports extended reasoning flags.',
    size: 'large',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/8/8e/Logo-nvidia-transparent-PNG.png'
  },
  { 
    id: 'openai/gpt-oss-20b:free', 
    name: 'GPT OSS 20B', 
    provider: 'openrouter', 
    description: 'OpenAI - Open architecture with reasoning support.',
    size: 'large',
    logo: 'https://cdn.worldvectorlogo.com/logos/openai-2.svg'
  },
  { 
    id: 'google/gemma-3-12b-it:free', 
    name: 'Gemma 3 12B', 
    provider: 'openrouter', 
    description: 'Google - Balanced efficiency for complex reasoning.',
    size: 'large',
    logo: 'https://registry.npmmirror.com/@lobehub/icons-static-png/latest/files/dark/gemma-color.png'
  },
  { 
    id: 'nex-agi/deepseek-v3.1-nex-n1:free', 
    name: 'DeepSeek V3.1 Nex N1', 
    provider: 'openrouter', 
    description: 'DeepSeek - High-capacity reasoning engine.',
    size: 'large',
    logo: 'https://images.seeklogo.com/logo-png/61/1/deepseek-ai-icon-logo-png_seeklogo-611473.png'
  },
  { 
    id: 'z-ai/glm-4.5-air:free', 
    name: 'GLM 4.5 Air', 
    provider: 'openrouter', 
    description: 'Z.AI - Advanced performance at efficiency.',
    size: 'large',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Z.ai_%28company_logo%29.svg/1200px-Z.ai_%28company_logo%29.svg.png'
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
      'openai/gpt-oss-20b:free'
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

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${params.openRouterKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.origin,
        "X-Title": "Dual-Brain RAG",
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "";
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
}

export const modelService = new ModelService();