import { createGateway } from '@ai-sdk/gateway';

/**
 * Example of how to use Vercel OIDC to securely fetch AI Gateway credentials
 * from a backend service instead of storing them as environment variables.
 * 
 * This demonstrates the secure pattern but would require:
 * 1. A backend service that validates OIDC tokens
 * 2. The backend service returns AI Gateway credentials
 */

async function getAIGatewayKey(): Promise<string> {
  // In production with OIDC enabled, you would:
  // 1. Get the OIDC token from the request header (in functions)
  // 2. Exchange it with your backend for AI Gateway credentials
  
  if (typeof window === 'undefined') {
    // Server-side: Check for OIDC token in function context
    const oidcToken = process.env.VERCEL_OIDC_TOKEN;
    
    if (oidcToken) {
      // Example: Exchange OIDC token with your backend
      // const response = await fetch('https://your-api.com/get-ai-key', {
      //   headers: {
      //     'Authorization': `Bearer ${oidcToken}`
      //   }
      // });
      // const { aiGatewayKey } = await response.json();
      // return aiGatewayKey;
      
      console.log('OIDC token available, but backend exchange not implemented');
    }
  }
  
  // Fallback to environment variable
  const apiKey = process.env.AI_GATEWAY_API_KEY;
  if (!apiKey) {
    throw new Error('AI_GATEWAY_API_KEY not found');
  }
  return apiKey;
}

// Create gateway instance with dynamic key retrieval
export async function createSecureGateway() {
  const apiKey = await getAIGatewayKey();
  return createGateway({ apiKey });
}

// Rest of the implementation remains the same...
export type { ModelResponse, TokenUsage } from './ai-gateway';