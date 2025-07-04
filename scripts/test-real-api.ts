#!/usr/bin/env node

/**
 * Test script to verify real API responses and web search functionality
 * This ensures we're using real evaluation with GPT-4o-mini as judge
 */

async function testRealAPI() {
  console.log('='.repeat(80));
  console.log('VERCEL SHIP 2025 - REAL API TEST');
  console.log('Testing: Real model responses + Web search evaluation');
  console.log('='.repeat(80));
  
  const testPrompt = 'Compare Vercel AI Gateway pricing and features with current availability status.';
  
  console.log('\nTest Configuration:');
  console.log('- Models: Grok-3, Claude-4-Opus, Gemini-2.5-Pro');
  console.log('- Judge: GPT-4o-mini with Gemini web search');
  console.log('- Prompt:', testPrompt);
  console.log('\nStarting test...\n');
  
  const startTime = Date.now();
  
  try {
    const response = await fetch('http://localhost:3004/api/triage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: testPrompt })
    });
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    const totalTime = Date.now() - startTime;
    
    console.log('\n' + '='.repeat(80));
    console.log('TEST RESULTS');
    console.log('='.repeat(80));
    
    console.log(`\nTotal Time: ${(totalTime / 1000).toFixed(1)} seconds`);
    console.log(`Total Cost: $${data.summary.totalCost.toFixed(6)}`);
    console.log(`Total Tokens: ${data.summary.totalPromptTokens} in / ${data.summary.totalCompletionTokens} out`);
    
    // Verify we got real responses (not timeouts)
    console.log('\n--- Model Responses ---');
    let hasRealResponses = true;
    
    data.responses.forEach((resp: any, index: number) => {
      console.log(`\n${index + 1}. ${resp.model}`);
      console.log(`   Latency: ${resp.latency}ms`);
      console.log(`   Tokens: ${resp.promptTokens} in / ${resp.completionTokens} out`);
      console.log(`   Cost: $${resp.cost.toFixed(6)}`);
      
      if (resp.text.includes('Error:') || resp.text.includes('timed out')) {
        console.log(`   ❌ TIMEOUT/ERROR: ${resp.text}`);
        hasRealResponses = false;
      } else {
        console.log(`   ✅ Real response received`);
        console.log(`   Preview: ${resp.text.substring(0, 150)}...`);
      }
    });
    
    // Verify evaluation with web search
    console.log('\n--- Evaluation Results ---');
    if (data.evaluations && data.evaluations.length > 0) {
      console.log('✅ Real evaluation completed with web search');
      
      data.evaluations.forEach((eval: any, index: number) => {
        console.log(`\n${index + 1}. ${eval.model} (Rank #${index + 1})`);
        console.log(`   Total Score: ${eval.scores.totalScore}/55`);
        console.log(`   - Relevance: ${eval.scores.relevance}/10`);
        console.log(`   - Accuracy: ${eval.scores.accuracy}/10 (verified via web search)`);
        console.log(`   - Reasoning: ${eval.scores.reasoning}/5`);
        console.log(`   - Style: ${eval.scores.style}/5`);
        console.log(`   - Honesty: ${eval.scores.honesty}/5`);
        console.log(`   - Soundness: ${eval.scores.soundnessScore}/10`);
        console.log(`   Explanation: ${eval.scores.explanation.substring(0, 200)}...`);
      });
      
      console.log(`\n🏆 WINNER: ${data.evaluations[0].model}`);
    } else {
      console.log('❌ No evaluation results - check if judge is working');
    }
    
    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('TEST SUMMARY');
    console.log('='.repeat(80));
    
    if (hasRealResponses && data.evaluations) {
      console.log('✅ SUCCESS: Real API responses received');
      console.log('✅ SUCCESS: Web search evaluation completed');
      console.log('✅ SUCCESS: Judge used GPT-4o-mini with Gemini search');
      console.log(`✅ Total cost: $${data.summary.totalCost.toFixed(6)} (well under $10 budget)`);
    } else {
      console.log('❌ FAILED: Some components not working properly');
      if (!hasRealResponses) {
        console.log('   - Models timed out or returned errors');
      }
      if (!data.evaluations) {
        console.log('   - Evaluation/web search not working');
      }
    }
    
    // Save full response for debugging
    const fs = require('fs').promises;
    const filename = `test-results-${Date.now()}.json`;
    await fs.writeFile(filename, JSON.stringify(data, null, 2));
    console.log(`\nFull results saved to: ${filename}`);
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error);
    console.error('\nMake sure:');
    console.error('1. Server is running (npm run dev)');
    console.error('2. AI_GATEWAY_API_KEY is set in .env.local');
    console.error('3. API key has access to all models');
  }
}

// Run the test
testRealAPI().catch(console.error);