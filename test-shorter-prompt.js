const { generateText } = require('ai');
const { createGateway } = require('@ai-sdk/gateway');

async function testWithShorterPrompt() {
  console.log('Testing with shorter prompt to verify models work\n');
  
  const gateway = createGateway({
    apiKey: process.env.AI_GATEWAY_API_KEY,
  });
  
  // Much shorter prompt
  const shortPrompt = 'List 3 benefits of using Vercel AI Gateway in 50 words or less.';
  
  const models = ['xai/grok-3', 'anthropic/claude-4-opus', 'google/gemini-2.5-pro'];
  
  for (const model of models) {
    console.log(`\nTesting ${model}...`);
    const startTime = Date.now();
    
    try {
      const result = await generateText({
        model: gateway(model),
        prompt: shortPrompt,
        maxTokens: 100,
      });
      
      const duration = Date.now() - startTime;
      console.log(`✓ Success in ${(duration/1000).toFixed(1)}s`);
      console.log(`Response: ${result.text}`);
      console.log(`Tokens: ${result.usage?.inputTokens} in / ${result.usage?.outputTokens} out`);
      
    } catch (error) {
      const duration = Date.now() - startTime;
      console.log(`✗ Failed after ${(duration/1000).toFixed(1)}s`);
      console.log(`Error: ${error.message}`);
    }
  }
}

// Load env vars
require('dotenv').config({ path: '.env.local' });

testWithShorterPrompt().catch(console.error);