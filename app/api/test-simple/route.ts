import { generateText } from 'ai';
import { createGateway } from '@ai-sdk/gateway';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('Test Simple API called');
    console.log('AI_GATEWAY_API_KEY present:', !!process.env.AI_GATEWAY_API_KEY);
    console.log('API Key:', process.env.AI_GATEWAY_API_KEY?.substring(0, 5) + '...');

    const gateway = createGateway({
      apiKey: process.env.AI_GATEWAY_API_KEY,
    });

    // Try a simple test with just one model
    const result = await generateText({
      model: gateway('xai/grok-3'),
      prompt: 'Say hello in 5 words or less',
    });

    return NextResponse.json({
      success: true,
      text: result.text,
      usage: result.usage,
    });
  } catch (error) {
    console.error('Test Simple error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}