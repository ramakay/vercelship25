'use client';

import { useState, useCallback } from 'react';
import { 
  Box, 
  Button, 
  Card, 
  Container, 
  Flex, 
  Heading, 
  Text, 
  TextArea,
  Badge
} from '@radix-ui/themes';
import { PlayIcon } from '@radix-ui/react-icons';
import AnimationOrchestratorV2 from './3d/AnimationOrchestratorV2';

interface StreamingDashboard3DProps {
  initialPrompt?: string;
}

export default function StreamingDashboard3D({ initialPrompt = '' }: StreamingDashboard3DProps) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStreamData, setCurrentStreamData] = useState<StreamEvent | null>(null);

interface StreamEvent {
  type: string;
  model?: string;
  textDelta?: string;
  models?: Array<{ model: string; displayName: string }>;
  evaluations?: Array<{
    model: string;
    scores: {
      relevance: number;
      reasoning: number;
      style: number;
      explanation: string;
    };
  }>;
  totalCost?: number;
  latency?: number;
  usage?: { inputTokens: number; outputTokens: number };
  error?: string;
}
  const [error, setError] = useState<string | null>(null);
  const [showPromptArea, setShowPromptArea] = useState(true);

  const handleSubmit = useCallback(async () => {
    if (!prompt.trim() || isRunning) return;

    setIsRunning(true);
    setError(null);
    setCurrentStreamData(null);
    setShowPromptArea(false); // Hide prompt area to focus on 3D scene

    try {
      const response = await fetch('/api/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              setIsRunning(false);
              continue;
            }

            try {
              const event = JSON.parse(data);
              setCurrentStreamData(event);
              
              if (event.type === 'judge-error') {
                setError(event.error);
              }
            } catch (e) {
              console.error('Error parsing event:', e);
            }
          }
        }
      }
    } catch (err) {
      console.error('Stream error:', err);
      setError(err instanceof Error ? err.message : 'Failed to stream responses');
      setIsRunning(false);
    }
  }, [prompt, isRunning]);

  const handleReset = () => {
    setShowPromptArea(true);
    setCurrentStreamData(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white/90 backdrop-blur-sm">
        <Container size="4">
          <Flex py="4" align="center" justify="between">
            <Box>
              <Heading size="6" weight="bold" className="text-gray-900">
                AI Triage Arena
              </Heading>
              <Text size="2" className="text-gray-600">
                Watch models compete in real-time 3D visualization
              </Text>
            </Box>
            {!showPromptArea && (
              <Button 
                variant="soft" 
                onClick={handleReset}
                disabled={isRunning}
              >
                New Benchmark
              </Button>
            )}
          </Flex>
        </Container>
      </div>

      {/* Main Content */}
      <Container size="4" className="py-6">
        {showPromptArea ? (
          /* Prompt Input Area */
          <Card className="bg-white border-gray-200 shadow-sm">
            <Flex direction="column" gap="4">
              <Box>
                <Heading size="4" mb="2" className="text-gray-900">Benchmark Prompt</Heading>
                <Text size="2" className="text-gray-600">
                  Enter your prompt to see how different AI models respond and compete
                </Text>
              </Box>
              
              <TextArea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter your prompt to benchmark across models..."
                size="3"
                style={{ 
                  minHeight: '200px',
                  backgroundColor: 'var(--gray-2)',
                  borderColor: 'var(--gray-6)'
                }}
                disabled={isRunning}
              />
              
              <Flex justify="between" align="center">
                <Text size="1" className="text-gray-500">
                  Models: Grok 3, Claude 4 Opus, Gemini 2.5 Pro
                </Text>
                <Button 
                  size="3" 
                  onClick={handleSubmit}
                  disabled={!prompt.trim() || isRunning}
                  className="bg-cyan-600 hover:bg-cyan-700"
                >
                  <PlayIcon />
                  {isRunning ? 'Initializing...' : 'Start Arena'}
                </Button>
              </Flex>
            </Flex>
          </Card>
        ) : (
          /* 3D Visualization Area */
          <Box>
            <AnimationOrchestratorV2 
              isStreaming={isRunning}
              streamData={currentStreamData}
              benchmarkPrompt={prompt}
            />
          </Box>
        )}

        {/* Error Display */}
        {error && (
          <Card className="mt-4 bg-red-900/20 border-red-800">
            <Flex direction="column" gap="2">
              <Text size="2" weight="bold" className="text-red-400">Error</Text>
              <Text size="2" className="text-red-300">{error}</Text>
            </Flex>
          </Card>
        )}

        {/* Instructions */}
        {showPromptArea && (
          <Card className="mt-6 bg-gray-50 border-gray-200">
            <Flex direction="column" gap="3">
              <Heading size="3" className="text-gray-900">How it works</Heading>
              <Box>
                <Badge color="cyan" variant="soft" mb="2">1. Submit</Badge>
                <Text size="2" className="text-gray-600 block">
                  Enter your prompt and click &quot;Start Arena&quot; to begin
                </Text>
              </Box>
              <Box>
                <Badge color="cyan" variant="soft" mb="2">2. Watch</Badge>
                <Text size="2" className="text-gray-600 block">
                  See crumpled papers unfold as each model generates responses
                </Text>
              </Box>
              <Box>
                <Badge color="cyan" variant="soft" mb="2">3. Judge</Badge>
                <Text size="2" className="text-gray-600 block">
                  An AI judge evaluates responses and crowns the winner
                </Text>
              </Box>
            </Flex>
          </Card>
        )}
      </Container>
    </div>
  );
}