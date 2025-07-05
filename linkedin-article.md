# The 179-Second Timeout That Changed Everything

*What $10 and three timing-out models taught me about building on promises*

---

> "At 179 seconds, Gemini was still thinking. That's when I understood."

I set two constraints: $10 and 24 hours to test Vercel's Ship 2025 features. 

The money wasn't the lesson. The timeouts were.

This is the story of building in the gap between platform promises and API reality. The code is public. The lessons are yours.

github.com/ramakay/vercelship25

---

## The First Failure

I started where any developer would. Asked three AI models to build a complete Next.js application.

```typescript
const prompt = `Build a complete Next.js 15 application with:
- User authentication system
- Dashboard with data visualization  
- API routes with validation
- Responsive UI with Tailwind
- Full TypeScript implementation`;
```

Then I watched them die.

Grok: Enthusiastic start. Dead at 28 seconds.
Claude: Steady progress. Flatlined at 64 seconds.  
Gemini: Still streaming at 179 seconds when Vercel's timeout killed it.

The logs told the story. Models trying to generate thousands of lines. Complete file structures. Entire codebases. My $10 budget evaporating in real-time.

> "Timeout isn't an error. It's information."

## The Pivot

After burning through dollars in failed attempts, I changed one line:

```typescript
const prompt = `Design a Next.js 15 app architecture. Provide:
1. HIGH-LEVEL PSEUDO CODE ONLY (no full implementations)
2. A Mermaid diagram showing the system architecture
3. Brief bullet points for each component`;
```

Everything changed.

Response times: 180+ seconds → under 80 seconds
Token usage: Down 85%
Success rate: 0% → 100%
Actual readability: Finally

The constraint forced clarity. Models stopped trying to be complete. Started trying to be useful.

## What Actually Shipped

Before I could test five features, I had to find five features.

**AI Gateway** ✅  
Beautiful. One line to switch between models. Unified streaming. Consistent errors.

```typescript
const gateway = createGateway({ apiKey: process.env.AI_GATEWAY_API_KEY });

// This is all it takes
const result = await streamText({
  model: gateway('anthropic/claude-4-opus'),
  prompt: userPrompt
});
```

**Queues** ❌  
"Limited beta." No API. No CLI. No documentation.
Workaround: localStorage and client-side state.

**Sandbox** ❌  
"Public beta." Listed everywhere. Works nowhere.
Workaround: Display code. Dream of execution.

**Microfrontends** ❌  
Not available. 
Future: Each AI gets its own runtime.

**BotID** ❌  
Invite only.
Status: Fictional.

Five announcements. One working API.

> "Beta now means 'we thought about it.'"

## Building With 20% Features

I could have stopped. Written a critique. Posted a complaint.

Instead, I built what I could with what worked.

An AI showdown where three models compete in real-time. The same prompt. Parallel execution. Streaming responses. Visual feedback. Automated judging.

Not because it's useful. Because it reveals patterns:

```typescript
// The patterns that matter
const responses = await Promise.allSettled(
  models.map(async (model) => {
    const startTime = Date.now();
    
    try {
      const result = streamText({
        model: gateway(model),
        prompt,
        experimental_transform: smoothStream({
          delayInMs: 20,
          chunking: 'word'
        }),
      });
      
      // Stream handling reveals model personality
      for await (const textPart of result.textStream) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          type: 'text-delta',
          model,
          textDelta: textPart
        })}\n\n`));
      }
      
    } catch (error) {
      // Every model fails differently
      return { model, error, duration: Date.now() - startTime };
    }
  })
);
```

Grok streams fast, hallucinates proudly.
Claude thinks deeply, writes carefully.
Gemini... well, Gemini thinks about thinking.

## The UI Problems That Teach

Judge panel invisible? Z-index warfare taught me about layer complexity.
Model cards overflowing? Fixed heights forced better design.
Responses unreadable? Monospace fonts and markdown parsing.
Users confused? Animations communicate state.

Each workaround became a feature:

```typescript
// Animations aren't decoration. They're information.
anime({
  targets: `#paper-plane-${modelId}`,
  translateX: [0, 100],
  translateY: [0, -50],
  opacity: [0, 1, 0],
  duration: 1000,
  easing: 'easeOutQuad'
});
```

Paper planes show data in flight.
Pulsing cards indicate processing.
Streaming text creates perceived speed.

> "Async operations need visual grammar."

## The Judge Problem

I needed a fourth AI to judge the first three. But OpenAI doesn't support web search through the gateway.

So I simulated it:

```typescript
controller.enqueue(encoder.encode(`data: ${JSON.stringify({
  type: 'judge-comment',
  comment: '🔍 Performing web search...\nSearching site:vercel.com for Ship 2025 features...'
})}\n\n`));

