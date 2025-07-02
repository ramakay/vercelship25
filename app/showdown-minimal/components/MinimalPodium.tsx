'use client';

import { motion } from 'framer-motion';

interface ModelData {
  id: string;
  name: string;
  cost: number;
}

interface MinimalPodiumProps {
  models: ModelData[];
  totalCost: number;
}

export default function MinimalPodium({ models, totalCost }: MinimalPodiumProps) {
  // Mock rankings
  const rankings = [
    { model: models[1], rank: 1, score: 18 }, // Claude
    { model: models[2], rank: 2, score: 17 }, // Gemini
    { model: models[0], rank: 3, score: 16 }  // Grok
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, ease: "easeOut" }}
      className="absolute inset-0 flex items-center justify-center"
      style={{ perspective: '1500px' }}
    >
      <motion.div 
        className="text-center"
        initial={{ rotateX: -5 }}
        animate={{ rotateX: 0 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Title with depth */}
        <motion.div
          initial={{ opacity: 0, y: -20, z: -50 }}
          animate={{ opacity: 1, y: 0, z: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="mb-16"
        >
          <motion.h2 
            className="text-5xl font-light tracking-widest mb-4"
            style={{
              textShadow: `
                1px 1px 2px rgba(0,0,0,0.15),
                2px 2px 4px rgba(0,0,0,0.1),
                4px 4px 8px rgba(0,0,0,0.05)
              `
            }}
            animate={{ 
              letterSpacing: ['0.2em', '0.3em', '0.2em'] 
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            Finale
          </motion.h2>
          <motion.p 
            className="text-lg text-gray-600" 
            style={{ 
              fontFamily: 'Caveat, cursive',
              textShadow: '0.5px 0.5px 1px rgba(0,0,0,0.1)'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            "The verdict has been reached"
          </motion.p>
        </motion.div>

        {/* Rankings with depth and highlights */}
        <div className="space-y-8">
          {rankings.map((item, index) => (
            <motion.div
              key={item.model.id}
              initial={{ opacity: 0, x: -50, rotateY: -10 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              transition={{ 
                delay: 1 + index * 0.3,
                duration: 0.8,
                ease: "easeOut"
              }}
              whileHover={{ 
                scale: 1.05,
                x: 10,
                transition: { duration: 0.2 }
              }}
              className="flex items-center justify-center gap-8 relative"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Highlight bar for winner */}
              {item.rank === 1 && (
                <motion.div
                  className="absolute inset-0 -mx-16 -my-2"
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 0.05, scaleX: 1 }}
                  transition={{ delay: 1.5, duration: 0.5 }}
                  style={{
                    background: 'linear-gradient(to right, transparent, black, transparent)'
                  }}
                />
              )}
              
              {/* Rank with animation */}
              <motion.span 
                className="text-3xl font-light w-12 text-right"
                style={{
                  textShadow: item.rank === 1 
                    ? '1px 1px 2px rgba(0,0,0,0.2)' 
                    : '0.5px 0.5px 1px rgba(0,0,0,0.1)',
                  color: item.rank === 1 ? '#000' : '#374151'
                }}
                animate={item.rank === 1 ? {
                  scale: [1, 1.1]
                } : {}}
                transition={{ 
                  duration: 1, 
                  repeat: Infinity,
                  repeatType: "reverse",
                  delay: 2 
                }}
              >
                {item.rank}
              </motion.span>
              
              {/* Animated divider */}
              <motion.div 
                className="w-px h-12 bg-black"
                initial={{ height: 0 }}
                animate={{ height: 48 }}
                transition={{ delay: 1.2 + index * 0.3, duration: 0.3 }}
                style={{ opacity: item.rank === 1 ? 0.3 : 0.2 }}
              />
              
              {/* Model name with depth */}
              <motion.span 
                className="text-2xl font-light tracking-wider w-32 text-left"
                style={{
                  textShadow: '0.5px 0.5px 1px rgba(0,0,0,0.1)'
                }}
              >
                {item.model.name.toUpperCase()}
              </motion.span>
              
              {/* Score with color coding */}
              <motion.span 
                className="text-lg font-light"
                style={{
                  color: item.score >= 18 ? '#059669' : (item.score >= 17 ? '#374151' : '#dc2626'),
                  textShadow: '0.25px 0.25px 0.5px rgba(0,0,0,0.05)'
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  delay: 1.5 + index * 0.3,
                  type: "spring",
                  stiffness: 200
                }}
              >
                {item.score}/20
              </motion.span>
            </motion.div>
          ))}
        </div>

        {/* Total cost with emphasis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.5, duration: 0.8 }}
          className="mt-16"
        >
          <motion.div 
            className="text-sm text-gray-500 flex items-center justify-center gap-4"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <motion.span 
              className="tracking-wider"
              style={{ textShadow: '0.25px 0.25px 0.5px rgba(0,0,0,0.05)' }}
            >
              TOTAL COST
            </motion.span>
            
            {/* Animated separator */}
            <motion.div
              className="w-8 h-px bg-gray-400"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 2.8, duration: 0.5 }}
            />
            
            <motion.span 
              className="font-mono tabular-nums"
              style={{
                textShadow: '0.5px 0.5px 1px rgba(0,0,0,0.08)',
                color: totalCost > 0.1 ? '#dc2626' : 'inherit'
              }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                delay: 3,
                duration: 0.5,
                type: "spring",
                stiffness: 150,
                damping: 12
              }}
            >
              ${totalCost.toFixed(4)}
            </motion.span>
          </motion.div>
          
          {/* Subtle celebration for under budget */}
          {totalCost < 0.1 && (
            <motion.p
              className="text-xs text-green-600 mt-2 text-center"
              style={{ fontFamily: 'Caveat, cursive' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3.5 }}
            >
              "Under budget!"
            </motion.p>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}