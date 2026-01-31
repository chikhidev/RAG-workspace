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
    }
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
    }
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
    "id": "gpt-oss-120b",
    "name": "gpt-oss-120b",
    "provider": "openai",
    "description": "OpenAI - Open-weight MoE model (117B params). Rivals o4-mini.",
    "size": "large",
    "logo": "/logos/chatgpt.png",
    "metadata": { 
      "author": "OpenAI", 
      "context": "128K", 
      "inputPrice": "Free (Self-Hosted)", 
      "outputPrice": "Free (Self-Hosted)", 
      "latency": "Variable", 
      "throughput": "Variable" 
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

      if (params.onUsage && data.usage) {
        params.onUsage({
          prompt_tokens: data.usage.prompt_tokens,
          completion_tokens: data.usage.completion_tokens,
          total_tokens: data.usage.total_tokens
        });
      }

      return data.choices[0]?.message?.content || "";
    } catch (error: any) {
      console.error("xAI API Error:", error);
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

              if (json.usage && params.onUsage) {
                params.onUsage({
                  prompt_tokens: json.usage.prompt_tokens,
                  completion_tokens: json.usage.completion_tokens,
                  total_tokens: json.usage.total_tokens
                });
              }

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
      throw new Error(error.message || "Failed to stream from OpenAI.");
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
    } else {
      throw new Error(`Provider ${definition.provider} is not currently supported.`);
    }
  }
}

export const modelService = new ModelService();