'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MinimalJudge from './MinimalJudge';
import MinimalModelCard from './MinimalModelCard';
import MinimalPodium from './MinimalPodium';

interface MinimalStageProps {
  isActive: boolean;
}

type Phase = 'idle' | 'act-one' | 'act-two' | 'act-three' | 'finale';

interface ModelState {
  id: string;
  name: string;
  response: string;
  cost: number;
  tokens: number;
  score?: number;
  position: 'offstage' | 'onstage' | 'exited';
}

export default function MinimalStage({ isActive }: MinimalStageProps) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [activeModel, setActiveModel] = useState<string | null>(null);
  const [totalCost, setTotalCost] = useState(0);
  
  const [models, setModels] = useState<ModelState[]>([
    { id: 'grok', name: 'Grok', response: '', cost: 0, tokens: 0, position: 'offstage' },
    { id: 'claude', name: 'Claude', response: '', cost: 0, tokens: 0, position: 'offstage' },
    { id: 'gemini', name: 'Gemini', response: '', cost: 0, tokens: 0, position: 'offstage' }
  ]);

  useEffect(() => {
    if (isActive && phase === 'idle') {
      performShow();
    } else if (!isActive) {
      resetShow();
    }
  }, [isActive]);

  const performShow = async () => {
    // Act One - Introduction
    setPhase('act-one');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Act Two - Performances
    setPhase('act-two');
    
    // Bring all models on stage in a line
    setModels(prev => prev.map(m => ({ ...m, position: 'onstage' })));
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Each model performs
    for (const model of models) {
      await performModel(model.id);
    }

    // Act Three - Judgment
    setPhase('act-three');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Finale
    setPhase('finale');
  };

  const performModel = async (modelId: string) => {
    setActiveModel(modelId);
    
    // Mock streaming response
    const mockResponses = {
      grok: { text: 'Efficiency through minimalism', cost: 0.0037, tokens: 245 },
      claude: { text: 'Comprehensive systematic analysis', cost: 0.0292, tokens: 389 },
      gemini: { text: 'Creative scalable solutions', cost: 0.0039, tokens: 312 }
    };

    const response = mockResponses[modelId as keyof typeof mockResponses];
    
    // Simulate streaming
    for (let i = 0; i < 10; i++) {
      const progress = (i + 1) / 10;
      setModels(prev => prev.map(m => 
        m.id === modelId ? {
          ...m,
          response: response.text.slice(0, response.text.length * progress),
          cost: response.cost * progress,
          tokens: Math.floor(response.tokens * progress)
        } : m
      ));
      setTotalCost(prev => prev + (response.cost / 10));
      await new Promise(resolve => setTimeout(resolve, 150));
    }

    await new Promise(resolve => setTimeout(resolve, 500));
    setActiveModel(null);
  };

  const resetShow = () => {
    setPhase('idle');
    setActiveModel(null);
    setTotalCost(0);
    setModels(models.map(m => ({ ...m, position: 'offstage', response: '', cost: 0, tokens: 0, score: undefined })));
  };

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ perspective: '2000px' }}>
      {/* Enhanced geometric background with depth */}
      <motion.div 
        className="absolute inset-0"
        animate={{ 
          rotateX: phase === 'idle' ? 0 : -2,
          rotateY: phase === 'idle' ? 0 : 1
        }}
        transition={{ duration: 2, ease: "easeOut" }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <svg className="absolute inset-0 w-full h-full opacity-5" preserveAspectRatio="none">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="black" strokeWidth="0.5"/>
              <circle cx="0" cy="0" r="1" fill="black" opacity="0.3"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
        
        {/* Subtle gradient overlay for depth */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.03) 100%)'
          }}
        />
      </motion.div>

      {/* Main content */}
      <div className="relative h-full flex flex-col">
        <AnimatePresence mode="wait">
          {/* Act One - Title card with depth */}
          {phase === 'act-one' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotateX: -10 }}
              animate={{ opacity: 1, scale: 1, rotateX: 0 }}
              exit={{ opacity: 0, scale: 1.1, rotateX: 10 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="absolute inset-0 flex items-center justify-center"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <motion.div 
                className="text-center"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <motion.h2 
                  className="text-6xl font-light tracking-widest mb-4"
                  style={{
                    textShadow: `
                      1px 1px 2px rgba(0,0,0,0.1),
                      2px 2px 4px rgba(0,0,0,0.08),
                      3px 3px 6px rgba(0,0,0,0.05)
                    `
                  }}
                  initial={{ letterSpacing: '0.1em' }}
                  animate={{ letterSpacing: '0.3em' }}
                  transition={{ duration: 2, ease: "easeOut" }}
                >
                  Act I
                </motion.h2>
                <motion.p 
                  className="text-xl text-gray-600" 
                  style={{ 
                    fontFamily: 'Caveat, cursive',
                    textShadow: '0.5px 0.5px 1px rgba(0,0,0,0.1)'
                  }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 1 }}
                >
                  "The Gathering of Minds"
                </motion.p>
              </motion.div>
            </motion.div>
          )}

          {/* Act Two & Three - Performance */}
          {(phase === 'act-two' || phase === 'act-three') && (
            <>
              {/* Judge - minimal top bar */}
              <MinimalJudge
                phase={phase}
                totalCost={totalCost}
                activeModel={activeModel}
              />

              {/* Model performances with 3D stage effect */}
              <div className="flex-1 flex items-center justify-center">
                <motion.div 
                  className="flex gap-24"
                  initial={{ rotateX: -5 }}
                  animate={{ 
                    rotateX: phase === 'act-two' ? -3 : 0,
                    y: phase === 'act-two' ? -20 : 0
                  }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {models.map((model, index) => (
                    <motion.div
                      key={model.id}
                      initial={{ z: -100 }}
                      animate={{ 
                        z: activeModel === model.id ? 50 : 0,
                        scale: activeModel === model.id ? 1.05 : (activeModel && activeModel !== model.id ? 0.95 : 1)
                      }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      <MinimalModelCard
                        model={model}
                        isActive={activeModel === model.id}
                        delay={index * 200}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </>
          )}

          {/* Finale */}
          {phase === 'finale' && (
            <MinimalPodium models={models} totalCost={totalCost} />
          )}
        </AnimatePresence>

        {/* Phase indicator with animation */}
        <AnimatePresence>
          {phase !== 'idle' && (
            <motion.div 
              className="absolute bottom-8 right-8 text-xs text-gray-400 tracking-wider"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
            >
              <motion.span
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {phase.replace('-', ' ').toUpperCase()}
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}