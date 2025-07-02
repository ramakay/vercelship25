// Local development version with API keys
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';

export async function triageWithModelsLocal(prompt: string) {
  // Check if we're in development with API keys
  const hasKeys = process.env.OPENAI_API_KEY && 
                  process.env.ANTHROPIC_API_KEY && 
                  process.env.GOOGLE_GENERATIVEAI_API_KEY;
  
  if (!hasKeys) {
    throw new Error('Local development requires API keys in .env.local');
  }

  console.log('Using local API keys for development...');

  // Note: For local dev with API keys, we use different models
  // xAI/Grok is not available via individual API keys
  const models = [
    { provider: openai('gpt-4-turbo'), name: 'openai/gpt-4-turbo' }, // Fallback for Grok
    { provider: anthropic('claude-3-opus-20240229'), name: 'anthropic/claude-3-opus' }, // Claude 3 Opus (Claude 4 not available via API yet)
    { provider: google('gemini-1.5-pro-latest'), name: 'google/gemini-1.5-pro' } // Gemini 1.5 Pro (2.5 not available via API yet)
  ];

  const results = await Promise.allSettled(
    models.map(async ({ provider, name }) => {
      const startTime = Date.now();
      try {
        const result = await generateText({
          model: provider,
          prompt,
        });
        
        return {
          provider: name.split('/')[0],
          model: name,
          text: result.text,
          latency: Date.now() - startTime,
          promptTokens: result.usage?.inputTokens || 0,
          completionTokens: result.usage?.outputTokens || 0,
          cost: 0, // Calculate based on your logic
        };
      } catch (error) {
        return {
          provider: name.split('/')[0],
          model: name,
          text: '',
          latency: Date.now() - startTime,
          promptTokens: 0,
          completionTokens: 0,
          cost: 0,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    })
  );

  return results.map(result => 
    result.status === 'fulfilled' ? result.value : {
      provider: 'unknown',
      model: 'unknown',
      text: '',
      latency: 0,
      promptTokens: 0,
      completionTokens: 0,
      cost: 0,
      error: 'Failed to call model'
    }
  );
}