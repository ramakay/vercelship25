# I Spent $18 Testing Vercel's Bleeding Edge Features

*The dream was irresistible. The reality taught different lessons.*

**Try it yourself**: https://vercelship25.vercel.app/  
**Source code**: https://github.com/ramakay/vercelship25

---

## The Hook

Following my [consensus article](https://www.linkedin.com/feed/update/urn:li:activity:7343306764064284672/) about AI teams finally working together, I imagined the perfect orchestration. 

Three models building in harmony. Queue managing their workflows. Memos passing context. Microfrontends giving each AI its own sandbox.

CodeSandbox on steroids. Models not just talking but building together.

The final test made me giddy: These AIs would collaborate to build the consensus product itself. 

Mind blown. 🤯

## What I Actually Built

Before I tell you what went wrong, let me show you what works:

**The AI Showdown Arena** - Three models compete in real-time:
- Same prompt, parallel execution
- Live streaming responses with visual feedback
- Automated judge evaluation (GPT-4o-mini)
- Real-time cost tracking against $10 budget
- Beautiful animations showing data in flight

Watch Grok, Claude, and Gemini race to design a Next.js architecture. See their different approaches. Understand their token economics. All in one interface.

```typescript
// The prompt that saved the project
const prompt = `Design a Next.js 15 app architecture. Provide:
1. HIGH-LEVEL PSEUDO CODE ONLY (no full implementations)
2. A Mermaid diagram showing the system architecture
3. Brief bullet points for each component`;
```

This isn't just a demo. It's a lens into how AI models think differently when given the same constraints.

## The Dream

I'd release it all. Public source. Visual proof that AI teams could create, not just critique.

The vision was clear:

```typescript
// The orchestration symphony I imagined
const consensus = await Queue.orchestrate([
  { model: 'grok', task: 'generate-ui-components' },
  { model: 'claude', task: 'review-and-refine' },
  { model: 'gemini', task: 'optimize-performance' }
]);

// Each model with its own sandbox
const sandboxes = await Promise.all(
  models.map(m => Microfrontend.create({
    model: m,
    runtime: 'isolated',
    memory: new Memo({ context: shared })
  }))
);

// Real consensus through actual building
const result = await consensus.build({
  target: 'production-app',
  judge: 'gpt-4o'
});
```

An MCP that did quick checks with all three models. Expensive? Yes. Revolutionary? Absolutely.

## The Reality Check

Then I hit Ship 2025's reality.

**Feature Availability:**
- ✅ AI Gateway: Ships beautifully
- ❌ Queues: "Limited beta." No access.
- ❌ Sandbox: "Public beta." Community link expired.
- ❌ Microfrontends: Not available.
- ❌ Memos: Doesn't exist.
- ❌ BotID: Invite only.

Five features announced. One actually shipped.

> "Beta now means 'we thought about it.'"

## The Timeout Discovery

But AI Gateway delivered. Model switching became trivial. One line to orchestrate three minds.

Until they all timed out at 180 seconds.

My first attempt asked them to build complete applications:

```typescript
const prompt = `Build a complete Next.js 15 application with:
- User authentication system
- Dashboard with data visualization  
- API routes with validation
- Responsive UI with Tailwind
- Full TypeScript implementation`;
```

The massacre:
- Grok: Enthusiastic start. Dead at 28 seconds.
- Claude: Steady progress. Flatlined at 64 seconds.
- Gemini: Still streaming at 179 seconds when Vercel pulled the plug.

Cost of failure: $0.73 for incomplete responses.

> "At 179 seconds, Gemini was still thinking. That's when I understood."

## The Pivot

The constraint forced clarity. Instead of complete applications, I asked for architecture.

Results:
- Response times: 180+ seconds → under 80 seconds
- Token usage: Down 85%
- Success rate: 0% → 100%
- Actual usefulness: Finally

Even Claude Code, my reliable architect, didn't know about features announced four weeks ago. Cut off from the very platform it was supposed to build on.

## The Architecture That Emerged

Faced with platform limitations, I built a hybrid system:

```typescript
// Main models through the gateway
const responses = await Promise.all([
  streamText({ model: gateway('xai/grok-3'), prompt }),
  streamText({ model: gateway('anthropic/claude-4-opus'), prompt }),
  streamText({ model: gateway('google/gemini-2.5-pro'), prompt })
]);

// Judge needs direct API for web search (gateway doesn't support tools)
const judge = await generateText({
  model: openai.responses('gpt-4o-mini'),
  tools: { web_search_preview: openai.tools.webSearchPreview({}) },
  prompt: judgePrompt
});
```

The twist? Even with web search tools, the judge found 0 sources. The preview feature has its own previews.

## Why Vercel AI Gateway Anyway?

Given these limitations, why not use OpenRouter, Cloudflare, Requesty, or Invariant Labs instead?

**The Landscape:**
- **OpenRouter**: 200+ models, but you handle your own deployment
- **Cloudflare AI Gateway**: Great caching, but separate from your app infrastructure  
- **Requesty**: Full tool support, but another service to manage
- **Invariant Labs**: Sophisticated guardrails (PII detection, data flow control) that Vercel completely lacks

**The Vercel Advantage:**
```typescript
// One-line model switching in your existing Vercel app
const response = await streamText({
  model: gateway('anthropic/claude-4-opus'),
  prompt: userInput
});
```

Zero config. Zero new services. It just works with your Vercel deployment.

**The Security Trade-off:**
While Invariant Labs offers contextual security:
```python
# Prevent sensitive data leaks
raise "PII leak detected" if:
    (call: ToolCall) -> (msg: Message)
    call is tool:get_user_data
    any(pii_detected(msg.content))
```

Vercel offers... nothing. You implement your own guardrails.

**My Choice:**
For this $10 experiment focused on performance and economics, Vercel's seamless integration won. For production systems handling sensitive data? I'd layer in Invariant Labs' guardrails or build custom security rules.

The beauty of constraints: They force clarity about what matters most.

## What I Learned Building This

**1. Animations aren't decoration. They're information.**

```typescript
anime({
  targets: `#paper-plane-${modelId}`,
  translateX: [0, 100],
  translateY: [0, -50],
  opacity: [0, 1, 0],
  duration: 1000,
  easing: 'easeOutQuad'
});
```

Paper planes show data in flight. Pulsing cards indicate processing. Users understand async operations through motion.

**2. Each model has a personality:**
- Grok: Streams fast, explains confidently, occasionally hallucinates
- Claude: Thoughtful structure, comprehensive coverage, verbose
- Gemini: Practical examples, clear organization, loves databases

**3. Token economics matter:**

```typescript
const PRICING = {
  'xai/grok-3': { input: 0.005, output: 0.015 },
  'anthropic/claude-4-opus': { input: 0.015, output: 0.075 },
  'google/gemini-2.5-pro': { input: 0.00125, output: 0.00375 }
};
```

My $18 budget revealed the true cost of AI conversations:
- Complete applications: $0.50-2.00 per generation
- Architecture diagrams: $0.02-0.08 per generation
- Failed timeouts: Money burned for nothing

## The Beautiful Middle Ground

So I built what I could with what worked.

A beautiful UI where three models compete respectfully. Real-time consensus forming. A judge deliberating the best choice. Animations showing async collaboration. Every timeout teaching patience.

The result? A live demonstration that:
- AI teams can work together (just not with all the features promised)
- Constraints drive better solutions
- Visual feedback solves async UX problems
- Public code pushes platforms forward

## Try It Yourself

**Live Demo**: https://vercelship25.vercel.app/  
**Source Code**: https://github.com/ramakay/vercelship25

The repository includes:
- Working AI Gateway integration
- Hybrid architecture documentation
- Cost tracking implementation
- Animation system for async ops
- Every workaround that made it possible

Clone it. Fork it. Improve it. My remaining budget is yours to experiment with.

## The Consensus Achievement

Consensus in a zen-like environment is possible.

It's just not complete nirvana.

Not when models time out mid-thought.  
Not when features exist only in keynotes.  
Not when the orchestra has instruments but no stage.

But here's what we proved:
- Three models can evaluate the same problem differently
- A judge can provide fair assessment (even without web search)
- Beautiful UI can make async operations understandable
- $18 can teach more than $1,800 in training

## The Invitation

I spent $18 to learn that AI teams can work together.

They just can't work together with all of Vercel's promised features. Yet.

But in that gap between promise and delivery, between announcement and API, that's where builders live. That's where innovation happens.

Your timeout is someone else's breakthrough.  
Your missing feature is someone else's architecture lesson.

What will you build in the space between the dream and the reality?

---

*The future belongs to those who ship with the 20% that works, not those who wait for the 80% that might.*

*Every public workaround is a feature request. Every constraint is a teacher. Every timeout is information.*

**Join the experiment**: https://vercelship25.vercel.app/  
**Fork the future**: https://github.com/ramakay/vercelship25