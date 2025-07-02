'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface ParticleEffectsProps {
  type: 'confetti' | 'sparkles' | 'celebration';
}

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
  velocity: { x: number; y: number };
}

export default function ParticleEffects({ type }: ParticleEffectsProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const colors = ['#FFD700', '#FF69B4', '#00CED1', '#FF6347', '#9370DB', '#00FF00'];
    const particleCount = type === 'celebration' ? 150 : 50;
    
    const newParticles: Particle[] = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: type === 'confetti' ? -10 : Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 20 + 10,
      rotation: Math.random() * 360,
      velocity: {
        x: (Math.random() - 0.5) * 5,
        y: type === 'confetti' ? Math.random() * 5 + 5 : (Math.random() - 0.5) * 3
      }
    }));

    setParticles(newParticles);
  }, [type]);

  const getParticleShape = (particle: Particle) => {
    if (type === 'sparkles') {
      return (
        <svg width={particle.size} height={particle.size} viewBox="0 0 24 24">
          <path
            d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z"
            fill={particle.color}
          />
        </svg>
      );
    }
    
    // Confetti rectangle
    return (
      <div
        className="w-full h-full"
        style={{
          backgroundColor: particle.color,
          borderRadius: '2px',
          transform: `rotate(${particle.rotation}deg)`
        }}
      />
    );
  };

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute"
          initial={{
            x: `${particle.x}vw`,
            y: `${particle.y}vh`,
            scale: 0,
            rotate: 0
          }}
          animate={{
            x: `${particle.x + particle.velocity.x * 20}vw`,
            y: type === 'confetti' ? '110vh' : `${particle.y + particle.velocity.y * 20}vh`,
            scale: [0, 1, 1, 0],
            rotate: particle.rotation + 720
          }}
          transition={{
            duration: type === 'confetti' ? 4 : 3,
            ease: type === 'confetti' ? 'easeIn' : 'easeOut',
            times: [0, 0.2, 0.8, 1]
          }}
          style={{
            width: particle.size,
            height: particle.size
          }}
        >
          {getParticleShape(particle)}
        </motion.div>
      ))}

      {/* Extra effects for celebration */}
      {type === 'celebration' && (
        <>
          {/* Fireworks */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={`firework-${i}`}
              className="absolute"
              initial={{ 
                x: `${30 + i * 20}vw`, 
                y: '100vh',
                scale: 0 
              }}
              animate={{
                y: '30vh',
                scale: [0, 0, 1, 0]
              }}
              transition={{
                duration: 2,
                delay: i * 0.5,
                times: [0, 0.6, 0.8, 1]
              }}
            >
              <div className="relative w-32 h-32">
                {Array.from({ length: 12 }, (_, j) => (
                  <motion.div
                    key={j}
                    className="absolute w-2 h-16 bg-gradient-to-t from-yellow-400 to-transparent"
                    style={{
                      left: '50%',
                      top: '50%',
                      transformOrigin: 'center bottom',
                      transform: `rotate(${j * 30}deg) translateX(-50%)`
                    }}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: [0, 1, 0] }}
                    transition={{
                      duration: 0.5,
                      delay: 1.2 + i * 0.5
                    }}
                  />
                ))}
              </div>
            </motion.div>
          ))}

          {/* Glitter rain */}
          <div className="absolute inset-0">
            {Array.from({ length: 50 }, (_, i) => (
              <motion.div
                key={`glitter-${i}`}
                className="absolute w-1 h-1 bg-white rounded-full"
                initial={{
                  x: `${Math.random() * 100}vw`,
                  y: '-5vh',
                  opacity: 0
                }}
                animate={{
                  y: '105vh',
                  opacity: [0, 1, 1, 0]
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  delay: Math.random() * 2,
                  repeat: Infinity,
                  ease: 'linear'
                }}
                style={{
                  filter: 'blur(0.5px)',
                  boxShadow: '0 0 6px rgba(255, 255, 255, 0.8)'
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}