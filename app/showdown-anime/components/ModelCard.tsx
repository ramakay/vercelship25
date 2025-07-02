'use client';

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
          <div className="relative bg-gray-50 rounded-lg p-6 min-h-[280px] h-full">
            <p 
              className="response-text text-2xl leading-relaxed"
              style={{ 
                fontFamily: 'Caveat, cursive',
                color: 'rgba(0,0,0,0.9)',
                fontSize: '28px',
                textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                opacity: model.response ? 1 : 0,
                transition: 'opacity 0.3s ease-out',
                display: 'block',
                minHeight: '200px'
              }}
            >
              "{model.response}"
            </p>
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
    </div>
  );
}