const fetch = require('node-fetch');

const prompt = `Vercel Ship 2025 — $10 Feature Benchmark (Next.js 15)

Mission: Spend ≈ USD $10 on a Pro account to benchmark three LLMs through Vercel AI Gateway, rank their answers with a lightweight SWE‑bench–style rubric, execute the best answer in Vercel Sandbox, and capture every metric needed for the LinkedIn article 'I spent $10 on Vercel's latest 2025 Ship features—here's what I found.'

Stack: Next.js 15.0.0-stable (React 19 RC ready), Vercel Pro team with Active CPU + Fluid enabled, AI Gateway (Open Beta), Sandbox (Public Beta), Queues (Limited Beta).

Implement:
1. Feature Availability Probe - Gateway ping, Sandbox ping, Queue probe, record in /status.json
2. Chat Orchestrator Flow - Parallel calls to 3 models, capture latency/tokens/cost, return ranked results
3. Model Evaluation & Benchmarking - evaluateResponse() scoring: Relevance (0-10), Reasoning (0-5), Style (0-5), Total Score = Relevance × 2 + Reasoning + Style + (-Latency/1000) + (-Cost×10)
4. UI - Prompt box, results table with scores, sandbox output, cumulative cost tracker
5. Cost Logging - Queue if available, else localStorage
6. Screenshots & Data Export - Playwright automation, Functions/Gateway metrics CSV

Key files: /app/api/chat/route.ts (orchestrator), /app/bench/evaluate.ts (judge prompts), /app/components/ResultsTable.tsx

Success: ≤$10 total cost, 3 models with scores, auto-ranked winner, sandbox execution, exported metrics.`;

async function testAPI() {
  console.log('Starting API test at:', new Date().toISOString());
  console.log('Prompt length:', prompt.length, 'characters');
  
  const startTime = Date.now();
  
  try {
    const response = await fetch('http://localhost:3002/api/triage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    console.log('\nResponse received!');
    console.log('Total time:', totalTime, 'ms (', (totalTime/1000).toFixed(1), 'seconds)');
    console.log('Status:', response.status);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.json();
    
    console.log('\n=== RESPONSE SUMMARY ===');
    console.log('Total cost: $', data.summary.totalCost);
    console.log('Total latency:', data.summary.totalLatency, 'ms');
    console.log('Winner:', data.summary.winner.model);
    
    console.log('\n=== MODEL RESPONSES ===');
    data.responses.forEach(resp => {
      console.log(`\n--- ${resp.model} ---`);
      console.log('Latency:', resp.latency, 'ms');
      console.log('Cost: $', resp.cost);
      console.log('Tokens:', resp.promptTokens, 'prompt /', resp.completionTokens, 'completion');
      console.log('Response preview:', resp.text.substring(0, 200) + '...');
    });
    
    console.log('\n=== EVALUATIONS ===');
    data.evaluations.forEach(eval => {
      console.log(`\n${eval.model}:`);
      console.log('  Total Score:', eval.scores.totalScore, '/ 55');
      console.log('  Accuracy:', eval.scores.accuracy, '/ 10');
      console.log('  Soundness:', eval.scores.soundnessScore, '/ 10');
      console.log('  Relevance:', eval.scores.relevance, '/ 10');
      console.log('  Reasoning:', eval.scores.reasoning, '/ 5');
      console.log('  Style:', eval.scores.style, '/ 5');
      console.log('  Honesty:', eval.scores.honesty, '/ 5');
    });
    
    // Save full response for mock data
    console.log('\n=== SAVING FULL RESPONSE ===');
    require('fs').writeFileSync(
      'api-response-full.json', 
      JSON.stringify(data, null, 2)
    );
    console.log('Full response saved to api-response-full.json');
    
  } catch (error) {
    const endTime = Date.now();
    console.error('\nError after', (endTime - startTime) / 1000, 'seconds:');
    console.error(error);
  }
}

testAPI();