'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SparklineChartProps {
  data: Array<{
    time: number;
    cpu: number;
    wall: number;
  }>;
}

export default function SparklineChart({ data }: SparklineChartProps) {
  // Transform data for the chart
  const chartData = data.map((point, index) => ({
    index: index + 1,
    cpu: Math.round(point.cpu),
    wall: Math.round(point.wall),
    efficiency: Math.round((point.cpu / point.wall) * 100)
  }));

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Active CPU vs Wall Time</h3>
      
      <div className="space-y-4">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="index" label={{ value: 'Request #', position: 'insideBottom', offset: -5 }} />
            <YAxis label={{ value: 'Time (ms)', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="cpu" 
              stroke="#3B82F6" 
              name="Active CPU" 
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="wall" 
              stroke="#10B981" 
              name="Wall Time" 
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
        
        {chartData.length > 0 && (
          <div className="text-sm space-y-1">
            <p className="text-gray-600">
              Latest Efficiency: <span className="font-semibold">{chartData[chartData.length - 1].efficiency}%</span>
            </p>
            <p className="text-gray-600">
              Average Efficiency: <span className="font-semibold">
                {Math.round(chartData.reduce((sum, p) => sum + p.efficiency, 0) / chartData.length)}%
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}