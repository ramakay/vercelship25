'use client';

import { useState } from 'react';

interface MockResponse {
  text: string;
  tokens: number;
  cost: number;
  latency: number;
}

const mockResponses: Record<string, MockResponse> = {
  grok: {
    text: "Grok's analysis leverages advanced pattern recognition to identify the optimal solution path. The implementation focuses on efficiency with streamlined algorithms that minimize computational overhead while maintaining accuracy.",
    tokens: 245,
    cost: 0.00367,
    latency: 1200
  },
  claude: {
    text: "Claude's comprehensive approach examines multiple facets of the problem space. Through systematic analysis, we can identify edge cases and potential failure modes. The solution incorporates robust error handling and validates assumptions at each step.",
    tokens: 389,
    cost: 0.02917,
    latency: 1800
  },
  gemini: {
    text: "Gemini applies creative problem-solving techniques with emphasis on scalability. The architecture supports future extensions through modular design patterns. Performance optimizations ensure consistent response times under varying load conditions.",
    tokens: 312,
    cost: 0.00390,
    latency: 1500
  }
};

const judgeResponse = {
  grok: {
    relevance: 8,
    reasoning: 4,
    style: 4,
    explanation: "Efficient and direct, but could use more depth in analysis."
  },
  claude: {
    relevance: 10,
    reasoning: 5,
    style: 5,
    explanation: "Comprehensive coverage with excellent logical flow and edge case consideration."
  },
  gemini: {
    relevance: 9,
    reasoning: 4,
    style: 4,
    explanation: "Creative approach with good scalability focus, solid implementation."
  }
};

export function useMockStream() {
  const [isStreaming, setIsStreaming] = useState(false);

  const startMockStream = async (modelId: string): Promise<MockResponse> => {
    setIsStreaming(true);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const response = mockResponses[modelId];
    
    // Simulate streaming delay
    await new Promise(resolve => setTimeout(resolve, response.latency));
    
    setIsStreaming(false);
    return response;
  };

  const judgeEvaluation = async () => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Calculate final scores
    const evaluations = Object.entries(judgeResponse).map(([modelId, scores]) => {
      const response = mockResponses[modelId];
      const finalScore = 
        (scores.relevance * 2) + 
        scores.reasoning + 
        scores.style - 
        (response.latency / 1000) - 
        (response.cost * 10);
      
      return {
        modelId,
        ...scores,
        finalScore,
        cost: response.cost,
        latency: response.latency
      };
    });

    // Sort by final score
    return evaluations.sort((a, b) => b.finalScore - a.finalScore);
  };

  return {
    isStreaming,
    startMockStream,
    judgeEvaluation
  };
}