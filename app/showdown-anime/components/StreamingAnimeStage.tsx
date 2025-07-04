'use client';

import { useEffect, useRef, useState } from 'react';
import ModelCard from './ModelCard';
import PaperPlane from './PaperPlane';
import JudgePanel from './JudgePanel';
import UseCasePanel from './UseCasePanel';
import ConclusionsCard from './ConclusionsCard';
import { getAnime } from '../lib/anime-wrapper';
import ParticleEffects from '../../showdown-glass/components/ParticleEffects';

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

export default function StreamingAnimeStage({ isActive, onLaunchCards }: AnimeStageProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<any>(null);
  const [activeModel, setActiveModel] = useState<string | null>(null);
  const [totalCost, setTotalCost] = useState(0);
  const [judgeComment, setJudgeComment] = useState('Ready to evaluate AI models...');
  const [showJudge, setShowJudge] = useState(false);
  const [showUseCase, setShowUseCase] = useState(true);
  const [showConclusions, setShowConclusions] = useState(false);
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  
  const [models, setModels] = useState<ModelData[]>([
    { id: 'grok', name: 'Grok', response: '', cost: 0, tokens: 0, status: 'waiting' },
    { id: 'claude', name: 'Claude', response: '', cost: 0, tokens: 0, status: 'waiting' },
    { id: 'gemini', name: 'Gemini', response: '', cost: 0, tokens: 0, status: 'waiting' }
  ]);

  const modelMapping: Record<string, string> = {
    'xai/grok-3': 'grok',
    'anthropic/claude-4-opus': 'claude',
    'google/gemini-2.5-pro': 'gemini'
  };

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
  }, [isActive]);

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
  };

  const resetAnimation = (anime: any) => {
    setShowJudge(false);
    setShowUseCase(true);
    setShowConclusions(false);
    setShowConfetti(false);
    setActiveModel(null);
    setModels([
      { id: 'grok', name: 'Grok', response: '', cost: 0, tokens: 0, status: 'waiting' },
      { id: 'claude', name: 'Claude', response: '', cost: 0, tokens: 0, status: 'waiting' },
      { id: 'gemini', name: 'Gemini', response: '', cost: 0, tokens: 0, status: 'waiting' }
    ]);
  };

  const startStreamingResponses = async () => {
    const streamStartTime = Date.now();
    console.log(`[${new Date().toISOString()}] CLIENT: Starting streaming responses...`);
    setJudgeComment('Connecting to AI models...');
    
    const clientLogs: any[] = [];
    const log = (event: string, data?: any) => {
      const logEntry = {
        timestamp: new Date().toISOString(),
        elapsed: Date.now() - streamStartTime,
        event,
        data
      };
      clientLogs.push(logEntry);
      console.log(`[${logEntry.timestamp}] CLIENT: ${event}`, data || '');
    };

    try {
      log('Fetching from /api/stream');
      const response = await fetch('/api/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: `Design a Next.js 15 app architecture using Vercel's AI Gateway. Provide:

1. HIGH-LEVEL PSEUDO CODE ONLY (no full implementations)
2. A Mermaid diagram showing the system architecture
3. Brief bullet points for each component

Requirements:
- AI Gateway to compare 3 models (Grok, Claude, Gemini)
- Judge scoring system
- Cost tracking under $10
- Results dashboard

Keep response CONCISE. Use pseudo code and diagrams, NOT full code.`
        })
      });

      if (!response.ok) {
        log('HTTP error', { status: response.status });
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      log('Response received, starting stream');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        log('ERROR: Response body is not readable');
        throw new Error('Response body is not readable');
      }
      
      log('Stream reader initialized');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              console.log('Stream complete');
              continue;
            }

            try {
              const event = JSON.parse(data);
              log(`Event: ${event.type}`, event);
              handleStreamEvent(event);
            } catch (e) {
              log('ERROR: Failed to parse SSE data', { error: e, data });
            }
          }
        }
      }
    } catch (error) {
      const totalTime = Date.now() - streamStartTime;
      log('STREAMING ERROR', { 
        error: error instanceof Error ? error.message : error,
        totalTime: `${totalTime}ms`
      });
      
      // Save client logs to console as a single object for analysis
      console.log('=== CLIENT SESSION LOGS ===', clientLogs);
      
      setJudgeComment('Error: Unable to connect to AI models. Please check server configuration.');
    }
  };

  const handleStreamEvent = (event: any) => {
    switch (event.type) {
      case 'start':
        // Models initialized
        break;

      case 'model-start':
        const modelId = modelMapping[event.model] || event.model.split('/')[1];
        setActiveModel(modelId);
        updateModelStatus(modelId, 'active');
        setJudgeComment(`${modelId.charAt(0).toUpperCase() + modelId.slice(1)} is thinking...`);
        showPaperPlaneAnimation(modelId);
        break;

      case 'text-delta':
        const deltaModelId = modelMapping[event.model] || event.model.split('/')[1];
        updateModelResponse(deltaModelId, event.textDelta, true);
        break;

      case 'model-complete':
        const completeModelId = modelMapping[event.model] || event.model.split('/')[1];
        updateModelStatus(completeModelId, 'complete');
        const totalTokens = (event.usage?.promptTokens || 0) + (event.usage?.completionTokens || 0);
        setModels(prev => prev.map(m => 
          m.id === completeModelId 
            ? { ...m, cost: event.cost || 0, tokens: totalTokens }
            : m
        ));
        setTotalCost(prev => prev + (event.cost || 0));
        break;

      case 'error':
        const errorModelId = modelMapping[event.model] || event.model.split('/')[1];
        updateModelResponse(errorModelId, `Error: ${event.error}`, false);
        updateModelStatus(errorModelId, 'complete');
        break;

      case 'judge-start':
        setJudgeComment('Judge is evaluating responses...');
        break;

      case 'judge-delta':
        // We could show judge thinking process here if desired
        break;

      case 'final-results':
        setEvaluations(event.evaluations || []);
        setTotalCost(event.totalCost || 0);
        if (event.evaluations && event.evaluations[0]) {
          const winnerId = modelMapping[event.evaluations[0].model] || 'claude';
          (window as any).__winner = winnerId;
          console.log('=== COMPETITION COMPLETE ===', {
            winner: winnerId,
            totalCost: event.totalCost,
            evaluations: event.evaluations
          });
          setTimeout(() => announceWinner(winnerId), 1000);
        }
        break;

      case 'judge-error':
        setJudgeComment(`Judge error: ${event.error}`);
        break;
    }
  };

  const updateModelStatus = (modelId: string, status: ModelData['status']) => {
    setModels(prev => prev.map(m => 
      m.id === modelId ? { ...m, status } : m
    ));
  };

  const updateModelResponse = (modelId: string, text: string, append: boolean = false) => {
    setModels(prev => prev.map(m => 
      m.id === modelId 
        ? { ...m, response: append ? m.response + text : text }
        : m
    ));
  };

  const showPaperPlaneAnimation = (modelId: string) => {
    getAnime().then((anime) => {
      if (!anime) return;
      
      anime({
        targets: `#paper-plane-${modelId}`,
        translateX: [0, 100],
        translateY: [0, -50],
        opacity: [0, 1, 0],
        scale: [0.5, 1, 0.5],
        duration: 1000,
        easing: 'easeOutQuad'
      });
    });
  };

  const announceWinner = (winnerId: string) => {
    console.log('Announcing winner:', winnerId);
    setJudgeComment(`The winner is ${winnerId.charAt(0).toUpperCase() + winnerId.slice(1)}!`);
    
    // Show confetti animation
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 5000);  // Hide after 5 seconds
    
    getAnime().then((anime) => {
      if (!anime) return;
      
      // Highlight winner card
      anime({
        targets: `#card-${winnerId}`,
        scale: [1.02, 1.05],
        translateY: [-20, -30],
        boxShadow: ['0 20px 40px rgba(0,0,0,0.15)', '0 30px 60px rgba(0,0,0,0.25)'],
        duration: 600,
        easing: 'easeOutElastic(1, .6)'
      });
      
      // Dim other cards
      models.forEach(model => {
        if (model.id !== winnerId) {
          anime({
            targets: `#card-${model.id}`,
            opacity: [1, 0.7],
            scale: [1.02, 0.98],
            duration: 600,
            easing: 'easeOutQuad'
          });
        }
      });
    });
    
    // Show conclusions after delay
    setTimeout(() => {
      setShowConclusions(true);
      // Keep judge panel visible during transition
    }, 7000);  // Show after 7 seconds as requested
  };

  return (
    <div ref={stageRef} className="w-full h-full flex flex-col bg-white">
      {/* Main content area with top margin to account for Judge Panel */}
      <div className="flex-1 flex items-center justify-center p-8 relative" style={{ marginTop: '120px' }}>
        {/* Use case panel */}
        {showUseCase && (
          <UseCasePanel 
            onLaunchCards={onLaunchCards} 
            showLaunchButton={true}
            visible={showUseCase}
          />
        )}
        
        {/* Model cards */}
        <div className="model-cards-container flex gap-8 justify-center items-center" style={{ opacity: isActive ? 1 : 0, marginTop: '100px' }}>
          {models.map((model, index) => (
            <div key={model.id} className="relative">
              <ModelCard
                id={`card-${model.id}`}
                model={model}
                isActive={activeModel === model.id}
              />
              <PaperPlane id={`paper-plane-${model.id}`} />
            </div>
          ))}
        </div>

        {/* Conclusions card */}
        {showConclusions && evaluations.length > 0 && (
          <ConclusionsCard 
            visible={true}
            totalCost={totalCost}
            onClose={() => {
              setShowConclusions(false);
              setShowJudge(true);
            }}
          />
        )}
      </div>

      {/* Judge panel - visible unless conclusions are shown */}
      <JudgePanel 
        comment={judgeComment}
        models={models}
        totalCost={totalCost}
        evaluations={evaluations}
        visible={!showConclusions}
      />
      
      {/* Confetti effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <ParticleEffects type="confetti" />
        </div>
      )}
    </div>
  );
}