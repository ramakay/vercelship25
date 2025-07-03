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

  const startStreamingResponses = async () => {
    setJudgeComment('Contacting AI models...');
    
    // Use mock data for testing (set to false to use real API)
    const USE_MOCK = false;
    
    if (USE_MOCK) {
      console.log('Using mock data for demo');
      startMockStreamingResponses();
      return;
    }
    
    let response: Response | undefined;
    
    try {
      // Call the real API with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout for AI responses
      
      response = await fetch('/api/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: 'Analyze and optimize this React application for better performance and code quality.'
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

      // Store winner info for later
      if (data.evaluations && data.evaluations[0]) {
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
          setJudgeComment('Request timed out after 30 seconds. The AI models are taking longer than expected.');
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
      
      // Don't fall back to mock - show error state
      setModels(prev => prev.map(m => ({
        ...m,
        response: 'API connection failed',
        status: 'complete' as const,
        cost: 0,
        tokens: 0
      })));
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
      const sentences = fullText.split(/[.!?]/).filter(s => s.trim());
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
    // Original mock implementation as fallback
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
    const winner = (window as any).__winner || 'claude';
    const winnerName = winner.charAt(0).toUpperCase() + winner.slice(1);
    setJudgeComment(`🎉 ${winnerName} wins with the best optimization approach!`);
    
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
        text: `I'll analyze your React application for performance optimization. The most impactful improvements come from addressing component re-renders, bundle size optimization, and state management efficiency. Here are the key areas to focus on:

1. **Component Memoization**: Use React.memo() for functional components that receive stable props to prevent unnecessary re-renders.

\`\`\`jsx
// Before
const UserCard = ({ user }) => {
  return <div>{user.name}</div>;
};

// After
const UserCard = React.memo(({ user }) => {
  return <div>{user.name}</div>;
});
\`\`\`

2. **useCallback and useMemo**: Memoize expensive computations and callback functions to maintain referential equality.

3. **Code Splitting**: Implement lazy loading for route-based components to reduce initial bundle size.`,
        summary: 'Focus on memoization and code splitting',
        cost: 0.0037, 
        tokens: 245 
      },
      claude: { 
        text: `I'd be happy to help analyze and optimize your React application! To provide comprehensive optimization suggestions, I'll need to see your code. However, here are the key areas I typically focus on:

## Performance Optimizations

1. **Virtual DOM Efficiency**
   - Minimize unnecessary re-renders using React.memo, useMemo, and useCallback
   - Implement proper key strategies for lists
   - Use React DevTools Profiler to identify bottlenecks

2. **Bundle Size Optimization**
   \`\`\`javascript
   // Use dynamic imports for code splitting
   const HeavyComponent = React.lazy(() => import('./HeavyComponent'));
   
   // Tree-shake unused exports
   import { specificFunction } from 'large-library';
   \`\`\`

3. **State Management**
   - Colocate state close to where it's used
   - Consider using useReducer for complex state logic
   - Implement proper data normalization

## Code Quality Improvements

- Extract custom hooks for reusable logic
- Implement proper TypeScript types
- Add comprehensive error boundaries
- Use ESLint and Prettier for consistency`,
        summary: 'Comprehensive optimization strategy', 
        cost: 0.0292, 
        tokens: 389 
      },
      gemini: { 
        text: `Of course! Let me provide a comprehensive guide for optimizing your React application.

### Performance Analysis Framework

First, let's establish metrics for measurement:

\`\`\`javascript
// Performance monitoring hook
function usePerformanceMonitor(componentName) {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      console.log(\`\${componentName} render time: \${endTime - startTime}ms\`);
    };
  });
}
\`\`\`

### Key Optimization Strategies

1. **React.memo with Custom Comparison**
   \`\`\`jsx
   const ExpensiveComponent = React.memo(
     ({ data, userId }) => {
       // Component logic
     },
     (prevProps, nextProps) => {
       return prevProps.userId === nextProps.userId &&
              prevProps.data.id === nextProps.data.id;
     }
   );
   \`\`\`

2. **Virtualization for Large Lists**
   - Use react-window or react-virtualized
   - Implement infinite scrolling
   - Lazy load images and content

3. **Optimize Context Usage**
   - Split contexts by update frequency
   - Use multiple small contexts instead of one large one`,
        summary: 'Performance monitoring and virtualization',
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