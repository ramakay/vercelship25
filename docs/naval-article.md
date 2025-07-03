# Why I Open-Sourced a $10 Experiment

## Or: What "Ship" Really Means in 2025

### The Paradox of Shipping

Ship is a sacred word in tech. It implies completion. It implies usability. It implies that something moves from imagination to reality.

Vercel called their 2025 feature set "Ship."

Five features. One worked.

This is the story of why that matters.

### The $10 Constraint

Constraints reveal truth.

With unlimited budget, you can hide poor architecture behind compute power. With $10, every decision matters.

I set out to test Vercel's Ship 2025 features with a simple constraint: spend no more than $10.

What I discovered wasn't about the money.

### What Ship Promised

1. **AI Gateway**: Unified access to 100+ models
2. **Queues**: Asynchronous job processing  
3. **Sandbox**: Secure code execution
4. **Micro-frontends**: Modular deployment
5. **BotID**: Bot detection with Kasada

Five infrastructure primitives. Each solving a real problem.

### What Ship Delivered

**AI Gateway**: Beautiful. One line to switch between Grok, Claude, and Gemini. This works.

**Queues**: "Limited beta." No API. No CLI. No access.

**Sandbox**: "Public beta." No documentation sufficient for secure implementation.

**Micro-frontends**: Enterprise only. Limited to 3. Not accessible.

**BotID**: Invite only. Might as well not exist.

### The Meta Lesson

This isn't a critique of Vercel. This is about what "Ship" means in modern software.

We've normalized announcing features that don't exist. Beta now means "we thought about it." Public beta means "we have a landing page."

Meanwhile, builders need to build.

### What Others Ship

**Cloudflare AI Gateway** ships with:
- Caching (reduce costs by 90%)
- Rate limiting (protect from abuse)
- Load balancing (distribute across providers)
- Request retry and fallback (resilience by default)
- Analytics and logging (understand usage)

Today. Not coming soon.

**Invariant Labs** ships with:
- Agent tracing (understand LLM behavior)
- Guardrails (prevent harmful outputs)
- Event-based monitoring (OpenAI-compatible)
- Visual execution graphs (debug complex flows)

Today. Not limited beta.

### Why This Repository Exists

I could have written a complaint. Instead, I built something.

24 hours. Three AI models. Real-time streaming. Cost tracking. Automated evaluation. Visual feedback that solves real UX problems.

With the 20% of features that actually worked.

Then I open-sourced it.

### The Teaching Function of Code

Code teaches in ways documentation cannot.

When you see the workarounds, you understand the platform limitations.
When you see the animations, you understand async UX challenges.
When you see the cost tracking, you understand token economics.

Every line of code is a lesson learned from constraint.

### The Async Animation Insight

Here's something we discovered: AI responses are inherently asynchronous. Users hate waiting without feedback.

We added animations not for beauty, but for function:
- Paper planes deliver responses (shows data in flight)
- Cards pulse while streaming (indicates active processing)
- Text streams word by word (creates perceived speed)
- Winners celebrate with confetti (provides closure)

The animations solve a UX problem that emerges from distributed AI systems.

This insight only came from building, not planning.

### Why Vercel Still Matters

Vercel got the vision right.

Developers need:
- Unified AI model access (fragmentation is killing productivity)
- Queue systems (async is the only way to scale AI)
- Sandboxes (eval and execute generated code safely)
- Edge computing (latency matters for AI interactions)

They identified every pain point correctly.

They just haven't shipped the solutions.

### The Platform Provider Dilemma

Platform providers face an impossible choice:

**Ship early**: Users complain about incomplete features
**Ship late**: Competitors eat your market

Vercel chose to announce early. This creates expectation debt.

Every "coming soon" is a promise. Every "limited beta" is a wall between builders and building.

### What We Actually Need

**For AI Gateways**:
- Provider failover (OpenAI down? Switch to Claude)
- Smart routing (send code to Grok, writing to Claude)
- Cost optimization (cache common queries)
- Usage prediction (alert before budget exceeded)

**For Developer Experience**:
- Features that exist when announced
- Betas that are actually accessible  
- Documentation written for builders
- Clear migration paths from competitors

### The $10 Learning

That $10 taught me more than $10,000 in cloud credits would have.

It forced architectural decisions:
- Stream responses to minimize tokens
- Extract first sentences for display
- Implement client-side state management
- Build resilient error boundaries

Constraints create clarity.

### Why Open Source

I made this repository public for three reasons:

1. **Accountability**: Platforms should ship what they announce
2. **Education**: Others shouldn't repeat our workarounds
3. **Progress**: Working code moves ecosystems forward

The best critique is a better alternative.

### The Call to Action

If you're building AI infrastructure:
- Ship when it works, not when marketed
- Beta should mean beta, not concept
- Enable builders with access, not announcements
- Learn from Cloudflare's execution

If you're building applications:
- Don't wait for perfect platforms
- Build with available tools
- Share your workarounds
- Push providers forward with code

### The Future

2025 will be the year of AI infrastructure.

The providers who ship working primitives will win.
The providers who ship promises will educate their competitors' customers.

Vercel has the right vision. They understand the problems.

Now they need to Ship. Actually ship.

### The Repository

github.com/ramakay/vercelship25

See the code. Understand the constraints. Learn from the workarounds.

Build anyway.

---

*The future is built by those who build with what exists, not what's promised.*

*Ship should mean it ships.*