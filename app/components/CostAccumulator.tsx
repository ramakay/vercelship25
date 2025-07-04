'use client';

import { useEffect, useState } from 'react';

interface CostAccumulatorProps {
  sessionCost: number;
  isStreaming?: boolean;
}

export default function CostAccumulator({ 
  sessionCost, 
  isStreaming = false
}: CostAccumulatorProps) {
  const [animatedCost, setAnimatedCost] = useState(0);

  // Animate cost counter
  useEffect(() => {
    const duration = isStreaming ? 100 : 500;
    const steps = 20;
    const increment = (sessionCost - animatedCost) / steps;
    
    let currentStep = 0;
    const timer = setInterval(() => {
      if (currentStep < steps) {
        setAnimatedCost(prev => prev + increment);
        currentStep++;
      } else {
        setAnimatedCost(sessionCost);
        clearInterval(timer);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [sessionCost, animatedCost, isStreaming]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Session Cost</h3>
        {isStreaming && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-xs text-gray-500">Live</span>
          </div>
        )}
      </div>

      {/* Session cost display */}
      <div className="text-center py-4">
        <div className="text-4xl font-mono font-bold text-gray-900">
          ${animatedCost.toFixed(6)}
        </div>
        <div className="text-sm text-gray-500 mt-2">
          Current session
        </div>
      </div>

      {/* Simple note */}
      <div className="text-xs text-gray-400 text-center mt-4 border-t pt-4">
        Cost updates as models generate responses
      </div>
    </div>
  );
}