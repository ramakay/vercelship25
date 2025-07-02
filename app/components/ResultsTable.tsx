'use client';

import { ModelResponse } from '@/app/services/ai-gateway';
import { EvaluationResult } from '@/app/bench/evaluate';

interface ResultsTableProps {
  responses: ModelResponse[];
  evaluations: EvaluationResult[];
}

export default function ResultsTable({ responses, evaluations }: ResultsTableProps) {
  // Create a map for easy lookup
  const evalMap = new Map(evaluations.map(e => [e.model, e]));
  
  // Combine responses with evaluations
  const combinedResults = responses.map(response => {
    const evaluation = evalMap.get(response.model);
    return {
      ...response,
      evaluation
    };
  });

  // Find the winner (highest final score)
  const winner = evaluations[0]?.model;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-4">Model Comparison & Benchmark Results</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Model
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Score
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Relevance
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reasoning
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Style
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Latency (ms)
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost ($)
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Response
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {combinedResults.map((result, idx) => {
                const isWinner = result.model === winner;
                const evaluation = result.evaluation;
                
                return (
                  <tr 
                    key={idx} 
                    className={`
                      ${result.error ? 'bg-red-50' : ''}
                      ${isWinner ? 'bg-green-50 font-medium' : ''}
                    `}
                  >
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center">
                        <span>{result.model}</span>
                        {isWinner && (
                          <span className="ml-2 px-2 py-1 text-xs bg-green-600 text-white rounded">
                            Winner
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      {evaluation ? (
                        <span className="font-bold text-lg">
                          {evaluation.finalScore.toFixed(2)}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      {evaluation ? `${evaluation.scores.relevance}/10` : '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      {evaluation ? `${evaluation.scores.reasoning}/5` : '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      {evaluation ? `${evaluation.scores.style}/5` : '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {result.latency}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${result.cost.toFixed(6)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      <details className="cursor-pointer">
                        <summary className="text-blue-600 hover:text-blue-800">
                          View Response
                        </summary>
                        <div className="mt-2 max-w-xs text-gray-700">
                          {result.error ? (
                            <span className="text-red-600">Error: {result.error}</span>
                          ) : (
                            <>
                              <p className="mb-2">{result.text}</p>
                              {evaluation && (
                                <p className="text-xs italic text-gray-600 mt-2 border-t pt-2">
                                  Judge: {evaluation.scores.explanation}
                                </p>
                              )}
                            </>
                          )}
                        </div>
                      </details>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {evaluations.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Scoring Formula</h4>
            <p className="text-sm text-blue-800">
              Total Score = (Relevance × 2) + Reasoning + Style - (Latency/1000) - (Cost × 10)
            </p>
            <p className="text-sm text-blue-700 mt-1">
              The winner is determined by the highest total score after factoring in response quality and performance metrics.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}