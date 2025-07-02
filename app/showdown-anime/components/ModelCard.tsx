'use client';

import { useState } from 'react';
import { Maximize2 } from 'react-feather';

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
  
  // Extract preview text (first 150 chars)
  const previewText = model.response.length > 150 
    ? model.response.substring(0, 147) + '...' 
    : model.response;
  return (
    <div
      id={id}
      className="model-card relative w-[380px] h-[520px] card-shadow opacity-0"
      style={{
        transformStyle: 'preserve-3d',
        transform: 'rotateY(-5deg)'
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
          <div className="relative bg-gray-50 rounded-lg p-6 min-h-[280px] h-full flex flex-col">
            <div className="flex-1 overflow-hidden">
              <p 
                className="response-text text-lg leading-relaxed"
                style={{ 
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  color: 'rgba(0,0,0,0.8)',
                  fontSize: '16px',
                  opacity: model.response ? 1 : 0,
                  transition: 'opacity 0.3s ease-out',
                  display: 'block',
                  wordBreak: 'break-word'
                }}
              >
                {previewText}
              </p>
            </div>
            {model.response && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-4 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
              >
                <Maximize2 size={16} />
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
      
      {/* Full Response Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-2xl font-light" style={{ fontFamily: 'Crimson Text, Georgia, serif' }}>
                {model.name} Response
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <FormattedResponse text={model.response} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Component to format response with code blocks
function FormattedResponse({ text }: { text: string }) {
  // Split text by code blocks
  const parts = text.split(/```(\w*)\n([\s\S]*?)```/g);
  
  return (
    <div className="space-y-4">
      {parts.map((part, index) => {
        // Even indices are text, odd indices are language, even+1 indices are code
        if (index % 3 === 0) {
          // Regular text
          return part ? (
            <div key={index} className="whitespace-pre-wrap text-gray-700 leading-relaxed">
              {part}
            </div>
          ) : null;
        } else if (index % 3 === 2) {
          // Code block
          const language = parts[index - 1] || 'plaintext';
          return (
            <div key={index} className="relative group">
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => navigator.clipboard.writeText(part)}
                  className="px-3 py-1 text-xs bg-gray-800 text-white rounded hover:bg-gray-700"
                >
                  Copy
                </button>
              </div>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                <code className={`language-${language}`}>{part}</code>
              </pre>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}