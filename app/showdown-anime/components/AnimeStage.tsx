'use client';

import { useEffect, useRef, useState } from 'react';
import ModelCard from './ModelCard';
import PaperPlane from './PaperPlane';
import JudgePanel from './JudgePanel';
import UseCasePanel from './UseCasePanel';
import ConclusionsCard from './ConclusionsCard';
import { getAnime } from '../lib/anime-wrapper';

interface AnimeStageProps {
  isActive: boolean;
  onLaunchCards?: () => void;
}

interface ModelData {
  id: string;
  name: string;
  response: string;
  cost: number;
  tokens: number;
  status: 'waiting' | 'arriving' | 'active' | 'complete' | 'judged';
}

export default function AnimeStage({ isActive, onLaunchCards }: AnimeStageProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const timelineRef = useRef<any>(null);
  const [activeModel, setActiveModel] = useState<string | null>(null);
  const [totalCost, setTotalCost] = useState(0);
  const [judgeComment, setJudgeComment] = useState('');
  const [showJudge, setShowJudge] = useState(false);
  const [showUseCase, setShowUseCase] = useState(true);
  const [showConclusions, setShowConclusions] = useState(false);
  const [evaluations, setEvaluations] = useState<any[]>([]);
  
  const [models, setModels] = useState<ModelData[]>([
    { id: 'grok', name: 'Grok', response: '', cost: 0, tokens: 0, status: 'waiting' },
    { id: 'claude', name: 'Claude', response: '', cost: 0, tokens: 0, status: 'waiting' },
    { id: 'gemini', name: 'Gemini', response: '', cost: 0, tokens: 0, status: 'waiting' }
  ]);

  useEffect(() => {
    // Load anime.js
    getAnime().then((anime) => {
      if (!anime) {
        console.error('anime.js could not be loaded');
        return;
      }
      
      if (isActive) {
        startAnimation(anime);
      } else {
        resetAnimation(anime);
      }
    });
    
    return () => {
      const timeline = timelineRef.current;
      if (timeline && timeline.pause) {
        timeline.pause();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const startAnimation = (anime: any) => {
    // First fade out the use case panel
    anime({
      targets: '.use-case-panel',
      opacity: [1, 0],
      scale: [1, 0.95],
      easing: 'easeOutExpo',
      duration: 600,
      complete: () => {
        setShowUseCase(false);
      }
    });
    
    // Show judge panel early
    setShowJudge(true);
    setJudgeComment('Awaiting AI responses...');
    
    // Elevate cards with shadow and slight scale
    anime({
      targets: '.model-card',
      opacity: [0, 1],
      translateY: [100, -20],
      scale: [0.9, 1.02],
      delay: anime.stagger(100, {start: 300}),
      easing: 'easeOutElastic(1, .6)',
      duration: 1200,
      complete: () => {
        // Add shadow effect to cards
        document.querySelectorAll('.model-card').forEach(card => {
          (card as HTMLElement).style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
        });
        // Start the streaming responses after cards are visible
        setTimeout(() => startStreamingResponses(), 500);
      }
    });
    
    // Elevate judge panel even more
    anime({
      targets: '.judge-panel',
      translateY: [50, -40],
      scale: [0.95, 1.05],
      delay: 400,
      easing: 'easeOutElastic(1, .6)',
      duration: 1200,
      complete: () => {
        const judgePanel = document.querySelector('.judge-panel') as HTMLElement;
        if (judgePanel) {
          judgePanel.style.boxShadow = '0 30px 60px rgba(0,0,0,0.2)';
        }
      }
    });
  };

  const startStreamingResponses = async () => {
    setJudgeComment('Contacting AI models...');
    
    // Use mock data for testing (never on root route)
    const isRootRoute = window.location.pathname === '/';
    const USE_MOCK = false && !isRootRoute; // Never use mock on root route
    
    if (USE_MOCK) {
      console.log('Using mock data for demo');
      startMockStreamingResponses();
      return;
    }
    
    let response: Response | undefined;
    
    try {
      // Call the real API with timeout
      const controller = new AbortController();
      // Use longer timeout on root route to ensure live data
      const isRootRoute = window.location.pathname === '/';
      const timeoutDuration = isRootRoute ? 150000 : 30000; // 150s for root, 30s for others
      const timeoutId = setTimeout(() => controller.abort(), timeoutDuration);
      
      response = await fetch('/api/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: `Design a Next.js 15 app using Vercel's AI Gateway to compare 3 AI models (Grok, Claude, Gemini) with a $10 budget. Include:

1. AI Gateway integration to call all 3 models in parallel
2. A judge component that scores responses on relevance, reasoning, and style
3. Cost tracking to stay under $10 total
4. Results dashboard showing model rankings and costs

Use Vercel's latest features: AI Gateway (Beta), Active CPU billing, and optionally Sandbox/Queues if available.`
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error('API call failed');
      }

      const data = await response.json();
      
      // Check if we have valid response data
      if (!data.responses || !Array.isArray(data.responses) || data.responses.length === 0) {
        throw new Error('Invalid response format');
      }
      
      // Process each model's response with staggered animations
      const modelMapping: Record<string, string> = {
        'xai/grok-3': 'grok',
        'anthropic/claude-4-opus': 'claude',
        'google/gemini-2.5-pro': 'gemini'
      };

      data.responses.forEach((modelResponse: any, index: number) => {
        const modelId = modelMapping[modelResponse.model] || modelResponse.model.split('/')[1];
        
        setTimeout(() => {
          setActiveModel(modelId);
          updateModelStatus(modelId, 'active');
          setJudgeComment(`${modelId.charAt(0).toUpperCase() + modelId.slice(1)} is responding...`);
          
          // Show paper plane arriving at card
          showPaperPlaneAnimation(modelId);
          
          // Stream the real response
          streamRealResponse(modelId, modelResponse);
        }, (index + 1) * 800);
      });

      // Store evaluations and winner info
      if (data.evaluations && data.evaluations.length > 0) {
        setEvaluations(data.evaluations);
        // Store winner for announceWinner function
        (window as any).__winner = modelMapping[data.evaluations[0].model] || 'claude';
      }

    } catch (error) {
      console.error('Failed to fetch from API:', error);
      
      // Detailed error logging
      if (error instanceof Error) {
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        if (error.message.includes('abort')) {
          setJudgeComment('Request timed out. Switching to demo mode...');
        } else {
          setJudgeComment(`API Error: ${error.message}`);
        }
      } else {
        setJudgeComment('Unknown error occurred');
      }
      
      // Check if it's likely an API key issue
      if (response && response.status === 500) {
        console.error('Server error - likely missing AI_GATEWAY_API_KEY environment variable');
        setJudgeComment('Server configuration error. Please check API settings.');
      }
      
      // Only fall back to mock data on non-root routes
      const isRootRoute = window.location.pathname === '/';
      if (!isRootRoute) {
        console.log('API failed, falling back to mock data for demonstration');
        setJudgeComment('Using simulated responses for demonstration...');
        setTimeout(() => startMockStreamingResponses(), 1000);
      } else {
        // On root route, show error but don't fall back to mock
        console.log('API failed on root route - not falling back to mock data');
        setJudgeComment('Error: Unable to fetch live data. Please check server logs.');
      }
    }
  };

  const streamRealResponse = (modelId: string, modelResponse: any) => {
    // Update judge comment
    setJudgeComment(`${modelId.charAt(0).toUpperCase() + modelId.slice(1)} is presenting their solution...`);
    
    // First animate the response area to show it's active
    getAnime().then((anime) => {
      if (!anime) return;
      
      // Animate the response background
      anime({
        targets: `#card-${modelId} .bg-gray-50`,
        backgroundColor: ['#f9fafb', '#e5e7eb', '#f9fafb'],
        duration: 1000,
        easing: 'easeInOutQuad'
      });
      
      // Show the response text with typewriter effect
      anime({
        targets: `#card-${modelId} .response-text`,
        opacity: [0, 1],
        duration: 300,
        easing: 'easeOutQuad'
      });
    });
    
    // Extract first meaningful sentence or summary
    const fullText = modelResponse.text || '';
    let displayText: string;
    
    // Check if it's an error message
    if (fullText.startsWith('Error:')) {
      // Show full error message
      displayText = fullText.length > 120 
        ? fullText.substring(0, 117) + '...' 
        : fullText;
    } else {
      // For normal responses, show more content
      const sentences = fullText.split(/[.!?]/).filter((s: string) => s.trim());
      const firstTwoSentences = sentences.slice(0, 2).join('. ') + (sentences.length > 0 ? '.' : '');
      displayText = firstTwoSentences.length > 200 
        ? firstTwoSentences.substring(0, 197) + '...' 
        : firstTwoSentences;
    }
    
    // Animate text appearance with streaming effect
    let progress = 0;
    const words = displayText.split(' ');
    const interval = setInterval(() => {
      progress += 0.1;  // Doubled speed
      if (progress >= 1) {
        clearInterval(interval);
        updateModelStatus(modelId, 'complete');
        
        // Update with final values
        setModels(prev => prev.map(m => 
          m.id === modelId ? {
            ...m,
            response: displayText,
            cost: modelResponse.cost,
            tokens: modelResponse.completionTokens,
            status: 'complete' as const
          } : m
        ));
        
        // Add to total cost once
        setTotalCost(prev => prev + modelResponse.cost);
        
        // Check if all models are complete
        checkAllComplete();
      } else {
        const wordsToShow = Math.floor(words.length * progress);
        const currentText = words.slice(0, wordsToShow).join(' ');
        
        setModels(prev => prev.map(m => 
          m.id === modelId ? {
            ...m,
            response: currentText,
            cost: modelResponse.cost * progress,
            tokens: Math.floor(modelResponse.completionTokens * progress)
          } : m
        ));
      }
    }, 100);
  };

  const checkAllComplete = () => {
    setModels(prev => {
      const allComplete = prev.every(m => m.status === 'complete');
      
      if (allComplete && !prev.some(m => m.status === 'judged')) {
        setTimeout(() => {
          setJudgeComment('All models have responded. Final verdict ready!');
          prev.forEach(m => updateModelStatus(m.id, 'judged'));
          // Announce winner after a brief pause
          setTimeout(() => announceWinner(), 1500);
        }, 1000);
      }
      
      return prev;
    });
  };

  const startMockStreamingResponses = () => {
    // Set mock evaluations with proper scoring
    const mockEvaluations = [
      {
        model: 'anthropic/claude-4-opus',
        response: 'Claude response...',
        scores: {
          relevance: 9,
          reasoning: 5,
          style: 5,
          accuracy: 8,
          honesty: 4,
          totalScore: 48, // (9×2) + (8×2) + 5 + 5 + 4 = 48
          soundnessScore: 10
        },
        latency: 1200,
        cost: 0.0292
      },
      {
        model: 'google/gemini-2.5-pro',
        response: 'Gemini response...',
        scores: {
          relevance: 8,
          reasoning: 5,
          style: 4,
          accuracy: 7,
          honesty: 3,
          totalScore: 42, // (8×2) + (7×2) + 5 + 4 + 3 = 42
          soundnessScore: 9
        },
        latency: 800,
        cost: 0.0015
      },
      {
        model: 'xai/grok-3',
        response: 'Grok response...',
        scores: {
          relevance: 7,
          reasoning: 4,
          style: 4,
          accuracy: 6,
          honesty: 2,
          totalScore: 36, // (7×2) + (6×2) + 4 + 4 + 2 = 36
          soundnessScore: 8
        },
        latency: 600,
        cost: 0.0037
      }
    ];
    
    // Sort by total score to determine winner
    const sortedEvaluations = [...mockEvaluations].sort((a, b) => b.scores.totalScore - a.scores.totalScore);
    setEvaluations(sortedEvaluations);
    
    // Set winner based on highest score (Claude in this case)
    const winnerModel = sortedEvaluations[0].model;
    const winnerId = winnerModel.includes('claude') ? 'claude' : 
                     winnerModel.includes('gemini') ? 'gemini' : 'grok';
    (window as any).__winner = winnerId;
    
    // Start responses quickly for smoother demo
    const delays = {
      grok: 300,    // Grok responds first
      claude: 800,  // Claude follows shortly after
      gemini: 1300  // Gemini takes a bit longer
    };

    Object.entries(delays).forEach(([modelId, delay]) => {
      setTimeout(() => {
        setActiveModel(modelId);
        updateModelStatus(modelId, 'active');
        setJudgeComment(`${modelId.charAt(0).toUpperCase() + modelId.slice(1)} is responding...`);
        
        // Show paper plane arriving at card
        showPaperPlaneAnimation(modelId);
        
        // Start streaming the response text
        simulateResponse(modelId);
      }, delay);
    });
  };

  const announceWinner = () => {
    const winner = (window as any).__winner || 'claude';
    const winnerName = winner.charAt(0).toUpperCase() + winner.slice(1);
    setJudgeComment(`🎉 ${winnerName} wins with the best implementation strategy!`);
    
    getAnime().then((anime) => {
      if (!anime) return;
      
      // Check if any modal is open
      const modalOpen = document.querySelector('.fixed.inset-0.bg-black.bg-opacity-50');
      
      // If modal is open, only show confetti and conclusions, skip card animations
      if (modalOpen) {
        // Create confetti effect without disturbing the modal
        createConfetti();
        
        // Show conclusions after delay
        setTimeout(() => {
          setShowConclusions(true);
        }, 7000);
        return;
      }
      
      // Otherwise, proceed with full animations
      // Determine losing cards
      const allCards = ['grok', 'claude', 'gemini'];
      const losingCards = allCards.filter(card => card !== winner);
      
      // Fade out losing cards
      anime({
        targets: losingCards.map(card => `#card-${card}`),
        opacity: [1, 0.3],
        scale: [1.02, 0.95],
        translateY: ['-20', '20'],
        filter: ['blur(0px)', 'blur(2px)'],
        easing: 'easeOutExpo',
        duration: 1000
      });
      
      // Elevate winner card
      anime({
        targets: `#card-${winner}`,
        translateY: ['-20', '-60'],
        scale: [1.02, 1.1],
        easing: 'easeOutElastic(1, .6)',
        duration: 1200
      });
      
      // Create confetti effect with multiple elements
      createConfetti();
      
      // Show conclusions after 7 seconds from winner announcement
      setTimeout(() => {
        setShowConclusions(true);
      }, 7000);
    });
  };
  
  const createConfetti = () => {
    const confettiContainer = document.createElement('div');
    confettiContainer.className = 'confetti-container';
    confettiContainer.style.cssText = 'position: fixed; inset: 0; pointer-events: none; z-index: 190;';
    document.body.appendChild(confettiContainer);
    
    // Create confetti pieces
    const colors = ['#FF5782', '#9100DB', '#00FFD7', '#FFD700', '#FF6B6B'];
    const confettiCount = 50;
    
    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      confetti.style.cssText = `
        position: absolute;
        width: 10px;
        height: 10px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        left: 50%;
        top: 40%;
        transform: translate(-50%, -50%);
      `;
      confettiContainer.appendChild(confetti);
    }
    
    getAnime().then((anime) => {
      if (!anime) return;
      
      anime({
        targets: '.confetti-container div',
        translateX: () => anime.random(-500, 500),
        translateY: () => anime.random(-300, 300),
        rotate: () => anime.random(0, 360),
        scale: [0, 1, 0],
        opacity: [1, 1, 0],
        easing: 'easeOutExpo',
        duration: 2000,
        delay: anime.stagger(20),
        complete: () => {
          confettiContainer.remove();
        }
      });
    });
  };

  const showPaperPlaneAnimation = (modelId: string) => {
    getAnime().then((anime) => {
      if (!anime) return;
      
      const planeId = `#plane-${modelId}`;
      const cardId = `#card-${modelId}`;
      
      // Get card position for target
      const cardEl = document.querySelector(cardId);
      if (!cardEl) return;
      
      const rect = cardEl.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Starting positions for each plane
      const startPositions = {
        grok: { x: -300, y: -100, rotate: -45 },
        claude: { x: window.innerWidth + 100, y: -100, rotate: 45 },
        gemini: { x: -300, y: window.innerHeight - 100, rotate: -90 }
      };
      
      const start = startPositions[modelId as keyof typeof startPositions];
      
      anime({
        targets: planeId,
        opacity: [0, 1, 0],
        translateX: [start.x, centerX - 60],
        translateY: [start.y, centerY - 60],
        rotate: [start.rotate, 0],
        scale: [1, 1, 0],
        easing: 'easeInOutQuad',
        duration: 1500,
        complete: () => {
          // Pulse the card to show delivery
          anime({
            targets: cardId,
            scale: [1, 1.02, 1],
            duration: 300,
            easing: 'easeInOutQuad'
          });
        }
      });
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const resetAnimation = (anime: any) => {
    if (timelineRef.current && timelineRef.current.pause) {
      timelineRef.current.pause();
    }
    
    // Reset all animations with v3 set method
    if (anime && anime.set) {
      anime.set('.model-card', {
        translateX: 0,
        translateY: 0,
        translateZ: 0,
        rotateY: 0,
        rotate: 0,
        scale: 1,
        opacity: 1,
        boxShadow: 'none'
      });
      
      // Reset judge panel
      anime.set('.judge-panel', {
        translateY: 0,
        scale: 1,
        boxShadow: 'none'
      });
      
      // Reset response text
      anime.set('.response-text', {
        opacity: 0
      });
      
      // Reset card backgrounds
      anime.set('.bg-gray-50', {
        scale: 1
      });
      
      // Reset paper planes
      anime.set('#plane-grok', {
        translateX: -300,
        translateY: -100,
        rotate: -45,
        scale: 1,
        opacity: 0
      });
      
      anime.set('#plane-claude', {
        translateX: 600,
        translateY: -78,
        rotate: 45,
        scale: 1,
        opacity: 0
      });
      
      anime.set('#plane-gemini', {
        translateX: -300,
        translateY: 200,
        rotate: -90,
        scale: 1,
        opacity: 0
      });
    }
    
    setActiveModel(null);
    setTotalCost(0);
    setShowJudge(false);
    setJudgeComment('');
    setShowUseCase(true);
    setShowConclusions(false);
    setModels(prev => prev.map(m => ({ ...m, status: 'waiting', response: '', cost: 0, tokens: 0 })));
    
    // Animate use case panel back in
    if (anime && anime.set) {
      anime.set('.use-case-panel', {
        filter: 'blur(0px)',
        opacity: 1,
        scale: 1
      });
    }
  };

  const updateModelStatus = (modelId: string, status: ModelData['status']) => {
    setModels(prev => prev.map(m => 
      m.id === modelId ? { ...m, status } : m
    ));
  };

  const simulateResponse = (modelId: string) => {
    const mockResponses = {
      grok: { 
        text: `I'll help you build a comprehensive Vercel Ship 2025 feature benchmark! Here's the implementation plan:

## 1. Feature Availability Probe

First, let's create a probe system to check feature availability:

\`\`\`typescript
// /app/services/feature-probe.ts
export async function probeFeatures() {
  const features = {
    aiGateway: false,
    sandbox: false,
    queues: false,
    activeCPU: true
  };
  
  // Check AI Gateway
  try {
    const res = await fetch('https://api.ai.vercel.com/v1/models');
    features.aiGateway = res.ok;
  } catch {}
  
  return features;
}
\`\`\`

## 2. Chat Orchestrator

Implement parallel model calls with cost tracking:

\`\`\`typescript
async function orchestrateModels(prompt: string) {
  const models = ['grok-3', 'claude-4-opus', 'gemini-2.5-pro'];
  const responses = await Promise.all(
    models.map(model => callWithTracking(model, prompt))
  );
  return rankByScore(responses);
}
\`\`\`

## 3. Budget Guardian

Monitor spending with a $10 hard limit using localStorage fallback.`,
        summary: 'Feature probing and orchestration focus',
        cost: 0.0037, 
        tokens: 245 
      },
      claude: { 
        text: `I'll help you implement the Vercel Ship 2025 feature benchmark with a focus on staying within the $10 budget. Here's a comprehensive approach:

## Architecture Overview

The key is to design a system that maximizes feature testing while minimizing costs through intelligent batching and caching.

### 1. Feature Availability Detection

\`\`\`typescript
// /app/api/status/route.ts
export async function GET() {
  const status = {
    timestamp: new Date().toISOString(),
    features: {
      aiGateway: { available: false, error: null },
      sandbox: { available: false, error: null },
      queues: { available: false, error: null }
    }
  };
  
  // Probe each feature with minimal cost
  try {
    await checkAIGateway();
    status.features.aiGateway.available = true;
  } catch (e) {
    status.features.aiGateway.error = e.message;
  }
  
  return NextResponse.json(status);
}
\`\`\`

### 2. Cost-Aware Orchestration

Implement a smart orchestrator that tracks costs in real-time:

\`\`\`typescript
class BudgetManager {
  private spent = 0;
  private readonly limit = 10.00;
  
  canAfford(estimatedCost: number): boolean {
    return this.spent + estimatedCost <= this.limit;
  }
  
  async executeWithBudget<T>(
    operation: () => Promise<T>,
    estimatedCost: number
  ): Promise<T> {
    if (!this.canAfford(estimatedCost)) {
      throw new Error('Budget exceeded');
    }
    const result = await operation();
    this.spent += estimatedCost;
    return result;
  }
}
\`\`\`

### 3. Evaluation System

Build a lightweight SWE-bench style evaluator that scores responses objectively.`,
        summary: 'Architecture-first approach with budget awareness', 
        cost: 0.0292, 
        tokens: 389 
      },
      gemini: { 
        text: `Let me design the Vercel Ship 2025 feature benchmark system optimized for the $10 budget constraint.

## Implementation Strategy

### Phase 1: Feature Discovery

\`\`\`typescript
// Probe available features with minimal API calls
const featureMatrix = {
  'AI Gateway': { endpoint: '/v1/models', cost: 0 },
  'Sandbox': { endpoint: '/sandbox/ping', cost: 0 },
  'Queues': { endpoint: '/queues/topics', cost: 0 },
  'Active CPU': { header: 'x-vercel-function-trace', cost: 0 }
};

async function discoverFeatures() {
  return Object.entries(featureMatrix).map(async ([name, config]) => {
    try {
      const available = await probeFeature(config);
      return { name, available, config };
    } catch {
      return { name, available: false, reason: 'Not accessible' };
    }
  });
}
\`\`\`

### Phase 2: Multi-Model Benchmark

Design a cost-efficient benchmarking system:

\`\`\`typescript
interface BenchmarkConfig {
  models: ModelConfig[];
  maxCost: number;
  evaluationCriteria: EvalCriteria;
}

const config: BenchmarkConfig = {
  models: [
    { id: 'grok-3', costPer1k: 0.02 },
    { id: 'claude-4-opus', costPer1k: 0.09 },
    { id: 'gemini-2.5-pro', costPer1k: 0.005 }
  ],
  maxCost: 10.00,
  evaluationCriteria: {
    relevance: { weight: 2, max: 10 },
    reasoning: { weight: 1, max: 5 },
    style: { weight: 1, max: 5 }
  }
};
\`\`\`

### Phase 3: Results Dashboard

Create a real-time dashboard showing model performance vs cost efficiency.`,
        summary: 'Phased approach with feature discovery',
        cost: 0.0039, 
        tokens: 312 
      }
    };

    const response = mockResponses[modelId as keyof typeof mockResponses];
    
    // Update judge comment
    setJudgeComment(`${modelId.charAt(0).toUpperCase() + modelId.slice(1)} is presenting: ${response.summary}`);
    
    // First animate the response area to show it's active
    getAnime().then((anime) => {
      if (!anime) return;
      
      // Animate the response background
      anime({
        targets: `#card-${modelId} .bg-gray-50`,
        backgroundColor: ['#f9fafb', '#e5e7eb', '#f9fafb'],
        duration: 1000,
        easing: 'easeInOutQuad'
      });
      
      // Show the response text with typewriter effect
      anime({
        targets: `#card-${modelId} .response-text`,
        opacity: [0, 1],
        duration: 300,
        easing: 'easeOutQuad'
      });
    });
    
    // Animate text appearance with streaming effect
    let progress = 0;
    const words = response.text.split(' ');
    const interval = setInterval(() => {
      progress += 0.1;  // Doubled speed
      if (progress >= 1) {
        clearInterval(interval);
        updateModelStatus(modelId, 'complete');
        
        // Check if all models are complete
        setModels(prev => {
          const updated = prev.map(m => 
            m.id === modelId ? { ...m, status: 'complete' as const } : m
          );
          
          const allComplete = updated.every(m => 
            m.status === 'complete' || m.status === 'judged'
          );
          
          if (allComplete && !updated.some(m => m.status === 'judged')) {
            setTimeout(() => {
              setJudgeComment('All models have responded. Final verdict ready!');
              updated.forEach(m => updateModelStatus(m.id, 'judged'));
              // Announce winner after a brief pause
              setTimeout(() => announceWinner(), 1500);
            }, 1000);
          }
          
          return updated;
        });
      }
      
      const wordsToShow = Math.floor(words.length * progress);
      const currentText = words.slice(0, wordsToShow).join(' ');
      
      setModels(prev => prev.map(m => 
        m.id === modelId ? {
          ...m,
          response: currentText,
          cost: response.cost * progress,
          tokens: Math.floor(response.tokens * progress)
        } : m
      ));
      
      setTotalCost(prev => prev + (response.cost * 0.05));
    }, 150);
  };

  return (
    <div ref={stageRef} className="fixed inset-0 overflow-hidden paper-texture">
      {/* Blur overlay */}
      <div 
        className="blur-overlay absolute inset-0"
        style={{
          backdropFilter: showUseCase ? 'blur(8px)' : 'blur(0px)',
          transition: 'backdrop-filter 0.8s ease-out',
          zIndex: 10,
          pointerEvents: showUseCase ? 'auto' : 'none'
        }}
      />
      
      {/* Background grid */}
      <svg className="absolute inset-0 w-full h-full opacity-5">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="black" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Main content area */}
      <div className="relative h-full flex items-center justify-center">
        {/* Cards container - horizontal layout */}
        <div className="flex gap-12 items-center" style={{ perspective: '1000px', minWidth: '1400px', position: 'relative', zIndex: 40 }}>
          {models.map((model) => (
            <div key={model.id} className="flex-shrink-0">
              <ModelCard
                id={`card-${model.id}`}
                model={model}
                isActive={activeModel === model.id}
              />
            </div>
          ))}
        </div>

        {/* Paper planes - positioned absolutely */}
        <div className="absolute inset-0 pointer-events-none">
          {models.map((model) => (
            <PaperPlane
              key={`plane-${model.id}`}
              id={`plane-${model.id}`}
              modelId={model.id}
            />
          ))}
        </div>

        {/* Judge panel */}
        <JudgePanel
          totalCost={totalCost}
          models={models}
          className="judge-panel"
          comment={judgeComment}
          visible={showJudge}
          evaluations={evaluations}
        />
        
        {/* Use case panel */}
        <UseCasePanel 
          visible={showUseCase} 
          onLaunchCards={onLaunchCards}
          showLaunchButton={!isActive}
        />
        
        {/* Conclusions card */}
        <ConclusionsCard 
          visible={showConclusions} 
          totalCost={totalCost} 
          onClose={() => setShowConclusions(false)}
        />
      </div>
    </div>
  );
}