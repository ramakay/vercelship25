// Environment validation utility
export function validateEnvironment(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check required environment variables
  if (!process.env.AI_GATEWAY_API_KEY) {
    errors.push(
      'Missing AI_GATEWAY_API_KEY environment variable. ' +
      'Get your API key from: https://vercel.com/dashboard/ai-gateway'
    );
  }

  // Validate API key format if present
  // Updated: Accept any non-empty API key since Vercel's key format may vary
  if (process.env.AI_GATEWAY_API_KEY && process.env.AI_GATEWAY_API_KEY.length < 10) {
    errors.push(
      'Invalid AI_GATEWAY_API_KEY format. ' +
      'Key appears too short'
    );
  }

  // Check if running in production without key
  if (process.env.NODE_ENV === 'production' && !process.env.AI_GATEWAY_API_KEY) {
    errors.push(
      'Cannot run in production without AI_GATEWAY_API_KEY'
    );
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// Helper to log validation results
export function logEnvironmentStatus(): void {
  const { valid, errors } = validateEnvironment();
  
  if (valid) {
    console.log('✅ Environment validation passed');
    console.log('   AI Gateway API Key: configured');
  } else {
    console.error('❌ Environment validation failed:');
    errors.forEach(error => console.error(`   - ${error}`));
    console.error('\n📝 Setup instructions:');
    console.error('   1. Copy .env.example to .env.local');
    console.error('   2. Add your AI Gateway API key');
    console.error('   3. Restart the development server');
  }
}