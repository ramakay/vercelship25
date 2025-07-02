'use client';

import { useState } from 'react';
import { Button } from '@radix-ui/themes';
import ShowdownStage from './components/ShowdownStage';

export default function ShowdownGlassPage() {
  const [isShowActive, setIsShowActive] = useState(false);
  const [useMockData, setUseMockData] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a1f] to-[#1a0f3a] overflow-hidden">
      {/* Header */}
      <div className="relative z-10 p-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          AI Showdown: Entertainment Night
        </h1>
        <p className="text-gray-300 mb-6">
          Glassmorphic design meets Vegas-style entertainment
        </p>
        
        <div className="flex gap-4 items-center">
          <Button
            size="3"
            variant="outline"
            onClick={() => setIsShowActive(!isShowActive)}
            className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20"
          >
            {isShowActive ? 'Reset Show' : 'Start the Show! 🎭'}
          </Button>
          
          <label className="flex items-center gap-2 text-white/80">
            <input
              type="checkbox"
              checked={useMockData}
              onChange={(e) => setUseMockData(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">Use Mock Data (No AI Credits)</span>
          </label>
        </div>
      </div>

      {/* Main Stage */}
      <ShowdownStage
        isActive={isShowActive}
        useMockData={useMockData}
        onShowComplete={() => setIsShowActive(false)}
      />
    </div>
  );
}