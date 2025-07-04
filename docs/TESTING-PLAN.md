# Testing & Validation Plan for AI Triage System

## Overview
This document provides a comprehensive testing plan for validating the production-grade web search implementation using Playwright MCP tools. The system uses real AI models with no mocking or simulation.

## Current Implementation Status

### ✅ What's Working
1. **API Endpoint**: `/app/api/triage/route.ts`
   - Orchestrates calls to 3 AI models
   - Integrates web search evaluation
   - Saves benchmark results to `/benchmarks/`

2. **Model Orchestration**: `/app/services/ai-gateway.ts`
   - Models: `xai/grok-3`, `anthropic/claude-4-opus`, `google/gemini-2.5-pro`
   - Pricing includes `openai/gpt-4o-mini` for judge
   - 25-second timeout per model

3. **Web Search Evaluation**: `/app/bench/evaluate.ts`
   - Step 1: Gemini 2.5 Pro searches with `useSearchGrounding: true`
   - Step 2: GPT-4o-mini judges based on search results
   - Scoring: relevance, accuracy, reasoning, style, honesty

### ❌ What Needs Testing
- Automated validation using Playwright MCP
- Verification of real API responses
- Console log monitoring for web search
- Screenshot capture for article

## Server Setup Instructions

```bash
# 1. Kill any existing Next.js servers
lsof -ti:3000-3005 | xargs kill -9 2>/dev/null || true

# 2. Ensure environment variable is set
# File: .env.local
# AI_GATEWAY_API_KEY=XtRYxjcvF3GcTmdhunY0YZsA

# 3. Start fresh development server
npm run dev

# Server will start on first available port (usually 3000)
# Watch for: "✓ Ready in XXXms"
```

## Critical Code Paths

### API Flow
```
POST /api/triage
  └─> triageWithModels(prompt)
      ├─> callModel('xai/grok-3', prompt)
      ├─> callModel('anthropic/claude-4-opus', prompt)
      └─> callModel('google/gemini-2.5-pro', prompt)
  └─> benchmarkResponses(prompt, responses)
      └─> evaluateResponse(prompt, response, model) [for each]
          ├─> Step 1: Gemini search for current info
          └─> Step 2: GPT-4o-mini evaluation
  └─> Return ranked results
```

### Key Functions

1. **triageWithModels** (`/app/services/ai-gateway.ts:100`)
   - Calls all 3 models in parallel
   - Returns array of ModelResponse objects

2. **benchmarkResponses** (`/app/bench/evaluate.ts:157`)
   - Evaluates all responses using web search
   - Returns sorted EvaluationResult array

3. **evaluateResponse** (`/app/bench/evaluate.ts:31`)
   - Two-step process: search then judge
   - Returns EvalScore with all metrics

## Playwright MCP Testing Sequence

### Available MCP Tools
- `mcp__playwright__browser_navigate` - Open URLs
- `mcp__playwright__browser_snapshot` - Capture page structure
- `mcp__playwright__browser_click` - Interact with elements
- `mcp__playwright__browser_take_screenshot` - Save images
- `mcp__playwright__browser_console_messages` - Read console logs

### Test Steps

1. **Navigate to Application**
   ```
   Tool: mcp__playwright__browser_navigate
   URL: http://localhost:3000/showdown-anime
   ```

2. **Capture Initial State**
   ```
   Tool: mcp__playwright__browser_snapshot
   Purpose: Get element references for interaction
   ```

3. **Trigger Model Comparison**
   ```
   Tool: mcp__playwright__browser_click
   Element: "FIGHT!" button
   Ref: [from snapshot]
   ```

4. **Monitor Console Output**
   ```
   Tool: mcp__playwright__browser_console_messages
   Expected logs:
   - "=== CALLING AI MODELS ==="
   - "Step 1: Searching for current Vercel Ship 2025 feature information..."
   - "Search completed. Found current feature information."
   - "Step 2: Evaluating response with GPT-4o-mini..."
   - "Evaluation complete for [model]"
   ```

