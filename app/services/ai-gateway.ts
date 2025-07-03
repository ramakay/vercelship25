import { generateText } from 'ai';
import { createGateway } from '@ai-sdk/gateway';

// Create gateway instance with API key
const gateway = createGateway({
  apiKey: process.env.AI_GATEWAY_API_KEY,
});

export interface ModelResponse {
  provider: string;
  model: string;
  text: string;
  latency: number;
  promptTokens: number;
  completionTokens: number;
  cost: number;
  error?: string;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

// Pricing per 1k tokens (in USD)
// Updated with latest models available through Vercel AI Gateway
const PRICING = {
  'xai/grok-3': { input: 0.005, output: 0.015 }, // xAI Grok 3
  'anthropic/claude-4-opus': { input: 0.015, output: 0.075 }, // Claude 4 Opus - most capable
  'google/gemini-2.5-pro': { input: 0.00125, output: 0.00375 } // Gemini 2.5 Pro
} as const;

export type ModelProvider = keyof typeof PRICING;

function calculateCost(
  model: ModelProvider,
  promptTokens: number,
  completionTokens: number
): number {
  const pricing = PRICING[model];
  const inputCost = (promptTokens / 1000) * pricing.input;
  const outputCost = (completionTokens / 1000) * pricing.output;
  return inputCost + outputCost;
}

async function callModel(
  model: ModelProvider,
  prompt: string
): Promise<ModelResponse> {
  const startTime = Date.now();
  console.log(`Calling ${model}...`);
  
  try {
    // Add a timeout for individual model calls
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error(`${model} timed out after 25 seconds`)), 25000)
    );
    
    const result = await Promise.race([
      generateText({
        model: gateway(model),
        prompt,
      }),
      timeoutPromise
    ]);
    
    const latency = Date.now() - startTime;
    // AI SDK 5 Beta uses different property names
    const promptTokens = result.usage?.inputTokens || 0;
    const completionTokens = result.usage?.outputTokens || 0;
    const cost = calculateCost(model, promptTokens, completionTokens);
    
    return {
      provider: model.split('/')[0], // Extract provider name from format: provider/model
      model,
      text: result.text,
      latency,
      promptTokens,
      completionTokens,
      cost
    };
  } catch (error) {
    console.error(`Error calling ${model}:`, error);
    return {
      provider: model.split('/')[0],
      model,
      text: '',
      latency: Date.now() - startTime,
      promptTokens: 0,
      completionTokens: 0,
      cost: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function triageWithModels(prompt: string): Promise<ModelResponse[]> {
  console.log('Starting parallel model calls...');
  console.log('AI_GATEWAY_API_KEY present:', !!process.env.AI_GATEWAY_API_KEY);
  
  // Call all models in parallel
  const modelCalls = [
    callModel('xai/grok-3', prompt),
    callModel('anthropic/claude-4-opus', prompt),
    callModel('google/gemini-2.5-pro', prompt)
  ];
  
  const results = await Promise.allSettled(modelCalls);
  
  // Process results
  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      const models: ModelProvider[] = ['xai/grok-3', 'anthropic/claude-4-opus', 'google/gemini-2.5-pro'];
      console.error(`Model ${models[index]} failed:`, result.reason);
      return {
        provider: models[index].split('/')[0],
        model: models[index],
        text: '',
        latency: 0,
        promptTokens: 0,
        completionTokens: 0,
        cost: 0,
        error: result.reason?.message || 'Failed to call model'
      };
    }
  });
}

export function calculateTotalCost(responses: ModelResponse[]): number {
  return responses.reduce((total, response) => total + response.cost, 0);
}

export function getModelDisplayName(model: ModelProvider): string {
  const displayNames = {
    'xai/grok-3': 'Grok 3',
    'anthropic/claude-4-opus': 'Claude 4 Opus',
    'google/gemini-2.5-pro': 'Gemini 2.5 Pro'
  };
  return displayNames[model] || model;
}