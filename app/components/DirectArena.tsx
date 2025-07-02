'use client';

import { useState, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import { Suspense } from 'react';
import EnhancedPaper from './3d/EnhancedPaper';
import { Container, Flex, Text, Button } from '@radix-ui/themes';
import { ReloadIcon } from '@radix-ui/react-icons';

interface DirectArenaProps {
  benchmarkPrompt: string;
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
}

interface StreamEvent {
  type: string;
  model?: string;
  textDelta?: string;
  models?: Array<{ model: string; displayName: string }>;
  evaluations?: Array<{
    model: string;
    scores: {
      relevance: number;
      reasoning: number;
      style: number;
      explanation: string;
    };
  }>;
  totalCost?: number;
  latency?: number;
  usage?: { inputTokens: number; outputTokens: number };
  error?: string;
}

export default function DirectArena({ benchmarkPrompt }: DirectArenaProps) {
  const [papers, setPapers] = useState<PaperState[]>([]);
  const [phase, setPhase] = useState<'intro' | 'models' | 'judge' | 'complete'>('intro');
  const [isStreaming, setIsStreaming] = useState(false);
  // Stream data is handled inline during processing
  const [totalCost, setTotalCost] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Start the animation sequence immediately
  useEffect(() => {
    // Create and drop benchmark paper on mount
    const benchmarkPaper: PaperState = {
      id: 'benchmark',
      type: 'benchmark',
      state: 'dropping',
      content: benchmarkPrompt,
      isWinner: false,
      position: [0, 0, 0],
      delay: 500 // Drop after 500ms
    };
    
    setPapers([benchmarkPaper]);
    
    // Unfold benchmark paper
    setTimeout(() => {
      setPapers(prev => prev.map(p => 
        p.id === 'benchmark' ? { ...p, state: 'unfolding' } : p
      ));
    }, 1500);
    
    // After benchmark unfolds, automatically start the API call
    setTimeout(() => {
      setPapers(prev => prev.map(p => 
        p.id === 'benchmark' ? { ...p, state: 'unfolded' } : p
      ));
      setPhase('models');
      startBenchmark();
    }, 3000);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startBenchmark = useCallback(async () => {
    setIsStreaming(true);
    setError(null);

    try {
      const response = await fetch('/api/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: benchmarkPrompt }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              setIsStreaming(false);
              continue;
            }

            try {
              const event = JSON.parse(data);
              handleStreamEvent(event);
            } catch (e) {
              console.error('Error parsing event:', e);
            }
          }
        }
      }
    } catch (err) {
      console.error('Stream error:', err);
      setError(err instanceof Error ? err.message : 'Failed to stream responses');
      setIsStreaming(false);
    }
  }, [benchmarkPrompt]);

  const handleStreamEvent = (event: StreamEvent) => {
    const { type, model, textDelta, models, evaluations, totalCost: finalCost } = event;

    switch (type) {
      case 'start':
        if (models) {
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
            delay: 4000 + (index * 300) // Staggered after benchmark
          }));
          
          setPapers(prev => [...prev, ...modelPapers]);
          
          // Start unfolding models after they drop
          modelPapers.forEach((paper) => {
            setTimeout(() => {
              setPapers(prev => prev.map(p => 
                p.id === paper.id ? { ...p, state: 'unfolding' } : p
              ));
            }, paper.delay + 800);
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
        setPapers(prev => prev.map(paper => 
          paper.model === model 
            ? { ...paper, state: 'unfolded' }
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
          delay: 500
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
            if (paper.type === 'model' && paper.model === winner) {
              return {
                ...paper,
                isWinner: true,
                state: 'unfolded',
                position: [paper.position[0], 1.5, paper.position[2]] // Elevate winner
              };
            }
            return paper;
          }));
          setTotalCost(finalCost || 0);
          setPhase('complete');
        }
        break;
    }
  };

  const handleReset = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Minimal Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4">
        <Container size="4">
          <Flex justify="between" align="center">
            <Text size="1" className="text-gray-500">
              AI Triage Arena • {phase === 'intro' ? 'Presenting Challenge' :
                              phase === 'models' ? 'Models Responding' :
                              phase === 'judge' ? 'Evaluating' : 'Complete'}
            </Text>
            {phase === 'complete' && (
              <Button size="1" variant="soft" onClick={handleReset}>
                <ReloadIcon />
                New Arena
              </Button>
            )}
          </Flex>
        </Container>
      </div>

      {/* Full Screen 3D Scene */}
      <div className="w-full h-screen">
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
            <mesh position={[0, -3, -8]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[60, 60, 60, 60]} />
              <meshBasicMaterial 
                color="#f0f0f0" 
                wireframe 
                wireframeLinewidth={0.5}
                transparent
                opacity={0.1}
              />
            </mesh>
            
            {/* Decorative scribbles */}
            <group position={[0, 0, -10]}>
              {/* Add random scribble lines here */}
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
              />
            ))}
            
            {/* Ground shadows */}
            <ContactShadows
              position={[0, -3, 0]}
              opacity={0.15}
              scale={30}
              blur={2}
              far={15}
              color="#000000"
            />
            
            <OrbitControls
              enablePan={false}
              enableZoom={true}
              maxPolarAngle={Math.PI / 2}
              minPolarAngle={Math.PI / 4}
              minDistance={8}
              maxDistance={20}
              autoRotate={phase === 'intro'}
              autoRotateSpeed={0.5}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Status Bar */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <Container size="4">
          <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg p-3">
            <Flex align="center" justify="between">
              <Flex align="center" gap="4">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    isStreaming ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                  }`} />
                  <Text size="1" className="text-gray-600">
                    {isStreaming ? 'Streaming' : 'Ready'}
                  </Text>
                </div>
                
                {totalCost > 0 && (
                  <Text size="1">
                    <span className="text-gray-500">Total Cost:</span>
                    <span className="text-cyan-600 font-mono ml-1">
                      ${totalCost.toFixed(4)}
                    </span>
                  </Text>
                )}
              </Flex>

              {/* Model Pills */}
              <Flex gap="2">
                {papers.filter(p => p.type === 'model').map((paper) => (
                  <div 
                    key={paper.id}
                    className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                      paper.state === 'folded' || paper.state === 'dropping'
                        ? 'bg-gray-100 text-gray-500'
                        : paper.state === 'unfolding'
                        ? 'bg-cyan-100 text-cyan-700'
                        : paper.isWinner
                        ? 'bg-green-100 text-green-700 ring-2 ring-green-500'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {paper.displayName?.split(' ')[0]}
                  </div>
                ))}
              </Flex>
            </Flex>
          </div>
        </Container>
      </div>

      {/* Error Toast */}
      {error && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg">
          <Text size="2" className="text-red-700">{error}</Text>
        </div>
      )}
    </div>
  );
}