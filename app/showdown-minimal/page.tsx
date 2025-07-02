'use client';

import { useState } from 'react';
import MinimalStage from './components/MinimalStage';

export default function ShowdownMinimalPage() {
  const [isShowActive, setIsShowActive] = useState(false);

  return (
    <div className="min-h-screen bg-white text-black">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&display=swap');
        
        /* Global depth enhancements */
        * {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        
        /* Subtle texture overlay */
        body::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image: 
            repeating-linear-gradient(
              45deg,
              transparent,
              transparent 35px,
              rgba(0,0,0,0.01) 35px,
              rgba(0,0,0,0.01) 70px
            );
          pointer-events: none;
          z-index: 1;
        }
        
        /* Enhanced button states */
        button {
          transform-style: preserve-3d;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        button:active {
          transform: translateY(1px);
        }
      `}</style>
      
      {/* Enhanced header with depth */}
      <div className="fixed top-8 left-8 z-50">
        <h1 
          className="text-2xl font-light tracking-wider"
          style={{
            textShadow: `
              0.5px 0.5px 1px rgba(0,0,0,0.1),
              1px 1px 2px rgba(0,0,0,0.05)
            `
          }}
        >
          AI Showdown
        </h1>
        <p 
          className="text-sm text-gray-500 mt-1"
          style={{
            textShadow: '0.25px 0.25px 0.5px rgba(0,0,0,0.05)'
          }}
        >
          A silent opera in three acts
        </p>
      </div>

      {/* Enhanced button with depth and micro-animations */}
      <div className="fixed bottom-8 left-8 z-50">
        <button
          onClick={() => setIsShowActive(!isShowActive)}
          className="group relative px-6 py-3 border border-black text-sm tracking-wider overflow-hidden"
          style={{
            boxShadow: `
              1px 1px 0 rgba(0,0,0,0.1),
              2px 2px 0 rgba(0,0,0,0.05),
              3px 3px 0 rgba(0,0,0,0.025)
            `,
            transform: 'translateZ(0)'
          }}
        >
          {/* Background transition effect */}
          <span 
            className="absolute inset-0 bg-black transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out"
          />
          
          {/* Text with depth */}
          <span 
            className="relative z-10 group-hover:text-white transition-colors duration-300"
            style={{
              textShadow: '0.25px 0.25px 0.5px rgba(0,0,0,0.1)'
            }}
          >
            {isShowActive ? 'Reset' : 'Begin Performance'}
          </span>
          
          {/* Subtle corner accents */}
          <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-black opacity-50" />
          <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-black opacity-50" />
        </button>
      </div>

      {/* Main stage */}
      <MinimalStage isActive={isShowActive} />
    </div>
  );
}