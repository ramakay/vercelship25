# Vercel Ship 2025 — $10 Feature Benchmark (Next.js 15)

## Updated Mission
Spend ≈ USD $10 on a Pro account to benchmark three LLMs through Vercel AI Gateway, rank their answers with a lightweight SWE‑bench–style rubric, execute the best answer in Vercel Sandbox, and capture every metric needed for the LinkedIn article "I spent $10 on Vercel's latest 2025 Ship features—here's what I found."

## Project Evolution
This project has evolved from a simple multi-model comparison to a comprehensive benchmarking system with automated evaluation, scoring, and ranking inspired by SWE-bench methodology.

## Tech Stack
- **Next.js**: 15.0.0-stable (React 19 RC ready)
- **Vercel**: Pro team – Active CPU + Fluid enabled by default
- **AI Gateway**: Open Beta
- **Sandbox**: Public Beta
- **Queues**: Limited Beta (probe availability first)
- **AI SDK**: 5.0 Beta
- **UI Framework**: Radix UI Themes (cyan accent, sand gray, large radius, 105% scaling)

## Ship 2025 Features Implementation

### 1. AI Gateway (Open Beta) ✅
- **Models**: Grok 3, Claude 4 Opus, Gemini 2.5 Pro
- **Status**: Implemented with parallel orchestration
- **Quota**: 50k tokens/day free, then pay-as-you-go

### 2. Model Evaluation System (NEW)
- **SWE-bench Style Scoring**: Automated evaluation using GPT-4o-mini as judge
- **Two-Step Process**:
  1. Gemini 2.5 Pro searches for current Vercel feature information using `useSearchGrounding: true`
  2. GPT-4o-mini evaluates responses based on search results
- **Metrics**:
  - Relevance (0-10): Does answer address prompt completely?
  - Reasoning (0-5): Logical steps and citations present?
  - Style (0-5): Clarity and conciseness
  - Accuracy (0-10): Factual correctness verified via web search
  - Honesty (0-5): Acknowledges knowledge limitations
  - Latency (ms): Response time
  - Cost ($): Token usage × unit price
- **Total Score**: (Relevance × 2) + (Accuracy × 2) + Reasoning + Style + Honesty + (-Latency/1000) + (-Cost×10)

### 3. Sandbox Execution ✅
- **Status**: Simulated implementation (actual API pending)
- **Feature**: Execute best-scored code responses
- **Tracking**: CPU-seconds consumed

### 4. Active CPU Tracking ✅
- **Status**: Monitoring via x-vercel-function-trace headers
- **Visualization**: Sparkline chart showing CPU vs wall time

### 5. Cost Tracking ✅
- **Budget**: $10 maximum
- **Storage**: localStorage with Queue fallback
- **Export**: CSV and JSON formats

## Implementation Flow

### Phase A: Feature Probing
1. Gateway ping: `curl https://api.ai.vercel.com/v1/models`
2. Sandbox ping: `npx sandbox ping`
3. Queue probe: `vercel queue topics ls`
4. Record in `/status.json`

### Phase B: Chat Orchestrator
```typescript
// /app/api/chat/route.ts
- Parallel calls to 3 models via Promise.all
- Capture: latency_ms, tokens_in/out, usage.$, text
- Return: [{ id, label, latency_ms, cost_usd, text }]
```

### Phase C: Evaluation System
```typescript
// /app/bench/evaluate.ts
evaluateResponse(modelLabel, text) => EvalScore {
  relevance: 0-10,
  reasoning: 0-5,
  style: 0-5,
  totalScore: calculated
}
```

### Phase D: Results UI
- Table columns: Model · Score · Latency(ms) · Cost($) · Relevance · Reasoning · Style
- Row highlight for top score
- Sandbox output pane
- Cumulative metrics display

### Phase E: Data Collection
- Benchmarks stored in `/benchmarks/{date}.json`
- Playwright automation for screenshots
- Export Functions & AI Gateway metrics as CSV

## Key Components

