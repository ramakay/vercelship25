import { NextRequest, NextResponse } from 'next/server';
import { triageWithModels, calculateTotalCost } from '@/app/services/ai-gateway';
import { benchmarkResponses } from '@/app/bench/evaluate';
import { promises as fs } from 'fs';
import path from 'path';

// Using Node.js runtime for file system access

interface TriageRequest {
  prompt: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: TriageRequest = await request.json();
    
    if (!body.prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }
    
    // Get start time for total request duration
    const requestStartTime = Date.now();
    
    // Call all models in parallel
    const responses = await triageWithModels(body.prompt);
    
    // Calculate total request time
    const totalLatency = Date.now() - requestStartTime;
    
    // Calculate total cost (including potential judge cost)
    const modelCost = calculateTotalCost(responses);
    
    // Temporarily skip evaluation to debug timeout issue
    // TODO: Re-enable evaluation after fixing timeout
    const evaluatedResponses = responses.map((r, index) => ({
      model: r.model,
      response: r.text,
      scores: {
        relevance: 8,
        reasoning: 4,
        style: 4,
        explanation: 'Evaluation temporarily disabled',
        totalScore: 16
      },
      latency: r.latency,
      cost: r.cost,
      finalScore: 16 - (r.latency / 1000) - (r.cost * 10)
    })).sort((a, b) => b.finalScore - a.finalScore);
    
    // Save benchmark results
    const benchmarkData = {
      timestamp: new Date().toISOString(),
      prompt: body.prompt,
      evaluations: evaluatedResponses,
      summary: {
        winner: evaluatedResponses[0].model,
        totalCost: modelCost,
        totalLatency,
      }
    };
    
    // Save to benchmarks directory (only in development)
    if (process.env.NODE_ENV === 'development') {
      try {
        const benchmarksDir = path.join(process.cwd(), 'benchmarks');
        await fs.mkdir(benchmarksDir, { recursive: true });
        
        const filename = `benchmark-${Date.now()}.json`;
        await fs.writeFile(
          path.join(benchmarksDir, filename),
          JSON.stringify(benchmarkData, null, 2)
        );
      } catch (error) {
        console.error('Failed to save benchmark data:', error);
      }
    }
    
    const responseData = {
      responses,
      evaluations: evaluatedResponses,
      summary: {
        totalCost: modelCost,
        totalLatency,
        totalPromptTokens: responses.reduce((sum, r) => sum + r.promptTokens, 0),
        totalCompletionTokens: responses.reduce((sum, r) => sum + r.completionTokens, 0),
        timestamp: new Date().toISOString(),
        winner: evaluatedResponses[0]
      }
    };
    
    return NextResponse.json(responseData, {
      headers: {
        'X-Total-Cost': modelCost.toFixed(6),
        'X-Total-Latency': totalLatency.toString(),
      }
    });
    
  } catch (error) {
    console.error('Triage API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}