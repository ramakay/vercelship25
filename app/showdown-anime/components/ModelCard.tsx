'use client';

import { useState, useEffect } from 'react';
import { Maximize2 } from 'react-feather';
import MarkdownRenderer from './MarkdownRenderer';

interface ModelData {
  id: string;
  name: string;
  response: string;
  cost: number;
  tokens: number;
  status: string;
}

interface ModelCardProps {
  id: string;
  model: ModelData;
  isActive: boolean;
}

export default function ModelCard({ id, model, isActive }: ModelCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Handle escape key to close modal
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false);
      }
    };
    
    if (isModalOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isModalOpen]);
  
  // No preview needed since we'll show full content with scroll
  return (
    <div
      id={id}
      className="model-card relative w-[380px] h-[540px] card-shadow opacity-0"
      style={{
        transformStyle: 'preserve-3d',
        transform: 'rotateY(-5deg)',
        zIndex: 50,
        position: 'relative'
      }}
    >
      {/* Card background */}
      <div className="absolute inset-0 bg-white rounded-lg border border-gray-200">
        {/* Paper texture overlay */}
        <div className="absolute inset-0 opacity-5 rounded-lg"
          style={{
            backgroundImage: `
              repeating-linear-gradient(
                45deg,
                transparent,
                transparent 35px,
                rgba(0,0,0,0.02) 35px,
                rgba(0,0,0,0.02) 70px
              )
            `
          }}
        />
      </div>

      {/* Card content */}
      <div className="relative p-8 h-full flex flex-col">
        {/* Header with gradient highlight */}
        <div className="mb-6 relative">
          <div className="absolute -inset-x-4 -inset-y-2 bg-gradient-to-r from-transparent via-yellow-100 to-transparent opacity-50 blur-sm" />
          <h3 className="text-3xl font-light tracking-wider text-gray-800 relative">
            {model.name.toUpperCase()}
          </h3>
          <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent mt-3" />
        </div>

        {/* Response area with animated highlight border */}
        <div className="flex-1 mb-6 relative">
          <div 
            className="absolute inset-0 rounded-lg"
            style={{
              backgroundImage: isActive ? 'linear-gradient(45deg, #fbbf24, #f59e0b, #fbbf24)' : 'none',
              backgroundSize: '200% 200%',
              animation: isActive ? 'gradient-shift 3s ease infinite' : 'none',
              padding: '2px'
            }}
          >
            <div className="bg-gray-50 rounded-lg h-full" />
          </div>
          <div className="relative bg-gray-50 rounded-lg p-6 h-full flex flex-col" style={{ height: '280px' }}>
            <div className="flex-1 overflow-y-auto overflow-x-hidden" style={{ maxHeight: '220px' }}>
              {model.response ? (
                <MarkdownRenderer text={model.response} className="text-sm" />
              ) : null}
            </div>
            {model.response && model.response.length > 0 && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-3 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                style={{ fontFamily: 'Monaco, Consolas, monospace', fontSize: '12px' }}
              >
                <Maximize2 size={14} />
                View Full Response
              </button>
            )}
          </div>
        </div>

        {/* Stats with highlight on cost */}
        <div className="space-y-2 text-lg">
          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-xl">tokens</span>
            <span className="font-mono text-gray-700 text-xl bg-blue-50 px-2 py-1 rounded">
              {model.tokens || '—'}
            </span>
          </div>
          <div className="flex justify-between items-center relative">
            <span className="text-gray-500 text-xl">cost</span>
            <span 
              className="font-mono text-gray-700 text-xl relative"
              style={{
                backgroundImage: model.cost > 0 ? 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' : 'none',
                backgroundColor: model.cost > 0 ? 'transparent' : 'transparent',
                padding: '4px 12px',
                borderRadius: '6px',
                boxShadow: model.cost > 0 ? '0 2px 4px rgba(251, 191, 36, 0.2)' : 'none'
              }}
            >
              {model.cost > 0 ? `$${model.cost.toFixed(4)}` : '—'}
            </span>
          </div>
        </div>

        {/* Status indicator */}
        {isActive && (
          <div className="absolute top-4 right-4">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          </div>
        )}
      </div>
      
      {/* Full Response Modal - Fullscreen */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 z-[1000]"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="fixed inset-0 bg-white overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with close button */}
            <div className="bg-white border-b border-gray-200 px-8 py-6 flex items-center justify-between shrink-0">
              <h3 className="text-3xl font-light tracking-wider text-gray-800">
                {model.name.toUpperCase()} RESPONSE
              </h3>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">Press ESC to close</span>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-3 hover:bg-gray-100 rounded-full transition-colors group"
                  aria-label="Close modal"
                >
                  <svg 
                    width="28" 
                    height="28" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                    className="group-hover:rotate-90 transition-transform duration-200"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Content area - scrollable */}
            <div className="flex-1 overflow-y-auto bg-gray-50">
              <div className="max-w-5xl mx-auto px-8 py-12">
                <MarkdownRenderer text={model.response} />
              </div>
            </div>
            
            {/* Footer with metadata */}
            <div className="bg-white border-t border-gray-200 px-8 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <span>Tokens: {model.tokens || '—'}</span>
                <span>Cost: {model.cost > 0 ? `$${model.cost.toFixed(4)}` : '—'}</span>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}