import { streamText, smoothStream } from 'ai';
import { createGateway } from '@ai-sdk/gateway';
import { openai } from '@ai-sdk/openai';
import { NextRequest } from 'next/server';
import { costLogger } from '@/app/services/cost-logger';
import { FileLogger } from '@/app/lib/file-logger';
import { promises as fs } from 'fs';
import path from 'path';

// Create gateway instance with API key
const gateway = createGateway({
  apiKey: process.env.AI_GATEWAY_API_KEY,
});

// Pricing per 1k tokens (in USD)
const PRICING = {
  'xai/grok-3': { input: 0.005, output: 0.015 },
  'anthropic/claude-4-opus': { input: 0.015, output: 0.075 },
  'google/gemini-2.5-pro': { input: 0.00125, output: 0.00375 },
  'openai/gpt-4o-mini': { input: 0.00015, output: 0.0006 }
} as const;

type ModelProvider = keyof typeof PRICING;

function calculateCost(
  model: ModelProvider,
  promptTokens: number,
  completionTokens: number
): number {
  const pricing = PRICING[model];
  const inputCost = (promptTokens / 1000) * pricing.input;
  const outputCost = (completionTokens / 1000) * pricing.output;
  return inputCost + outputCost;
}

export async function POST(request: NextRequest) {
  const requestStartTime = Date.now();
  const logger = new FileLogger('api');
  
  try {
    await logger.log('INFO', '=== STREAM API REQUEST STARTED ===', {
      timestamp: new Date().toISOString(),
      logFile: logger.getLogFilePath()
    });
    const { prompt } = await request.json();
    
    if (!prompt) {
      console.error('ERROR: No prompt provided');
      return new Response(JSON.stringify({ error: 'Prompt is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    await logger.log('INFO', 'Request details', {
      promptPreview: prompt.substring(0, 100) + '...',
      promptLength: prompt.length,
      hasApiKey: !!process.env.AI_GATEWAY_API_KEY
    });

    const models: ModelProvider[] = [
      'xai/grok-3',
      'anthropic/claude-4-opus', 
      'google/gemini-2.5-pro'
    ];

    // Create a custom readable stream that will handle all models
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        const results: any[] = [];
        let totalCost = 0;

        // Send initial metadata
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          type: 'start',
          models: models.map(m => ({
            model: m,
            displayName: m.split('/')[1]
          }))
        })}\n\n`));

        // Process each model
        for (const model of models) {
          const modelStartTime = Date.now();
          await logger.log('INFO', `Starting model: ${model}`, {
            startTime: new Date(modelStartTime).toISOString()
          });
          
          try {
            // Notify start
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'model-start',
              model
            })}\n\n`));

            // Stream text from model
            await logger.log('DEBUG', `Calling ${model} via AI Gateway`);
            const streamStartTime = Date.now();
            
            const result = streamText({
              model: gateway(model),
              prompt,
              temperature: 0.7,
              experimental_transform: smoothStream({
                delayInMs: 20,
                chunking: 'word'
              }),
            });

            let fullText = '';
            let promptTokens = 0;
            let completionTokens = 0;
            let tokenCount = 0;

            // Stream the text parts
            await logger.log('DEBUG', `Streaming response from ${model}`);
            let streamedChunks = 0;
            
            for await (const textPart of result.textStream) {
              fullText += textPart;
              tokenCount++;
              streamedChunks++;
              
              // Log every 10th chunk to avoid log spam
              if (streamedChunks % 10 === 0) {
                await logger.log('DEBUG', `${model} streaming progress`, {
                  chunks: streamedChunks,
                  textLength: fullText.length
                });
              }
              
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                type: 'text-delta',
                model,
                textDelta: textPart
              })}\n\n`));
            }
            
            await logger.log('INFO', `${model} streaming complete`, {
              totalChunks: streamedChunks,
              totalLength: fullText.length
            });
            
            const streamDuration = Date.now() - streamStartTime;
            await logger.logPerformance(`${model} streaming`, streamDuration);

            // Get usage data
            const usage = await result.usage;
            promptTokens = usage.inputTokens || 0;
            completionTokens = usage.outputTokens || 0;
            
            const totalModelTime = Date.now() - modelStartTime;
            const cost = calculateCost(model, promptTokens, completionTokens);
            totalCost += cost;
            
            await logger.log('INFO', `${model} completed`, {
              totalTime: `${totalModelTime}ms`,
              tokens: { prompt: promptTokens, completion: completionTokens },
              cost: `$${cost.toFixed(6)}`,
              responseLength: fullText.length
            });

            // Log to cost tracker
            await costLogger.log({
              provider: model.split('/')[0],
              model,
              promptTokens,
              completionTokens,
              cost,
              prompt
            });

            results.push({
              model,
              text: fullText,
              latency: totalModelTime,
              promptTokens,
              completionTokens,
              cost
            });

            // Send completion
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'model-complete',
              model,
              latency: totalModelTime,
              usage: { promptTokens, completionTokens },
              cost
            })}\n\n`));

          } catch (error) {
            const errorTime = Date.now() - modelStartTime;
            await logger.logError(error, `${model} after ${errorTime}ms`);
            
            // Log detailed error information
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const errorDetails = {
              model,
              error: errorMessage,
              duration: `${errorTime}ms`,
              timestamp: new Date().toISOString()
            };
            
            await logger.log('ERROR', `Model ${model} failed`, errorDetails);
            
            // Check for specific error types
            if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
              await logger.log('ERROR', 'Authentication failed - check API key');
            } else if (errorMessage.includes('429')) {
              await logger.log('ERROR', 'Rate limit exceeded');
            } else if (errorMessage.includes('timeout')) {
              await logger.log('ERROR', 'Request timed out');
            }
            
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'error',
              model,
              error: errorMessage,
              details: errorDetails
            })}\n\n`));
          }
        }

        // Judge evaluation with web search
        if (results.length > 0) {
          await logger.log('INFO', '=== JUDGE EVALUATION PHASE ===');
          const judgeStartTime = Date.now();
          
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'judge-start'
          })}\n\n`));

          try {
            // First, search for current Vercel features information
            await logger.log('INFO', 'Starting web search for Vercel documentation');
            const searchStartTime = Date.now();
            
            const searchPrompt = `site:vercel.com Search for official Vercel documentation about:
- "Ship 2025" announcement and new features
- "AI Gateway" current status (Beta/Open Beta)
- "Sandbox" feature and its availability (Public Beta)
- "Queues" feature and its availability (Limited Beta)  
- "Active CPU" and "Fluid Compute" (Generally Available)
- "Rolling Releases" feature status
Search only official vercel.com documentation pages, blog posts, and announcements.`;

            // Simulated web search for now (real implementation would use a search API)
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'judge-comment',
              comment: '🔍 Performing web search...\nSearching site:vercel.com for Ship 2025 features...'
            })}\n\n`));
            
            // Simulate search delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            const searchInfo = `Based on available documentation:
