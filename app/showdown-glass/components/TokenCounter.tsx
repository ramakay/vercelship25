'use client';

import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';

interface TokenCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  size?: 'small' | 'medium' | 'large';
  glowColor?: string;
}

export default function TokenCounter({ 
  value, 
  prefix = '', 
  suffix = '', 
  size = 'medium',
  glowColor = '#facc15'
}: TokenCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const springValue = useSpring(0, { damping: 30, stiffness: 100 });
  
  const sizeClasses = {
    small: 'text-lg font-mono',
    medium: 'text-2xl font-mono',
    large: 'text-4xl font-mono'
  };

  useEffect(() => {
    springValue.set(value);
  }, [value, springValue]);

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      setDisplayValue(latest);
    });
    return unsubscribe;
  }, [springValue]);

  // Format number with proper decimal places
  const formattedValue = displayValue.toFixed(4);
  const [whole, decimal] = formattedValue.split('.');

  // Split into individual digits for animation
  const digits = whole.split('');
  const decimalDigits = decimal.split('');

  return (
    <div className={`${sizeClasses[size]} flex items-baseline`}>
      {prefix && <span className="text-yellow-400 mr-1">{prefix}</span>}
      
      {/* Whole number part */}
      <div className="flex">
        {digits.map((digit, index) => (
          <motion.span
            key={`whole-${index}`}
            className="inline-block text-white"
            style={{
              textShadow: `0 0 20px ${glowColor}`,
              fontFamily: 'monospace',
              fontVariantNumeric: 'tabular-nums'
            }}
            animate={{
              y: [0, -5, 0],
            }}
            transition={{
              duration: 0.3,
              delay: index * 0.05,
              repeat: displayValue > 0 && displayValue < value ? Infinity : 0,
              repeatDelay: 0.5
            }}
          >
            {digit}
          </motion.span>
        ))}
      </div>

      {/* Decimal point */}
      <span className="text-white/60 mx-0.5">.</span>

      {/* Decimal part - rolls faster for effect */}
      <div className="flex">
        {decimalDigits.map((digit, index) => (
          <motion.span
            key={`decimal-${index}`}
            className="inline-block text-white/80"
            style={{
              textShadow: `0 0 15px ${glowColor}`,
              fontFamily: 'monospace',
              fontVariantNumeric: 'tabular-nums'
            }}
            animate={displayValue > 0 && displayValue < value ? {
              y: [0, -10, 0],
            } : {}}
            transition={{
              duration: 0.15,
              delay: index * 0.02,
              repeat: displayValue > 0 && displayValue < value ? Infinity : 0,
            }}
          >
            {digit}
          </motion.span>
        ))}
      </div>

      {suffix && <span className="text-yellow-400 ml-1">{suffix}</span>}

      {/* Glow effect when changing */}
      {displayValue > 0 && displayValue < value && (
        <motion.div
          className="absolute inset-0 rounded-lg"
          animate={{
            boxShadow: [
              `0 0 10px ${glowColor}`,
              `0 0 20px ${glowColor}`,
              `0 0 10px ${glowColor}`
            ]
          }}
          transition={{
            duration: 1,
            repeat: Infinity
          }}
          style={{ pointerEvents: 'none' }}
        />
      )}
    </div>
  );
}