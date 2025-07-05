import { streamText, smoothStream, generateText } from 'ai';
import { createGateway } from '@ai-sdk/gateway';
import { openai } from '@ai-sdk/openai';
import { NextRequest } from 'next/server';
import { costLogger } from '@/app/services/cost-logger';
import { FileLogger } from '@/app/lib/file-logger';
import { promises as fs } from 'fs';
import path from 'path';
import { getMockResponse, streamMockResponse } from '@/app/lib/mock-responses';

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
            
            // Check for specific error types and decide if we should use mock
            let shouldUseMock = false;
            if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
              await logger.log('ERROR', 'Authentication failed - check API key');
            } else if (errorMessage.includes('429') || errorMessage.includes('rate limit') || 
                       errorMessage.includes('quota') || errorMessage.includes('credits')) {
              await logger.log('ERROR', 'Rate limit or credits exceeded - falling back to mock');
              shouldUseMock = true;
            } else if (errorMessage.includes('timeout')) {
              await logger.log('ERROR', 'Request timed out');
            }
            
            // Use mock response if appropriate
            if (shouldUseMock) {
              await logger.log('INFO', `Using mock response for ${model}`);
              
              // Stream mock response
              const mockData = getMockResponse(model);
              let fullText = '';
              
              for await (const chunk of streamMockResponse(model)) {
                fullText += chunk;
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                  type: 'text-delta',
                  model,
                  textDelta: chunk
                })}\n\n`));
              }
              
              const mockLatency = 2000; // Simulate 2s response time
              const cost = mockData.cost;
              totalCost += cost;
              
              results.push({
                model,
                text: fullText,
                latency: mockLatency,
                promptTokens: Math.floor(mockData.tokens * 0.2), // Estimate prompt tokens
                completionTokens: Math.floor(mockData.tokens * 0.8), // Estimate completion tokens
                cost
              });
              
              // Send completion with mock indicator
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                type: 'model-complete',
                model,
                latency: mockLatency,
                usage: { 
                  promptTokens: Math.floor(mockData.tokens * 0.2), 
                  completionTokens: Math.floor(mockData.tokens * 0.8) 
                },
                cost,
                isMock: true
              })}\n\n`));
              
              await logger.log('INFO', `Mock response completed for ${model}`, {
                cost: `$${cost.toFixed(6)}`,
                tokens: mockData.tokens
              });
            } else {
              // Send error as before
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                type: 'error',
                model,
                error: errorMessage,
                details: errorDetails
              })}\n\n`));
            }
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
            // Judge evaluates with web search capability
            await logger.log('INFO', 'Judge evaluating responses with web search capability');
            const evalStartTime = Date.now();
            
            // Send search notification
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'judge-comment',
              comment: '🔍 Judge is searching for current Vercel documentation...'
            })}\n\n`));
            
            // Log for visibility
            console.log('🔍 Judge performing web search for Vercel features...');
            
            // Judge prompt that will use web search
            const judgePrompt = `You are evaluating AI model responses about Vercel Ship 2025 features.

Use the web search tool to find current information about:
- Vercel AI Gateway status and features
- Active CPU and Fluid Compute availability
- Sandbox feature status
- Other Ship 2025 features

Then evaluate each model's response for accuracy against your search results.

User asked: "${prompt}"

Model responses to evaluate:
${results.map((r, i) => `\n${i + 1}. ${r.model}:\n${r.text.substring(0, 400)}...`).join('\n')}

After searching, score each response on:
- relevance (0-10): Does it answer the question?
- reasoning (0-5): Logical flow and structure?
- style (0-5): Clear and concise?
- accuracy (0-10): Factually correct based on your search? Mark hallucinations.
- honesty (0-5): Acknowledges limitations or outdated info?

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
        "honesty": 3
      },
      "explanation": "Brief explanation noting any hallucinations found"
    }
  ]
}`;

            // Use OpenAI responses API with web search
            const judgeResult = await generateText({
              model: openai.responses('gpt-4o-mini'),
              prompt: judgePrompt,
              tools: {
                web_search_preview: openai.tools.webSearchPreview({}),
              },
              toolChoice: { type: 'tool', toolName: 'web_search_preview' },
              temperature: 0.1,
            });
            
            await logger.log('INFO', 'Judge evaluation complete', {
              steps: judgeResult.steps?.length,
              toolCalls: judgeResult.steps?.filter(s => s.toolCalls?.length > 0).length
            });
            
            // Log search sources
            const sources = judgeResult.sources;
            console.log('Sources found:', sources?.length || 0);
            if (sources && sources.length > 0) {
              console.log('Web search sources:');
              sources.forEach((source: any) => {
                console.log(`- ${source.title || 'Untitled'}: ${source.url || 'No URL'}`);
              });
            }
            
            // Extract the evaluation from the judge's response
            const judgeText = judgeResult.text;
            
            // Send judge's evaluation to the client
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'judge-delta',
              textDelta: judgeText
            })}\n\n`));

            // Get judge usage for cost
            const evalDuration = Date.now() - evalStartTime;
            const judgeUsage = judgeResult.usage;
            const judgeCost = calculateCost(
              'openai/gpt-4o-mini',
              judgeUsage.inputTokens || 0,
              judgeUsage.outputTokens || 0
            );
            totalCost += judgeCost;
            
            const totalJudgeTime = Date.now() - judgeStartTime;
            await logger.log('INFO', 'Judge evaluation completed', {
              evaluationTime: `${evalDuration}ms`,
              totalJudgeTime: `${totalJudgeTime}ms`,
              judgeCost: `$${judgeCost.toFixed(6)}`,
              sourcesFound: sources?.length || 0
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