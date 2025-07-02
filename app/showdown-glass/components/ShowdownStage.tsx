'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassJudgeHost from './GlassJudgeHost';
import GlassModelCard from './GlassModelCard';
import SpotlightController from './SpotlightController';
import ParticleEffects from './ParticleEffects';
import WinnerPodium from './WinnerPodium';
import { useMockStream } from '../hooks/useMockStream';
import { useAnimationQueue } from '../hooks/useAnimationQueue';

interface ShowdownStageProps {
  isActive: boolean;
  useMockData: boolean;
  onShowComplete: () => void;
}

type ShowPhase = 'idle' | 'pre-show' | 'judge-entrance' | 'model-presentations' | 'verdict' | 'finale';

interface ModelState {
  id: string;
  name: string;
  position: 'offscreen-right' | 'center' | 'offscreen-left';
  response: string;
  cost: number;
  tokens: number;
  score?: number;
  isWinner?: boolean;
}

export default function ShowdownStage({ isActive, useMockData, onShowComplete }: ShowdownStageProps) {
  const [phase, setPhase] = useState<ShowPhase>('idle');
  const [activeModel, setActiveModel] = useState<string | null>(null);
  const [spotlightTarget, setSpotlightTarget] = useState<'none' | 'judge' | 'model' | 'podium'>('none');
  const [showParticles, setShowParticles] = useState(false);
  const [totalCost, setTotalCost] = useState(0);
  const [judgeCost, setJudgeCost] = useState(0);
  
  const [models, setModels] = useState<ModelState[]>([
    { id: 'grok', name: 'Grok 3', position: 'offscreen-right', response: '', cost: 0, tokens: 0 },
    { id: 'claude', name: 'Claude 4 Opus', position: 'offscreen-right', response: '', cost: 0, tokens: 0 },
    { id: 'gemini', name: 'Gemini 2.5 Pro', position: 'offscreen-right', response: '', cost: 0, tokens: 0 }
  ]);

  const { startMockStream, judgeEvaluation } = useMockStream();
  const { addToQueue, processQueue } = useAnimationQueue();

  // Start show sequence
  useEffect(() => {
    if (isActive && phase === 'idle') {
      startShow();
    } else if (!isActive) {
      resetShow();
    }
  }, [isActive]);

  const startShow = async () => {
    // Pre-show phase
    setPhase('pre-show');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Judge entrance
    setPhase('judge-entrance');
    setSpotlightTarget('judge');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Model presentations
    setPhase('model-presentations');
    
    // First, bring all models on stage
    setModels(prev => prev.map(m => ({ ...m, position: 'center' })));
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Then present each model
    for (const model of models) {
      await presentModel(model.id);
    }

    // Judge verdict
    setPhase('verdict');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Grand finale
    setPhase('finale');
    setSpotlightTarget('podium');
    setShowParticles(true);
    await new Promise(resolve => setTimeout(resolve, 5000));

    onShowComplete();
  };

  const presentModel = async (modelId: string) => {
    // Move model to center
    setActiveModel(modelId);
    setSpotlightTarget('model');
    
    setModels(prev => prev.map(m => 
      m.id === modelId ? { ...m, position: 'center' } : m
    ));

    // Start streaming response
    if (useMockData) {
      const mockData = await startMockStream(modelId);
      
      // Simulate streaming with cost updates
      let currentCost = 0;
      const costIncrement = mockData.cost / 20; // 20 updates
      
      for (let i = 0; i < 20; i++) {
        currentCost += costIncrement;
        setModels(prev => prev.map(m => 
          m.id === modelId ? { 
            ...m, 
            response: mockData.text.slice(0, (i + 1) * mockData.text.length / 20),
            cost: currentCost,
            tokens: Math.floor((i + 1) * mockData.tokens / 20)
          } : m
        ));
        setTotalCost(prev => prev + costIncrement);
        await new Promise(resolve => setTimeout(resolve, 150));
      }
    }

    // Move model off stage
    await new Promise(resolve => setTimeout(resolve, 1000));
    setModels(prev => prev.map(m => 
      m.id === modelId ? { ...m, position: 'offscreen-left' } : m
    ));
    setActiveModel(null);
  };

  const resetShow = () => {
    setPhase('idle');
    setActiveModel(null);
    setSpotlightTarget('none');
    setShowParticles(false);
    setTotalCost(0);
    setJudgeCost(0);
    setModels(models.map(m => ({ ...m, position: 'offscreen-right', response: '', cost: 0, tokens: 0, score: undefined })));
  };

  return (
    <div className="fixed inset-0 -mt-20">
      {/* Background with animated gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a1f] via-[#1a0f3a] to-[#0a0a1f]">
        <div className="absolute inset-0 opacity-30">
          <div className="h-full w-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-600/20 via-transparent to-transparent animate-pulse" />
        </div>
      </div>

      {/* Fog effect at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white/5 to-transparent" />
      
      {/* Spotlight system */}
      <SpotlightController target={spotlightTarget} phase={phase} />

      {/* Stage floor reflection */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {/* Main stage area */}
      <div className="relative h-full flex items-center justify-center">
        <AnimatePresence mode="wait">
          {/* Pre-show announcement */}
          {phase === 'pre-show' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              className="text-center"
            >
              <h2 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500 mb-4">
                Ladies and Gentlemen...
              </h2>
              <p className="text-2xl text-white/80">Welcome to AI Showdown!</p>
            </motion.div>
          )}

          {/* Judge entrance and stay */}
          {(phase === 'judge-entrance' || phase === 'model-presentations' || phase === 'verdict') && (
            <div className="relative">
              <GlassJudgeHost
                phase={phase}
                totalCost={totalCost}
                judgeCost={judgeCost}
                onJudgeCostUpdate={setJudgeCost}
                activeModel={activeModel}
              />
              
              {/* Model presentations */}
              {phase === 'model-presentations' && (
                <div className="absolute inset-0 pointer-events-none">
                  {models.map((model, index) => (
                    <GlassModelCard
                      key={model.id}
                      model={model}
                      isActive={activeModel === model.id}
                      position={model.position}
                      stagePosition={index} // Pass index to determine stage position
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Winner podium */}
          {phase === 'finale' && (
            <WinnerPodium models={models} totalCost={totalCost} />
          )}
        </AnimatePresence>
      </div>

      {/* Particle effects */}
      <AnimatePresence>
        {showParticles && (
          <ParticleEffects type="celebration" />
        )}
      </AnimatePresence>

      {/* Show status indicator */}
      <div className="absolute top-4 right-4 z-50">
        <div className="bg-black/50 backdrop-blur-md rounded-lg px-4 py-2 text-white text-sm">
          Phase: {phase}
        </div>
      </div>
    </div>
  );
}