```
app/
├── api/
│   └── chat/
│       └── route.ts          # Orchestrator with evaluation
├── bench/
│   └── evaluate.ts          # Judge prompts & scoring logic
├── components/
│   ├── ResultsTable.tsx     # Enhanced UI with scores
│   ├── Dashboard-radix.tsx  # Radix UI implementation
│   └── MetricsExport.tsx    # Data export functionality
├── services/
│   ├── ai-gateway.ts        # Multi-model orchestration
│   └── cost-logger.ts       # Budget tracking
e2e/
└── chat.spec.ts            # Playwright tests
```

## Success Metrics
- ✅ End-to-end cost ≤ $10
- ✅ Table shows 3 models with evaluation scores
- ✅ Best model auto-ranked by judge prompts
- ✅ Sandbox executes code (if applicable)
- ✅ Metrics CSV & screenshots captured

## Commands

### Development
```bash
npm run dev              # Start dev server
npm run probe           # Test feature availability
npm run benchmark       # Run evaluation suite
npm run screenshots     # Capture UI states
```

### Data Export
```bash
vercel functions inspect --since 1h --csv > data/functions.csv
npm run export:metrics  # Export all benchmark data
```

## Current Status
- ✅ Multi-model orchestration implemented
- ✅ Cost tracking with $10 budget limit
- ✅ Basic UI with results table
- ✅ Web search evaluation system (GPT-4o-mini judge with Gemini search grounding)
- ✅ Production-grade implementation (no mocking or simulation)
- ✅ Enhanced UI with score display
- 🚧 Automated testing suite (needs proper implementation)
- 🚧 Playwright automation for screenshots
- 🚧 Radix UI theme integration

## Production Quality Standards

### Core Principles
- **NO mock data or simulated responses** - All features must be production-grade
- **NO "manual test instruction" scripts** - Write real automated tests that verify functionality
- **Fix root causes, not symptoms** - When debugging fails, systematically fix the underlying issue
- **Systematic debugging** - If an API connection fails: check logs, verify ports, test network connectivity

### Implementation Requirements
- All API responses must be real (no timeouts accepted as valid)
- Web search must use actual AI models with search grounding
- Tests must make real API calls and verify actual responses
- Error handling must be comprehensive and informative

## Web Search Implementation

### Architecture
The evaluation system uses a two-step process for accurate scoring:

```typescript
// Step 1: Search for current information using Gemini with search grounding
const searchResult = await generateText({
  model: gateway('google/gemini-2.5-pro', {
    useSearchGrounding: true,
  }),
  prompt: `Search for current information about Vercel Ship 2025 features...`,
  temperature: 0.1,
});

// Step 2: Judge with search context using GPT-4o-mini
const evaluation = await generateText({
  model: gateway('openai/gpt-4o-mini'),
  prompt: judgePrompt + searchResult.text,
  temperature: 0.1,
});
```

### Key Points
- Gemini 2.5 Pro performs web searches with `useSearchGrounding: true`
- GPT-4o-mini evaluates based on search results for accuracy
- No OpenAI API key needed - uses Vercel AI Gateway
- Production-grade comparison with no simulation

## Testing Requirements

### Automated Test Standards
All test scripts must:
1. Make real API calls to verify functionality
2. Validate web search is performed (check for search logs)
3. Confirm judge uses search results for evaluation
4. Verify no timeouts or mock data used
5. Include proper error handling and reporting

### Test Validation Checklist
- ✅ API responds with real model outputs
- ✅ Console shows "Searching for current Vercel Ship 2025 feature information..."
- ✅ Evaluation includes web search results in scoring
- ✅ Total costs are tracked and under budget
- ✅ Winner is determined by actual evaluation scores

## Session Management Guidelines

### When to Start Fresh
Use `claude` (without `-c` flag) when:
- Complex implementations requiring full attention
- Previous session exceeded 30+ minutes
- Quality degradation signs appear
- Critical production-grade work needed

### Quality Degradation Signs
Watch for these patterns:
- Creating workarounds instead of fixing errors
- Writing "test" scripts that just print instructions
- Avoiding systematic debugging
- Suggesting manual processes for automation tasks

### Best Practices
1. Break complex tasks into focused sessions
2. Explicitly state "production-grade only" requirements
3. Call out quality issues immediately
4. Use fresh sessions for critical implementations

## Deliverable
Merge-ready PR with:
- Working benchmarking app
- `/benchmarks/*.json` evaluation results
- Screenshot assets for article
- Exported metrics CSV files
- Complete documentation