'use client';

import AccuracyCard from './AccuracyCard';

interface ModelData {
  id: string;
  name: string;
  response: string;
  cost: number;
  tokens: number;
  status: string;
}

interface EvaluationData {
  model: string;
  scores: {
    relevance: number;
    reasoning: number;
    style: number;
    accuracy: number;
    honesty: number;
    totalScore: number;
    soundnessScore: number;
  };
}

interface JudgePanelProps {
  totalCost: number;
  models: ModelData[];
  className?: string;
  comment?: string;
  visible?: boolean;
  evaluations?: EvaluationData[];
}

export default function JudgePanel({ totalCost, models, className, comment, visible, evaluations }: JudgePanelProps) {
  // Use real evaluations if available, otherwise mock
  const rankings = evaluations ? 
    evaluations
      .map(e => ({
        model: e.model.includes('claude') ? 'Claude' : 
               e.model.includes('gemini') ? 'Gemini' : 'Grok',
        score: Math.round(e.totalScore || 0),  // Use totalScore directly, not scores.totalScore
        accuracy: e.scores?.accuracy || 0,
        soundness: ((e.scores?.reasoning || 0) + (e.scores?.style || 0)),  // Combine reasoning + style for soundness
        honesty: e.scores?.honesty || 0
      }))
      .sort((a, b) => b.score - a.score)
    : [
      { model: 'Claude', score: 35, accuracy: 8, soundness: 10, honesty: 4 },
      { model: 'Gemini', score: 31, accuracy: 7, soundness: 9, honesty: 3 },
      { model: 'Grok', score: 27, accuracy: 6, soundness: 8, honesty: 2 }
    ];

  return (
    <div 
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 ${className}`}
      style={{ 
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.5s ease-out',
        zIndex: 40,
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
              <div className="relative inline-block mt-2">
                {/* Animated gradient border */}
                <div 
                  className="absolute -inset-0.5 rounded-lg opacity-75"
                  style={{
                    background: 'linear-gradient(45deg, #f59e0b, #fbbf24, #f59e0b, #fbbf24)',
                    backgroundSize: '300% 300%',
                    animation: 'gradient-shift 3s ease infinite'
                  }}
                />
                <div className="relative bg-white rounded-lg px-4 py-2">
                  <p className="font-mono text-lg font-medium text-gray-800" style={{ 
                    letterSpacing: '0.02em'
                  }}>
                    {comment}
                  </p>
                </div>
              </div>
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
                    <span className="text-lg text-gray-600">({item.score}/55)</span>
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
        
        {/* Accuracy vs Soundness Cards - shown when models are complete */}
        {models.every(m => m.status === 'complete' || m.status === 'judged') && rankings.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-sm uppercase tracking-wider text-gray-500 mb-3">Accuracy vs Soundness Analysis</h4>
            <div className="flex gap-4 justify-center">
              {rankings.map((item) => (
                <AccuracyCard
                  key={item.model}
                  model={item.model}
                  accuracy={item.accuracy}
                  soundness={item.soundness}
                  honesty={item.honesty}
                  visible={true}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}