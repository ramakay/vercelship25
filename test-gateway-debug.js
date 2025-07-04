const { generateText } = require('ai');
const { createGateway } = require('@ai-sdk/gateway');

async function testGateway() {
  console.log('Testing AI Gateway connection...');
  console.log('API Key:', process.env.AI_GATEWAY_API_KEY ? 'Present' : 'Missing');
  
  const gateway = createGateway({
    apiKey: process.env.AI_GATEWAY_API_KEY,
  });
  
  // Test with a working model first
  try {
    console.log('\nTesting openai/gpt-4o-mini...');
    const result = await generateText({
      model: gateway('openai/gpt-4o-mini'),
      prompt: 'Say hello',
    });
    console.log('✓ Success:', result.text);
  } catch (error) {
    console.log('✗ Error:', error.message);
  }
  
  // Test the problematic models
  const models = ['xai/grok-3', 'anthropic/claude-4-opus', 'google/gemini-2.5-pro'];
  
  for (const model of models) {
    try {
      console.log(`\nTesting ${model}...`);
      const result = await generateText({
        model: gateway(model),
        prompt: 'Say hello',
      });
      console.log('✓ Success:', result.text);
    } catch (error) {
      console.log('✗ Error:', error.message);
      if (error.cause) {
        console.log('  Cause:', error.cause?.message || error.cause);
      }
    }
  }
}

// Load env vars
require('dotenv').config({ path: '.env.local' });

testGateway().catch(console.error);