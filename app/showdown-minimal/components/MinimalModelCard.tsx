'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface ModelData {
  id: string;
  name: string;
  response: string;
  cost: number;
  tokens: number;
  position: string;
}

interface MinimalModelCardProps {
  model: ModelData;
  isActive: boolean;
  delay: number;
}

export default function MinimalModelCard({ model, isActive, delay }: MinimalModelCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, rotateY: -15 }}
      animate={{ 
        opacity: model.position === 'onstage' ? 1 : 0,
        y: 0,
        scale: isActive ? 1.08 : 1,
        rotateY: isActive ? 0 : (isHovered ? -5 : -10),
        z: isActive ? 50 : 0
      }}
      transition={{ 
        delay: delay / 1000,
        duration: 0.8,
        scale: { duration: 0.3, ease: "easeOut" },
        rotateY: { duration: 0.6, ease: "easeOut" }
      }}
      className="relative w-64"
      style={{ 
        transformStyle: 'preserve-3d',
        perspective: '1000px'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Geometric frame with depth */}
      <div className="absolute inset-0">
        {/* Shadow layers for depth */}
        <div 
          className="absolute inset-0 bg-black opacity-5"
          style={{ transform: 'translate(2px, 2px)' }}
        />
        <div 
          className="absolute inset-0 bg-black opacity-3"
          style={{ transform: 'translate(1px, 1px)' }}
        />
        
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 256 320"
          preserveAspectRatio="none"
        >
          {/* Main frame */}
          <rect
            x="1"
            y="1"
            width="254"
            height="318"
            fill="white"
            stroke="black"
            strokeWidth={isActive ? "2" : "1"}
            className="transition-all duration-300"
          />
          
          {/* Active state animations */}
          {isActive && (
            <>
              <motion.rect
                x="1"
                y="1"
                width="254"
                height="318"
                fill="none"
                stroke="black"
                strokeWidth="1"
                strokeDasharray="10 5"
                initial={{ strokeDashoffset: 0 }}
                animate={{ strokeDashoffset: -15 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              
              {/* Corner highlights */}
              <motion.path
                d="M1,20 L1,1 L20,1"
                fill="none"
                stroke="black"
                strokeWidth="2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
              <motion.path
                d="M236,1 L255,1 L255,20"
                fill="none"
                stroke="black"
                strokeWidth="2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
              />
            </>
          )}
          
          {/* Hover effect */}
          {isHovered && !isActive && (
            <motion.rect
              x="1"
              y="1"
              width="254"
              height="318"
              fill="none"
              stroke="gray"
              strokeWidth="0.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </svg>
      </div>

      {/* Content */}
      <div className="relative p-8">
        {/* Model name with depth */}
        <motion.h3 
          className="text-lg font-light tracking-wider mb-6"
          style={{
            textShadow: isActive 
              ? '1px 1px 2px rgba(0,0,0,0.1), 2px 2px 4px rgba(0,0,0,0.05)'
              : '0.5px 0.5px 1px rgba(0,0,0,0.08)'
          }}
          animate={{
            letterSpacing: isActive ? '0.15em' : '0.12em'
          }}
          transition={{ duration: 0.3 }}
        >
          {model.name.toUpperCase()}
        </motion.h3>

        {/* Response area with gradient fade */}
        <div className="min-h-[120px] mb-6 relative overflow-hidden">
          {model.response && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative"
            >
              <motion.p
                className="text-sm leading-relaxed"
                style={{ 
                  fontFamily: 'Caveat, cursive', 
                  fontSize: '18px',
                  color: 'transparent',
                  backgroundImage: 'linear-gradient(to bottom, rgba(0,0,0,0.9), rgba(0,0,0,0.8), rgba(0,0,0,0.4), rgba(0,0,0,0.1))',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  textShadow: isActive ? '0.5px 0.5px 1px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                "{model.response}"
              </motion.p>
              
              {/* Bottom fade overlay */}
              <div 
                className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none"
                style={{
                  background: 'linear-gradient(to bottom, transparent, white)'
                }}
              />
            </motion.div>
          )}
          
          {/* Enhanced loading animation */}
          {isActive && !model.response && (
            <div className="flex items-center gap-2">
              {/* Thinking dots with wave effect */}
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 bg-black rounded-full"
                    animate={{ 
                      opacity: [0.2, 1, 0.2],
                      y: [0, -3, 0]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.15,
                      ease: "easeInOut"
                    }}
                  />
                ))}
              </div>
              
              {/* Pulse ring */}
              <motion.div
                className="w-3 h-3 rounded-full border border-gray-300"
                animate={{ 
                  scale: [1, 1.5],
                  opacity: [0.5, 0]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeOut"
                }}
              />
            </div>
          )}
        </div>

        {/* Stats with micro-animations */}
        <motion.div 
          className="space-y-1 text-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.div 
            className="flex justify-between items-center"
            whileHover={{ x: 2 }}
            transition={{ duration: 0.2 }}
          >
            <span className="text-gray-600" style={{ textShadow: '0.25px 0.25px 0.5px rgba(0,0,0,0.05)' }}>tokens</span>
            <motion.span 
              className="font-mono text-gray-800"
              animate={{ opacity: model.tokens > 0 ? 1 : 0.3 }}
            >
              {model.tokens > 0 && (
                <motion.span
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {model.tokens}
                </motion.span>
              )}
              {model.tokens === 0 && '—'}
            </motion.span>
          </motion.div>
          
          <motion.div 
            className="flex justify-between items-center"
            whileHover={{ x: 2 }}
            transition={{ duration: 0.2 }}
          >
            <span className="text-gray-600" style={{ textShadow: '0.25px 0.25px 0.5px rgba(0,0,0,0.05)' }}>cost</span>
            <motion.span 
              className="font-mono text-gray-800"
              animate={{ opacity: model.cost > 0 ? 1 : 0.3 }}
            >
              {model.cost > 0 && (
                <motion.span
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    color: model.cost > 0.01 ? '#dc2626' : 'inherit'
                  }}
                >
                  ${model.cost.toFixed(4)}
                </motion.span>
              )}
              {model.cost === 0 && '—'}
            </motion.span>
          </motion.div>
        </motion.div>
      </div>

      {/* Active indicator with glow */}
      {isActive && (
        <>
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
          
          {/* Subtle glow effect */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.05 }}
            transition={{ duration: 0.3 }}
            style={{
              boxShadow: 'inset 0 0 20px rgba(0,0,0,0.1)'
            }}
          />
        </>
      )}
      
      {/* Hover highlight */}
      {isHovered && !isActive && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          style={{
            background: 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.02) 100%)'
          }}
        />
      )}
    </motion.div>
  );
}