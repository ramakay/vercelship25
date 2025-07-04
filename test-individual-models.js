const { generateText } = require('ai');
const { createGateway } = require('@ai-sdk/gateway');

async function testModel(model, prompt) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Testing ${model}...`);
  console.log(`${'='.repeat(60)}`);
  
  const gateway = createGateway({
    apiKey: process.env.AI_GATEWAY_API_KEY,
  });
  
  const startTime = Date.now();
  
  try {
    console.log('Starting request...');
    const result = await generateText({
      model: gateway(model),
      prompt: prompt,
      maxTokens: 100, // Limit tokens to reduce response time
    });
    
    const duration = Date.now() - startTime;
    console.log(`✓ Success in ${duration}ms`);
    console.log(`Response: ${result.text.substring(0, 100)}...`);
    console.log(`Tokens: ${result.usage?.inputTokens || 0} in / ${result.usage?.outputTokens || 0} out`);
    
    return { model, success: true, duration, response: result.text };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.log(`✗ Failed after ${duration}ms`);
    console.log(`Error: ${error.message}`);
    
    // Log more details about the error
    if (error.cause) {
      console.log(`Cause: ${error.cause.message || error.cause}`);
    }
    if (error.response) {
      console.log(`Response status: ${error.response.status}`);
      console.log(`Response text: ${await error.response.text()}`);
    }
    
    return { model, success: false, duration, error: error.message };
  }
}

async function main() {
  console.log('Testing Vercel AI Gateway Models');
  console.log('API Key:', process.env.AI_GATEWAY_API_KEY ? 'Present' : 'Missing');
  
  // Test with a simple prompt
  const prompt = 'Write a haiku about coding';
  
  // Test each model
  const models = [
    'openai/gpt-4o-mini',     // Known working
    'xai/grok-3',             // Working in our tests
    'anthropic/claude-4-opus', // Timing out
    'google/gemini-2.5-pro'    // Timing out
  ];
  
  const results = [];
  
  for (const model of models) {
    const result = await testModel(model, prompt);
    results.push(result);
  }
  
  // Summary
  console.log(`\n${'='.repeat(60)}`);
  console.log('SUMMARY');
  console.log(`${'='.repeat(60)}`);
  
  results.forEach(r => {
    const status = r.success ? '✓' : '✗';
    const time = `${(r.duration / 1000).toFixed(1)}s`;
    console.log(`${status} ${r.model}: ${time} ${r.success ? '' : `- ${r.error}`}`);
  });
}

// Load env vars
require('dotenv').config({ path: '.env.local' });

main().catch(console.error);