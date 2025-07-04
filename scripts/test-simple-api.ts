#!/usr/bin/env node

/**
 * Simple test to verify API is responding
 */

async function testSimpleAPI() {
  console.log('Testing simple API call...');
  
  const testPrompt = 'What is 2+2?';
  
  try {
    const response = await fetch('http://localhost:3004/api/triage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: testPrompt })
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('\nResponse received!');
      console.log('Total cost:', data.summary?.totalCost);
      console.log('Number of responses:', data.responses?.length);
      
      if (data.responses) {
        data.responses.forEach((r: any) => {
          console.log(`\n${r.model}:`, r.text.substring(0, 50) + '...');
        });
      }
    } else {
      const errorText = await response.text();
      console.error('Error response:', errorText);
    }
  } catch (error) {
    console.error('Failed to connect:', error);
  }
}

testSimpleAPI();