'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface SpotlightControllerProps {
  target: 'none' | 'judge' | 'model' | 'podium';
  phase: string;
}

export default function SpotlightController({ target, phase }: SpotlightControllerProps) {
  const spotlightPositions = {
    none: { x: '50%', y: '-100%' },
    judge: { x: '50%', y: '50%' },
    model: { x: '50%', y: '45%' },
    podium: { x: '50%', y: '60%' }
  };

  const spotlightSizes = {
    none: { width: '0px', height: '0px' },
    judge: { width: '600px', height: '600px' },
    model: { width: '500px', height: '500px' },
    podium: { width: '800px', height: '600px' }
  };

  const spotlightColors = {
    none: 'transparent',
    judge: 'rgba(255, 215, 0, 0.15)', // Golden
    model: 'rgba(100, 200, 255, 0.15)', // Blue-white
    podium: 'rgba(255, 255, 255, 0.2)' // Pure white
  };

  return (
    <>
      {/* Main spotlight */}
      <AnimatePresence>
        {target !== 'none' && (
          <motion.div
            className="absolute pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: 1,
              x: spotlightPositions[target].x,
              y: spotlightPositions[target].y,
              width: spotlightSizes[target].width,
              height: spotlightSizes[target].height
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            style={{
              transform: 'translate(-50%, -50%)',
              background: `radial-gradient(circle, ${spotlightColors[target]}, transparent 70%)`,
              filter: 'blur(40px)'
            }}
          />
        )}
      </AnimatePresence>

      {/* Secondary moving spotlights for atmosphere */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Left roaming spotlight */}
        <motion.div
          className="absolute w-96 h-96"
          animate={{
            x: ['-20%', '20%', '-20%'],
            y: ['80%', '60%', '80%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{
            background: 'radial-gradient(circle, rgba(147, 51, 234, 0.1), transparent 60%)',
            filter: 'blur(60px)'
          }}
        />

        {/* Right roaming spotlight */}
        <motion.div
          className="absolute w-96 h-96"
          animate={{
            x: ['120%', '80%', '120%'],
            y: ['60%', '80%', '60%'],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{
            background: 'radial-gradient(circle, rgba(236, 72, 153, 0.1), transparent 60%)',
            filter: 'blur(60px)'
          }}
        />
      </div>

      {/* Stage lighting effects based on phase */}
      {phase === 'finale' && (
        <>
          {/* Celebration spotlights */}
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={`celebration-${i}`}
              className="absolute w-64 h-[800px]"
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0, 0.3, 0],
                rotate: [0, 360],
                x: `${25 + i * 25}%`,
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "linear"
              }}
              style={{
                bottom: 0,
                transformOrigin: 'bottom center',
                background: `linear-gradient(to top, rgba(${i % 2 ? '255, 215, 0' : '100, 200, 255'}, 0.2), transparent)`,
                clipPath: 'polygon(40% 100%, 50% 0%, 60% 100%)'
              }}
            />
          ))}
        </>
      )}

      {/* Ambient stage lights */}
      <div className="absolute bottom-0 left-0 right-0 h-32">
        <div className="absolute inset-0 bg-gradient-to-t from-purple-500/10 via-transparent to-transparent" />
        {/* Stage edge lights */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>
    </>
  );
}