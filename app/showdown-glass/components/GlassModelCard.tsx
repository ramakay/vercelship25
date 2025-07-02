'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import TokenCounter from './TokenCounter';

interface ModelData {
  id: string;
  name: string;
  response: string;
  cost: number;
  tokens: number;
  score?: number;
}

interface GlassModelCardProps {
  model: ModelData;
  isActive: boolean;
  position: 'offscreen-right' | 'center' | 'offscreen-left';
  stagePosition?: number;
}

const modelColors = {
  grok: { primary: '#00d4ff', secondary: '#0099cc' },
  claude: { primary: '#b565d8', secondary: '#9333ea' },
  gemini: { primary: '#ff6b6b', secondary: '#ff4444' }
};

export default function GlassModelCard({ model, isActive, position, stagePosition = 0 }: GlassModelCardProps) {
  const [isStreaming, setIsStreaming] = useState(false);
  const colors = modelColors[model.id as keyof typeof modelColors] || modelColors.grok;

  useEffect(() => {
    if (isActive && model.response) {
      setIsStreaming(true);
      const timer = setTimeout(() => setIsStreaming(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isActive, model.response]);

  // Position cards below the judge strip
  // Model-specific positioning
  const modelPositions: Record<string, { waiting: { x: number; y: number }, active: { x: number; y: number } }> = {
    grok: { 
      waiting: { x: -40, y: 10 },    // Left position
      active: { x: 0, y: 5 }          // Center stage
    },
    claude: { 
      waiting: { x: 0, y: 15 },       // Center back
      active: { x: 0, y: 5 }          // Center stage
    },
    gemini: { 
      waiting: { x: 40, y: 10 },      // Right position
      active: { x: 0, y: 5 }          // Center stage
    }
  };
  
  const modelPosition = modelPositions[model.id] || modelPositions.grok;

  const positionVariants = {
    'offscreen-right': { x: '150%', opacity: 0, scale: 0.8 },
    'center': { 
      x: isActive ? `${modelPosition.active.x}%` : `${modelPosition.waiting.x}%`, 
      y: isActive ? `${modelPosition.active.y}%` : `${modelPosition.waiting.y}%`,
      opacity: 1, 
      scale: isActive ? 1 : 0.8 
    },
    'offscreen-left': { x: '-150%', opacity: 0, scale: 0.8 }
  };

  return (
    <AnimatePresence>
      {position !== 'offscreen-right' && (
        <motion.div
          className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${isActive ? 'w-96' : 'w-80'}`}
          style={{ zIndex: isActive ? 30 : 10 }}
          variants={positionVariants}
          initial="offscreen-right"
          animate={position}
          exit="offscreen-left"
          transition={{
            x: { type: "spring", damping: 25, stiffness: 100 },
            y: { type: "spring", damping: 25, stiffness: 100 },
            opacity: { duration: 0.4 },
            scale: { duration: 0.4 }
          }}
        >
          {/* Glow effect when active */}
          {isActive && (
            <motion.div
              className="absolute -inset-10 rounded-3xl"
              animate={{
                boxShadow: [
                  `0 0 60px ${colors.primary}40`,
                  `0 0 80px ${colors.primary}60`,
                  `0 0 60px ${colors.primary}40`
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}

          {/* Glass card */}
          <motion.div
            className="relative bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden"
            animate={{
              rotateY: isActive ? [0, 5, 0] : 0,
              borderColor: isActive ? colors.primary : 'rgba(255, 255, 255, 0.2)',
              padding: isActive ? 24 : 16
            }}
            transition={{ duration: 1 }}
            style={{
              transform: isActive ? 'scale(1)' : 'scale(0.6)'
            }}
          >
            {/* Model header */}
            <div className="flex items-center justify-between mb-4">
              <h3 
                className="text-2xl font-bold"
                style={{
                  color: colors.primary,
                  textShadow: `0 0 20px ${colors.primary}80`
                }}
              >
                {model.name}
              </h3>
              {isActive && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 rounded-full"
                  style={{
                    background: `conic-gradient(from 0deg, ${colors.primary}, ${colors.secondary}, ${colors.primary})`
                  }}
                />
              )}
            </div>

            {/* Response area */}
            <div className={`bg-black/20 backdrop-blur-sm rounded-xl p-4 mb-4 overflow-hidden transition-all duration-500 ${isActive ? 'h-40' : 'h-24'}`}>
              {isStreaming ? (
                <motion.div className="text-white/90 text-sm">
                  {model.response.split('').map((char, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.01 }}
                    >
                      {char}
                    </motion.span>
                  ))}
                  <motion.span
                    className="inline-block w-2 h-4 bg-white/60 ml-1"
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  />
                </motion.div>
              ) : (
                <p className="text-white/80 text-sm">{model.response || 'Awaiting response...'}</p>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-black/10 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                <p className="text-white/60 text-xs mb-1">Tokens</p>
                <p className="text-white font-mono text-lg">{model.tokens}</p>
              </div>
              <div className="bg-black/10 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                <p className="text-white/60 text-xs mb-1">Cost</p>
                <TokenCounter value={model.cost} prefix="$" size="small" glowColor={colors.primary} />
              </div>
            </div>

            {/* Score (if available) */}
            {model.score !== undefined && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 text-center"
              >
                <p className="text-white/60 text-sm">Score</p>
                <p className="text-3xl font-bold" style={{ color: colors.primary }}>
                  {model.score}/20
                </p>
              </motion.div>
            )}

            {/* Animated border gradient */}
            {isActive && (
              <motion.div
                className="absolute inset-0 rounded-3xl pointer-events-none"
                style={{
                  background: `linear-gradient(45deg, transparent 30%, ${colors.primary}20, transparent 70%)`,
                }}
                animate={{
                  backgroundPosition: ['0% 0%', '100% 100%'],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatType: 'reverse'
                }}
              />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}