import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Return basic info about the environment
  const info = {
    message: 'AI Triage API Test Endpoint',
    environment: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
    region: process.env.VERCEL_REGION,
    hasAIGatewayKey: !!process.env.AI_GATEWAY_API_KEY,
    aiGatewayKeyLength: process.env.AI_GATEWAY_API_KEY?.length || 0,
    timestamp: new Date().toISOString(),
    headers: {
      'x-vercel-id': request.headers.get('x-vercel-id'),
      'x-vercel-deployment-url': request.headers.get('x-vercel-deployment-url'),
    }
  };

  return NextResponse.json(info);
}