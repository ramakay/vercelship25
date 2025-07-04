import { generateText, streamText } from 'ai';
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
  stream?: ReadableStream<Uint8Array>;
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
  'google/gemini-2.5-pro': { input: 0.00125, output: 0.00375 }, // Gemini 2.5 Pro
  'openai/gpt-4o-mini': { input: 0.00015, output: 0.0006 } // GPT-4o-mini - most cost-effective
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
      setTimeout(() => reject(new Error(`${model} timed out after 120 seconds`)), 120000)
    );
    
    const result = await Promise.race([
      generateText({
        model: gateway(model),
        prompt
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      provider: model.split('/')[0],
      model,
      text: `Error: ${errorMessage}`,
      latency: Date.now() - startTime,
      promptTokens: 0,
      completionTokens: 0,
      cost: 0,
      error: errorMessage
    };
  }
}

export async function triageWithModels(prompt: string): Promise<ModelResponse[]> {
  console.log('Starting sequential model calls...');
  console.log('AI_GATEWAY_API_KEY present:', !!process.env.AI_GATEWAY_API_KEY);
  
  const models: ModelProvider[] = ['xai/grok-3', 'anthropic/claude-4-opus', 'google/gemini-2.5-pro'];
  const results: ModelResponse[] = [];
  
  // Call models sequentially to avoid rate limiting and resource contention
  for (const model of models) {
    console.log(`\nCalling ${model} (${results.length + 1}/${models.length})...`);
    const response = await callModel(model, prompt);
    results.push(response);
    
    // Add a small delay between calls to be nice to the API
    if (results.length < models.length) {
      console.log('Waiting 1 second before next model...');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return results;
}

export function calculateTotalCost(responses: ModelResponse[]): number {
  return responses.reduce((total, response) => total + response.cost, 0);
}

export function getModelDisplayName(model: ModelProvider): string {
  const displayNames: Record<string, string> = {
    'xai/grok-3': 'Grok 3',
    'anthropic/claude-4-opus': 'Claude 4 Opus',
    'google/gemini-2.5-pro': 'Gemini 2.5 Pro',
    'openai/gpt-4o-mini': 'GPT-4o Mini'
  };
  return displayNames[model] || model;
}