5. **Wait for Results**
   ```
   Wait for UI to show:
   - Model responses (not "Using simulated responses...")
   - Evaluation scores
   - Winner announcement
   ```

6. **Capture Final Screenshot**
   ```
   Tool: mcp__playwright__browser_take_screenshot
   Filename: showdown-results.png
   Purpose: Article asset
   ```

## Direct API Testing (Fallback)

If UI testing encounters issues, use direct API testing:

```javascript
// Test script approach
const testPrompt = 'Compare Vercel AI Gateway pricing and current feature availability.';

const response = await fetch('http://localhost:3000/api/triage', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ prompt: testPrompt })
});

const data = await response.json();

// Validate response structure
assert(data.responses.length === 3);
assert(data.evaluations.length === 3);
assert(data.summary.winner);
assert(data.summary.totalCost < 0.10); // Under $0.10
```

## Validation Checklist

### Server & Environment
- [ ] Port 3000-3005 cleared before starting
- [ ] Server running without errors
- [ ] AI_GATEWAY_API_KEY present in .env.local

### API Response Validation
- [ ] All 3 models return actual responses (no timeouts)
- [ ] Response text contains coherent content (not error messages)
- [ ] Latency recorded for each model
- [ ] Token counts present

### Web Search Validation
- [ ] Console shows "Searching for current Vercel Ship 2025 feature information..."
- [ ] Search completes without errors
- [ ] Judge evaluation references search results

### Scoring Validation
- [ ] Each model has scores for: relevance, accuracy, reasoning, style, honesty
- [ ] Total score calculated correctly
- [ ] Models ranked by final score
- [ ] Winner identified

### UI Validation (Showdown Anime)
- [ ] Models appear in fighting stance
- [ ] Animation plays during API call
- [ ] Results display with scores
- [ ] Winner announcement shows

## Debugging Guide

### Common Issues & Solutions

1. **Port Already in Use**
   ```bash
   # Find and kill process
   lsof -i :3000
   kill -9 [PID]
   ```

2. **API Key Issues**
   - Check `.env.local` exists
   - Verify key format (no quotes needed)
   - Ensure key has access to all models

3. **Model Timeouts**
   - Normal for complex prompts (up to 25s)
   - Check if specific model consistently fails
   - Simplify prompt if all timeout

4. **No Web Search Logs**
   - Verify `evaluateResponse` is called
   - Check Gemini model access
   - Look for error messages in console

## Expected Console Output

Success looks like:
```
=== CALLING AI MODELS ===
Prompt: Compare Vercel AI Gateway pricing...
Calling xai/grok-3...
Calling anthropic/claude-4-opus...
Calling google/gemini-2.5-pro...

xai/grok-3 responded: {
  latency: '3421ms',
  tokens: '95 in / 342 out',
  cost: '$0.005605',
  responsePreview: 'Vercel AI Gateway provides a unified...'
}

Starting real evaluation with web search...

=== EVALUATING xai/grok-3 with Web Search ===
Step 1: Searching for current Vercel Ship 2025 feature information...
Search completed. Found current feature information.
Step 2: Evaluating response with GPT-4o-mini...
Evaluation complete for xai/grok-3: {
  accuracy: 8,
  relevance: 9,
  explanation: 'Based on search results, the pricing information...'
}

Evaluation complete. Winner: anthropic/claude-4-opus
```

## Production Quality Standards

Remember:
- NO mock data or simulation
- Real API calls only
- Fix root causes, not symptoms
- Use Playwright MCP tools exclusively
- Document all findings

## Next Steps

1. Run server with port cleanup
2. Execute Playwright MCP test sequence
3. Capture screenshots for article
4. Save benchmark results
5. Document any issues found

This plan ensures comprehensive testing of the production-grade web search implementation.