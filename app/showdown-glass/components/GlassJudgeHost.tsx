'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import TokenCounter from './TokenCounter';

interface GlassJudgeHostProps {
  phase: string;
  totalCost: number;
  judgeCost: number;
  onJudgeCostUpdate: (cost: number) => void;
  activeModel: string | null;
}

const judgeReactions = {
  greeting: { emoji: '🎭', text: 'Welcome to the show!' },
  analyzing: { emoji: '🤔', text: 'Interesting approach...' },
  impressed: { emoji: '🌟', text: 'Now that\'s impressive!' },
  calculating: { emoji: '🧮', text: 'Let me calculate the costs...' },
  deciding: { emoji: '⚖️', text: 'Time for the verdict!' }
};

export default function GlassJudgeHost({ 
  phase, 
  totalCost, 
  judgeCost, 
  onJudgeCostUpdate, 
  activeModel 
}: GlassJudgeHostProps) {
  const [reaction, setReaction] = useState(judgeReactions.greeting);
  const [isEvaluating, setIsEvaluating] = useState(false);

  useEffect(() => {
    if (phase === 'judge-entrance') {
      setReaction(judgeReactions.greeting);
    } else if (activeModel) {
      const reactions = [judgeReactions.analyzing, judgeReactions.impressed];
      setReaction(reactions[Math.floor(Math.random() * reactions.length)]);
    } else if (phase === 'verdict') {
      setReaction(judgeReactions.deciding);
      setIsEvaluating(true);
      // Simulate judge evaluation cost
      simulateJudgeCost();
    }
  }, [phase, activeModel]);

  const simulateJudgeCost = async () => {
    const targetCost = 0.015; // Judge evaluation cost
    const steps = 20;
    const increment = targetCost / steps;

    for (let i = 0; i < steps; i++) {
      onJudgeCostUpdate((i + 1) * increment);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  };

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", damping: 20, stiffness: 100 }}
      className="fixed top-32 left-0 right-0 z-30 px-8"
    >
      {/* Judge strip - horizontal glassmorphic design */}
      <div className="relative max-w-6xl mx-auto">
        {/* Glow effect behind strip */}
        <div className="absolute -inset-4 bg-gradient-to-r from-transparent via-yellow-500/20 to-transparent blur-2xl" />
        
        {/* Main judge strip */}
        <motion.div
          className="relative bg-gradient-to-r from-yellow-500/5 via-yellow-500/10 to-yellow-500/5 backdrop-blur-xl rounded-2xl px-6 py-4 border border-yellow-500/20 shadow-2xl"
          animate={{
            boxShadow: isEvaluating 
              ? '0 0 40px rgba(255, 215, 0, 0.4)' 
              : '0 10px 30px rgba(0, 0, 0, 0.3)'
          }}
        >
          {/* Horizontal layout */}
          <div className="flex items-center justify-between gap-6">
            {/* Judge info */}
            <div className="flex items-center gap-4">
              <div>
                <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500">
                  Judge GPT-4o
                </h3>
                <p className="text-white/60 text-sm">Your AI Showdown Host</p>
              </div>
            </div>

            {/* Judge reaction - center */}
            <AnimatePresence mode="wait">
              <motion.div
                key={reaction.text}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/10"
              >
                <span className="text-3xl">{reaction.emoji}</span>
                <p className="text-white/90 text-lg font-medium">{reaction.text}</p>
              </motion.div>
            </AnimatePresence>

            {/* Cost displays - right side */}
            <div className="flex gap-4">
              <div className="bg-black/30 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/10">
                <p className="text-white/60 text-xs">Show Total</p>
                <TokenCounter value={totalCost} prefix="$" size="medium" />
              </div>
              <div className="bg-black/30 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/10">
                <p className="text-white/60 text-xs">Judge Cost</p>
                <TokenCounter value={judgeCost} prefix="$" size="medium" />
              </div>
            </div>
          </div>

        </motion.div>
      </div>
    </motion.div>
  );
}