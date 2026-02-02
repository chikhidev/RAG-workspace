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
    },
    categories: ['Reasoning', 'Code']
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
    },
    categories: ['Balanced', 'Vision']
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
    },
    categories: ['Speed', 'Code']
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
    },
    categories: ['Balanced', 'Code']
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
    },
    categories: ['Speed', 'Code']
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
    },
    categories: ['Balanced', 'Code']
  },
  {
    id: 'arcee-ai/trinity-large-preview:free',
    name: 'Trinity Large Preview',
    provider: 'openrouter',
    description: 'Arcee AI - 400B-parameter sparse MoE with 13B active parameters per token.',
    size: 'large',
    logo: '/logos/arceeai.png',
    isFree: true,
    metadata: {
      author: 'Arcee AI',
      context: '131K',
      inputPrice: '$0.00/M',
      outputPrice: '$0.00/M',
      latency: '1.00s',
      throughput: '100tps'
    },
    categories: ['Code', 'Reasoning']
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
    },
    categories: ['Reasoning', 'Code']
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
    },
    categories: ['Reasoning', 'Code']
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
    },
    categories: ['Code', 'Reasoning']
  },
  // --- GOOGLE MODELS (GEMINI 3 & 2.5) ---
  // Gemini 3 Pro - Most Intelligent Model
  {
    id: 'gemini-3-pro-preview',
    name: 'Gemini 3 Pro Preview',
    provider: 'google',
    description: 'The best model in the world for multimodal understanding, delivering richer visuals and deeper interactivity with state-of-the-art reasoning.',
    size: 'large',
    logo: '/logos/gemini.png',
    isFree: true,
    metadata: {
      author: 'Google',
      context: '1M',
      inputPrice: '$0.00/M',
      outputPrice: '$0.00/M',
      latency: '1.2s',
      throughput: '60tps',
      updated: 'November 2025',
      cutoff: 'January 2025'
    },
    categories: ['Code', 'Reasoning', 'Long Context']
  },
  {
    id: 'gemini-3-pro-image-preview',
    name: 'Gemini 3 Pro Image Preview',
    provider: 'google',
    description: 'Gemini 3 Pro with image generation capabilities. Supports image and text inputs/outputs with thinking.',
    size: 'large',
    logo: '/logos/gemini.png',
    isFree: true,
    metadata: {
      author: 'Google',
      context: '64K',
      inputPrice: '$0.00/M',
      outputPrice: '$0.00/M',
      latency: '1.8s',
      throughput: '40tps',
      updated: 'November 2025',
      cutoff: 'January 2025'
    },
    categories: ['Vision', 'Code']
  },
  // Gemini 3 Flash - Most Balanced Model
  {
    id: 'gemini-3-flash-preview',
    name: 'Gemini 3 Flash Preview',
    provider: 'google',
    description: 'Most balanced model built for speed, scale, and frontier intelligence.',
    size: 'small',
    logo: '/logos/gemini.png',
    isFree: true,
    metadata: {
      author: 'Google',
      context: '1M',
      inputPrice: '$0.00/M',
      outputPrice: '$0.00/M',
      latency: '0.4s',
      throughput: '200tps',
      updated: 'December 2025',
      cutoff: 'January 2025'
    },
    categories: ['Balanced', 'Code']
  },
  // Gemini 2.5 Pro - Advanced Thinking Model
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'google',
    description: 'State-of-the-art thinking model for complex reasoning in code, math, and STEM, plus analyzing large datasets with long context.',
    size: 'large',
    logo: '/logos/gemini.png',
    isFree: true,
    metadata: {
      author: 'Google',
      context: '1M',
      inputPrice: '$0.00/M',
      outputPrice: '$0.00/M',
      latency: '1.0s',
      throughput: '60tps',
      updated: 'June 2025',
      cutoff: 'January 2025'
    },
    categories: ['Reasoning', 'Code']
  },
  // Gemini 2.5 Flash - Fast and Intelligent
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'google',
    description: 'Best price-performance model for large-scale processing, low-latency, high-volume tasks with thinking and agentic capabilities.',
    size: 'small',
    logo: '/logos/gemini.png',
    isFree: true,
    metadata: {
      author: 'Google',
      context: '1M',
      inputPrice: '$0.00/M',
      outputPrice: '$0.00/M',
      latency: '0.3s',
      throughput: '250tps',
      updated: 'June 2025',
      cutoff: 'January 2025'
    },
    categories: ['Speed', 'Code']
  },
  {
    id: 'gemini-2.5-flash-preview-09-2025',
    name: 'Gemini 2.5 Flash Preview',
    provider: 'google',
    description: 'Preview version of Gemini 2.5 Flash with latest improvements.',
    size: 'small',
    logo: '/logos/gemini.png',
    isFree: true,
    metadata: {
      author: 'Google',
      context: '1M',
      inputPrice: '$0.00/M',
      outputPrice: '$0.00/M',
      latency: '0.3s',
      throughput: '250tps',
      updated: 'September 2025',
      cutoff: 'January 2025'
    },
    categories: ['Balanced', 'Code']
  },
  {
    id: 'gemini-2.5-flash-image',
    name: 'Gemini 2.5 Flash Image',
    provider: 'google',
    description: 'Optimized for image generation and understanding with text. Supports caching and structured outputs.',
    size: 'small',
    logo: '/logos/gemini.png',
    isFree: true,
    metadata: {
      author: 'Google',
      context: '64K',
      inputPrice: '$0.00/M',
      outputPrice: '$0.00/M',
      latency: '0.7s',
      throughput: '120tps',
      updated: 'October 2025',
      cutoff: 'June 2025'
    },
    categories: ['Vision', 'Code']
  },
  // Gemini 2.5 Flash-Lite - Ultra Fast
  {
    id: 'gemini-2.5-flash-lite',
    name: 'Gemini 2.5 Flash-Lite',
    provider: 'google',
    description: 'Fastest flash model optimized for cost-efficiency and high throughput.',
    size: 'small',
    logo: '/logos/gemini.png',
    isFree: true,
    metadata: {
      author: 'Google',
      context: '1M',
      inputPrice: '$0.00/M',
      outputPrice: '$0.00/M',
      latency: '0.2s',
      throughput: '450tps',
      updated: 'July 2025',
      cutoff: 'January 2025'
    },
    categories: ['Speed', 'Code']
  },
  {
    id: 'gemini-2.5-flash-lite-preview-09-2025',
    name: 'Gemini 2.5 Flash-Lite Preview',
    provider: 'google',
    description: 'Preview of the ultra-fast 2.5 Flash-Lite model.',
    size: 'small',
    logo: '/logos/gemini.png',
    isFree: true,
    metadata: {
      author: 'Google',
      context: '1M',
      inputPrice: '$0.00/M',
      outputPrice: '$0.00/M',
      latency: '0.2s',
      throughput: '450tps',
      updated: 'September 2025',
      cutoff: 'January 2025'
    },
    categories: ['Speed', 'Code']
  },
  // Gemini 2.0 - Deprecated (shut down March 31, 2026)
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash (DEPRECATED)',
    provider: 'google',
    description: 'DEPRECATED - Will be shut down on March 31, 2026. Use Gemini 2.5 Flash instead.',
    size: 'small',
    logo: '/logos/gemini.png',
    isFree: true,
    metadata: {
      author: 'Google',
      context: '1M',
      inputPrice: '$0.00/M',
      outputPrice: '$0.00/M',
      latency: '0.3s',
      throughput: '250tps',
      updated: 'February 2025',
      cutoff: 'August 2024',
      deprecated: 'March 31, 2026'
    },
    categories: ['Balanced', 'Code']
  },
  {
    id: 'gemini-2.0-flash-lite',
    name: 'Gemini 2.0 Flash-Lite (DEPRECATED)',
    provider: 'google',
    description: 'DEPRECATED - Will be shut down on March 31, 2026. Use Gemini 2.5 Flash-Lite instead.',
    size: 'small',
    logo: '/logos/gemini.png',
    isFree: true,
    metadata: {
      author: 'Google',
      context: '1M',
      inputPrice: '$0.00/M',
      outputPrice: '$0.00/M',
      latency: '0.2s',
      throughput: '350tps',
      updated: 'February 2025',
      cutoff: 'August 2024',
      deprecated: 'March 31, 2026'
    },
    categories: ['Speed', 'Code']
  },
  {
    id: 'gemini-2.0-flash-thinking-exp',
    name: 'Gemini 2.0 Thinking (Experimental)',
    provider: 'google',
    description: 'Experimental thinking model with extended reasoning capabilities.',
    size: 'large',
    logo: '/logos/gemini.png',
    isFree: true,
    metadata: {
      author: 'Google',
      context: '1M',
      inputPrice: '$0.00/M',
      outputPrice: '$0.00/M',
      latency: '1.2s',
      throughput: '60tps',
      cutoff: 'August 2024'
    },
    categories: ['Reasoning', 'Code']
  },
  // --- X.AI MODELS ---
  {
    id: 'grok-4-1-fast-reasoning',
    name: 'Grok 4.1 Fast Reasoning',
    provider: 'xai',
    description: 'xAI - Ultra-fast reasoning model with 2M context.',
    size: 'large',
    logo: '/logos/xai.png',
    metadata: {
      author: 'xAI',
      context: '2M',
      inputPrice: '$0.20/M',
      outputPrice: '$0.50/M',
      latency: 'Unknown',
      throughput: '4M tpm'
    },
    categories: ['Reasoning', 'Code']
  },
  {
    id: 'grok-4-1-fast-non-reasoning',
    name: 'Grok 4.1 Fast',
    provider: 'xai',
    description: 'xAI - Ultra-fast general purpose model with 2M context.',
    size: 'large',
    logo: '/logos/xai.png',
    metadata: {
      author: 'xAI',
      context: '2M',
      inputPrice: '$0.20/M',
      outputPrice: '$0.50/M',
      latency: 'Unknown',
      throughput: '4M tpm'
    },
    categories: ['Balanced', 'Code']
  },
  {
    id: 'grok-code-fast-1',
    name: 'Grok Code Fast',
    provider: 'xai',
    description: 'xAI - Optimized for ultra-fast coding tasks.',
    size: 'large',
    logo: '/logos/xai.png',
    metadata: {
      author: 'xAI',
      context: '256K',
      inputPrice: '$0.20/M',
      outputPrice: '$1.50/M',
      latency: 'Unknown',
      throughput: '2M tpm'
    }
  },
  {
    id: 'grok-4-fast-reasoning',
    name: 'Grok 4 Fast Reasoning',
    provider: 'xai',
    description: 'xAI - Fast reasoning model with 2M context.',
    size: 'large',
    logo: '/logos/xai.png',
    metadata: {
      author: 'xAI',
      context: '2M',
      inputPrice: '$0.20/M',
      outputPrice: '$0.50/M',
      latency: 'Unknown',
      throughput: '4M tpm'
    }
  },
  {
    id: 'grok-4-fast-non-reasoning',
    name: 'Grok 4 Fast',
    provider: 'xai',
    description: 'xAI - Fast general purpose model with 2M context.',
    size: 'large',
    logo: '/logos/xai.png',
    metadata: {
      author: 'xAI',
      context: '2M',
      inputPrice: '$0.20/M',
      outputPrice: '$0.50/M',
      latency: 'Unknown',
      throughput: '4M tpm'
    }
  },
  {
    id: 'grok-4-0709',
    name: 'Grok 4 (0709)',
    provider: 'xai',
    description: 'xAI - Legacy reasoning model.',
    size: 'large',
    logo: '/logos/xai.png',
    metadata: {
      author: 'xAI',
      context: '256K',
      inputPrice: '$3.00/M',
      outputPrice: '$15.00/M',
      latency: 'Unknown',
      throughput: '2M tpm'
    }
  },
  {
    id: 'grok-3-mini',
    name: 'Grok 3 Mini',
    provider: 'xai',
    description: 'xAI - Efficient reasoning model.',
    size: 'small',
    logo: '/logos/xai.png',
    metadata: {
      author: 'xAI',
      context: '131K',
      inputPrice: '$0.30/M',
      outputPrice: '$0.50/M',
      latency: 'Unknown',
      throughput: '480 rpm'
    }
  },
  {
    id: 'grok-3',
    name: 'Grok 3',
    provider: 'xai',
    description: 'xAI - High-intelligence flagship model.',
    size: 'large',
    logo: '/logos/xai.png',
    metadata: {
      author: 'xAI',
      context: '131K',
      inputPrice: '$3.00/M',
      outputPrice: '$15.00/M',
      latency: 'Unknown',
      throughput: '600 rpm'
    }
  },
  {
    id: 'grok-2-vision-1212',
    name: 'Grok 2 Vision',
    provider: 'xai',
    description: 'xAI - Multimodal vision model.',
    size: 'large',
    logo: '/logos/xai.png',
    metadata: {
      author: 'xAI',
      context: '32K',
      inputPrice: '$2.00/M',
      outputPrice: '$10.00/M',
      latency: 'Unknown',
      throughput: '600 rpm'
    },
    categories: ['Vision', 'Code']
  },
  // --- STEPFUN MODELS ---
  {
    id: 'stepfun/step-3.5-flash:free',
    name: 'Step 3.5 Flash',
    provider: 'openrouter',
    description: 'StepFun - Most capable open-source model with sparse MoE architecture. 11B active of 196B parameters.',
    size: 'large',
    logo: '/logos/stepfun.png',
    isFree: true,
    metadata: {
      author: 'StepFun',
      context: '256K',
      inputPrice: '$0.00/M',
      outputPrice: '$0.00/M',
      latency: '0.8s',
      throughput: '110tps'
    },
    categories: ['Reasoning', 'Code', 'Speed']
  },
  // --- BYTEDANCE SEED MODELS ---
  {
    id: 'bytedance-seed/seed-1.6-flash',
    name: 'Seed 1.6 Flash',
    provider: 'openrouter',
    description: 'ByteDance Seed - Ultra-fast multimodal model with deep thinking. 256K context, up to 16K output tokens.',
    size: 'large',
    logo: '/logos/bytedance.png',
    metadata: {
      author: 'ByteDance',
      context: '256K',
      inputPrice: '$0.075/M',
      outputPrice: '$0.30/M',
      latency: '0.7s',
      throughput: '120tps'
    },
    categories: ['Vision', 'Code', 'Speed']
  },
  {
    id: 'bytedance-seed/seed-1.6',
    name: 'Seed 1.6',
    provider: 'openrouter',
    description: 'ByteDance Seed - General-purpose multimodal model with adaptive deep thinking. 256K context.',
    size: 'large',
    logo: '/logos/bytedance.png',
    metadata: {
      author: 'ByteDance',
      context: '256K',
      inputPrice: '$0.25/M',
      outputPrice: '$2.00/M',
      latency: '1.0s',
      throughput: '80tps'
    },
    categories: ['Vision', 'Code', 'Reasoning']
  },
  {
    id: 'bytedance-seed/seedream-4.5',
    name: 'Seedream 4.5',
    provider: 'openrouter',
    description: 'ByteDance - Latest image generation model. Excellent editing consistency, portrait refinement, and small-text rendering.',
    size: 'large',
    logo: '/logos/bytedance.png',
    metadata: {
      author: 'ByteDance',
      context: '4K',
      inputPrice: '$0.00/M',
      outputPrice: '$9.581/M',
      latency: '2.0s',
      throughput: '30tps'
    },
    categories: ['Vision']
  },
  // --- XIAOMI MODELS ---
  {
    id: 'xiaomi/mimo-v2-flash',
    name: 'MiMo-V2-Flash',
    provider: 'openrouter',
    description: 'Xiaomi - 309B total params, 15B active. Hybrid-thinking toggle, 256K context. #1 on SWE-bench Open-Source.',
    size: 'large',
    logo: '/logos/mimo.png',
    metadata: {
      author: 'Xiaomi',
      context: '256K',
      inputPrice: '$0.09/M',
      outputPrice: '$0.29/M',
      latency: '0.9s',
      throughput: '100tps'
    },
    categories: ['Reasoning', 'Code', 'Speed']
  },
  // --- DEEPSEEK MODELS (OpenRouter) ---
  {
    id: 'deepseek/deepseek-v3.2-speciale',
    name: 'DeepSeek V3.2 Speciale',
    provider: 'openrouter',
    description: 'DeepSeek - High-compute reasoning variant optimized for maximum reasoning and agentic performance. Ahead of GPT-5.',
    size: 'large',
    logo: '/logos/deepseek.png',
    metadata: {
      author: 'DeepSeek',
      context: '163.84K',
      inputPrice: '$0.27/M',
      outputPrice: '$0.41/M',
      latency: '1.2s',
      throughput: '75tps'
    },
    categories: ['Reasoning', 'Code']
  },
  {
    id: 'deepseek/deepseek-v3.2',
    name: 'DeepSeek V3.2',
    provider: 'openrouter',
    description: 'DeepSeek - Balanced reasoning and agentic performance with Sparse Attention (DSA). Gold medals on 2025 IMO & IOI.',
    size: 'large',
    logo: '/logos/deepseek.png',
    metadata: {
      author: 'DeepSeek',
      context: '163.84K',
      inputPrice: '$0.25/M',
      outputPrice: '$0.38/M',
      latency: '1.0s',
      throughput: '85tps'
    },
    categories: ['Reasoning', 'Code']
  },
  {
    id: 'deepseek/deepseek-r1',
    name: 'DeepSeek R1',
    provider: 'openrouter',
    description: 'DeepSeek - Performance on par with OpenAI o1, fully open-sourced with open reasoning tokens. 671B params, 37B active.',
    size: 'large',
    logo: '/logos/deepseek.png',
    metadata: {
      author: 'DeepSeek',
      context: '64K',
      inputPrice: '$0.70/M',
      outputPrice: '$2.50/M',
      latency: '1.5s',
      throughput: '60tps'
    },
    categories: ['Reasoning', 'Code']
  },
  // --- NVIDIA PAID MODELS ---
  {
    id: 'nvidia/nemotron-3-nano-30b-a3b',
    name: 'Nemotron 3 Nano 30B A3B (Paid)',
    provider: 'openrouter',
    description: 'NVIDIA - Small language MoE with highest compute efficiency. Open-weights for custom deployment.',
    size: 'small',
    logo: '/logos/nvidia.png',
    metadata: {
      author: 'NVIDIA',
      context: '256K',
      inputPrice: '$0.05/M',
      outputPrice: '$0.20/M',
      latency: '0.6s',
      throughput: '140tps'
    },
    categories: ['Reasoning', 'Code', 'Speed', 'Budget']
  },
  // --- PERPLEXITY MODELS ---
  {
    id: 'perplexity/sonar-pro-search',
    name: 'Sonar Pro Search',
    provider: 'openrouter',
    description: 'Perplexity - Most advanced agentic search system with multi-step reasoning. $18/K requests + tokens.',
    size: 'large',
    logo: '/logos/perplexity.png',
    metadata: {
      author: 'Perplexity',
      context: '200K',
      inputPrice: '$3.00/M',
      outputPrice: '$15.00/M',
      latency: '1.5s',
      throughput: '60tps'
    },
    categories: ['Reasoning', 'Code']
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
    },
    categories: ['Code', 'Reasoning']
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
    },
    categories: ['Code', 'Reasoning', 'Long Context']
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
    },
    categories: ['Code', 'Speed', 'Budget']
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
    },
    categories: ['Code', 'Speed', 'Budget']
  },
  {
    id: 'moonshotai/kimi-k2.5',
    name: 'Kimi K2.5',
    provider: 'openrouter',
    description: 'MoonshotAI - Native multimodal model with state-of-the-art visual coding and agentic tool-calling.',
    size: 'large',
    logo: '/logos/kimi.png',
    metadata: {
      author: 'MoonshotAI',
      context: '262K',
      inputPrice: '$0.50/M',
      outputPrice: '$2.80/M',
      latency: '1.5s',
      throughput: '75tps'
    }
  },
  {
    id: 'minimax/minimax-m2-her',
    name: 'MiniMax M2-her',
    provider: 'openrouter',
    description: 'MiniMax - Dialogue-first model for immersive roleplay and character-driven conversations.',
    size: 'small',
    logo: '/logos/minimax.png',
    metadata: {
      author: 'MiniMax',
      context: '65K',
      inputPrice: '$0.30/M',
      outputPrice: '$1.20/M',
      latency: '0.8s',
      throughput: '110tps'
    }
  },
  {
    id: 'writer/palmyra-x5',
    name: 'Palmyra X5',
    provider: 'openrouter',
    description: 'Writer - Enterprise AI agents model with 1M context window and hybrid attention mechanisms.',
    size: 'large',
    logo: '/logos/palmyra.png',
    metadata: {
      author: 'Writer',
      context: '1M',
      inputPrice: '$0.60/M',
      outputPrice: '$6.00/M',
      latency: '1.8s',
      throughput: '65tps'
    }
  },
  {
    id: 'openai/gpt-4.1',
    name: 'GPT-4.1',
    provider: 'openrouter',
    description: 'OpenAI - Flagship model for advanced instruction following and long-context reasoning with 1M tokens.',
    size: 'large',
    logo: '/logos/chatgpt.png',
    metadata: {
      author: 'OpenAI',
      context: '1.05M',
      inputPrice: '$2.00/M',
      outputPrice: '$8.00/M',
      latency: '1.0s',
      throughput: '80tps'
    }
  },
  {
    id: 'openai/gpt-4.1-mini',
    name: 'GPT-4.1 Mini',
    provider: 'openrouter',
    description: 'OpenAI - Mid-sized model competitive with GPT-4o at lower latency and cost.',
    size: 'small',
    logo: '/logos/chatgpt.png',
    metadata: {
      author: 'OpenAI',
      context: '1.05M',
      inputPrice: '$0.40/M',
      outputPrice: '$1.60/M',
      latency: '0.6s',
      throughput: '140tps'
    }
  },
  {
    id: 'openai/gpt-4.1-nano',
    name: 'GPT-4.1 Nano',
    provider: 'openrouter',
    description: 'OpenAI - Fastest and cheapest in GPT-4.1 series with 1M context.',
    size: 'small',
    logo: '/logos/chatgpt.png',
    metadata: {
      author: 'OpenAI',
      context: '1.05M',
      inputPrice: '$0.10/M',
      outputPrice: '$0.40/M',
      latency: '0.4s',
      throughput: '200tps'
    }
  },
  {
    id: 'minimax/minimax-01',
    name: 'MiniMax-01',
    provider: 'openrouter',
    description: 'MiniMax - 456B parameter MoE combining text generation and image understanding with 4M context.',
    size: 'large',
    logo: '/logos/minimax.png',
    metadata: {
      author: 'MiniMax',
      context: '1M',
      inputPrice: '$0.20/M',
      outputPrice: '$1.10/M',
      latency: '1.2s',
      throughput: '75tps'
    }
  },
  {
    id: 'amazon/nova-2-lite-v1',
    name: 'Nova 2 Lite',
    provider: 'openrouter',
    description: 'Amazon - Fast, cost-effective reasoning model for everyday multimodal workloads.',
    size: 'small',
    logo: '/logos/nova.png',
    metadata: {
      author: 'Amazon',
      context: '1M',
      inputPrice: '$0.30/M',
      outputPrice: '$2.50/M',
      latency: '0.7s',
      throughput: '120tps'
    }
  },
  {
    id: 'amazon/nova-premier-v1',
    name: 'Nova Premier 1.0',
    provider: 'openrouter',
    description: 'Amazon - Most capable multimodal model for complex reasoning and custom model distillation.',
    size: 'large',
    logo: '/logos/nova.png',
    metadata: {
      author: 'Amazon',
      context: '1M',
      inputPrice: '$2.50/M',
      outputPrice: '$12.50/M',
      latency: '1.5s',
      throughput: '60tps'
    }
  },
  {
    id: 'qwen/qwen-plus-2025-07-28',
    name: 'Qwen Plus 0728',
    provider: 'openrouter',
    description: 'Qwen - 1M context hybrid reasoning model with balanced performance, speed, and cost.',
    size: 'large',
    logo: '/logos/qwen.png',
    metadata: {
      author: 'Qwen',
      context: '1M',
      inputPrice: '$0.40/M',
      outputPrice: '$1.20/M',
      latency: '0.8s',
      throughput: '110tps'
    }
  },
  {
    id: 'qwen/qwen-plus-0728-thinking',
    name: 'Qwen Plus 0728 Thinking',
    provider: 'openrouter',
    description: 'Qwen - 1M context hybrid reasoning model with enhanced thinking capabilities.',
    size: 'large',
    logo: '/logos/qwen.png',
    metadata: {
      author: 'Qwen',
      context: '1M',
      inputPrice: '$0.40/M',
      outputPrice: '$4.00/M',
      latency: '1.2s',
      throughput: '80tps'
    }
  },
  {
    id: 'minimax/minimax-m1',
    name: 'MiniMax M1',
    provider: 'openrouter',
    description: 'MiniMax - 456B parameter open-weight MoE with lightning attention for long-context reasoning.',
    size: 'large',
    logo: '/logos/minimax.png',
    metadata: {
      author: 'MiniMax',
      context: '1M',
      inputPrice: '$0.40/M',
      outputPrice: '$2.20/M',
      latency: '1.0s',
      throughput: '85tps'
    }
  },
  {
    id: 'anthropic/claude-sonnet-4',
    name: 'Claude Sonnet 4',
    provider: 'openrouter',
    description: 'Anthropic - Enhanced coding and reasoning with 72.7% SWE-bench performance.',
    size: 'large',
    logo: '/logos/claude.png',
    metadata: {
      author: 'Anthropic',
      context: '1M',
      inputPrice: '$3.00/M',
      outputPrice: '$15.00/M',
      latency: '1.1s',
      throughput: '75tps'
    }
  },
  {
    id: 'qwen/qwen-turbo',
    name: 'Qwen-Turbo',
    provider: 'openrouter',
    description: 'Qwen - Fast speed and low cost 1M context model for simple tasks.',
    size: 'small',
    logo: '/logos/qwen.png',
    metadata: {
      author: 'Qwen',
      context: '1M',
      inputPrice: '$0.05/M',
      outputPrice: '$0.20/M',
      latency: '0.4s',
      throughput: '180tps'
    }
  },
  {
    id: 'openai/gpt-5.2-pro',
    name: 'GPT-5.2 Pro',
    provider: 'openrouter',
    description: 'OpenAI - Most advanced model with major improvements in agentic coding and long context.',
    size: 'large',
    logo: '/logos/chatgpt.png',
    metadata: {
      author: 'OpenAI',
      context: '400K',
      inputPrice: '$21.00/M',
      outputPrice: '$168.00/M',
      latency: '2.0s',
      throughput: '40tps'
    }
  },
  {
    id: 'openai/gpt-5.2',
    name: 'GPT-5.2',
    provider: 'openrouter',
    description: 'OpenAI - Latest frontier-grade with adaptive reasoning and stronger agentic performance.',
    size: 'large',
    logo: '/logos/chatgpt.png',
    metadata: {
      author: 'OpenAI',
      context: '400K',
      inputPrice: '$1.75/M',
      outputPrice: '$14.00/M',
      latency: '1.5s',
      throughput: '60tps'
    }
  },
  {
    id: 'openai/gpt-5',
    name: 'GPT-5',
    provider: 'openrouter',
    description: 'OpenAI - Most advanced model with major improvements in reasoning, code quality, and user experience.',
    size: 'large',
    logo: '/logos/chatgpt.png',
    metadata: {
      author: 'OpenAI',
      context: '400K',
      inputPrice: '$1.25/M',
      outputPrice: '$10.00/M',
      latency: '1.3s',
      throughput: '70tps'
    }
  },
  {
    id: 'openai/gpt-5-image-mini',
    name: 'GPT-5 Image Mini',
    provider: 'openrouter',
    description: 'OpenAI - Combines GPT-5 Mini with image generation for efficient visual creation.',
    size: 'small',
    logo: '/logos/chatgpt.png',
    metadata: {
      author: 'OpenAI',
      context: '400K',
      inputPrice: '$2.50/M',
      outputPrice: '$8.00/M',
      latency: '1.0s',
      throughput: '90tps'
    }
  },
  {
    id: 'openai/gpt-5-image',
    name: 'GPT-5 Image',
    provider: 'openrouter',
    description: 'OpenAI - Combines GPT-5 with state-of-the-art image generation capabilities.',
    size: 'large',
    logo: '/logos/chatgpt.png',
    metadata: {
      author: 'OpenAI',
      context: '400K',
      inputPrice: '$10.00/M',
      outputPrice: '$40.00/M',
      latency: '1.8s',
      throughput: '50tps'
    }
  },
  {
    id: 'openai/gpt-5-pro',
    name: 'GPT-5 Pro',
    provider: 'openrouter',
    description: 'OpenAI - Most advanced model optimized for complex reasoning and high-stakes tasks.',
    size: 'large',
    logo: '/logos/chatgpt.png',
    metadata: {
      author: 'OpenAI',
      context: '400K',
      inputPrice: '$15.00/M',
      outputPrice: '$120.00/M',
      latency: '1.8s',
      throughput: '45tps'
    }
  },
  {
    id: 'openai/gpt-5-codex',
    name: 'GPT-5 Codex',
    provider: 'openrouter',
    description: 'OpenAI - Specialized for software engineering with superior code quality and project building.',
    size: 'large',
    logo: '/logos/chatgpt.png',
    metadata: {
      author: 'OpenAI',
      context: '400K',
      inputPrice: '$1.25/M',
      outputPrice: '$10.00/M',
      latency: '1.4s',
      throughput: '65tps'
    }
  },
  {
    id: 'openai/gpt-5-mini',
    name: 'GPT-5 Mini',
    provider: 'openrouter',
    description: 'OpenAI - Compact version with reduced latency and cost for lighter reasoning tasks.',
    size: 'small',
    logo: '/logos/chatgpt.png',
    metadata: {
      author: 'OpenAI',
      context: '400K',
      inputPrice: '$0.25/M',
      outputPrice: '$2.00/M',
      latency: '0.7s',
      throughput: '120tps'
    }
  },
  {
    id: 'openai/gpt-5-nano',
    name: 'GPT-5 Nano',
    provider: 'openrouter',
    description: 'OpenAI - Smallest and fastest variant optimized for ultra-low latency.',
    size: 'small',
    logo: '/logos/chatgpt.png',
    metadata: {
      author: 'OpenAI',
      context: '400K',
      inputPrice: '$0.05/M',
      outputPrice: '$0.40/M',
      latency: '0.4s',
      throughput: '200tps'
    }
  },
  {
    id: 'amazon/nova-lite-v1',
    name: 'Nova Lite 1.0',
    provider: 'openrouter',
    description: 'Amazon - Very low-cost multimodal model for fast image, video, and text processing.',
    size: 'small',
    logo: '/logos/nova.png',
    metadata: {
      author: 'Amazon',
      context: '300K',
      inputPrice: '$0.06/M',
      outputPrice: '$0.24/M',
      latency: '0.5s',
      throughput: '150tps'
    }
  },
  {
    id: 'amazon/nova-pro-v1',
    name: 'Nova Pro 1.0',
    provider: 'openrouter',
    description: 'Amazon - Capable multimodal model with state-of-the-art visual understanding.',
    size: 'large',
    logo: '/logos/nova.png',
    metadata: {
      author: 'Amazon',
      context: '300K',
      inputPrice: '$0.80/M',
      outputPrice: '$3.20/M',
      latency: '1.0s',
      throughput: '90tps'
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
    id: 'x-ai/grok-4.1-fast',
    name: 'Grok 4.1 Fast',
    provider: 'openrouter',
    description: 'xAI - Best agentic tool calling model for customer support and research with 2M context.',
    size: 'large',
    logo: '/logos/xai.png',
    metadata: {
      author: 'xAI',
      context: '2M',
      inputPrice: '$0.20/M',
      outputPrice: '$0.50/M',
      latency: '0.9s',
      throughput: '100tps'
    }
  },
  {
    id: 'x-ai/grok-4-fast',
    name: 'Grok 4 Fast',
    provider: 'openrouter',
    description: 'xAI - Latest multimodal model with SOTA cost-efficiency and 2M context.',
    size: 'large',
    logo: '/logos/xai.png',
    metadata: {
      author: 'xAI',
      context: '2M',
      inputPrice: '$0.20/M',
      outputPrice: '$0.50/M',
      latency: '0.8s',
      throughput: '110tps'
    }
  },
  {
    id: 'google/gemini-3-flash-preview',
    name: 'Gemini 3 Flash Preview',
    provider: 'openrouter',
    description: 'Google - High speed thinking model for agentic workflows with 1M context.',
    size: 'large',
    logo: '/logos/gemini.png',
    metadata: {
      author: 'Google',
      context: '1.05M',
      inputPrice: '$0.50/M',
      outputPrice: '$3.00/M',
      latency: '0.6s',
      throughput: '150tps'
    }
  },
  {
    id: 'google/gemini-3-pro-preview',
    name: 'Gemini 3 Pro Preview',
    provider: 'openrouter',
    description: 'Google - Flagship frontier model for high-precision multimodal reasoning with 1M context.',
    size: 'large',
    logo: '/logos/gemini.png',
    metadata: {
      author: 'Google',
      context: '1.05M',
      inputPrice: '$2.00/M',
      outputPrice: '$12.00/M',
      latency: '1.2s',
      throughput: '70tps'
    }
  },
  {
    id: 'google/gemini-2.5-flash-preview-09-2025',
    name: 'Gemini 2.5 Flash Preview 09-2025',
    provider: 'openrouter',
    description: 'Google - State-of-the-art workhorse with built-in thinking. Going away February 17, 2026.',
    size: 'small',
    logo: '/logos/gemini.png',
    metadata: {
      author: 'Google',
      context: '1.05M',
      inputPrice: '$0.30/M',
      outputPrice: '$2.50/M',
      latency: '0.5s',
      throughput: '180tps',
      deprecated: 'February 17, 2026'
    }
  },
  {
    id: 'google/gemini-2.5-flash-lite-preview-09-2025',
    name: 'Gemini 2.5 Flash-Lite Preview 09-2025',
    provider: 'openrouter',
    description: 'Google - Lightweight reasoning model optimized for ultra-low latency and cost efficiency.',
    size: 'small',
    logo: '/logos/gemini.png',
    metadata: {
      author: 'Google',
      context: '1.05M',
      inputPrice: '$0.10/M',
      outputPrice: '$0.40/M',
      latency: '0.3s',
      throughput: '250tps'
    }
  },
  {
    id: 'google/gemini-2.5-flash-lite',
    name: 'Gemini 2.5 Flash-Lite',
    provider: 'openrouter',
    description: 'Google - Lightweight reasoning model with improved throughput and faster token generation.',
    size: 'small',
    logo: '/logos/gemini.png',
    metadata: {
      author: 'Google',
      context: '1.05M',
      inputPrice: '$0.10/M',
      outputPrice: '$0.40/M',
      latency: '0.3s',
      throughput: '280tps'
    }
  },
  {
    id: 'google/gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'openrouter',
    description: 'Google - State-of-the-art workhorse model with built-in thinking capabilities.',
    size: 'small',
    logo: '/logos/gemini.png',
    metadata: {
      author: 'Google',
      context: '1.05M',
      inputPrice: '$0.30/M',
      outputPrice: '$2.50/M',
      latency: '0.5s',
      throughput: '180tps'
    }
  },
  {
    id: 'google/gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'openrouter',
    description: 'Google - State-of-the-art AI with advanced reasoning and thinking capabilities.',
    size: 'large',
    logo: '/logos/gemini.png',
    metadata: {
      author: 'Google',
      context: '1.05M',
      inputPrice: '$1.25/M',
      outputPrice: '$10.00/M',
      latency: '1.0s',
      throughput: '90tps'
    }
  },
  {
    id: 'google/gemini-2.5-pro-preview',
    name: 'Gemini 2.5 Pro Preview 06-05',
    provider: 'openrouter',
    description: 'Google - State-of-the-art AI model achieving top-tier benchmark performance.',
    size: 'large',
    logo: '/logos/gemini.png',
    metadata: {
      author: 'Google',
      context: '1.05M',
      inputPrice: '$1.25/M',
      outputPrice: '$10.00/M',
      latency: '1.0s',
      throughput: '90tps'
    }
  },
  {
    id: 'google/gemini-2.5-pro-preview-05-06',
    name: 'Gemini 2.5 Pro Preview 05-06',
    provider: 'openrouter',
    description: 'Google - State-of-the-art AI model with enhanced accuracy and context handling.',
    size: 'large',
    logo: '/logos/gemini.png',
    metadata: {
      author: 'Google',
      context: '1.05M',
      inputPrice: '$1.25/M',
      outputPrice: '$10.00/M',
      latency: '1.0s',
      throughput: '90tps'
    }
  },
  {
    id: 'meta-llama/llama-4-maverick',
    name: 'Llama 4 Maverick',
    provider: 'openrouter',
    description: 'Meta - High-capacity multimodal MoE with 128 experts and 17B active parameters. Vision-language optimized.',
    size: 'large',
    logo: '/logos/meta.png',
    metadata: {
      author: 'Meta',
      context: '1.05M',
      inputPrice: '$0.15/M',
      outputPrice: '$0.60/M',
      latency: '0.7s',
      throughput: '130tps'
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
  // --- MISTRAL AI MODELS ---
  // Latest Models
  {
    id: 'mistral-large-latest',
    name: 'Mistral Large Latest',
    provider: 'mistral',
    description: 'Mistral - Flagship model with top-tier reasoning, 128K context, and multimodal capabilities.',
    size: 'large',
    logo: '/logos/mistral.png',
    metadata: {
      author: 'Mistral AI',
      context: '128K',
      inputPrice: '$2.00/M',
      outputPrice: '$6.00/M',
      latency: 'Fast',
      throughput: 'High',
      updated: 'July 2024'
    }
  },
  {
    id: 'mistral-small-latest',
    name: 'Mistral Small Latest',
    provider: 'mistral',
    description: 'Mistral - Enterprise-grade small model optimized for low latency workloads.',
    size: 'small',
    logo: '/logos/mistral.png',
    metadata: {
      author: 'Mistral AI',
      context: '128K',
      inputPrice: '$0.20/M',
      outputPrice: '$0.60/M',
      latency: 'Very Fast',
      throughput: 'Very High',
      updated: 'September 2024'
    }
  },
  {
    id: 'pixtral-large-latest',
    name: 'Pixtral Large Latest',
    provider: 'mistral',
    description: 'Mistral - Flagship multimodal model with 128K context and vision capabilities.',
    size: 'large',
    logo: '/logos/mistral.png',
    metadata: {
      author: 'Mistral AI',
      context: '128K',
      inputPrice: '$2.00/M',
      outputPrice: '$6.00/M',
      latency: 'Fast',
      throughput: 'High',
      updated: 'November 2024'
    }
  },
  {
    id: 'ministral-3b-latest',
    name: 'Ministral 3B Latest',
    provider: 'mistral',
    description: 'Mistral - Ultra-efficient 3B model for edge and on-device deployment.',
    size: 'small',
    logo: '/logos/mistral.png',
    metadata: {
      author: 'Mistral AI',
      context: '128K',
      inputPrice: '$0.04/M',
      outputPrice: '$0.04/M',
      latency: 'Fastest',
      throughput: 'Very High',
      updated: 'October 2024'
    }
  },
  {
    id: 'ministral-8b-latest',
    name: 'Ministral 8B Latest',
    provider: 'mistral',
    description: 'Mistral - Knowledge-dense 8B model balancing efficiency and performance.',
    size: 'small',
    logo: '/logos/mistral.png',
    metadata: {
      author: 'Mistral AI',
      context: '128K',
      inputPrice: '$0.10/M',
      outputPrice: '$0.10/M',
      latency: 'Very Fast',
      throughput: 'Very High',
      updated: 'October 2024'
    }
  },
  {
    id: 'devstral-small-latest',
    name: 'Devstral Small Latest',
    provider: 'mistral',
    description: 'Mistral - Specialized coding model with 256K context window.',
    size: 'small',
    logo: '/logos/mistral.png',
    metadata: {
      author: 'Mistral AI',
      context: '256K',
      inputPrice: '$0.20/M',
      outputPrice: '$0.60/M',
      latency: 'Very Fast',
      throughput: 'High',
      updated: 'February 2025'
    }
  },
  {
    id: 'codestral-latest',
    name: 'Codestral Latest',
    provider: 'mistral',
    description: 'Mistral - Premier code generation model with 256K context.',
    size: 'large',
    logo: '/logos/mistral.png',
    metadata: {
      author: 'Mistral AI',
      context: '256K',
      inputPrice: '$0.20/M',
      outputPrice: '$0.60/M',
      latency: 'Fast',
      throughput: 'High',
      updated: 'May 2024'
    }
  },
  // Dated Models
  {
    id: 'mistral-large-2411',
    name: 'Mistral Large 2411',
    provider: 'mistral',
    description: 'Mistral - Stable snapshot from November 2024.',
    size: 'large',
    logo: '/logos/mistral.png',
    metadata: {
      author: 'Mistral AI',
      context: '128K',
      inputPrice: '$2.00/M',
      outputPrice: '$6.00/M',
      latency: 'Fast',
      throughput: 'High',
      updated: 'November 2024'
    }
  },
  {
    id: 'mistral-small-2501',
    name: 'Mistral Small 2501',
    provider: 'mistral',
    description: 'Mistral - Stable snapshot from January 2025.',
    size: 'small',
    logo: '/logos/mistral.png',
    metadata: {
      author: 'Mistral AI',
      context: '128K',
      inputPrice: '$0.20/M',
      outputPrice: '$0.60/M',
      latency: 'Very Fast',
      throughput: 'Very High',
      updated: 'January 2025'
    }
  },
  {
    id: 'pixtral-large-2411',
    name: 'Pixtral Large 2411',
    provider: 'mistral',
    description: 'Mistral - Multimodal snapshot from November 2024.',
    size: 'large',
    logo: '/logos/mistral.png',
    metadata: {
      author: 'Mistral AI',
      context: '128K',
      inputPrice: '$2.00/M',
      outputPrice: '$6.00/M',
      latency: 'Fast',
      throughput: 'High',
      updated: 'November 2024'
    }
  },
  {
    id: 'pixtral-12b-2409',
    name: 'Pixtral 12B 2409',
    provider: 'mistral',
    description: 'Mistral - 12B multimodal model from September 2024.',
    size: 'small',
    logo: '/logos/mistral.png',
    metadata: {
      author: 'Mistral AI',
      context: '128K',
      inputPrice: '$0.15/M',
      outputPrice: '$0.15/M',
      latency: 'Very Fast',
      throughput: 'High',
      updated: 'September 2024'
    }
  },
  {
    id: 'ministral-3b-2410',
    name: 'Ministral 3B 2410',
    provider: 'mistral',
    description: 'Mistral - 3B edge model from October 2024.',
    size: 'small',
    logo: '/logos/mistral.png',
    metadata: {
      author: 'Mistral AI',
      context: '128K',
      inputPrice: '$0.04/M',
      outputPrice: '$0.04/M',
      latency: 'Fastest',
      throughput: 'Very High',
      updated: 'October 2024'
    }
  },
  {
    id: 'ministral-8b-2410',
    name: 'Ministral 8B 2410',
    provider: 'mistral',
    description: 'Mistral - 8B model from October 2024.',
    size: 'small',
    logo: '/logos/mistral.png',
    metadata: {
      author: 'Mistral AI',
      context: '128K',
      inputPrice: '$0.10/M',
      outputPrice: '$0.10/M',
      latency: 'Very Fast',
      throughput: 'Very High',
      updated: 'October 2024'
    }
  },
  {
    id: 'devstral-small-2501',
    name: 'Devstral Small 2501',
    provider: 'mistral',
    description: 'Mistral - Coding model snapshot from January 2025.',
    size: 'small',
    logo: '/logos/mistral.png',
    metadata: {
      author: 'Mistral AI',
      context: '256K',
      inputPrice: '$0.20/M',
      outputPrice: '$0.60/M',
      latency: 'Very Fast',
      throughput: 'High',
      updated: 'January 2025'
    }
  },
  {
    id: 'codestral-2501',
    name: 'Codestral 2501',
    provider: 'mistral',
    description: 'Mistral - Code generation snapshot from January 2025.',
    size: 'large',
    logo: '/logos/mistral.png',
    metadata: {
      author: 'Mistral AI',
      context: '256K',
      inputPrice: '$0.20/M',
      outputPrice: '$0.60/M',
      latency: 'Fast',
      throughput: 'High',
      updated: 'January 2025'
    }
  },
  // Legacy Models
  {
    id: 'mistral-large-2407',
    name: 'Mistral Large 2407 (Legacy)',
    provider: 'mistral',
    description: 'Mistral - Legacy flagship model from July 2024.',
    size: 'large',
    logo: '/logos/mistral.png',
    metadata: {
      author: 'Mistral AI',
      context: '128K',
      inputPrice: '$2.00/M',
      outputPrice: '$6.00/M',
      latency: 'Fast',
      throughput: 'High',
      updated: 'July 2024'
    }
  },
  {
    id: 'mistral-small-2409',
    name: 'Mistral Small 2409 (Legacy)',
    provider: 'mistral',
    description: 'Mistral - Legacy small model from September 2024.',
    size: 'small',
    logo: '/logos/mistral.png',
    metadata: {
      author: 'Mistral AI',
      context: '128K',
      inputPrice: '$0.20/M',
      outputPrice: '$0.60/M',
      latency: 'Very Fast',
      throughput: 'Very High',
      updated: 'September 2024'
    }
  },
  {
    id: 'codestral-2405',
    name: 'Codestral 2405 (Legacy)',
    provider: 'mistral',
    description: 'Mistral - Legacy code model from May 2024.',
    size: 'large',
    logo: '/logos/mistral.png',
    metadata: {
      author: 'Mistral AI',
      context: '32K',
      inputPrice: '$0.20/M',
      outputPrice: '$0.60/M',
      latency: 'Fast',
      throughput: 'High',
      updated: 'May 2024'
    }
  },
  // --- OPENAI MODELS (Responses API) ---
  {
    "id": "gpt-5.2",
    "name": "GPT-5.2",
    "provider": "openai",
    "description": "OpenAI - Flagship model. Best for coding, agentic tasks, and deep reasoning.",
    "size": "large",
    "logo": "/logos/chatgpt.png",
    "metadata": {
      "author": "OpenAI",
      "context": "400K",
      "inputPrice": "$1.75",
      "outputPrice": "$14.00",
      "latency": "Medium",
      "throughput": "High"
    }
  },
  {
    "id": "gpt-5-mini",
    "name": "GPT-5 mini",
    "provider": "openai",
    "description": "OpenAI - Cost-efficient, high-intelligence version of GPT-5 family.",
    "size": "small",
    "logo": "/logos/chatgpt.png",
    "metadata": {
      "author": "OpenAI",
      "context": "400K",
      "inputPrice": "$0.25",
      "outputPrice": "$2.00",
      "latency": "Low",
      "throughput": "Very High"
    }
  },
  {
    "id": "gpt-5-nano",
    "name": "GPT-5 nano",
    "provider": "openai",
    "description": "OpenAI - Fastest, most cost-efficient model for lightweight tasks.",
    "size": "small",
    "logo": "/logos/chatgpt.png",
    "metadata": {
      "author": "OpenAI",
      "context": "400K",
      "inputPrice": "$0.05",
      "outputPrice": "$0.40",
      "latency": "Very Low",
      "throughput": "Extreme"
    }
  },
  {
    "id": "gpt-5.2-pro",
    "name": "GPT-5.2 pro",
    "provider": "openai",
    "description": "OpenAI - Maximum reasoning capability. 12x cost of standard 5.2.",
    "size": "large",
    "logo": "/logos/chatgpt.png",
    "metadata": {
      "author": "OpenAI",
      "context": "400K",
      "inputPrice": "$21.00",
      "outputPrice": "$168.00",
      "latency": "High",
      "throughput": "Low"
    }
  },
  {
    "id": "gpt-5",
    "name": "GPT-5",
    "provider": "openai",
    "description": "OpenAI - The original 5-series reasoning model (Aug 2025).",
    "size": "large",
    "logo": "/logos/chatgpt.png",
    "metadata": {
      "author": "OpenAI",
      "context": "400K",
      "inputPrice": "$1.25",
      "outputPrice": "$10.00",
      "latency": "Medium",
      "throughput": "Medium"
    }
  },
  {
    "id": "gpt-4.1",
    "name": "GPT-4.1",
    "provider": "openai",
    "description": "OpenAI - Smartest non-reasoning model. Massive context window.",
    "size": "large",
    "logo": "/logos/chatgpt.png",
    "metadata": {
      "author": "OpenAI",
      "context": "1M",
      "inputPrice": "$2.00",
      "outputPrice": "$8.00",
      "latency": "Low",
      "throughput": "High"
    }
  },
  {
    "id": "gpt-oss-20b",
    "name": "gpt-oss-20b",
    "provider": "openai",
    "description": "OpenAI - Open-weight MoE model (21B params). Optimized for consumer GPUs.",
    "size": "small",
    "logo": "/logos/chatgpt.png",
    "metadata": {
      "author": "OpenAI",
      "context": "128K",
      "inputPrice": "Free (Self-Hosted)",
      "outputPrice": "Free (Self-Hosted)",
      "latency": "Low",
      "throughput": "High"
    }
  },
  {
    "id": "o3-mini",
    "name": "o3-mini",
    "provider": "openai",
    "description": "OpenAI - High-speed reasoning model. Replaced o1-mini.",
    "size": "small",
    "logo": "/logos/chatgpt.png",
    "metadata": {
      "author": "OpenAI",
      "context": "200K",
      "inputPrice": "$1.10",
      "outputPrice": "$4.40",
      "latency": "Low",
      "throughput": "High"
    }
  },
  {
    "id": "o1",
    "name": "o1",
    "provider": "openai",
    "description": "OpenAI - Legacy reasoning model (2024).",
    "size": "large",
    "logo": "/logos/chatgpt.png",
    "metadata": {
      "author": "OpenAI",
      "context": "128K",
      "inputPrice": "$15.00",
      "outputPrice": "$60.00",
      "latency": "High",
      "throughput": "Low"
    }
  },
  {
    "id": "o1-mini",
    "name": "o1-mini",
    "provider": "openai",
    "description": "OpenAI - Legacy small reasoning model (2024).",
    "size": "small",
    "logo": "/logos/chatgpt.png",
    "metadata": {
      "author": "OpenAI",
      "context": "128K",
      "inputPrice": "$1.10",
      "outputPrice": "$4.40",
      "latency": "Low",
      "throughput": "High"
    }
  }
];

interface ExecutionParams {
  modelId: string;
  systemInstruction: string;
  prompt: string;
  temperature: number;
  thinkingBudget?: number;
  openRouterKey?: string;
  googleKey?: string;
  xaiKey?: string;
  openaiKey?: string;
  mistralKey?: string;
  maxTokens?: number;
}

class ModelService {
  /**
   * Get the provider for a given model ID
   */
  public getModelProvider(modelId: string): string | null {
    const definition = SUPPORTED_MODELS.find(m => m.id === modelId);
    return definition?.provider || null;
  }

  /**
   * Get the required API key for a model based on its provider
   * Returns the provider name if key is missing, or null if key is present
   */
  public getRequiredApiKey(modelId: string, params: ExecutionParams): string | null {
    const provider = this.getModelProvider(modelId);
    
    if (provider === 'openrouter' && !params.openRouterKey) {
      return 'openrouter';
    } else if (provider === 'google' && !params.googleKey) {
      return 'google';
    } else if (provider === 'xai' && !params.xaiKey) {
      return 'xai';
    } else if (provider === 'openai' && !params.openaiKey) {
      return 'openai';
    } else if (provider === 'mistral' && !params.mistralKey) {
      return 'mistral';
    }
    
    return null;
  }

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
      
      // Check for quota/billing issues
      const errorMsg = error.message || '';
      
      if (error.status === 402 || errorMsg.includes('requires more credits') || errorMsg.includes('402')) {
        throw new Error("Insufficient credits on OpenRouter. Please visit https://openrouter.ai/settings/credits to add credits or upgrade to a paid account.");
      }
      
      if (errorMsg.includes('quota') || errorMsg.includes('rate limit')) {
        throw new Error("Rate limit exceeded on OpenRouter. Please wait a few moments and try again, or upgrade your plan.");
      }
      
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
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          yield content;
        }
      }

    } catch (error: any) {
      console.error("OpenRouter Stream Error:", error);
      
      // Check for quota/billing issues
      const errorMsg = error.message || '';
      const errorBody = error.body || '';
      
      if (error.status === 402 || errorMsg.includes('requires more credits') || errorMsg.includes('402')) {
        throw new Error("Insufficient credits on OpenRouter. Please visit https://openrouter.ai/settings/credits to add credits or upgrade to a paid account.");
      }
      
      if (errorMsg.includes('quota') || errorMsg.includes('rate limit')) {
        throw new Error("Rate limit exceeded on OpenRouter. Please wait a few moments and try again, or upgrade your plan.");
      }
      
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

      return response.text || "";
    } catch (error: any) {
      console.error("Google Gemini API Error:", error);
      
      // Check for quota/billing issues
      const errorMsg = error.message || '';
      const errorStr = JSON.stringify(error);
      
      if (error.code === 429 || errorMsg.includes('exceeded') || errorMsg.includes('RESOURCE_EXHAUSTED') || errorMsg.includes('quota')) {
        const retryMatch = errorStr.match(/retry in ([\d.]+s)/i);
        const retryTime = retryMatch ? retryMatch[1] : 'a few moments';
        throw new Error(`Google Gemini quota exceeded. You've hit the free tier limit. Please retry in ${retryTime}, or upgrade at https://ai.google.dev/pricing`);
      }
      
      if (errorMsg.includes('rate limit') || errorMsg.includes('too many requests')) {
        throw new Error("Rate limit exceeded on Google Gemini. Please wait a few moments and try again.");
      }
      
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
        let chunkText = '';
        const c = chunk as any;
        try {
          if (typeof c.text === 'function') {
            chunkText = c.text();
          } else if (typeof c.text === 'string') {
            chunkText = c.text;
          } else if (c.candidates?.[0]?.content?.parts?.[0]?.text) {
            chunkText = c.candidates[0].content.parts[0].text;
          }
        } catch (e) {
          if (c.candidates?.[0]?.content?.parts?.[0]?.text) {
            chunkText = c.candidates[0].content.parts[0].text;
          }
        }

        if (chunkText) yield chunkText;
      }
    } catch (error: any) {
      console.error("Google Gemini Stream Error:", error);
      
      // Check for quota/billing issues
      const errorMsg = error.message || '';
      const errorStr = JSON.stringify(error);
      
      if (error.code === 429 || errorMsg.includes('exceeded') || errorMsg.includes('RESOURCE_EXHAUSTED') || errorMsg.includes('quota')) {
        // Extract retry time if available
        const retryMatch = errorStr.match(/retry in ([\d.]+s)/i);
        const retryTime = retryMatch ? retryMatch[1] : 'a few moments';
        throw new Error(`Google Gemini quota exceeded. You've hit the free tier limit. Please retry in ${retryTime}, or upgrade at https://ai.google.dev/pricing`);
      }
      
      if (errorMsg.includes('rate limit') || errorMsg.includes('too many requests')) {
        throw new Error("Rate limit exceeded on Google Gemini. Please wait a few moments and try again.");
      }
      
      throw new Error(error.message || "Failed to stream from Gemini.");
    }
  }

  // xAI Execution
  private async executeXai(params: ExecutionParams): Promise<string> {
    if (!params.xaiKey) {
      throw new Error("xAI API Key is missing. Please set it in the settings.");
    }

    try {
      const response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${params.xaiKey}`
        },
        body: JSON.stringify({
          model: params.modelId,
          messages: [
            { role: "system", content: params.systemInstruction },
            { role: "user", content: params.prompt }
          ],
          temperature: params.temperature,
          max_tokens: params.maxTokens,
          stream: false
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || `xAI API Error ${response.status}`);
      }

      const data = await response.json();

      return data.choices[0]?.message?.content || "";
    } catch (error: any) {
      console.error("xAI API Error:", error);
      
      // Check for quota/billing issues
      const errorMsg = error.message || '';
      
      if (error.status === 429 || errorMsg.includes('quota') || errorMsg.includes('rate limit') || errorMsg.includes('exceeded')) {
        throw new Error("xAI rate limit exceeded. Please wait a few moments and try again, or check your plan at https://x.ai");
      }
      
      if (error.status === 402 || errorMsg.includes('credits') || errorMsg.includes('billing')) {
        throw new Error("Insufficient credits on xAI. Please check your billing and add credits.");
      }
      
      throw new Error(error.message || "Failed to generate response from xAI.");
    }
  }

  // xAI Streaming
  private async *streamXai(params: ExecutionParams): AsyncGenerator<string, void, unknown> {
    if (!params.xaiKey) {
      throw new Error("xAI API Key is missing. Please set it in the settings.");
    }

    try {
      const response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${params.xaiKey}`
        },
        body: JSON.stringify({
          model: params.modelId,
          messages: [
            { role: "system", content: params.systemInstruction },
            { role: "user", content: params.prompt }
          ],
          temperature: params.temperature,
          max_tokens: params.maxTokens,
          stream: true
        })
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error?.message || `xAI API Error ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body from xAI stream.");

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep the last incomplete line

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed === 'data: [DONE]') continue;
          if (trimmed.startsWith('data: ')) {
            try {
              const json = JSON.parse(trimmed.slice(6));

              const content = json.choices[0]?.delta?.content;
              if (content) {
                yield content;
              }
            } catch (e) {
              console.warn("Failed to parse xAI stream chunk", e);
            }
          }
        }
      }

    } catch (error: any) {
      console.error("xAI Stream Error:", error);
      
      // Check for quota/billing issues
      const errorMsg = error.message || '';
      
      if (error.status === 429 || errorMsg.includes('quota') || errorMsg.includes('rate limit') || errorMsg.includes('exceeded')) {
        throw new Error("xAI rate limit exceeded. Please wait a few moments and try again, or check your plan at https://x.ai");
      }
      
      if (error.status === 402 || errorMsg.includes('credits') || errorMsg.includes('billing')) {
        throw new Error("Insufficient credits on xAI. Please check your billing and add credits.");
      }
      
      throw new Error(error.message || "Failed to stream from xAI.");
    }
  }

  // OpenAI Responses API Execution
  private async executeOpenAi(params: ExecutionParams): Promise<string> {
    if (!params.openaiKey) {
      throw new Error("OpenAI API Key is missing. Please set it in the settings.");
    }

    try {
      const response = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${params.openaiKey}`
        },
        body: JSON.stringify({
          model: params.modelId,
          input: `${params.systemInstruction}\n\n${params.prompt}`,
          temperature: params.temperature,
          max_tokens: params.maxTokens,
          stream: false
        })
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error?.message || `OpenAI API Error ${response.status}`);
      }

      const data = await response.json();

      // OpenAI Responses API uses output_text helper in SDK, 
      // but in REST it might be data.output[0].text or similar depending on the exact spec of v1/responses
      // Based on user eg: response.output_text
      return data.output_text || "";
    } catch (error: any) {
      console.error("OpenAI API Error:", error);
      
      // Check for quota/billing issues
      const errorMsg = error.message || '';
      
      if (error.status === 429 || errorMsg.includes('quota') || errorMsg.includes('rate_limit') || errorMsg.includes('exceeded')) {
        throw new Error("OpenAI rate limit exceeded. Please wait a few moments and try again, or upgrade your plan at https://platform.openai.com/account/billing");
      }
      
      if (error.status === 402 || error.code === 'insufficient_quota' || errorMsg.includes('insufficient_quota') || errorMsg.includes('quota exceeded')) {
        throw new Error("OpenAI quota exceeded. Please add credits at https://platform.openai.com/account/billing or upgrade your plan.");
      }
      
      throw new Error(error.message || "Failed to generate response from OpenAI.");
    }
  }

  private async *streamOpenAi(params: ExecutionParams): AsyncGenerator<string, void, unknown> {
    if (!params.openaiKey) {
      throw new Error("OpenAI API Key is missing. Please set it in the settings.");
    }

    try {
      const response = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${params.openaiKey}`
        },
        body: JSON.stringify({
          model: params.modelId,
          input: `${params.systemInstruction}\n\n${params.prompt}`,
          temperature: params.temperature,
          max_tokens: params.maxTokens,
          stream: true
        })
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error?.message || `OpenAI API Error ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body from OpenAI stream.");

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed === 'data: [DONE]') continue;
          if (trimmed.startsWith('data: ')) {
            try {
              const json = JSON.parse(trimmed.slice(6));
              // For Responses API streaming, it might be delta based
              const content = json.delta?.output_text || json.choices?.[0]?.delta?.content;
              if (content) {
                yield content;
              }
            } catch (e) {
              console.warn("Failed to parse OpenAI stream chunk", e);
            }
          }
        }
      }
    } catch (error: any) {
      console.error("OpenAI Stream Error:", error);
      
      // Check for quota/billing issues
      const errorMsg = error.message || '';
      
      if (error.status === 429 || errorMsg.includes('quota') || errorMsg.includes('rate_limit') || errorMsg.includes('exceeded')) {
        throw new Error("OpenAI rate limit exceeded. Please wait a few moments and try again, or upgrade your plan at https://platform.openai.com/account/billing");
      }
      
      if (error.status === 402 || error.code === 'insufficient_quota' || errorMsg.includes('insufficient_quota') || errorMsg.includes('quota exceeded')) {
        throw new Error("OpenAI quota exceeded. Please add credits at https://platform.openai.com/account/billing or upgrade your plan.");
      }
      
      throw new Error(error.message || "Failed to stream from OpenAI.");
    }
  }

  // Mistral Execution
  private async executeMistral(params: ExecutionParams): Promise<string> {
    if (!params.mistralKey) {
      throw new Error("Mistral API Key is missing. Please set it in the settings.");
    }

    try {
      const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${params.mistralKey}`
        },
        body: JSON.stringify({
          model: params.modelId,
          messages: [
            { role: "system", content: params.systemInstruction },
            { role: "user", content: params.prompt }
          ],
          temperature: params.temperature,
          max_tokens: params.maxTokens || 4096
        })
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || `Mistral API Error ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || "";
    } catch (error: any) {
      console.error("Mistral API Error:", error);
      
      // Check for CORS/network errors
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error("Cannot connect to Mistral API directly from browser due to CORS restrictions. Use OpenRouter for Mistral models or set up a proxy server.");
      }
      
      if (error.status === 429 || error.message?.includes('rate_limit') || error.message?.includes('Rate limit')) {
        throw new Error("Mistral rate limit exceeded. Please wait a few moments and try again. Free tier has strict limits.");
      }
      
      throw new Error(error.message || "Failed to execute Mistral request.");
    }
  }

  // Mistral Streaming
  private async *streamMistral(params: ExecutionParams): AsyncGenerator<string, void, unknown> {
    if (!params.mistralKey) {
      throw new Error("Mistral API Key is missing. Please set it in the settings.");
    }

    try {
      const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${params.mistralKey}`
        },
        body: JSON.stringify({
          model: params.modelId,
          messages: [
            { role: "system", content: params.systemInstruction },
            { role: "user", content: params.prompt }
          ],
          temperature: params.temperature,
          max_tokens: params.maxTokens || 4096,
          stream: true
        })
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || `Mistral API Error ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body from Mistral stream.");

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed === 'data: [DONE]') continue;
          if (trimmed.startsWith('data: ')) {
            try {
              const json = JSON.parse(trimmed.slice(6));
              const content = json.choices?.[0]?.delta?.content;
              if (content) {
                yield content;
              }
            } catch (e) {
              console.warn("Failed to parse Mistral stream chunk", e);
            }
          }
        }
      }
    } catch (error: any) {
      console.error("Mistral Stream Error:", error);
      
      // Check for CORS/network errors
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error("Cannot connect to Mistral API directly from browser due to CORS restrictions. Use OpenRouter for Mistral models or set up a proxy server.");
      }
      
      if (error.status === 429 || error.message?.includes('rate_limit') || error.message?.includes('Rate limit')) {
        throw new Error("Mistral rate limit exceeded. Please wait a few moments and try again. Free tier has strict limits.");
      }
      
      throw new Error(error.message || "Failed to stream from Mistral.");
    }
  }

  public async run(params: ExecutionParams): Promise<string> {
    const definition = SUPPORTED_MODELS.find(m => m.id === params.modelId);
    if (!definition) throw new Error(`Unsupported model: ${params.modelId}`);

    if (definition.provider === 'openrouter') {
      return this.executeOpenRouter(params);
    } else if (definition.provider === 'google') {
      return this.executeGoogle(params);
    } else if (definition.provider === 'xai') {
      return this.executeXai(params);
    } else if (definition.provider === 'openai') {
      return this.executeOpenAi(params);
    } else if (definition.provider === 'mistral') {
      return this.executeMistral(params);
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
    } else if (definition.provider === 'xai') {
      yield* this.streamXai(params);
    } else if (definition.provider === 'openai') {
      yield* this.streamOpenAi(params);
    } else if (definition.provider === 'mistral') {
      yield* this.streamMistral(params);
    } else {
      throw new Error(`Provider ${definition.provider} is not currently supported.`);
    }
  }
}

export const modelService = new ModelService();