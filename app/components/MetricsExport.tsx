'use client';

import { costLogger } from '@/app/services/cost-logger';

export default function MetricsExport() {
  const handleExportCostLog = () => {
    const csv = costLogger.exportToCSV();
    if (!csv) {
      alert('No cost data to export');
      return;
    }
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-gateway-cost-log-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportMetrics = () => {
    const costByProvider = costLogger.getCostByProvider();
    const totalCost = costLogger.getTotalCost();
    const entries = costLogger.getFromLocalStorage();
    
    const metrics = {
      exportDate: new Date().toISOString(),
      summary: {
        totalCost,
        totalRequests: entries.length,
        totalPromptTokens: entries.reduce((sum, e) => sum + e.promptTokens, 0),
        totalCompletionTokens: entries.reduce((sum, e) => sum + e.completionTokens, 0),
      },
      costByProvider,
      averageLatency: entries.length > 0 
        ? entries.reduce((sum, e) => sum + (e.activeCpuMs || 0), 0) / entries.length 
        : 0,
    };
    
    const blob = new Blob([JSON.stringify(metrics, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-gateway-metrics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all cost data? This cannot be undone.')) {
      costLogger.clear();
      window.location.reload();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Data Export</h3>
      <div className="space-y-2">
        <button
          onClick={handleExportCostLog}
          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Export Cost Log (CSV)
        </button>
        <button
          onClick={handleExportMetrics}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Export Metrics (JSON)
        </button>
        <button
          onClick={handleClearData}
          className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Clear All Data
        </button>
      </div>
    </div>
  );
}