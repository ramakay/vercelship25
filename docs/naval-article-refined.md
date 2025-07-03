# Building in the Gap Between Promise and Product

*A $10 experiment in platform reality*

---

> "Ship implies it works. Ship implies deployment. Ship implies you can use it today."

I set a constraint: $10 to test Vercel's Ship 2025 features. Not because I'm cheap. Because constraints reveal truth.

What I discovered wasn't about the money. It was about the growing gap between what platforms announce and what builders can actually use.

The repository is public. The remaining budget is yours. This is what I learned in 24 hours.

github.com/ramakay/vercelship25

---

## The Promise

Vercel announced Ship 2025 with five features:

- AI Gateway for unified model access
- Queues for async processing
- Sandbox for code execution
- Micro-frontends for modular deployment
- BotID for bot detection

Each solves a real problem. The vision is correct. Developers need these primitives.

## The Reality

AI Gateway works. Beautifully. One line to switch between 100+ models. This actually shipped.

```javascript
import { streamText } from 'ai'

const result = streamText({
  model: 'xai/grok-3', // or claude, or gemini
  prompt: 'Build me something real'
})
```

Everything else? A masterclass in modern software announcement patterns.

Queues: "Limited beta." No API. No CLI. No access.  
Sandbox: "Public beta." No secure implementation path.  
Micro-frontends: Enterprise only. Limited to 3.  
BotID: Invite only. Effectively fictional.

> "Beta now means 'we thought about it.' Public beta means 'we have a landing page.'"

## What Others Ship

This isn't unique to Vercel. But it's instructive to see what others deliver today, not tomorrow.

**Cloudflare AI Gateway** ships with:
- Caching that reduces costs by 90%
- Rate limiting that works
- Load balancing across providers
- Automatic failover
- Real analytics

**Invariant Labs** ships with:
- Agent tracing for LLM behavior
- Guardrails that prevent harmful outputs
- Visual execution graphs
- OpenAI-compatible events

Today. Not coming soon. Not limited beta. Today.

> "The gap between announcement and availability is where builders live."

## Building Anyway

I could have written a complaint. Instead, I spent 24 hours building what I could with what worked.

The demo is deceptively simple: an AI showdown. Ask a question about React optimization. Watch three models compete in real-time. Grok, Claude, and Gemini each take their shot. Responses stream word by word. Costs accumulate penny by penny. Then an automated judge declares a winner.

It's not scientific. It's not rigorous benchmarking. But it reveals something benchmarks miss: the lived experience of multi-model orchestration. How models differ in speed, cost, and approach. How streaming affects perception. Why visual feedback matters for async operations.

All made possible by the one feature that actually shipped: the AI Gateway.

```typescript
// This is all it took to orchestrate three models
const models = [
  'x-ai/grok-3',
  'anthropic/claude-4-opus', 
  'google/gemini-2.5-pro'
];

// Parallel execution with individual error boundaries
const responses = await Promise.allSettled(
  models.map(model => 
    streamText({
      model,
      prompt: 'Optimize this React app for performance',
      max_tokens: 150
    })
  )
);

// That's it. Three models. One API. Real competition.
```

No API key juggling. No provider-specific SDKs. No authentication dance. Just specify the model string and go.

The animations weren't aesthetic choices. They solve a real problem: AI responses are inherently asynchronous. Users need feedback. Paper planes show data in flight. Pulsing cards indicate processing. Streaming text creates perceived speed.

These insights only come from building, not planning.

## The $10 Learning

That budget constraint forced architectural decisions:

- Stream responses to minimize token usage
- Extract first sentences for display efficiency  
- Implement client-side state for resilience
- Build graceful degradation for missing features

Every workaround teaches. Every constraint clarifies.

The real lesson: I discovered Vercel's AI Gateway genuinely reduces complexity. When it works, it's elegant. One line to switch models. Unified error handling. Consistent streaming.

But I also discovered localStorage replacing Queues. Animations replacing proper async feedback. Hope replacing documentation.

> "Constraints don't limit builders. They reveal platform limitations."

## Why Open Source

The repository exists for three reasons:

**Accountability.** Platforms should ship what they announce. Working code is gentle pressure.

**Education.** Others shouldn't repeat these workarounds. See what I tried. Understand why it failed. Build better.

**Progress.** Every public workaround pushes platforms forward. Cloudflare didn't build better features by accident. They built them because developers showed what was missing.

## The Agentic View

As an Agentic architect, I see patterns across platforms. The AI infrastructure race reveals a truth:

Platforms that ship features win developers.  
Platforms that ship promises train their competitors' customers.

This experiment extends my work on multi-model orchestration and consensus. In my previous exploration of Zen MCP, I showed how Claude could orchestrate other models - Gemini for architecture, O3 for reasoning, Flash for speed. Each contributing their strengths. Finding consensus through debate.

That work revealed the power of AI teams over AI assistants. This experiment reveals the infrastructure gap preventing those teams from forming at scale.

Vercel identified every pain point correctly. Unified model access matters. Async processing is essential. Code sandboxing enables new possibilities.

They just haven't built the solutions yet.

> "Vision without execution is hallucination. Even in tech."

## Finding Consensus Through Competition

My previous work on Zen MCP taught me that AI models work better in teams. Different perspectives. Competing analyses. Consensus through debate.

The same applies to platforms. Vercel's vision competing with Cloudflare's execution. Promises competing with products. Announcements competing with availability.

Competition creates clarity. For platforms and builders.

## The Path Forward

If you're building AI infrastructure:
- Ship when it works, not when marketed
- Beta should mean beta, not concept
- Enable builders with access, not announcements
- Study Cloudflare's execution model

If you're building applications:
- Don't wait for perfect platforms
- Build with available tools
- Share your workarounds publicly
- Vote with your code

> "The best critique of a platform is building on it anyway."

## The Repository as Proof

github.com/ramakay/vercelship25

Twenty-four hours of work. Three AI models orchestrated. Real-time streaming implemented. Cost tracking to $0.0001. Automated evaluation system. Visual feedback for async operations.

Built with 20% feature availability. Proving what's possible with constraints.

The code includes:
- Working AI Gateway integration
- Workarounds for missing Queues
- Animations solving real UX problems  
- Cost tracking that revealed token economics
- Comments explaining every platform limitation

Use my remaining budget. Run the experiment yourself. Fork it. Improve it. Show Vercel what you need.

## The Meta Pattern

This experiment revealed a larger truth about modern software development.

We've normalized incomplete releases. Accepted "coming soon" as standard. Trained ourselves to build around absent features.

But the best builders don't complain. They create.

Every workaround is feedback. Every public repository is a feature request written in code. Every constraint reveals what platforms should prioritize.

> "Working code moves ecosystems forward faster than feature requests."

## The Invitation

You have access to my code. My learnings. My remaining budget.

What will you build in the gap between promise and product?

The frontier isn't where platforms say it is. It's where builders make it.

Ship should mean it ships. Until then, we build anyway.

---

*I'm an Agentic architect. I build bridges between human intuition and AI capability. Between platform promises and developer needs. Between what's announced and what's possible.*

*The future belongs to those who build with constraints, not those who wait for features.*

*Your move.*