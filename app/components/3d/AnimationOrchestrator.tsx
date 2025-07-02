'use client';

import { useState, useEffect, useCallback } from 'react';
import PaperScene from './PaperScene';
import { useTheme } from 'next-themes';

interface ModelState {
  id: string;
  model: string;
  displayName: string;
  state: 'folded' | 'unfolding' | 'unfolded';
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

interface AnimationOrchestratorProps {
  isStreaming: boolean;
  streamData: StreamEvent | null;
}

export default function AnimationOrchestrator({ isStreaming, streamData }: AnimationOrchestratorProps) {
  const { } = useTheme();
  const [modelStates, setModelStates] = useState<ModelState[]>([]);
  const [judgeContent, setJudgeContent] = useState('');
  const [showJudge, setShowJudge] = useState(false);
  const [totalCost, setTotalCost] = useState(0);

  // Initialize paper positions
  const initializePapers = useCallback((models: Array<{ model: string; displayName: string }>) => {
    const positions: [number, number, number][] = [
      [-3, 0, 0],  // Left
      [0, 0, 0],   // Center
      [3, 0, 0]    // Right
    ];

    setModelStates(models.map((model, index) => ({
      id: `paper-${index}`,
      model: model.model,
      displayName: model.displayName,
      state: 'folded',
      content: '',
      isWinner: false,
      position: positions[index],
      delay: index * 300 // Stagger animations
    })));
  }, []);

  // Handle stream events
  useEffect(() => {
    if (!streamData) return;

    const { type, model, textDelta, models, evaluations, totalCost: finalCost } = streamData;

    switch (type) {
      case 'start':
        if (models) {
          initializePapers(models);
        }
        break;

      case 'model-start':
        setModelStates(prev => prev.map(paper => 
          paper.model === model 
            ? { ...paper, state: 'unfolding' }
            : paper
        ));
        break;

      case 'text-delta':
        setModelStates(prev => prev.map(paper => 
          paper.model === model 
            ? { ...paper, content: paper.content + textDelta }
            : paper
        ));
        break;

      case 'model-complete':
        const { latency, usage } = streamData;
        setModelStates(prev => prev.map(paper => 
          paper.model === model 
            ? { 
                ...paper, 
                state: 'unfolded',
                latency,
                cost: usage ? calculateModelCost(model, usage) : 0
              }
            : paper
        ));
        break;

      case 'judge-delta':
        setJudgeContent(prev => prev + textDelta);
        if (!showJudge) {
          setShowJudge(true);
        }
        break;

      case 'final-results':
        if (evaluations && evaluations.length > 0) {
          // Update scores and determine winner
          const winner = evaluations[0].model;
          setModelStates(prev => prev.map(paper => {
            const evaluation = evaluations.find((e: ModelEvaluation) => e.model === paper.model);
            return {
              ...paper,
              isWinner: paper.model === winner,
              scores: evaluation?.scores,
              position: paper.model === winner 
                ? [paper.position[0], 1, paper.position[2]] // Lift winner
                : paper.position
            };
          }));
          setTotalCost(finalCost || 0);
        }
        break;
    }
  }, [streamData, showJudge, initializePapers]);

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

  const handlePaperClick = (id: string) => {
    console.log('Paper clicked:', id);
  };

  const handlePaperHover = (id: string) => {
    console.log('Paper hovered:', id);
  };

  return (
    <div className="w-full">
      {/* 3D Paper Scene */}
      <div className="mb-8">
        <PaperScene 
          papers={modelStates}
          onPaperClick={handlePaperClick}
          onPaperHover={handlePaperHover}
        />
      </div>

      {/* Status Bar */}
      <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                isStreaming ? 'bg-green-500 animate-pulse' : 'bg-zinc-600'
              }`} />
              <span className="text-sm text-zinc-400">
                {isStreaming ? 'Streaming' : 'Ready'}
              </span>
            </div>
            
            {totalCost > 0 && (
              <div className="text-sm">
                <span className="text-zinc-500">Total Cost:</span>
                <span className="text-cyan-400 font-mono ml-2">
                  ${totalCost.toFixed(4)}
                </span>
              </div>
            )}
          </div>

          {/* Model Status Pills */}
          <div className="flex items-center gap-2">
            {modelStates.map((paper) => (
              <div 
                key={paper.id}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  paper.state === 'folded' 
                    ? 'bg-zinc-800 text-zinc-500'
                    : paper.state === 'unfolding'
                    ? 'bg-cyan-900/50 text-cyan-400'
                    : paper.isWinner
                    ? 'bg-green-900/50 text-green-400'
                    : 'bg-zinc-800 text-zinc-300'
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

        {/* Judge Analysis */}
        {showJudge && judgeContent && (
          <div className="mt-4 pt-4 border-t border-zinc-800">
            <h3 className="text-sm font-medium text-zinc-400 mb-2">Judge Analysis</h3>
            <div className="text-sm text-zinc-300 font-mono whitespace-pre-wrap max-h-32 overflow-y-auto">
              {judgeContent}
            </div>
          </div>
        )}
      </div>

      {/* Score Details (shown after evaluation) */}
      {modelStates.some(p => p.scores) && (
        <div className="mt-4 grid grid-cols-3 gap-4">
          {modelStates.map((paper) => (
            <div 
              key={paper.id}
              className={`bg-zinc-900/50 border rounded-lg p-4 transition-all ${
                paper.isWinner 
                  ? 'border-green-500/50 shadow-green-500/20 shadow-lg'
                  : 'border-zinc-800'
              }`}
            >
              <h4 className="font-medium text-sm mb-2 flex items-center justify-between">
                {paper.displayName}
                {paper.isWinner && (
                  <span className="text-green-400 text-xs">Winner</span>
                )}
              </h4>
              
              {paper.scores && (
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Relevance</span>
                    <span className="text-zinc-300">{paper.scores.relevance}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Reasoning</span>
                    <span className="text-zinc-300">{paper.scores.reasoning}/5</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Style</span>
                    <span className="text-zinc-300">{paper.scores.style}/5</span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-zinc-800">
                    <p className="text-zinc-400 text-xs italic">
                      {paper.scores.explanation}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}