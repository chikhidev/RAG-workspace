import { ModelDefinition } from "../types";
import { OpenRouter } from "@openrouter/sdk";
import { GoogleGenAI } from "@google/genai";

export const SUPPORTED_MODELS: ModelDefinition[] = [
  // --- FREE MODELS ---
  {
    id: 'liquid/lfm-2.5-1.2b-thinking:free',
    name: 'Liquid LFM 2.5 1.2B',
    provider: 'openrouter',
    description: 'Liquid AI - Efficient Thinking Model.',
    size: 'small',
    logo: '/logos/liquidai.png',
    isFree: true,
    metadata: {
      author: 'Liquid AI',
      context: '32K',
      inputPrice: '$0.00/M',
      outputPrice: '$0.00/M',
      latency: '0.50s',
      throughput: '150tps'
    }
  },
  {
    id: 'allenai/molmo-2-8b:free',
    name: 'Molmo 2 8B',
    provider: 'openrouter',
    description: 'AllenAI - Multimodal Open Model.',
    size: 'small',
    logo: '/logos/allenai.png',
    isFree: true,
    metadata: {
      author: 'AllenAI',
      context: '32K',
      inputPrice: '$0.00/M',
      outputPrice: '$0.00/M',
      latency: '0.45s',
      throughput: '140tps'
    }
  },
  {
    id: 'meta-llama/llama-3.2-3b-instruct:free',
    name: 'Llama 3.2 3B',
    provider: 'openrouter',
    description: 'Meta - Optimized Instruction Tuning.',
    size: 'small',
    logo: '/logos/meta.png',
    isFree: true,
    metadata: {
      author: 'Meta',
      context: '128K',
      inputPrice: '$0.00/M',
      outputPrice: '$0.00/M',
      latency: '0.30s',
      throughput: '250tps'
    }
  },
  {
    id: 'nvidia/nemotron-nano-9b-v2:free',
    name: 'Nemotron Nano 9B V2',
    provider: 'openrouter',
    description: 'NVIDIA - Optimized for speed and small-scale tasks.',
    size: 'small',
    logo: '/logos/nvidia.png',
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
    logo: '/logos/qwen.png',
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
    logo: '/logos/gemma.png',
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
    logo: '/logos/deepseek.png',
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
    logo: '/logos/nvidia.png',
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
    logo: '/logos/chatgpt.png',
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
  // --- GOOGLE MODELS (GEMINI 3 & 2.5) ---
  {
    id: 'google/gemini-3-pro-preview:free',
    name: 'Gemini 3 Pro Preview',
    provider: 'google',
    description: 'Google - Most powerful agentic model with state-of-the-art reasoning.',
    size: 'large',
    logo: '/logos/gemini.png',
    isFree: true,
    metadata: {
      author: 'Google',
      context: '1M',
      inputPrice: '$0.00/M',
      outputPrice: '$0.00/M',
      latency: '1.2s',
      throughput: '60tps'
    }
  },
  {
    id: 'google/gemini-3-pro-image-preview:free',
    name: 'Gemini 3 Pro Image Preview',
    provider: 'google',
    description: 'Google - Most powerful model with image generation and reasoning.',
    size: 'large',
    logo: '/logos/gemini.png',
    isFree: true,
    metadata: {
      author: 'Google',
      context: '64K',
      inputPrice: '$0.00/M',
      outputPrice: '$0.00/M',
      latency: '1.8s',
      throughput: '40tps'
    }
  },
  {
    id: 'google/gemini-3-flash-preview:free',
    name: 'Gemini 3 Flash Preview',
    provider: 'google',
    description: 'Google - Most balanced model for speed, scale, and frontier intelligence.',
    size: 'small',
    logo: '/logos/gemini.png',
    isFree: true,
    metadata: {
      author: 'Google',
      context: '1M',
      inputPrice: '$0.00/M',
      outputPrice: '$0.00/M',
      latency: '0.4s',
      throughput: '200tps'
    }
  },
  {
    id: 'google/gemini-2.5-pro:free',
    name: 'Gemini 2.5 Pro',
    provider: 'google',
    description: 'Google - SOTA thinking model for complex reasoning and long context.',
    size: 'large',
    logo: '/logos/gemini.png',
    isFree: true,
    metadata: {
      author: 'Google',
      context: '1M',
      inputPrice: '$0.00/M',
      outputPrice: '$0.00/M',
      latency: '1.0s',
      throughput: '60tps'
    }
  },
  {
    id: 'google/gemini-2.5-pro-preview-tts:free',
    name: 'Gemini 2.5 Pro TTS',
    provider: 'google',
    description: 'Google - High-fidelity text-to-audio preview.',
    size: 'large',
    logo: '/logos/gemini.png',
    isFree: true,
    metadata: {
      author: 'Google',
      context: '8K',
      inputPrice: '$0.00/M',
      outputPrice: '$0.00/M',
      latency: '0.8s',
      throughput: '50tps'
    }
  },
  {
    id: 'google/gemini-2.5-flash:free',
    name: 'Gemini 2.5 Flash',
    provider: 'google',
    description: 'Google - Best price-performance with thinking and agentic capabilities.',
    size: 'small',
    logo: '/logos/gemini.png',
    isFree: true,
    metadata: {
      author: 'Google',
      context: '1M',
      inputPrice: '$0.00/M',
      outputPrice: '$0.00/M',
      latency: '0.3s',
      throughput: '250tps'
    }
  },
  {
    id: 'google/gemini-2.5-flash-preview-09-2025:free',
    name: 'Gemini 2.5 Flash Preview',
    provider: 'google',
    description: 'Google - Preview version (09-2025) of the balanced 2.5 Flash model.',
    size: 'small',
    logo: '/logos/gemini.png',
    isFree: true,
    metadata: {
      author: 'Google',
      context: '1M',
      inputPrice: '$0.00/M',
      outputPrice: '$0.00/M',
      latency: '0.3s',
      throughput: '250tps'
    }
  },
  {
    id: 'google/gemini-2.5-flash-image:free',
    name: 'Gemini 2.5 Flash Image',
    provider: 'google',
    description: 'Google - High-speed image and text understanding/generation.',
    size: 'small',
    logo: '/logos/gemini.png',
    isFree: true,
    metadata: {
      author: 'Google',
      context: '64K',
      inputPrice: '$0.00/M',
      outputPrice: '$0.00/M',
      latency: '0.7s',
      throughput: '120tps'
    }
  },
  {
    id: 'google/gemini-2.5-flash-native-audio-preview-12-2025:free',
    name: 'Gemini 2.5 Flash Live',
    provider: 'google',
    description: 'Google - Specialized for real-time audio and video interaction (preview).',
    size: 'small',
    logo: '/logos/gemini.png',
    isFree: true,
    metadata: {
      author: 'Google',
      context: '128K',
      inputPrice: '$0.00/M',
      outputPrice: '$0.00/M',
      latency: '0.1s',
      throughput: '500tps'
    }
  },
  {
    id: 'google/gemini-2.5-flash-preview-tts:free',
    name: 'Gemini 2.5 Flash TTS',
    provider: 'google',
    description: 'Google - Text-to-Audio specialized preview model.',
    size: 'small',
    logo: '/logos/gemini.png',
    isFree: true,
    metadata: {
      author: 'Google',
      context: '8K',
      inputPrice: '$0.00/M',
      outputPrice: '$0.00/M',
      latency: '0.4s',
      throughput: '150tps'
    }
  },
  {
    id: 'google/gemini-2.5-flash-lite:free',
    name: 'Gemini 2.5 Flash-Lite',
    provider: 'google',
    description: 'Google - Fastest model optimized for cost-efficiency and high throughput.',
    size: 'small',
    logo: '/logos/gemini.png',
    isFree: true,
    metadata: {
      author: 'Google',
      context: '1M',
      inputPrice: '$0.00/M',
      outputPrice: '$0.00/M',
      latency: '0.2s',
      throughput: '450tps'
    }
  },
  {
    id: 'google/gemini-2.5-flash-lite-preview-09-2025:free',
    name: 'Gemini 2.5 Flash-Lite Preview',
    provider: 'google',
    description: 'Google - Preview of the ultra-fast 2.5 Flash-Lite model.',
    size: 'small',
    logo: '/logos/gemini.png',
    isFree: true,
    metadata: {
      author: 'Google',
      context: '1M',
      inputPrice: '$0.00/M',
      outputPrice: '$0.00/M',
      latency: '0.2s',
      throughput: '450tps'
    }
  },
  {
    id: 'google/gemini-2.0-flash:free',
    name: 'Gemini 2.0 Flash (Stable)',
    provider: 'google',
    description: 'Google - Reliable performance, native tool use, and 1M context.',
    size: 'small',
    logo: '/logos/gemini.png',
    isFree: true,
    metadata: {
      author: 'Google',
      context: '1M',
      inputPrice: '$0.00/M',
      outputPrice: '$0.00/M',
      latency: '0.3s',
      throughput: '250tps'
    }
  },
  {
    id: 'google/gemini-2.0-flash-lite:free',
    name: 'Gemini 2.0 Flash-Lite (Stable)',
    provider: 'google',
    description: 'Google - Low latency and cost efficiency.',
    size: 'small',
    logo: '/logos/gemini.png',
    isFree: true,
    metadata: {
      author: 'Google',
      context: '1M',
      inputPrice: '$0.00/M',
      outputPrice: '$0.00/M',
      latency: '0.2s',
      throughput: '350tps'
    }
  },
  {
    id: 'google/gemini-2.0-flash-thinking-exp:free',
    name: 'Gemini 2.0 Thinking (Experimental)',
    provider: 'google',
    description: 'Google - Specialized in complex reasoning and multi-step tasks.',
    size: 'large',
    logo: '/logos/gemini.png',
    isFree: true,
    metadata: {
      author: 'Google',
      context: '1M',
      inputPrice: '$0.00/M',
      outputPrice: '$0.00/M',
      latency: '1.2s',
      throughput: '60tps'
    }
  },
  // --- PAID MODELS ---
  {
    id: 'anthropic/claude-3.7-sonnet',
    name: 'Claude 3.7 Sonnet',
    provider: 'openrouter',
    description: 'Anthropic - Latest SOTA model.',
    size: 'large',
    logo: '/logos/claude.png',
    metadata: {
      author: 'Anthropic',
      context: '200K',
      inputPrice: '$3.00/M',
      outputPrice: '$15.00/M',
      latency: '1.0s',
      throughput: '80tps'
    }
  },
  {
    id: 'anthropic/claude-sonnet-4.5',
    name: 'Claude Sonnet 4.5',
    provider: 'openrouter',
    description: 'Anthropic - Next-gen intelligence (1M Context).',
    size: 'large',
    logo: '/logos/claude.png',
    metadata: {
      author: 'Anthropic',
      context: '1M',
      inputPrice: '$3.00/M',
      outputPrice: '$15.00/M',
      latency: '1.2s',
      throughput: '60tps'
    }
  },
  {
    id: 'anthropic/claude-haiku-4.5',
    name: 'Claude Haiku 4.5',
    provider: 'openrouter',
    description: 'Anthropic - Next-gen speed (200K Context).',
    size: 'large',
    logo: '/logos/claude.png',
    metadata: {
      author: 'Anthropic',
      context: '200K',
      inputPrice: '$1.00/M',
      outputPrice: '$5.00/M',
      latency: '0.4s',
      throughput: '120tps'
    }
  },
  {
    id: 'anthropic/claude-3-haiku',
    name: 'Claude 3 Haiku',
    provider: 'openrouter',
    description: 'Anthropic - Fast, intelligent, and cost-effective.',
    size: 'small',
    logo: '/logos/claude.png',
    metadata: {
      author: 'Anthropic',
      context: '200K',
      inputPrice: '$0.25/M',
      outputPrice: '$1.25/M',
      latency: '0.64s',
      throughput: '92tps'
    }
  },
  {
    id: 'mistralai/ministral-8b',
    name: 'Ministral 8B',
    provider: 'openrouter',
    description: 'Mistral - Ultra-fast, high-throughput efficiency.',
    size: 'small',
    logo: '/logos/mistral.png',
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
    logo: '/logos/cohere.png',
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
    logo: '/logos/qwen.png',
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
    logo: '/logos/nvidia.png',
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
    logo: '/logos/chatgpt.png',
    metadata: {
      author: 'OpenAI',
      context: '131K',
      inputPrice: '$0.075/M',
      outputPrice: '$0.30/M',
      latency: '0.11s',
      throughput: '945.8tps'
    }
  },
  {
    id: 'google/gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'google',
    description: 'Google - Balanced performance and large context (2M).',
    size: 'large',
    logo: '/logos/gemini.png',
    metadata: {
      author: 'Google',
      context: '2M',
      inputPrice: '$1.25/M',
      outputPrice: '$3.75/M',
      latency: '0.8s',
      throughput: '80tps'
    }
  },
  {
    id: 'google/gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'google',
    description: 'Google - High-speed model with long-context support.',
    size: 'small',
    logo: '/logos/gemini.png',
    metadata: {
      author: 'Google',
      context: '1M',
      inputPrice: '$0.075/M',
      outputPrice: '$0.30/M',
      latency: '0.2s',
      throughput: '250tps'
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
  googleKey?: string;
  maxTokens?: number;
  onUsage?: (usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number }) => void;
}

class ModelService {
  private getClient(apiKey: string) {
    return new OpenRouter({
      apiKey: apiKey,
    });
  }

  // Non-streaming execution
  private async executeOpenRouter(params: ExecutionParams): Promise<string> {
    if (!params.openRouterKey) {
      throw new Error("OpenRouter API Key is missing.");
    }

    const client = this.getClient(params.openRouterKey);

    // Check for reasoning-enabled models
    const reasoningModels = [
      'nvidia/nemotron-3-nano-30b-a3b:free',
      'openai/gpt-oss-20b:free',
      'nvidia/nemotron-nano-12b-v2-vl',
      'openai/gpt-oss-safeguard-20b',
      'liquid/lfm-2.5-1.2b-thinking:free',
      'deepseek/deepseek-r1-0528:free'
    ];
    // Some models like LFM might imply reasoning in ID or require specific handling, 
    // but OpenRouter often handles `reasoning: { enabled: true }` gracefully for unsupported models too.

    // Note: The @openrouter/sdk might not strictly enforce types for extra params yet, 
    // but we construct the object to match the user's snippet.

    const messages: any[] = [
      { role: "system", content: params.systemInstruction },
      { role: "user", content: params.prompt }
    ];

    try {
      const result = await client.chat.send({
        model: params.modelId,
        messages: messages,
        temperature: params.temperature,
        maxTokens: params.maxTokens,
      }) as any;

      return result.choices[0]?.message?.content || "";
    } catch (error: any) {
      console.error("OpenRouter API Error:", error);
      throw new Error(error.message || "Failed to generate response.");
    }
  }

  // Streaming execution using native SDK
  private async *streamOpenRouter(params: ExecutionParams): AsyncGenerator<string, void, unknown> {
    if (!params.openRouterKey) {
      throw new Error("OpenRouter API Key is missing.");
    }

    const client = this.getClient(params.openRouterKey);

    const messages = [
      { role: "system", content: params.systemInstruction },
      { role: "user", content: params.prompt }
    ];

    try {
      const stream = await client.chat.send({
        model: params.modelId,
        messages: messages as any[],
        temperature: params.temperature,
        maxTokens: params.maxTokens,
        stream: true
      }) as unknown as AsyncIterable<any>;

      for await (const chunk of stream) {
        // Handle Usage if present in slice
        if (chunk.usage && params.onUsage) {
          params.onUsage(chunk.usage);
        }

        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          yield content;
        }
      }

    } catch (error: any) {
      console.error("OpenRouter Stream Error:", error);
      throw new Error(error.message || "Failed to stream response.");
    }
  }

  // Gemini (Google SDK) execution
  private async executeGoogle(params: ExecutionParams): Promise<string> {
    if (!params.googleKey) {
      throw new Error("Google AI API Key is missing. Please set it in the settings.");
    }

    try {
      // Normalize model ID: remove 'google/' and strip ':free'
      const modelId = params.modelId.replace('google/', '').split(':')[0];

      // Determine API version: v1beta for experimental/thinking/preview/2.5/3, v1 for stable
      const isBeta = modelId.includes('exp') || modelId.includes('thinking') || modelId.includes('preview') || modelId.includes('2.5') || modelId.includes('gemini-3');
      const apiVersion = isBeta ? 'v1beta' : 'v1';

      const ai = new GoogleGenAI({ apiKey: params.googleKey, apiVersion });

      const config: any = {
        temperature: params.temperature,
        maxOutputTokens: params.maxTokens,
      };

      // Add thinkingConfig if supported (Thinking models or Gemini 2.5/3 which have it "Supported")
      if (modelId.includes('thinking') || modelId.includes('2.5') || modelId.includes('gemini-3')) {
        config.thinkingConfig = { includeThoughts: true };
      }

      const response = await ai.models.generateContent({
        model: modelId,
        contents: [
          { role: "user", parts: [{ text: `${params.systemInstruction}\n\n${params.prompt}` }] }
        ],
        config
      });

      if (params.onUsage) {
        const metadata = response.usageMetadata;
        if (metadata) {
          params.onUsage({
            prompt_tokens: metadata.promptTokenCount || 0,
            completion_tokens: metadata.candidatesTokenCount || 0,
            total_tokens: metadata.totalTokenCount || 0
          });
        }
      }

      return response.text || "";
    } catch (error: any) {
      console.error("Google Gemini API Error:", error);
      throw new Error(error.message || "Failed to generate response from Gemini.");
    }
  }

  private async *streamGoogle(params: ExecutionParams): AsyncGenerator<string, void, unknown> {
    if (!params.googleKey) {
      throw new Error("Google AI API Key is missing. Please set it in the settings.");
    }

    try {
      const modelId = params.modelId.replace('google/', '').split(':')[0];
      const isBeta = modelId.includes('exp') || modelId.includes('thinking') || modelId.includes('preview') || modelId.includes('2.5') || modelId.includes('gemini-3');
      const apiVersion = isBeta ? 'v1beta' : 'v1';

      const ai = new GoogleGenAI({ apiKey: params.googleKey, apiVersion });

      const config: any = {
        temperature: params.temperature,
        maxOutputTokens: params.maxTokens,
      };

      if (modelId.includes('thinking') || modelId.includes('2.5') || modelId.includes('gemini-3')) {
        config.thinkingConfig = { includeThoughts: true };
      }

      const resultGenerator = await ai.models.generateContentStream({
        model: modelId,
        contents: [
          { role: "user", parts: [{ text: `${params.systemInstruction}\n\n${params.prompt}` }] }
        ],
        config
      });

      for await (const chunk of resultGenerator) {
        const chunkText = chunk.text;
        if (chunkText) yield chunkText;

        if (chunk.usageMetadata && params.onUsage) {
          params.onUsage({
            prompt_tokens: chunk.usageMetadata.promptTokenCount || 0,
            completion_tokens: chunk.usageMetadata.candidatesTokenCount || 0,
            total_tokens: chunk.usageMetadata.totalTokenCount || 0
          });
        }
      }
    } catch (error: any) {
      console.error("Google Gemini Stream Error:", error);
      throw new Error(error.message || "Failed to stream from Gemini.");
    }
  }

  public async run(params: ExecutionParams): Promise<string> {
    const definition = SUPPORTED_MODELS.find(m => m.id === params.modelId);
    if (!definition) throw new Error(`Unsupported model: ${params.modelId}`);

    if (definition.provider === 'openrouter') {
      return this.executeOpenRouter(params);
    } else if (definition.provider === 'google') {
      return this.executeGoogle(params);
    } else {
      throw new Error(`Provider ${definition.provider} is not currently supported.`);
    }
  }

  public async *stream(params: ExecutionParams): AsyncGenerator<string, void, unknown> {
    const definition = SUPPORTED_MODELS.find(m => m.id === params.modelId);
    if (!definition) throw new Error(`Unsupported model: ${params.modelId}`);

    if (definition.provider === 'openrouter') {
      yield* this.streamOpenRouter(params);
    } else if (definition.provider === 'google') {
      yield* this.streamGoogle(params);
    } else {
      throw new Error(`Provider ${definition.provider} is not currently supported.`);
    }
  }
}

export const modelService = new ModelService();