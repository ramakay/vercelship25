'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface MinimalJudgeProps {
  phase: string;
  totalCost: number;
  activeModel: string | null;
}

export default function MinimalJudge({ phase, totalCost, activeModel }: MinimalJudgeProps) {
  const thoughts = {
    idle: '',
    'act-two': activeModel ? 'Observing...' : 'Awaiting performances',
    'act-three': 'Deliberating...'
  };

  const thought = thoughts[phase as keyof typeof thoughts] || thoughts.idle;

  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-40"
    >
      {/* Minimal line */}
      <div className="h-px bg-black opacity-20" />
      
      {/* Judge presence with depth */}
      <div className="max-w-6xl mx-auto px-8 py-6">
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-8">
            <motion.h3 
              className="text-sm font-light tracking-wider"
              style={{
                textShadow: '0.5px 0.5px 1px rgba(0,0,0,0.1)'
              }}
              animate={{
                opacity: thought ? 0.6 : 1
              }}
              transition={{ duration: 0.3 }}
            >
              JUDGE
            </motion.h3>
            <AnimatePresence mode="wait">
              {thought && (
                <motion.p
                  key={thought}
                  initial={{ opacity: 0, x: -10, y: 2 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  exit={{ opacity: 0, x: 10, y: -2 }}
                  className="text-sm text-gray-500 italic"
                  style={{ 
                    fontFamily: 'Caveat, cursive',
                    textShadow: '0.25px 0.25px 0.5px rgba(0,0,0,0.05)'
                  }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  {thought}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
          
          {/* Cost with animated counter */}
          <div className="text-sm font-light flex items-center gap-2">
            <motion.span 
              className="text-gray-400"
              animate={{ opacity: totalCost > 0 ? 0.6 : 0.4 }}
            >
              Cost
            </motion.span>
            <motion.span 
              className="ml-2 font-mono tabular-nums"
              style={{
                textShadow: totalCost > 0 ? '0.5px 0.5px 1px rgba(0,0,0,0.08)' : 'none'
              }}
              animate={{
                scale: totalCost > 0 ? 1.02 : 1,
                color: totalCost > 0.05 ? '#dc2626' : '#000'
              }}
              transition={{ scale: { duration: 0.2, type: "tween" } }}
            >
              ${totalCost.toFixed(4)}
            </motion.span>
            
            {/* Live indicator dot */}
            {activeModel && (
              <motion.div
                className="w-1.5 h-1.5 bg-red-500 rounded-full"
                animate={{ 
                  opacity: [0.3, 1, 0.3],
                  scale: [0.8, 1]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            )}
          </div>
        </div>
      </div>
      
      {/* Bottom line */}
      <div className="h-px bg-black opacity-20" />
    </motion.div>
  );
}