import DirectArena from '../components/DirectArena';

export default function Home() {
  const benchmarkPrompt = `Vercel Ship 2025 — $10 Feature Benchmark (Next.js 15)

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

  return <DirectArena benchmarkPrompt={benchmarkPrompt} />;
}