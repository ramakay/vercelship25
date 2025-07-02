'use client';

interface ModelData {
  id: string;
  name: string;
  response: string;
  cost: number;
  tokens: number;
  status: string;
}

interface JudgePanelProps {
  totalCost: number;
  models: ModelData[];
  className?: string;
  comment?: string;
  visible?: boolean;
}

export default function JudgePanel({ totalCost, models, className, comment, visible }: JudgePanelProps) {
  // Mock rankings
  const rankings = [
    { model: 'Claude', score: 18 },
    { model: 'Gemini', score: 17 },
    { model: 'Grok', score: 16 }
  ];

  return (
    <div 
      className={`fixed top-8 left-1/2 transform -translate-x-1/2 ${className}`}
      style={{ 
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.5s ease-out',
        zIndex: 100,
        pointerEvents: visible ? 'auto' : 'none',
        width: '90%',
        maxWidth: '1200px'
      }}
    >
      <div className="bg-white rounded-lg border-2 border-black p-6 relative overflow-hidden">
        {/* Animated gradient background */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 50%, #f59e0b 100%)',
            backgroundSize: '200% 200%',
            animation: 'gradient-shift 8s ease infinite'
          }}
        />
        
        <div className="flex items-start justify-between gap-8 relative">
          {/* Left section - Title and Commentary */}
          <div className="flex-1">
            <h3 className="text-2xl font-light tracking-wider mb-3 relative">
              <span className="absolute -inset-x-2 -inset-y-1 bg-yellow-100 opacity-50 blur-sm" />
              <span className="relative">JUDGE PANEL</span>
            </h3>
            
            {/* Live commentary */}
            {comment && (
              <p className="text-lg italic text-gray-700 relative inline-block" style={{ 
                fontFamily: 'Caveat, cursive', 
                fontSize: '22px',
                textShadow: '0 1px 2px rgba(0,0,0,0.1)'
              }}>
                <span 
                  className="absolute -inset-x-2 -inset-y-1 bg-gradient-to-r from-transparent via-blue-100 to-transparent opacity-40 blur-sm"
                  style={{ animation: 'gradient-shift 4s ease infinite' }}
                />
                <span className="relative">&ldquo;{comment}&rdquo;</span>
              </p>
            )}
          </div>
          
          {/* Middle section - Rankings */}
          {models.every(m => m.status === 'complete' || m.status === 'judged') && (
            <div className="flex-1">
              <h4 className="text-sm uppercase tracking-wider text-gray-500 mb-2">Final Rankings</h4>
              <div className="flex gap-6">
                {rankings.map((item, index) => (
                  <div 
                    key={item.model} 
                    className="flex items-center gap-2 px-3 py-1 rounded-md"
                    style={{
                      backgroundImage: index === 0 ? 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' : 'none',
                      backgroundColor: index === 0 ? 'transparent' : 'transparent',
                      boxShadow: index === 0 ? '0 2px 4px rgba(251, 191, 36, 0.2)' : 'none'
                    }}
                  >
                    <span className="text-2xl font-light text-gray-400">
                      {index + 1}.
                    </span>
                    <span className="text-lg font-medium">{item.model}</span>
                    <span className="text-lg text-gray-600">({item.score}/20)</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Right section - Total Cost */}
          <div className="text-right relative">
            <span className="text-sm uppercase tracking-wider text-gray-500 block mb-1">Total Cost</span>
            <div className="relative inline-block">
              <span 
                className="absolute -inset-x-3 -inset-y-1 bg-gradient-to-r from-green-100 to-emerald-100 opacity-60 blur-sm"
              />
              <span className="font-mono text-2xl font-medium relative">${totalCost.toFixed(4)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}