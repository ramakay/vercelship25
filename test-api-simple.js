const fetch = require('node-fetch');

const prompt = `Help optimize my React application performance. I need specific suggestions for:
1. Component re-render optimization
2. Bundle size reduction
3. State management improvements
Focus on practical, implementable solutions with code examples.`;

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
      console.log('\nFull Response:');
      console.log(resp.text);
      console.log('---END---\n');
    });
    
    console.log('\n=== EVALUATIONS ===');
    data.evaluations.forEach(eval => {
      console.log(`\n${eval.model}:`);
      console.log('  Total Score:', eval.scores.totalScore, '/ 55');
      console.log('  Accuracy:', eval.scores.accuracy, '/ 10');
      console.log('  Soundness:', eval.scores.soundnessScore, '/ 10');
      console.log('  Final Score:', eval.finalScore);
    });
    
    // Save full response for mock data
    console.log('\n=== SAVING FULL RESPONSE ===');
    require('fs').writeFileSync(
      'react-optimization-responses.json', 
      JSON.stringify(data, null, 2)
    );
    console.log('Full response saved to react-optimization-responses.json');
    
  } catch (error) {
    const endTime = Date.now();
    console.error('\nError after', (endTime - startTime) / 1000, 'seconds:');
    console.error(error);
  }
}

testAPI();