import { streamText } from 'ai';
import { createGateway } from '@ai-sdk/gateway';

// Create gateway instance with API key
const gateway = createGateway({
  apiKey: process.env.AI_GATEWAY_API_KEY,
});

export async function GET() {
  try {
    console.log('Test Gateway API called');
    console.log('AI Gateway API Key present:', !!process.env.AI_GATEWAY_API_KEY);
    console.log('API Key length:', process.env.AI_GATEWAY_API_KEY?.length);

    // Test with a simple prompt
    const result = streamText({
      model: gateway('openai/gpt-4o-mini'),
      prompt: 'Say hello in 5 words or less',
      onError: ({ error }) => {
        console.error('Stream error:', error);
      }
    });

    // Use the built-in toTextStreamResponse for proper SSE format
    return result.toTextStreamResponse();

  } catch (error) {
    console.error('Test Gateway error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Test failed',
      hasApiKey: !!process.env.AI_GATEWAY_API_KEY,
      details: error instanceof Error ? error.stack : undefined
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}