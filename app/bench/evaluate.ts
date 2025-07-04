import { generateText } from 'ai';
import { createGateway } from '@ai-sdk/gateway';

export interface EvalScore {
  relevance: number;  // 0-10
  reasoning: number;  // 0-5
  style: number;      // 0-5
  accuracy: number;   // 0-10 - factual correctness about Vercel features
  honesty: number;    // 0-5 - acknowledges knowledge limitations
  explanation: string;
  totalScore: number;
  soundnessScore: number; // reasoning + style (logical coherence)
}

export interface EvaluationResult {
  model: string;
  response: string;
  scores: EvalScore;
  latency: number;
  cost: number;
  finalScore: number; // Combined score including performance metrics
}

// Create gateway instance
const gateway = createGateway({
  apiKey: process.env.AI_GATEWAY_API_KEY,
});

const JUDGE_MODEL = 'gpt-4o-mini'; // Using GPT-4o-mini as judge for cost efficiency

export async function evaluateResponse(
  userPrompt: string,
  modelResponse: string,
  modelName: string
): Promise<EvalScore> {
  console.log(`\n=== EVALUATING ${modelName} ===`);
  
  try {
    // Use GPT-4o-mini as judge without web search to ensure fair evaluation
    console.log('Evaluating response with GPT-4o-mini...');
    
    const judgePrompt = `You are an expert evaluator for AI responses about Vercel features.

Evaluate the following response based on your knowledge of Vercel's features as of early 2025:

USER PROMPT: "${userPrompt}"

${modelName.toUpperCase()} RESPONSE: "${modelResponse}"

Evaluate the response on these criteria:

1. Relevance (0-10): How well does it answer the user's question? Is it complete?
2. Reasoning (0-5): Are there logical steps, explanations, or citations where appropriate?
3. Style (0-5): Is it clear, concise, and well-structured?
4. Accuracy (0-10): Based on your knowledge of Vercel features, are the facts likely correct?
   - AI Gateway is in Beta/Open Beta
   - Sandbox is in Public Beta
   - Queues is in Limited Beta
   - Active CPU is Generally Available
   - Consider if technical approaches are valid for Vercel platform
5. Honesty (0-5): Does the model acknowledge knowledge limitations?
   - 5: Explicitly states knowledge cutoff or uncertainty
   - 3: Makes reasonable disclaimers
   - 0: Confidently states potentially outdated/wrong information

Respond in JSON format:
{
  "relevance": <number>,
  "reasoning": <number>,
  "style": <number>,
  "accuracy": <number>,
  "honesty": <number>,
  "explanation": "<detailed explanation of your evaluation>"
}`;
    
    // Use GPT-4o-mini through the gateway
    const result = await generateText({
      model: gateway(`openai/${JUDGE_MODEL}`),
      prompt: judgePrompt,
      temperature: 0.1,
    });

    // Parse the JSON response (handle markdown code blocks)
    let jsonText = result.text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json\s*\n?/, '').replace(/\n?```\s*$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```\s*\n?/, '').replace(/\n?```\s*$/, '');
    }
    
    const scores = JSON.parse(jsonText);
    
    console.log(`Evaluation complete for ${modelName}:`, {
      accuracy: scores.accuracy,
      relevance: scores.relevance,
      explanation: scores.explanation.substring(0, 100) + '...'
    });
    
    // Calculate soundness score (logical coherence)
    const soundnessScore = scores.reasoning + scores.style;
    
    // Calculate total score (relevance 2x + accuracy 2x + rest)
    const totalScore = (scores.relevance * 2) + (scores.accuracy * 2) + scores.reasoning + scores.style + scores.honesty;
    
    return {
      relevance: scores.relevance,
      reasoning: scores.reasoning,
      style: scores.style,
      accuracy: scores.accuracy || 5,
      honesty: scores.honesty || 2.5,
      explanation: scores.explanation,
      totalScore,
      soundnessScore
    };
  } catch (error) {
    console.error(`Error evaluating response for ${modelName}:`, error);
    // Return neutral scores on error
    return {
      relevance: 5,
      reasoning: 2.5,
      style: 2.5,
      accuracy: 5,
      honesty: 2.5,
      explanation: 'Evaluation failed',
      totalScore: 25,
      soundnessScore: 5
    };
  }
}

export function calculateFinalScore(
  evalScore: EvalScore,
  latencyMs: number,
  costUsd: number
): number {
  // Final Score = Total Score + (−Latency/1000) + (−Cost×10)
  return evalScore.totalScore - (latencyMs / 1000) - (costUsd * 10);
}

export async function benchmarkResponses(
  userPrompt: string,
  responses: Array<{
    model: string;
    text: string;
    latency: number;
    cost: number;
  }>
): Promise<EvaluationResult[]> {
  console.log('Starting benchmark evaluation...');
  
  // Evaluate all responses in parallel
  const evaluations = await Promise.all(
    responses.map(async (response) => {
      const scores = await evaluateResponse(userPrompt, response.text, response.model);
      const finalScore = calculateFinalScore(scores, response.latency, response.cost);
      
      return {
        model: response.model,
        response: response.text,
        scores,
        latency: response.latency,
        cost: response.cost,
        finalScore
      };
    })
  );
  
  // Sort by final score (highest first)
  return evaluations.sort((a, b) => b.finalScore - a.finalScore);
}