# Vercel Ship 2025: The $10 AI Gateway Experiment

A deep dive into building cost-efficient, real-time AI applications using Vercel's Ship 2025 features. This project explores practical patterns for multi-model orchestration, token economics, and performance optimization in production AI systems.

[Live Demo](https://vercelship25.vercel.app) | [Technical Article](https://linkedin.com/in/ramakay)

![Vercel Ship 2025 AI Showdown](./screenshots/intro-panel.png)

## The Story

In June 2025, Vercel announced Ship. A suite of features for AI applications. With budgets tight, we asked:

**What can $10 actually buy you?**

Testing three AI models: Grok, Claude, and Gemini. Tracking every token and penny spent.

## Why It Works

### Real Constraints
$10 forces meaningful choices. Just practical developer decisions.

### Active CPU Billing  
Pay only for execution time. Every millisecond counts.

### Multi-Model Reality
Different models excel at different tasks. Which delivers value?

## The Method

1. **Parallel:** All three models simultaneously
2. **Track:** Tokens, latency, and cost
3. **Judge:** Automated scoring
4. **Analyze:** Track against $10 budget

## What We Built

A real-time AI showdown visualization that:
- Orchestrates multiple AI models through Vercel's AI Gateway
- Animates responses with paper planes and streaming text
- Tracks token usage and costs
- Automatically evaluates responses and declares a winner

### Technical Highlights

**Multi-Model Orchestration**  
Successfully integrated Grok, Claude, and Gemini through a unified API interface.

**Streaming Responses**  
Implemented character-by-character streaming with visual feedback.

**Cost Tracking**  
Built real-time cost accumulation with precise decimal tracking.

### Feature Availability (As Tested)

**Working Features:**
- AI Gateway (Beta) - Successfully called multiple models
- Active CPU pricing - Visible in deployment
- Streaming responses - Implemented with animations

**Unavailable Features:**
- Queues - Limited beta, no API access
- Sandbox - Documentation unclear
- BotID - Not available in current plan

### Development Experience

The project evolved from a simple benchmark tool to an immersive animated experience. The AI Gateway worked well for basic multi-model calls, though advanced features like intelligent routing weren't accessible during testing.

*Note: This is an experimental project exploring Vercel's Ship 2025 features. Actual costs and performance will vary based on usage.*

---

*Built with ❤️ for shipping fast*

## The Journey: From Concept to Production

### What We Started With

**Initial Goal**: "I have $10. Let's see what Vercel's new AI features can really do."

**Original Plan**:
- Test 3 AI models through Vercel's gateway
- Track costs meticulously 
- Write a LinkedIn article about the experience
- Maybe build a simple comparison UI

### What We Actually Built

An immersive, animated AI showdown that:
- Orchestrates real-time battles between Grok, Claude, and Gemini
- Streams responses with cinematic animations
- Tracks every token and penny spent
- Automatically evaluates and crowns winners
- Provides actionable insights about production AI economics

## Problem Statement

As AI models proliferate, developers face critical challenges:

- **Model Selection Paralysis**: Each model has distinct strengths, weaknesses, and pricing models
- **Cost Uncertainty**: Token costs can spiral unexpectedly in production
- **Integration Complexity**: Switching between models requires significant code changes
- **User Experience**: Real-time streaming adds complexity to error handling and state management

This project demonstrates how Vercel's AI Gateway solves these challenges while exploring the practical economics of AI at scale.

## Architecture Overview

### Core Design Decisions

#### 1. Multi-Model Orchestration
Rather than betting on a single model, we implement a comparison engine that runs queries against multiple models simultaneously. This approach reveals:

- Performance characteristics under identical conditions
- Cost-per-insight variations
- Response quality differences for specific use cases

```typescript
// Unified interface for multiple models
const models = ['x-ai/grok-3', 'anthropic/claude-4-opus', 'google/gemini-2.5-pro'];

// Parallel execution with individual error boundaries
const responses = await Promise.allSettled(
  models.map(model => executeWithMetrics(model, prompt))
);
```

#### 2. Real-Time Token Economics
Every API call tracks:

- Token consumption per model
- Cumulative costs with precise decimal tracking
- Performance metrics (time-to-first-token, total duration)
- Error rates and retry patterns

#### 3. Visual Feedback Systems
AI responses are inherently asynchronous. We use animation as a functional tool to:

- Indicate processing states without blocking UI
- Show token streaming progress
- Communicate errors gracefully
- Celebrate successful completions

## Technical Implementation

### The Evolution

**Phase 1: Basic Dashboard** (Hours 1-4)
- Simple form input → API call → table display
- Functional but uninspiring
- Realized we needed to tell a better story

**Phase 2: The Pivot** (Hours 5-8)
- "What if we made this... fun?"
- Introduced anime.js for smooth animations
- Created the "AI Showdown" concept
- Paper planes delivering responses

**Phase 3: Editorial Design** (Hours 9-16)
- Redesigned with newspaper-style typography
- Added the $10 budget constraint narrative
- Implemented real streaming with visual feedback
- Created the judge evaluation system

**Phase 4: Production Polish** (Hours 17-24)
- Fixed ESLint/TypeScript errors for deployment
- Removed unavailable features (Queues)
- Optimized for real API calls
- Added comprehensive error handling

### Key Components

```
app/
├── /                      # Main showdown (originally /showdown-anime)
├── api/
│   └── triage/           # AI Gateway orchestration
│       └── route.ts      # Parallel model execution
├── showdown-anime/       
│   ├── components/
│   │   ├── AnimeStage.tsx    # Core orchestration & animations
│   │   ├── ModelCard.tsx     # Handwritten response display
│   │   ├── UseCasePanel.tsx  # Editorial intro with blur effects
│   │   ├── JudgePanel.tsx    # Real-time evaluation display
│   │   └── ConclusionsCard.tsx # Findings & verdicts
│   └── lib/
│       └── anime-wrapper.ts  # Dynamic anime.js loading
└── services/
    ├── ai-gateway.ts     # Model abstraction layer
    └── cost-logger.ts    # Token & cost tracking
```

## Features in Production Context

### ✅ What Shipped & Worked

**AI Gateway (Beta)**
- **What it solves**: Vendor lock-in, unified billing, consistent interfaces
- **Our implementation**: Abstract model differences behind a common API
- **Result**: Seamless model switching with 5 lines of code

**Active CPU Pricing**
- **What it solves**: Paying for idle lambda time
- **Our implementation**: Streaming responses to minimize execution time
- **Result**: Only pay for actual processing time

**Streaming Responses**
- **What it solves**: Better UX for slow AI responses
- **Our implementation**: Character-by-character animation
- **Result**: More engaging user experience

### 🚧 What We Couldn't Ship

**Queues (Limited Beta)**
- **Status**: Form was broken, no API access
- **Workaround**: localStorage for cost persistence
- **Learning**: Beta really means beta

**Sandbox Execution**
- **Status**: Available but no clear API documentation
- **Impact**: Couldn't execute generated code automatically
- **Future**: Would enable self-modifying applications

## Implementation Details

The project includes:
- Parallel API calls to multiple models
- Real-time response streaming
- Automated evaluation system
- Cost tracking and budgeting
- Animated visualization with anime.js

## Setup and Deployment

### Local Development

```bash
# Clone and install
git clone https://github.com/ramakay/vercelship25.git
cd vercelship25/ai-triage
npm install

# Configure environment
cp .env.example .env.local
# Add your AI_GATEWAY_API_KEY from Vercel dashboard

# Run development server
npm run dev
```

### Production Deployment

```bash
# Deploy to Vercel
vercel --prod

# Or connect GitHub repo for auto-deploy
vercel link
vercel git connect
```

For production, we recommend OIDC federation over environment variables:

```typescript
// Secure credential exchange
const token = await getOIDCToken();
const apiKey = await exchangeForAPIKey(token);
```

See [SECURE-DEPLOYMENT.md](./docs/SECURE-DEPLOYMENT.md) for implementation details.

## Performance Considerations

### Animation Performance
- All animations run on the compositor thread (transform, opacity only)
- RequestAnimationFrame for smooth 60fps
- Blur effects use CSS filters with GPU acceleration

### Network Optimization
- Response streaming for better perceived performance
- Parallel model execution with independent error handling
- Error boundaries for graceful failures

### Cost Optimization
- Token tracking for budget management
- First-sentence extraction for display
- Configurable token limits

## Lessons Learned

### 1. Token Economics Matter
Every token counts when working with multiple models. Tracking usage is essential for cost control.

### 2. Streaming Changes Everything
Traditional request/response patterns don't work well with LLMs. Streaming requires rethinking error handling, state management, and user feedback.

### 3. Model Selection is Context-Dependent
No single model wins all scenarios. Building comparison tools helps teams make informed decisions.

### 4. Animation as Communication
Well-crafted animations aren't decoration—they're functional communication tools that improve perceived performance and user understanding.

### 5. Ship Features Have Rough Edges
Beta features are truly beta. Plan for fallbacks and workarounds. The platform is powerful but documentation gaps exist.

## The Code That Makes It Work

### Parallel Model Execution
```typescript
export async function triageWithModels(prompt: string) {
  const models = [
    { provider: 'x-ai', model: 'grok-3' },
    { provider: 'anthropic', model: 'claude-4-opus' },
    { provider: 'google', model: 'gemini-2.5-pro' }
  ];

  const responses = await Promise.allSettled(
    models.map(async (config) => {
      const start = Date.now();
      const { text, usage } = await gateway.completions.create({
        model: `${config.provider}/${config.model}`,
        prompt,
        max_tokens: 150
      });
      
      return {
        model: `${config.provider}/${config.model}`,
        text,
        latency: Date.now() - start,
        ...calculateCost(usage, config)
      };
    })
  );

  return responses
    .filter(r => r.status === 'fulfilled')
    .map(r => r.value);
}
```

### Streaming Animation
```typescript
const streamResponse = (text: string, elementId: string) => {
  const words = text.split(' ');
  let progress = 0;
  
  const interval = setInterval(() => {
    progress += 0.05;
    const wordsToShow = Math.floor(words.length * progress);
    const currentText = words.slice(0, wordsToShow).join(' ');
    
    updateElement(elementId, currentText);
    
    if (progress >= 1) {
      clearInterval(interval);
      onComplete();
    }
  }, 100);
};
```

## Contributing

We welcome contributions that:

- Improve performance metrics
- Add new model integrations  
- Enhance error handling
- Document edge cases

Please include benchmarks with any performance-related PRs.

## Future Explorations

- [ ] WebSocket integration for true real-time updates
- [ ] Model fine-tuning integration
- [ ] Cost prediction algorithms
- [ ] A/B testing framework for model selection
- [ ] Sandbox execution when available
- [ ] Queue integration when API is accessible

## Acknowledgments

Built during a weekend exploration of Vercel Ship 2025. Special thanks to:
- The Vercel team for pushing the boundaries
- The anime.js community for performance insights
- Early users who provided feedback

## License

MIT License - see [LICENSE](./LICENSE) for details.

---

**Built to explore the intersection of AI economics and user experience.**

*Questions or collaboration: [@ramakay](https://linkedin.com/in/ramakay)*