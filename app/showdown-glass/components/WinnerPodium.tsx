'use client';

import { motion } from 'framer-motion';
import TokenCounter from './TokenCounter';

interface ModelData {
  id: string;
  name: string;
  cost: number;
  score?: number;
}

interface WinnerPodiumProps {
  models: ModelData[];
  totalCost: number;
}

const podiumColors = {
  1: { base: '#FFD700', glow: '#FFA500' }, // Gold
  2: { base: '#C0C0C0', glow: '#E5E5E5' }, // Silver  
  3: { base: '#CD7F32', glow: '#D2691E' }  // Bronze
};

export default function WinnerPodium({ models, totalCost }: WinnerPodiumProps) {
  // Mock scores for now - in real implementation, these would come from judge evaluation
  const rankedModels = [
    { ...models[1], score: 18, rank: 1 }, // Claude wins
    { ...models[2], score: 17, rank: 2 }, // Gemini second
    { ...models[0], score: 16, rank: 3 }  // Grok third
  ];

  const podiumHeights = { 1: 200, 2: 150, 3: 100 };
  const podiumPositions = { 1: 0, 2: -250, 3: 250 };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative w-full h-full flex items-end justify-center pb-20"
    >
      {/* Title */}
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: -400, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="absolute text-center"
      >
        <h2 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-300 mb-2">
          And the Winner is...
        </h2>
        <motion.p
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1, type: "spring" }}
          className="text-3xl text-white"
        >
          {rankedModels[0].name}!
        </motion.p>
      </motion.div>

      {/* Podiums */}
      {rankedModels.map((model, index) => {
        const rank = model.rank;
        const colors = podiumColors[rank as keyof typeof podiumColors];
        
        return (
          <motion.div
            key={model.id}
            className="absolute"
            initial={{ y: 500 }}
            animate={{ 
              y: 0,
              x: podiumPositions[rank as keyof typeof podiumPositions] 
            }}
            transition={{ 
              delay: 0.5 + (3 - rank) * 0.3,
              type: "spring",
              damping: 15
            }}
          >
            {/* Model card on podium */}
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: -20 }}
              transition={{ delay: 1.5 + index * 0.2 }}
              className="absolute bottom-full mb-4 -translate-x-1/2 left-1/2"
            >
              <div 
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl"
                style={{
                  boxShadow: `0 0 40px ${colors.glow}40`
                }}
              >
                <h3 className="text-xl font-bold text-white mb-2">{model.name}</h3>
                <div className="text-center">
                  <p className="text-4xl font-bold mb-1" style={{ color: colors.base }}>
                    #{rank}
                  </p>
                  <p className="text-white/80">Score: {model.score}/20</p>
                  <div className="mt-2">
                    <TokenCounter value={model.cost} prefix="$" size="small" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Podium base */}
            <motion.div
              className="relative overflow-hidden"
              style={{
                width: '200px',
                height: `${podiumHeights[rank as keyof typeof podiumHeights]}px`,
                background: `linear-gradient(135deg, ${colors.base}40, ${colors.base}20)`,
                backdropFilter: 'blur(10px)',
                border: `2px solid ${colors.base}60`,
                borderRadius: '8px 8px 0 0',
                boxShadow: `0 0 30px ${colors.glow}40`
              }}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring" }}
            >
              {/* Rank number on podium */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span 
                  className="text-6xl font-bold"
                  style={{ 
                    color: colors.base,
                    textShadow: `0 0 20px ${colors.glow}`
                  }}
                >
                  {rank}
                </span>
              </div>

              {/* Animated shine effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{
                  x: ['-100%', '100%']
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatDelay: 2
                }}
              />
            </motion.div>
          </motion.div>
        );
      })}

      {/* Total cost display */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2.5, type: "spring" }}
        className="absolute bottom-10 bg-black/50 backdrop-blur-md rounded-2xl px-8 py-4 border border-yellow-500/30"
      >
        <p className="text-white/80 text-sm mb-1">Total Show Cost</p>
        <TokenCounter value={totalCost} prefix="$" size="large" glowColor="#FFD700" />
      </motion.div>

      {/* Trophy for winner */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 3, type: "spring" }}
        className="absolute top-1/4"
      >
        <div className="text-8xl">🏆</div>
      </motion.div>
    </motion.div>
  );
}