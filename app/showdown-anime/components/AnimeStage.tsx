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

  const startStreamingResponses = () => {
    // Simulate parallel API calls with different response times
    const delays = {
      grok: 800,
      claude: 1200,
      gemini: 1600
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
    setJudgeComment('🎉 Claude wins with superior optimization analysis!');
    
    getAnime().then((anime) => {
      if (!anime) return;
      
      // Fade out losing cards
      anime({
        targets: ['#card-grok', '#card-gemini'],
        opacity: [1, 0.3],
        scale: [1.02, 0.95],
        translateY: ['-20', '20'],
        filter: ['blur(0px)', 'blur(2px)'],
        easing: 'easeOutExpo',
        duration: 1000
      });
      
      // Elevate winner card
      anime({
        targets: '#card-claude',
        translateY: ['-20', '-60'],
        scale: [1.02, 1.1],
        easing: 'easeOutElastic(1, .6)',
        duration: 1200
      });
      
      // Create confetti effect with multiple elements
      createConfetti();
      
      // Show conclusions after 3 seconds
      setTimeout(() => {
        setShowConclusions(true);
      }, 3000);
    });
  };
  
  const createConfetti = () => {
    const confettiContainer = document.createElement('div');
    confettiContainer.className = 'confetti-container';
    confettiContainer.style.cssText = 'position: fixed; inset: 0; pointer-events: none; z-index: 200;';
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
        scaleX: 0,
        opacity: 1
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
        text: 'Efficiency through minimalism leads to cleaner code and faster execution times',
        summary: 'Focus on minimalism',
        cost: 0.0037, 
        tokens: 245 
      },
      claude: { 
        text: 'Comprehensive systematic analysis reveals multiple optimization opportunities across the codebase architecture',
        summary: 'Systematic optimization approach', 
        cost: 0.0292, 
        tokens: 389 
      },
      gemini: { 
        text: 'Creative scalable solutions emerge when we combine modern patterns with thoughtful design',
        summary: 'Creative scalability',
        cost: 0.0039, 
        tokens: 312 
      }
    };

    const response = mockResponses[modelId as keyof typeof mockResponses];
    
    // Update judge comment
    setJudgeComment(`${modelId} is presenting: ${response.summary}`);
    
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
      progress += 0.05;
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
          zIndex: 40
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
        <div className="flex gap-12 items-center" style={{ perspective: '1000px', minWidth: '1400px' }}>
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
        />
        
        {/* Use case panel */}
        <UseCasePanel 
          visible={showUseCase} 
          onLaunchCards={onLaunchCards}
          showLaunchButton={!isActive}
        />
        
        {/* Conclusions card */}
        <ConclusionsCard visible={showConclusions} totalCost={totalCost} />
      </div>
    </div>
  );
}