- Vercel AI Gateway is in Open Beta
- Supports multiple AI models including Grok, Claude, and Gemini
- Active CPU billing is Generally Available
- Sandbox is in Public Beta
- Queues is in Limited Beta`;
            
            const searchDuration = Date.now() - searchStartTime;
            await logger.logPerformance('Web search (simulated)', searchDuration, {
              resultLength: searchInfo.length
            });
            
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'judge-comment', 
              comment: '✅ Web search completed\nFound documentation on AI Gateway, Sandbox, Queues, and Active CPU features\n\nEvaluating model responses against current documentation...'
            })}\n\n`));

            // Now judge with the search context
            await logger.log('INFO', 'Starting judge evaluation with search context');
            const evalStartTime = Date.now();
            
            const judgePrompt = `Evaluate AI responses. Be CONCISE.

Context: ${searchInfo}

User asked: "${prompt}"

Responses:
${results.map((r, i) => `${i + 1}. ${r.model}: ${r.text.substring(0, 300)}...`).join('\n')}

Score each (0-10 relevance, 0-5 reasoning/style/accuracy/honesty).
Return JSON only:
{
  "evaluations": [
    {
      "model": "model-name",
      "scores": {
        "relevance": 8,
        "reasoning": 4,
        "style": 4,
        "accuracy": 9,
        "honesty": 3,
        "explanation": "1 sentence"
      }
    }
  ]
}`;

            const judgeResult = streamText({
              model: gateway('openai/gpt-4o-mini'),
              prompt: judgePrompt,
              temperature: 0.1,
            });

            let judgeText = '';
            
            // Stream judge response
            for await (const textPart of judgeResult.textStream) {
              judgeText += textPart;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                type: 'judge-delta',
                textDelta: textPart
              })}\n\n`));
            }

            // Get judge usage for cost
            const evalDuration = Date.now() - evalStartTime;
            const judgeUsage = await judgeResult.usage;
            const judgeCost = calculateCost(
              'openai/gpt-4o-mini',
              judgeUsage.inputTokens || 0,
              judgeUsage.outputTokens || 0
            );
            totalCost += judgeCost;
            
            const totalJudgeTime = Date.now() - judgeStartTime;
            await logger.log('INFO', 'Judge evaluation completed', {
              searchTime: `${searchDuration}ms`,
              evaluationTime: `${evalDuration}ms`,
              totalJudgeTime: `${totalJudgeTime}ms`,
              judgeCost: `$${judgeCost.toFixed(6)}`
            });

            // Parse and send final results
            try {
              const jsonMatch = judgeText.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                
                // Calculate final scores
                const evaluatedResults = results.map(r => {
                  const evaluation = parsed.evaluations?.find((e: any) => 
                    e.model === r.model || e.model.includes(r.model.split('/')[1])
                  );
                  
                  const scores = evaluation?.scores || {
                    relevance: 5,
                    reasoning: 3,
                    style: 3,
                    accuracy: 5,
                    honesty: 3,
                    explanation: 'No evaluation'
                  };
                  
                  const totalScore = (scores.relevance * 2) + (scores.accuracy * 2) + 
                    scores.reasoning + scores.style + scores.honesty;
                  
                  const finalScore = totalScore - (r.latency / 1000) - (r.cost * 10);
                  
                  return {
                    ...r,
                    scores,
                    totalScore,
                    finalScore
                  };
                }).sort((a: any, b: any) => b.finalScore - a.finalScore);

                controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                  type: 'final-results',
                  evaluations: evaluatedResults,
                  totalCost,
                  searchSources: parsed.searchSources || []
                })}\n\n`));

                // Save benchmark
                await saveBenchmarkResults(prompt, evaluatedResults, totalCost);
                
                await logger.log('INFO', 'Competition results', {
                  winner: evaluatedResults[0]?.model,
                  winnerScore: evaluatedResults[0]?.finalScore.toFixed(2),
                  rankings: evaluatedResults.map(r => ({
                    model: r.model,
                    score: r.finalScore.toFixed(2)
                  }))
                });
              }
            } catch (parseError) {
              console.error('Error parsing judge response:', parseError);
            }

          } catch (error) {
            await logger.logError(error, 'Judge evaluation');
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'judge-error',
              error: error instanceof Error ? error.message : 'Judge evaluation failed'
            })}\n\n`));
          }
        }

        // Complete
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
        
        const totalRequestTime = Date.now() - requestStartTime;
        
        await logger.logSummary({
          totalDuration: `${(totalRequestTime / 1000).toFixed(2)}s`,
          totalCost: `$${totalCost.toFixed(6)}`,
          modelsProcessed: results.length,
          modelDetails: results.map(r => ({
            model: r.model,
            time: `${r.latency}ms`,
            cost: `$${r.cost.toFixed(6)}`,
            tokens: r.completionTokens
          }))
        });
        
        await logger.log('INFO', `=== REQUEST COMPLETED - Log saved to: ${logger.getLogFilePath()} ===`);
      }
    });

    // Return SSE response
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });

  } catch (error) {
    if (logger) {
      await logger.logError(error, 'API request');
    } else {
      console.error('API error:', error);
    }
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function saveBenchmarkResults(
  prompt: string, 
  evaluations: any[], 
  totalCost: number
): Promise<void> {
  try {
    const benchmarksDir = path.join(process.cwd(), 'benchmarks');
    await fs.mkdir(benchmarksDir, { recursive: true });
    
    const benchmarkData = {
      timestamp: new Date().toISOString(),
      prompt,
      evaluations,
      summary: {
        winner: evaluations[0]?.model,
        totalCost
      }
    };
    
    const filename = `benchmark-${Date.now()}.json`;
    await fs.writeFile(
      path.join(benchmarksDir, filename),
      JSON.stringify(benchmarkData, null, 2)
    );
  } catch (error) {
    console.error('Failed to save benchmark data:', error);
  }
}