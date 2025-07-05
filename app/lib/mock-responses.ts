// Captured responses from actual API runs - used as fallback when credits run out
export const mockResponses = {
  'xai/grok-3': {
    text: `### 1. High-Level Pseudo Code

\`\`\`pseudo
// App Entry Point (Next.js 15 with App Router)
App()
  initialize VercelAIGateway
  define routes for /api/compare, /dashboard, /costs

// AI Gateway Integration
AIComparisonRoute()
  receive user input for comparison
  call VercelAIGateway.compareModels([Grok, Claude, Gemini])
  store responses in database
  trigger JudgeScoring()
  track costs via CostTracker()
  return results to frontend

// Judge Scoring System
JudgeScoring(responses)
  define scoring criteria (accuracy, relevance, speed)
  compute scores for each model response
  save scores to database

// Cost Tracking
CostTracker(apiCalls)
  monitor API usage per model
  calculate cost per call
  enforce limit if totalCost > $10
  log costs to database

// Dashboard
DashboardRoute()
  fetch comparison results, scores, and costs from database
  render data in charts and tables
  display model performance and cost breakdown
\`\`\`

### 2. Mermaid Diagram (System Architecture)

\`\`\`mermaid
graph TD
    A[User] -->|Input| B[Next.js App]
    B -->|API Request| C[Vercel AI Gateway]
    C -->|Compare| D[Grok]
    C -->|Compare| E[Claude]
    C -->|Compare| F[Gemini]
    C -->|Responses| G[Judge Scoring System]
    G -->|Scores| H[Database]
    C -->|Usage| I[Cost Tracker]
    I -->|Costs| H
    H -->|Data| J[Dashboard]
    J -->|Display| A
    I -->|Limit Check| K[Budget Alert: $10]
\`\`\`

### 3. Component Descriptions (Brief Bullet Points)

- **Next.js App (App Router)**
  - Core application using Next.js 15.
  - Handles routing for API, dashboard, and user input.
  - Integrates with Vercel AI Gateway.

- **Vercel AI Gateway**
  - Central hub for model comparison.
  - Sends requests to Grok, Claude, and Gemini.
  - Returns aggregated responses.

- **Judge Scoring System**
  - Evaluates model responses based on predefined criteria.
  - Stores scores in database for analysis.

- **Cost Tracker**
  - Tracks API call costs per model.
  - Enforces $10 budget limit with alerts.
  - Logs cost data for transparency.

- **Database**
  - Stores model responses, scores, and cost data.
  - Provides data for dashboard rendering.

- **Dashboard**
  - Visualizes comparison results, scores, and costs.
  - Uses charts/tables for user-friendly display.
  - Built with React components in Next.js.`,
    tokens: 575,
    cost: 0.009149999999999998
  },
  
  'anthropic/claude-4-opus': {
    text: `## System Architecture

\`\`\`mermaid
graph TB
    subgraph "Next.js 15 App"
        UI[Dashboard UI]
        API[API Routes]
        MW[Middleware]
    end
    
    subgraph "Vercel AI Gateway"
        GW[AI Gateway Router]
        GM[Grok Model]
        CM[Claude Model]
        GEM[Gemini Model]
    end
    
    subgraph "Data Layer"
        KV[Vercel KV Store]
        EDGE[Edge Config]
    end
    
    subgraph "Services"
        JUDGE[Judge Service]
        COST[Cost Tracker]
        METRICS[Metrics Aggregator]
    end
    
    UI --> API
    API --> MW
    MW --> GW
    GW --> GM
    GW --> CM
    GW --> GEM
    
    API --> JUDGE
    API --> COST
    API --> METRICS
    
    JUDGE --> KV
    COST --> KV
    METRICS --> KV
    
    MW --> EDGE
    COST --> EDGE
\`\`\`

## Component Breakdown

### **Frontend Components**
\`\`\`pseudo
// app/dashboard/page.tsx
- ModelComparisonCard
  - Display prompts, responses, scores
- CostTracker 
  - Real-time cost monitoring with $10 limit
- ResultsChart
  - Performance metrics visualization
- PromptInput
  - User prompt submission form
\`\`\`

### **API Routes**
\`\`\`pseudo
// app/api/compare/route.ts
POST /api/compare
  - Validate prompt
  - Check cost limit
  - Parallel call to 3 models via AI Gateway
  - Return responses + metadata

// app/api/judge/route.ts  
POST /api/judge
  - Receive model responses
  - Apply scoring criteria
  - Store results in KV
  - Return scores

// app/api/metrics/route.ts
GET /api/metrics
  - Aggregate historical data
  - Calculate win rates
  - Return dashboard data
\`\`\`

### **Middleware**
\`\`\`pseudo
// middleware.ts
- Rate limiting per user
- Cost threshold checking
- Request logging
- API key validation
\`\`\`

### **AI Gateway Configuration**
\`\`\`pseudo
// vercel.json
{
  "aiGateway": {
    "providers": [
      { "id": "grok", "model": "grok-beta", "maxTokens": 1000 },
      { "id": "claude", "model": "claude-3-sonnet", "maxTokens": 1000 },
      { "id": "gemini", "model": "gemini-pro", "maxTokens": 1000 }
    ],
    "costTracking": true,
    "logging": true
  }
}
\`\`\`

### **Judge Service**
\`\`\`pseudo
// lib/judge.ts
class JudgeService {
  scoreResponse(response, criteria) {
    // Evaluate: accuracy, speed, relevance, creativity
    // Return score 0-100
  }
  
  compareResponses(responses[]) {
    // Rank responses
    // Declare winner
    // Store in KV
  }
}
\`\`\`

### **Cost Tracker**
\`\`\`pseudo
// lib/cost-tracker.ts
class CostTracker {
  async checkBudget() {
    // Get current spend from KV
    // Return remaining budget
  }
  
  async recordCost(model, tokens) {
    // Calculate cost based on model pricing
    // Update KV
    // Alert if near $10 limit
  }
}
\`\`\`

### **Data Models**
\`\`\`pseudo
// types/index.ts
interface ComparisonResult {
  id: string
  prompt: string
  responses: ModelResponse[]
  scores: Score[]
  winner: string
  totalCost: number
  timestamp: Date
}

interface ModelResponse {
  model: 'grok' | 'claude' | 'gemini'
  content: string
  latency: number
  tokens: number
  cost: number
}
\`\`\`

### **Key Features**
- **Parallel Processing**: Send prompts to all 3 models simultaneously
- **Real-time Updates**: WebSocket/Server-Sent Events for live results
- **Cost Protection**: Automatic cutoff at $9.50 to prevent overruns
- **Caching**: Edge Config for model settings, KV for results
- **Analytics**: Track win rates, average scores, response times`,
    tokens: 1090,
    cost: 0.083625
  },
  
  'google/gemini-2.5-pro': {
    text: `Here is a concise design for a Next.js 15 app using Vercel's AI Gateway.

### 1. High-Level Pseudo Code

\`\`\`typescript
// /app/page.tsx (React Server Component)
// User-facing form to submit a prompt.
FUNCTION HomePage:
  RETURN (
    <form action={handlePromptSubmission}>
      <input name="prompt" />
      <button type="submit">Compare Models</button>
    </form>
  )
END FUNCTION

// /app/actions.ts (Server Action)
// Handles the core logic on the server.
"use server"

FUNCTION handlePromptSubmission(formData):
  // 1. Get user prompt
  prompt = formData.get("prompt")

  // 2. Call AI Gateway to get parallel responses
  // AI Gateway is configured to route 'grok', 'claude', 'gemini'
  grokResponse = ai.generate({ model: 'grok', prompt: prompt })
  claudeResponse = ai.generate({ model: 'claude', prompt: prompt })
  geminiResponse = ai.generate({ model: 'gemini', prompt: prompt })
  
  // 3. Await all responses
  [res1, res2, res3] = await Promise.all([grokResponse, claudeResponse, geminiResponse])

  // 4. Send responses to a "Judge" model for scoring
  judgePrompt = \`
    Prompt: "\${prompt}"
    Response A (Grok): "\${res1.text}"
    Response B (Claude): "\${res2.text}"
    Response C (Gemini): "\${res3.text}"
    Score each response from 1-10 on clarity and relevance. Return JSON:
    { "grok_score": score, "claude_score": score, "gemini_score": score }
  \`
  // Use a powerful model as the judge
  judgement = await ai.generate({ model: 'openai:gpt-4o', prompt: judgePrompt })
  scores = JSON.parse(judgement.text)

  // 5. Get cost data from AI Gateway response headers (or Vercel dashboard)
  totalCost = res1.cost + res2.cost + res3.cost + judgement.cost

  // 6. Save everything to the database
  db.query(\`
    INSERT INTO results (prompt, grok_response, claude_response, gemini_response, scores, cost)
    VALUES (...)
  \`)

  // 7. Redirect to the results dashboard
  redirect('/dashboard')
END FUNCTION

// /app/dashboard/page.tsx (React Server Component)
// Displays the results from the database.
ASYNC FUNCTION DashboardPage:
  // Fetch all results from the database
  results = await db.query("SELECT * FROM results ORDER BY created_at DESC")
  totalTrackedCost = await db.query("SELECT SUM(cost) FROM results")

  RETURN (
    // Display total cost (e.g., $0.57 / $10.00)
    // Display a table of results:
    // | Prompt | Grok (Score) | Claude (Score) | Gemini (Score) | Cost |
  )
END FUNCTION
\`\`\`

### 2. Mermaid Diagram: System Architecture

\`\`\`mermaid
graph TD
    subgraph "User's Browser"
        A[Next.js 15 App / RSC]
    end

    subgraph "Vercel Platform"
        B[Server Action: handlePromptSubmission]
        C[Vercel AI Gateway]
        D[Vercel Postgres DB]
        E[Results Dashboard / RSC]
    end

    subgraph "External AI Services"
        F[Grok]
        G[Claude]
        H[Gemini]
        I[Judge Model e.g., GPT-4o]
    end

    A -- User Submits Prompt --> B
    B -- 1. Fan-out API Calls --> C
    C -- Routes to --> F
    C -- Routes to --> G
    C -- Routes to --> H
    F -- Response --> C
    G -- Response --> C
    H -- Response --> C
    C -- 2. Aggregated Responses --> B
    B -- 3. Judge API Call --> C
    C -- Routes to --> I
    I -- Scores --> C
    C -- 4. Scores --> B
    B -- 5. Writes Results --> D
    E -- 6. Reads Results --> D
    A -- Navigates to --> E
\`\`\`

### 3. Component Bullet Points

*   **Next.js 15 App (RSC):** The user interface. Renders on the server for fast, interactive experiences. Contains the input form and the results dashboard.
*   **Server Action:** Securely executes server-side logic (calling AIs, writing to DB) without needing to build a separate API. Triggered by the form submission.
*   **Vercel AI Gateway:**
    *   A single entry point to manage multiple AI models.
    *   Provides automatic retries, fallbacks, and unified logging.
    *   **Crucially, tracks usage and cost for all connected models**, helping to stay under the $10 budget.
*   **AI Models (Grok, Claude, Gemini):** The "worker" models that generate responses to the user's prompt.
*   **Judge Model (e.g., GPT-4o):** A separate, powerful AI model tasked with objectively scoring the outputs of the other three models based on a defined rubric.
*   **Vercel Postgres DB:** A serverless SQL database to persistently store prompts, model responses, judge scores, and per-request costs.
*   **Results Dashboard (RSC):** A server-rendered page that reads directly from the database to display a comparison table and the total accumulated cost.`,
    tokens: 1298,
    cost: 0.0050012500000000005
  }
};

// Function to get mock response for a model
export function getMockResponse(model: string) {
  const mockData = mockResponses[model as keyof typeof mockResponses];
  if (!mockData) {
    return {
      text: `Mock response for ${model}. API credits exhausted.`,
      tokens: 100,
      cost: 0.001
    };
  }
  return mockData;
}

// Function to simulate streaming a mock response
export async function* streamMockResponse(model: string, chunkSize: number = 50) {
  const { text } = getMockResponse(model);
  const words = text.split(' ');
  
  for (let i = 0; i < words.length; i += chunkSize) {
    const chunk = words.slice(i, i + chunkSize).join(' ') + ' ';
    yield chunk;
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 20));
  }
}