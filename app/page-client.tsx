'use client';

import { useState } from 'react';
import AnimeStage from './showdown-anime/components/StreamingAnimeStage';

export default function ShowdownAnimePage() {
  const [isShowActive, setIsShowActive] = useState(false);

  return (
    <div className="min-h-screen bg-white text-black relative">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap');
        
        /* Global styles for anime.js */
        * {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        
        /* Card shadows and depth */
        .card-shadow {
          filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
        }
        
        /* Paper texture */
        .paper-texture {
          background-image: 
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 40px,
              rgba(0,0,0,0.01) 40px,
              rgba(0,0,0,0.01) 80px
            );
        }
        
        /* Gradient animation for active cards */
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        /* Server status pulse */
        @keyframes server-pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>
      

      {/* Reset button - only show when active */}
      {isShowActive && (
        <div className="fixed bottom-8 right-8 z-50">
          <button
            onClick={() => setIsShowActive(false)}
            className="px-8 py-4 bg-black text-white text-lg tracking-wider hover:bg-gray-800 transition-colors duration-300 font-medium"
          >
            Reset
          </button>
        </div>
      )}

      {/* Main stage */}
      <AnimeStage 
        isActive={isShowActive} 
        onLaunchCards={() => setIsShowActive(true)}
      />
      
      {/* Server restart indicator */}
      <div className="fixed bottom-4 left-4 z-50">
        <div className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-md text-sm">
          <div 
            className="w-2 h-2 bg-green-400 rounded-full"
            style={{ animation: 'server-pulse 2s ease-in-out infinite' }}
          />
          <span className="font-mono text-xs">Server restarted • Ready</span>
        </div>
      </div>
    </div>
  );
}