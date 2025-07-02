import { streamText } from 'ai';
import { createGateway } from '@ai-sdk/gateway';
import { NextRequest } from 'next/server';
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
  'google/gemini-2.5-pro': { input: 0.00125, output: 0.00375 }
} as const;

type ModelProvider = keyof typeof PRICING;

interface ModelEvaluation {
  model: string;
  text: string;
  latency: number;
  cost: number;
  scores: {
    relevance: number;
    reasoning: number;
    style: number;
    explanation: string;
  };
  finalScore: number;
}

interface ModelResult {
  model: string;
  text: string;
  latency: number;
  promptTokens: number;
  completionTokens: number;
  cost: number;
  error?: string;
  finishReason?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();
    
    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('Stream API called');
    console.log('AI Gateway API Key present:', !!process.env.AI_GATEWAY_API_KEY);

    const models: ModelProvider[] = [
      'xai/grok-3',
      'anthropic/claude-4-opus', 
      'google/gemini-2.5-pro'
    ];

    // Create custom transform stream for our SSE format
    const encoder = new TextEncoder();
    const customTransform = new TransformStream({
      async start(controller) {
        // Send initial event
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          type: 'start',
          models: models.map(m => ({
            model: m,
            displayName: getModelDisplayName(m)
          }))
        })}\n\n`));

        const modelResults: ModelResult[] = [];

        // Process each model sequentially
        for (const model of models) {
          const startTime = Date.now();
          
          try {
            console.log(`Starting model: ${model}`);
            
            // Send model start event
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'model-start',
              model
            })}\n\n`));

            // Create a simple prompt for testing
            const result = streamText({
              model: gateway(model),
              prompt,
              onError: (error) => {
                console.error(`Error with model ${model}:`, error);
              }
            });

            let fullText = '';
            
            // Stream the text
            for await (const textPart of result.textStream) {
              fullText += textPart;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                type: 'text-delta',
                model,
                textDelta: textPart
              })}\n\n`));
            }

            // Wait for final result
            const [usage, finishReason] = await Promise.all([
              result.usage,
              result.finishReason
            ]);

            const latency = Date.now() - startTime;
            const cost = calculateCost(model, usage.inputTokens || 0, usage.outputTokens || 0);

            console.log(`Model ${model} completed in ${latency}ms`);

            modelResults.push({
              model,
              text: fullText,
              latency,
              promptTokens: usage.inputTokens || 0,
              completionTokens: usage.outputTokens || 0,
              cost,
              finishReason
            });

            // Send model complete event
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'model-complete',
              model,
              latency,
              usage
            })}\n\n`));

          } catch (error) {
            console.error(`Error with model ${model}:`, error);
            
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            
            modelResults.push({
              model,
              text: '',
              latency: Date.now() - startTime,
              promptTokens: 0,
              completionTokens: 0,
              cost: 0,
              error: errorMessage
            });

            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'error',
              model,
              error: errorMessage
            })}\n\n`));
          }
        }

        // All models complete
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          type: 'all-models-complete'
        })}\n\n`));

        // Judge evaluation - only if we have successful responses
        const successfulResponses = modelResults.filter(r => !r.error && r.text);
        
        if (successfulResponses.length > 0) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'judge-start'
          })}\n\n`));

          try {
            const judgePrompt = createJudgePrompt(prompt, successfulResponses);
            
            const judgeResult = streamText({
              model: gateway('openai/gpt-4o'),
              prompt: judgePrompt,
              onError: (error) => {
                console.error('Judge error:', error);
              }
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

            const judgeUsage = await judgeResult.usage;
            const judgeCost = calculateCost('openai/gpt-4o' as ModelProvider | 'openai/gpt-4o', judgeUsage.inputTokens || 0, judgeUsage.outputTokens || 0);

            // Parse evaluations
            const evaluations = parseJudgeResponse(judgeText, modelResults);
            
            // Send final results
            const totalCost = modelResults.reduce((sum, r) => sum + r.cost, 0) + judgeCost;
            
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'final-results',
              evaluations,
              totalCost
            })}\n\n`));

            // Save benchmark
            await saveBenchmarkResults(prompt, evaluations);

          } catch (error) {
            console.error('Judge error:', error);
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'judge-error',
              error: error instanceof Error ? error.message : 'Judge evaluation failed'
            })}\n\n`));
          }
        } else {
          // No successful responses to judge
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'judge-error',
            error: 'No successful model responses to evaluate'
          })}\n\n`));
        }

        // Complete the stream
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      }
    });

    // Return the readable stream with proper headers
    return new Response(customTransform.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });

  } catch (error) {
    console.error('API error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

function calculateCost(
  model: ModelProvider | 'openai/gpt-4o',
  promptTokens: number,
  completionTokens: number
): number {
  const pricing = model === 'openai/gpt-4o' 
    ? { input: 0.01, output: 0.03 }
    : PRICING[model as ModelProvider];
    
  const inputCost = (promptTokens / 1000) * pricing.input;
  const outputCost = (completionTokens / 1000) * pricing.output;
  return inputCost + outputCost;
}

function getModelDisplayName(model: ModelProvider): string {
  const displayNames = {
    'xai/grok-3': 'Grok 3',
    'anthropic/claude-4-opus': 'Claude 4 Opus',
    'google/gemini-2.5-pro': 'Gemini 2.5 Pro'
  };
  return displayNames[model] || model;
}

function createJudgePrompt(userPrompt: string, responses: ModelResult[]): string {
  const responseTexts = responses.map((r, i) => 
    `Model ${i + 1} (${r.model}):\n${r.text}`
  ).join('\n\n---\n\n');

  return `You are an expert technical evaluator. Score these model responses using this rubric:

- Relevance (0-10): How well does the response address all aspects of the prompt?
- Reasoning (0-5): Are logical steps clear with proper justification?
- Style (0-5): Is the response clear, concise, and well-structured?

User Prompt: ${userPrompt}

Model Responses:
${responseTexts}

For each model, provide:
1. Relevance score (0-10)
2. Reasoning score (0-5)
3. Style score (0-5)
4. Brief explanation of scores
5. Overall ranking

Format your response as JSON with this structure:
{
  "evaluations": [
    {
      "model": "model-name",
      "scores": {
        "relevance": 8,
        "reasoning": 4,
        "style": 4,
        "explanation": "Brief explanation"
      }
    }
  ],
  "ranking": ["first-model", "second-model", "third-model"]
}`;
}

interface JudgeEvaluation {
  model: string;
  scores: {
    relevance: number;
    reasoning: number;
    style: number;
    explanation: string;
  };
}

function parseJudgeResponse(judgeText: string, responses: ModelResult[]): ModelEvaluation[] {
  try {
    // Extract JSON from the judge response
    const jsonMatch = judgeText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in judge response');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const evaluations: JudgeEvaluation[] = parsed.evaluations || [];

    // Calculate final scores and merge with response data
    return responses.map(response => {
      const evaluation = evaluations.find((e) => 
        e.model === response.model || e.model.includes(response.model.split('/')[1])
      );

      if (!evaluation) {
        return {
          model: response.model,
          text: response.text,
          latency: response.latency,
          cost: response.cost,
          scores: { relevance: 5, reasoning: 3, style: 3, explanation: 'No evaluation found' },
          finalScore: 10
        };
      }

      const finalScore = 
        (evaluation.scores.relevance * 2) + 
        evaluation.scores.reasoning + 
        evaluation.scores.style - 
        (response.latency / 1000) - 
        (response.cost * 10);

      return {
        model: response.model,
        text: response.text,
        latency: response.latency,
        cost: response.cost,
        scores: evaluation.scores,
        finalScore
      };
    }).sort((a, b) => b.finalScore - a.finalScore);
  } catch (error) {
    console.error('Error parsing judge response:', error);
    // Return default scores if parsing fails
    return responses.map(r => ({
      model: r.model,
      text: r.text,
      latency: r.latency,
      cost: r.cost,
      scores: { relevance: 5, reasoning: 3, style: 3, explanation: 'Parse error' },
      finalScore: 10
    }));
  }
}

async function saveBenchmarkResults(prompt: string, evaluations: ModelEvaluation[]): Promise<void> {
  try {
    const benchmarksDir = path.join(process.cwd(), 'benchmarks');
    await fs.mkdir(benchmarksDir, { recursive: true });
    
    const benchmarkData = {
      timestamp: new Date().toISOString(),
      prompt,
      evaluations,
      summary: {
        winner: evaluations[0]?.model,
        totalCost: evaluations.reduce((sum, e) => sum + e.cost, 0)
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