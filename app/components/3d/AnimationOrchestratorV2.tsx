'use client';

import { useState, useEffect } from 'react';
import EnhancedPaper from './EnhancedPaper';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import { Suspense } from 'react';

interface StreamEvent {
  type: string;
  model?: string;
  textDelta?: string;
  models?: Array<{ model: string; displayName: string }>;
  evaluations?: ModelEvaluation[];
  totalCost?: number;
  latency?: number;
  usage?: { inputTokens: number; outputTokens: number };
  error?: string;
}

interface ModelEvaluation {
  model: string;
  scores: {
    relevance: number;
    reasoning: number;
    style: number;
    explanation: string;
  };
}

interface PaperState {
  id: string;
  type: 'benchmark' | 'model' | 'judge';
  model?: string;
  displayName?: string;
  state: 'folded' | 'dropping' | 'unfolding' | 'unfolded';
  content: string;
  isWinner: boolean;
  position: [number, number, number];
  delay: number;
  latency?: number;
  cost?: number;
  scores?: {
    relevance: number;
    reasoning: number;
    style: number;
    explanation: string;
  };
}

interface AnimationOrchestratorV2Props {
  isStreaming: boolean;
  streamData: StreamEvent | null;
  benchmarkPrompt: string;
}

export default function AnimationOrchestratorV2({ 
  isStreaming, 
  streamData,
  benchmarkPrompt 
}: AnimationOrchestratorV2Props) {
  const [papers, setPapers] = useState<PaperState[]>([]);
  const [phase, setPhase] = useState<'idle' | 'benchmark' | 'models' | 'judge' | 'complete'>('idle');
  const [totalCost, setTotalCost] = useState(0);

  // Initialize with benchmark paper
  useEffect(() => {
    if (isStreaming && papers.length === 0) {
      // Create benchmark paper
      const benchmarkPaper: PaperState = {
        id: 'benchmark',
        type: 'benchmark',
        state: 'dropping',
        content: benchmarkPrompt,
        isWinner: false,
        position: [0, 0, 0],
        delay: 0
      };
      
      setPapers([benchmarkPaper]);
      setPhase('benchmark');
      
      // After benchmark unfolds, transition to models phase
      setTimeout(() => {
        setPapers(prev => prev.map(p => 
          p.id === 'benchmark' ? { ...p, state: 'unfolding' } : p
        ));
      }, 1000);
      
      setTimeout(() => {
        setPapers(prev => prev.map(p => 
          p.id === 'benchmark' ? { ...p, state: 'unfolded' } : p
        ));
        setPhase('models');
      }, 2500);
    }
  }, [isStreaming, papers.length, benchmarkPrompt]);

  // Handle stream events
  useEffect(() => {
    if (!streamData) return;

    const { type, model, textDelta, models, evaluations, totalCost: finalCost } = streamData;

    switch (type) {
      case 'start':
        if (models && phase === 'models') {
          // Create model papers
          const positions: [number, number, number][] = [
            [-3, 0, 0],  // Left
            [0, 0, -2],  // Center back
            [3, 0, 0]    // Right
          ];
          
          const modelPapers: PaperState[] = models.map((m, index) => ({
            id: `model-${m.model}`,
            type: 'model' as const,
            model: m.model,
            displayName: m.displayName,
            state: 'dropping' as const,
            content: '',
            isWinner: false,
            position: positions[index],
            delay: 3000 + (index * 500) // Staggered after benchmark
          }));
          
          setPapers(prev => [...prev, ...modelPapers]);
          
          // Start unfolding models after they drop
          modelPapers.forEach((paper) => {
            setTimeout(() => {
              setPapers(prev => prev.map(p => 
                p.id === paper.id ? { ...p, state: 'unfolding' } : p
              ));
            }, paper.delay + 1000);
          });
        }
        break;

      case 'text-delta':
        setPapers(prev => prev.map(paper => 
          paper.model === model 
            ? { ...paper, content: paper.content + textDelta }
            : paper
        ));
        break;

      case 'model-complete':
        const { latency, usage } = streamData;
        setPapers(prev => prev.map(paper => 
          paper.model === model 
            ? { 
                ...paper, 
                state: 'unfolded',
                latency,
                cost: usage && model ? calculateModelCost(model, usage) : 0
              }
            : paper
        ));
        break;

      case 'all-models-complete':
        setPhase('judge');
        // Create judge paper
        const judgePaper: PaperState = {
          id: 'judge',
          type: 'judge',
          state: 'dropping',
          content: '',
          isWinner: false,
          position: [0, 0, 2],
          delay: 0
        };
        setPapers(prev => [...prev, judgePaper]);
        
        setTimeout(() => {
          setPapers(prev => prev.map(p => 
            p.id === 'judge' ? { ...p, state: 'unfolding' } : p
          ));
        }, 1000);
        break;

      case 'judge-delta':
        setPapers(prev => prev.map(paper => 
          paper.id === 'judge' 
            ? { ...paper, content: paper.content + textDelta }
            : paper
        ));
        break;

      case 'final-results':
        if (evaluations && evaluations.length > 0) {
          const winner = evaluations[0].model;
          setPapers(prev => prev.map(paper => {
            const evaluation = evaluations.find((e: ModelEvaluation) => e.model === paper.model);
            if (paper.type === 'model') {
              return {
                ...paper,
                isWinner: paper.model === winner,
                scores: evaluation?.scores,
                state: 'unfolded',
                position: paper.model === winner 
                  ? [paper.position[0], 1, paper.position[2]] // Elevate winner
                  : paper.position
              };
            }
            return paper;
          }));
          setTotalCost(finalCost || 0);
          setPhase('complete');
        }
        break;
    }
  }, [streamData, phase]);

  const calculateModelCost = (model: string, usage: { inputTokens: number; outputTokens: number }) => {
    const pricing: Record<string, { input: number; output: number }> = {
      'xai/grok-3': { input: 0.005, output: 0.015 },
      'anthropic/claude-4-opus': { input: 0.015, output: 0.075 },
      'google/gemini-2.5-pro': { input: 0.00125, output: 0.00375 }
    };
    
    const price = pricing[model] || { input: 0, output: 0 };
    return (usage.inputTokens / 1000) * price.input + 
           (usage.outputTokens / 1000) * price.output;
  };

  return (
    <div className="w-full">
      {/* 3D Scene */}
      <div className="w-full h-[700px] rounded-xl overflow-hidden border border-gray-200 bg-white">
        <Canvas 
          shadows
          dpr={[1, 2]}
          camera={{ position: [0, 5, 12], fov: 50 }}
          gl={{ alpha: true, antialias: true }}
          style={{ background: 'white' }}
        >
          <Suspense fallback={null}>
            {/* Lighting */}
            <ambientLight intensity={0.7} />
            <directionalLight
              position={[10, 10, 5]}
              intensity={0.8}
              castShadow
              shadow-mapSize={[2048, 2048]}
            />
            <pointLight position={[-10, -10, -5]} intensity={0.3} />
            
            {/* Graph paper background */}
            <mesh position={[0, -2.5, -5]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[50, 50, 50, 50]} />
              <meshBasicMaterial 
                color="#f0f0f0" 
                wireframe 
                wireframeLinewidth={0.5}
                transparent
                opacity={0.15}
              />
            </mesh>
            
            {/* Random scribbles background */}
            <group position={[0, 0, -8]}>
              {/* Add some decorative elements */}
            </group>
            
            {/* Papers */}
            {papers.map((paper) => (
              <EnhancedPaper
                key={paper.id}
                position={paper.position}
                text={paper.content}
                state={paper.state}
                delay={paper.delay}
                isWinner={paper.isWinner}
                isBenchmark={paper.type === 'benchmark'}
                modelName={paper.displayName}
                onClick={() => console.log('Paper clicked:', paper.id)}
                onHover={() => console.log('Paper hovered:', paper.id)}
              />
            ))}
            
            {/* Ground shadows */}
            <ContactShadows
              position={[0, -2.5, 0]}
              opacity={0.15}
              scale={20}
              blur={2}
              far={10}
              color="#000000"
            />
            
            <OrbitControls
              enablePan={false}
              enableZoom={true}
              maxPolarAngle={Math.PI / 2}
              minPolarAngle={Math.PI / 4}
              minDistance={8}
              maxDistance={20}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Status Bar */}
      <div className="mt-4 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                isStreaming ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
              }`} />
              <span className="text-sm text-gray-600">
                {phase === 'idle' ? 'Ready' :
                 phase === 'benchmark' ? 'Presenting Challenge' :
                 phase === 'models' ? 'Models Responding' :
                 phase === 'judge' ? 'Evaluating' :
                 'Complete'}
              </span>
            </div>
            
            {totalCost > 0 && (
              <div className="text-sm">
                <span className="text-gray-500">Total Cost:</span>
                <span className="text-cyan-600 font-mono ml-2">
                  ${totalCost.toFixed(4)}
                </span>
              </div>
            )}
          </div>

          {/* Model Status */}
          <div className="flex items-center gap-2">
            {papers.filter(p => p.type === 'model').map((paper) => (
              <div 
                key={paper.id}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  paper.state === 'folded' || paper.state === 'dropping'
                    ? 'bg-gray-100 text-gray-500'
                    : paper.state === 'unfolding'
                    ? 'bg-cyan-100 text-cyan-700'
                    : paper.isWinner
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {paper.displayName}
                {paper.latency && (
                  <span className="ml-1 opacity-70">
                    {(paper.latency / 1000).toFixed(1)}s
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}