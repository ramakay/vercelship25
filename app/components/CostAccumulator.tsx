'use client';

interface CostAccumulatorProps {
  currentCost: number;
  maxBudget: number;
}

export default function CostAccumulator({ currentCost, maxBudget }: CostAccumulatorProps) {
  const percentage = (currentCost / maxBudget) * 100;
  const remaining = maxBudget - currentCost;
  
  const getProgressColor = () => {
    if (percentage < 50) return 'bg-green-500';
    if (percentage < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  const getTextColor = () => {
    if (percentage < 50) return 'text-green-700';
    if (percentage < 80) return 'text-yellow-700';
    return 'text-red-700';
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Spend Tracker</h3>
      
      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-3xl font-bold">${currentCost.toFixed(4)}</span>
            <span className="text-sm text-gray-500">of ${maxBudget}</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${getProgressColor()}`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
          
          <div className="mt-2 text-sm">
            <span className={getTextColor()}>
              {percentage.toFixed(1)}% used
            </span>
            <span className="text-gray-500 ml-2">
              (${remaining.toFixed(4)} remaining)
            </span>
          </div>
        </div>
        
        {percentage >= 80 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
            <p className="text-sm text-yellow-800">
              ⚠️ Approaching budget limit!
            </p>
          </div>
        )}
        
        {percentage >= 95 && (
          <div className="bg-red-50 border border-red-200 rounded p-3">
            <p className="text-sm text-red-800">
              🛑 Budget nearly exhausted!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}