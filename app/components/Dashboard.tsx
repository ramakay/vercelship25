'use client';

import { useState, useEffect } from 'react';
import { ModelResponse } from '@/app/services/ai-gateway';
import { costLogger } from '@/app/services/cost-logger';
import { isExecutableCode, extractCode, executeSandbox, formatSandboxOutput } from '@/app/services/sandbox-executor';
import { EvaluationResult } from '@/app/bench/evaluate';
import CostAccumulator from './CostAccumulator';
import SparklineChart from './SparklineChart';
import MetricsExport from './MetricsExport';
import ResultsTable from './ResultsTable';

interface DashboardProps {
  initialPrompt?: string;
}

export default function Dashboard({ initialPrompt = '' }: DashboardProps) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [loading, setLoading] = useState(false);
  const [responses, setResponses] = useState<ModelResponse[]>([]);
  const [evaluations, setEvaluations] = useState<EvaluationResult[]>([]);
  const [totalCost, setTotalCost] = useState(0);
  const [activeCpuData, setActiveCpuData] = useState<Array<{ time: number; cpu: number; wall: number }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [sandboxOutput, setSandboxOutput] = useState<string | null>(null);
  const [sandboxLoading, setSandboxLoading] = useState(false);

  // Load existing cost from localStorage on mount
  useEffect(() => {
    const existingCost = costLogger.getTotalCost();
    setTotalCost(existingCost);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);
    const startTime = Date.now();

    try {
      const response = await fetch('/api/triage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Update responses with evaluation data
      setResponses(data.responses);
      setEvaluations(data.evaluations || []);
      
      // Log each response to cost logger
      for (const response of data.responses) {
        await costLogger.log({
          provider: response.provider,
          model: response.model,
          promptTokens: response.promptTokens,
          completionTokens: response.completionTokens,
          cost: response.cost,
          prompt: prompt.substring(0, 100), // Store first 100 chars of prompt
        });
      }
      
      // Update total cost
      const newTotalCost = costLogger.getTotalCost();
      setTotalCost(newTotalCost);
      
      // Add CPU data point (simulated for now)
      const wallTime = Date.now() - startTime;
      const cpuTime = wallTime * 0.85; // Simulated 85% CPU efficiency
      setActiveCpuData(prev => [...prev, { time: Date.now(), cpu: cpuTime, wall: wallTime }]);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get responses';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const sortedByLatency = [...responses].sort((a, b) => a.latency - b.latency);
  const sortedByCost = [...responses].sort((a, b) => a.cost - b.cost);

  const handleSandboxExecute = async (text: string) => {
    const code = extractCode(text);
    if (!code) {
      setSandboxOutput('No executable code found in the response');
      return;
    }

    setSandboxLoading(true);
    setSandboxOutput(null);

    try {
      const result = await executeSandbox(code);
      setSandboxOutput(formatSandboxOutput(result));
      
      // Add sandbox CPU data
      if (result.success) {
        setActiveCpuData(prev => [...prev, { 
          time: Date.now(), 
          cpu: result.cpuMs, 
          wall: result.executionTime 
        }]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setSandboxOutput(`Sandbox error: ${errorMessage}`);
    } finally {
      setSandboxLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Prompt Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">AI Model Triage</h2>
            <div className="space-y-4">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter your prompt here..."
                className="w-full p-3 border rounded-lg resize-none h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !prompt.trim()}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Processing...' : 'Compare Models'}
              </button>
            </div>
          </form>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Results Table with Evaluation Scores */}
          {responses.length > 0 && (
            <ResultsTable responses={responses} evaluations={evaluations} />
          )}

          {/* Rankings */}
          {responses.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h4 className="font-semibold mb-3">Fastest Response</h4>
                <p className="text-2xl font-bold text-green-600">
                  {sortedByLatency[0]?.model}
                </p>
                <p className="text-sm text-gray-500">
                  {sortedByLatency[0]?.latency}ms
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h4 className="font-semibold mb-3">Most Cost-Effective</h4>
                <p className="text-2xl font-bold text-blue-600">
                  {sortedByCost[0]?.model}
                </p>
                <p className="text-sm text-gray-500">
                  ${sortedByCost[0]?.cost.toFixed(6)}
                </p>
              </div>
            </div>
          )}

          {/* Sandbox Execution */}
          {evaluations.length > 0 && responses.some(r => isExecutableCode(r.text)) && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold mb-4">Sandbox Execution</h3>
              <div className="space-y-4">
                <div className="flex gap-2">
                  {/* Show winner's code execution button first */}
                  {evaluations[0] && isExecutableCode(evaluations[0].response) && (
                    <button
                      onClick={() => handleSandboxExecute(evaluations[0].response)}
                      disabled={sandboxLoading}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Execute Winner ({evaluations[0].model}) Code
                    </button>
                  )}
                  {/* Other models */}
                  {responses
                    .filter(r => isExecutableCode(r.text) && r.model !== evaluations[0]?.model)
                    .map((response, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSandboxExecute(response.text)}
                        disabled={sandboxLoading}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Execute {response.model} Code
                      </button>
                    ))}
                </div>
                
                {sandboxLoading && (
                  <div className="text-gray-500">Executing in sandbox...</div>
                )}
                
                {sandboxOutput && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <pre className="whitespace-pre-wrap font-mono text-sm">{sandboxOutput}</pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <CostAccumulator currentCost={totalCost} maxBudget={10} />
          {activeCpuData.length > 0 && (
            <SparklineChart data={activeCpuData} />
          )}
          <MetricsExport />
        </div>
      </div>
    </div>
  );
}