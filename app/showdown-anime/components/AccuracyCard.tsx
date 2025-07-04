'use client';

interface AccuracyCardProps {
  model: string;
  accuracy: number;      // 0-10
  soundness: number;     // 0-10 (reasoning + style)
  honesty: number;       // 0-5
  visible?: boolean;
}

export default function AccuracyCard({ model, accuracy, soundness, honesty, visible = true }: AccuracyCardProps) {
  // Normalize scores to percentages
  const accuracyPercent = ((accuracy || 0) / 10) * 100;
  const soundnessPercent = ((soundness || 0) / 10) * 100;
  const honestyPercent = ((honesty || 0) / 5) * 100;
  
  // Color coding based on score
  const getColor = (percent: number) => {
    if (percent >= 80) return '#10b981'; // green
    if (percent >= 60) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };
  
  return (
    <div 
      className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
      style={{
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.3s ease-out',
        minWidth: '280px'
      }}
    >
      <h4 className="text-sm font-medium text-gray-700 mb-3">{model}</h4>
      
      {/* Accuracy vs Soundness bars */}
      <div className="space-y-3">
        {/* Accuracy */}
        <div>
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Accuracy</span>
            <span>{accuracy.toFixed(1)}/10</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${accuracyPercent}%`,
                backgroundColor: getColor(accuracyPercent)
              }}
            />
          </div>
        </div>
        
        {/* Soundness */}
        <div>
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Soundness</span>
            <span>{(soundness || 0).toFixed(1)}/10</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${soundnessPercent}%`,
                backgroundColor: getColor(soundnessPercent)
              }}
            />
          </div>
        </div>
        
        {/* Knowledge Honesty indicator */}
        <div className="pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Knowledge Honesty</span>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i < honesty ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Visual comparison */}
      <div className="mt-3 text-xs text-gray-500">
        {accuracy > soundness ? (
          <span>✓ Factually accurate</span>
        ) : soundness > accuracy ? (
          <span>⚠️ Sounds good but check facts</span>
        ) : (
          <span>Balanced response</span>
        )}
      </div>
    </div>
  );
}