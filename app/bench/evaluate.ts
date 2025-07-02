import { generateText } from 'ai';

export interface EvalScore {
  relevance: number;  // 0-10
  reasoning: number;  // 0-5
  style: number;      // 0-5
  explanation: string;
  totalScore: number;
}

export interface EvaluationResult {
  model: string;
  response: string;
  scores: EvalScore;
  latency: number;
  cost: number;
  finalScore: number; // Combined score including performance metrics
}

const JUDGE_MODEL = 'xai/grok-3'; // Using Grok-3 as judge (or could use gpt-4o if available)

export async function evaluateResponse(
  userPrompt: string,
  modelResponse: string,
  modelName: string
): Promise<EvalScore> {
  const judgePrompt = `You are an expert evaluator. Score this AI response based on the original user prompt.

User Prompt: "${userPrompt}"

AI Response: "${modelResponse}"

Evaluate on these criteria:
1. Relevance (0-10): How well does it answer the user's question? Is it complete and accurate?
2. Reasoning (0-5): Are there logical steps, explanations, or citations where appropriate?
3. Style (0-5): Is it clear, concise, and well-structured?

Respond in JSON format:
{
  "relevance": <number>,
  "reasoning": <number>,
  "style": <number>,
  "explanation": "<brief explanation of scores>"
}`;

  try {
    const result = await generateText({
      model: JUDGE_MODEL,
      prompt: judgePrompt,
      temperature: 0.1, // Low temperature for consistent judging
    });

    // Parse the JSON response
    const scores = JSON.parse(result.text);
    
    // Calculate total score (relevance weighted 2x)
    const totalScore = (scores.relevance * 2) + scores.reasoning + scores.style;
    
    return {
      relevance: scores.relevance,
      reasoning: scores.reasoning,
      style: scores.style,
      explanation: scores.explanation,
      totalScore
    };
  } catch (error) {
    console.error(`Error evaluating response for ${modelName}:`, error);
    // Return neutral scores on error
    return {
      relevance: 5,
      reasoning: 2.5,
      style: 2.5,
      explanation: 'Evaluation failed',
      totalScore: 15
    };
  }
}

export function calculateFinalScore(
  evalScore: EvalScore,
  latencyMs: number,
  costUsd: number
): number {
  // Total Score = Relevance × 2 + Reasoning + Style + (−Latency/1000) + (−Cost×10)
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