// Add realistic delay
await new Promise(resolve => setTimeout(resolve, 1500));

// Use cached knowledge
const searchInfo = `Based on available documentation:
- Vercel AI Gateway is in Open Beta
- Supports multiple AI models including Grok, Claude, and Gemini
- Active CPU billing is Generally Available
- Sandbox is in Public Beta
- Queues is in Limited Beta`;
```

Not elegant. But honest about limitations.

## What I Couldn't Build

The vision haunts me:

```typescript
// What I wanted to build
const aiSandboxes = await Promise.all([
  createSandbox({ model: 'grok', runtime: 'react' }),
  createSandbox({ model: 'claude', runtime: 'react' }),
  createSandbox({ model: 'gemini', runtime: 'react' })
]);

// Each AI builds actual components
const components = await Promise.all(
  aiSandboxes.map(sandbox => 
    sandbox.execute(generatedCode)
  )
);

// Judge evaluates running apps, not text
const evaluation = await judge.evaluate({
  criteria: ['functionality', 'performance', 'ui-quality'],
  artifacts: components.map(c => c.liveUrl)
});
```

Imagine: Each AI model gets its own sandbox. Generates actual React components. Runs them live. The judge evaluates working software, not promises.

"Who builds better software" instead of "who writes better prose."

That's the future. When Sandbox ships. If it ships.

## The Economics of Tokens

The $10 constraint revealed token economics:

```typescript
const PRICING = {
  'xai/grok-3': { input: 0.005, output: 0.015 },
  'anthropic/claude-4-opus': { input: 0.015, output: 0.075 },
  'google/gemini-2.5-pro': { input: 0.00125, output: 0.00375 }
};

// Every token costs
function calculateCost(model, promptTokens, completionTokens) {
  const pricing = PRICING[model];
  return (promptTokens / 1000) * pricing.input + 
         (completionTokens / 1000) * pricing.output;
}
```

Complete applications: $0.50-2.00 per generation
Pseudo code: $0.02-0.08 per generation
First timeout: $0.73 (for nothing)

> "Constraints reveal true costs."

## Platform Competition

While building workarounds, I researched alternatives.

**Cloudflare AI Gateway** ships with:
- Response caching (90% cost reduction)
- Automatic rate limiting
- Load balancing across providers
- Real-time analytics
- Fallback routing

Today. Not beta. Today.

**Invariant Labs** provides:
- Visual tracing for every LLM call
- Guardrails preventing harmful outputs
- Execution graphs showing agent behavior
- OpenTelemetry integration

Also today.

> "Features that ship beat features that might."

## Why This Matters

This isn't about Vercel. They identified every need correctly:
- Unified model access ✓
- Async job processing ✓
- Secure code execution ✓
- Modular deployment ✓

The vision is perfect. The execution is... shipping.

But that gap between vision and reality? That's where builders live.

Every workaround teaches. Every constraint clarifies. Every public repository pushes platforms forward.

## The Code as Proof

github.com/ramakay/vercelship25

Clone it. Run it. See three models compete. Watch costs accumulate. Understand why pseudo code wins.

The repository includes:
- Working AI Gateway integration (the 20% that shipped)
- localStorage replacing Queues
- Animations solving real UX problems
- Comments documenting every platform limitation
- The pivot that saved the project

Use my remaining budget. Fork the vision. Build what I couldn't.

## The Builder's Paradox

I started trying to test features.
I ended up testing the platform's readiness.

Started with complete applications.
Learned to value pseudo code.

Started angry about timeouts.
Learned they were teaching moments.

> "The best bug report is working code."

## The Pattern Across Platforms

This experiment revealed a truth about modern developer platforms:

Announce complete. Ship partial. Document never.

We've normalized this. Accepted "coming soon" as standard. Trained ourselves to build around absence.

But the best builders don't wait. They create with constraints.

Every public workaround is a feature request.
Every timeout is a data point.
Every pivot is progress.

## Looking Forward

When Sandbox ships, I'll build the real vision:
- Each model in its own runtime
- Generating actual applications
- Judge evaluating functionality, not philosophy
- "Who ships better" as the only metric

Until then, I have animations and pseudo code.

And sometimes, that's enough to prove a point.

## The Invitation

You have my code. My learnings. My remaining budget.

The timeout at 179 seconds wasn't a failure. It was the beginning of understanding.

What will you build in the space between announcement and API?

The frontier isn't where platforms promise it is.
It's where builders make it with what works.

---

*I'm a builder who believes in shipping. In public learning. In constraints as creativity.*

*The future belongs to those who build with the 20% that works, not those who wait for the 80% that might.*

*Your timeout is someone else's breakthrough.*