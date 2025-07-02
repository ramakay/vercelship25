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
  Table,
  Badge,
  Progress,
  Code,
  ScrollArea,
  Separator
} from '@radix-ui/themes';
import { PlayIcon } from '@radix-ui/react-icons';

interface ModelStream {
  model: string;
  displayName: string;
  content: string;
  isStreaming: boolean;
  isComplete: boolean;
  latency?: number;
  error?: string;
}

interface EvaluationScore {
  relevance: number;
  reasoning: number;
  style: number;
  explanation: string;
}

interface ModelEvaluation {
  model: string;
  text: string;
  latency: number;
  cost: number;
  scores: EvaluationScore;
  finalScore: number;
}

interface StreamingDashboardProps {
  initialPrompt?: string;
}

export default function StreamingDashboard({ initialPrompt = '' }: StreamingDashboardProps) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [isRunning, setIsRunning] = useState(false);
  const [modelStreams, setModelStreams] = useState<Map<string, ModelStream>>(new Map());
  const [judgeContent, setJudgeContent] = useState('');
  const [isJudging, setIsJudging] = useState(false);
  const [evaluations, setEvaluations] = useState<ModelEvaluation[]>([]);
  const [totalCost, setTotalCost] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async () => {
    if (!prompt.trim() || isRunning) return;

    setIsRunning(true);
    setError(null);
    setModelStreams(new Map());
    setJudgeContent('');
    setIsJudging(false);
    setEvaluations([]);
    setTotalCost(0);

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
              
              switch (event.type) {
                case 'start':
                  const newStreams = new Map<string, ModelStream>();
                  event.models.forEach((m: { model: string; displayName: string }) => {
                    newStreams.set(m.model, {
                      model: m.model,
                      displayName: m.displayName,
                      content: '',
                      isStreaming: true,
                      isComplete: false,
                    });
                  });
                  setModelStreams(newStreams);
                  break;

                case 'text-delta':
                  setModelStreams(prev => {
                    const updated = new Map(prev);
                    const stream = updated.get(event.model);
                    if (stream) {
                      stream.content += event.textDelta;
                      updated.set(event.model, { ...stream });
                    }
                    return updated;
                  });
                  break;

                case 'model-complete':
                  setModelStreams(prev => {
                    const updated = new Map(prev);
                    const stream = updated.get(event.model);
                    if (stream) {
                      stream.isStreaming = false;
                      stream.isComplete = true;
                      stream.latency = event.latency;
                      updated.set(event.model, { ...stream });
                    }
                    return updated;
                  });
                  break;

                case 'error':
                  setModelStreams(prev => {
                    const updated = new Map(prev);
                    const stream = updated.get(event.model);
                    if (stream) {
                      stream.isStreaming = false;
                      stream.isComplete = true;
                      stream.error = event.error;
                      updated.set(event.model, { ...stream });
                    }
                    return updated;
                  });
                  break;

                case 'all-models-complete':
                  setIsJudging(true);
                  break;

                case 'judge-start':
                  setJudgeContent('');
                  break;

                case 'judge-delta':
                  setJudgeContent(prev => prev + event.textDelta);
                  break;

                case 'final-results':
                  setEvaluations(event.evaluations);
                  setTotalCost(event.totalCost);
                  setIsJudging(false);
                  break;

                case 'judge-error':
                  setError(event.error);
                  setIsJudging(false);
                  break;
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

  const winner = evaluations[0];

  return (
    <Container size="4" className="py-6">
      <Flex direction="column" gap="4">
        {/* Prompt Input */}
        <Card>
          <Flex direction="column" gap="3">
            <Heading size="4">Benchmark Prompt</Heading>
            <TextArea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your prompt to benchmark across models..."
              size="3"
              style={{ minHeight: '150px' }}
              disabled={isRunning}
            />
            <Button 
              size="3" 
              onClick={handleSubmit}
              disabled={!prompt.trim() || isRunning}
            >
              <PlayIcon />
              {isRunning ? 'Running...' : 'Run Benchmark'}
            </Button>
          </Flex>
        </Card>

        {/* Error Display */}
        {error && (
          <Card>
            <Flex direction="column" gap="2">
              <Text size="2" weight="bold" color="red">Error</Text>
              <Text size="2" color="red">{error}</Text>
            </Flex>
          </Card>
        )}

        {/* Model Responses */}
        {modelStreams.size > 0 && (
          <Flex gap="4" wrap="wrap">
            {Array.from(modelStreams.values()).map((stream) => (
              <Box key={stream.model} style={{ flex: '1 1 300px', minWidth: 0 }}>
                <Card>
                  <Flex direction="column" gap="3" style={{ height: '400px' }}>
                    <Flex justify="between" align="center">
                      <Heading size="3">{stream.displayName}</Heading>
                      {stream.isStreaming && (
                        <Badge color="blue" variant="soft">Streaming...</Badge>
                      )}
                      {stream.isComplete && !stream.error && (
                        <Badge color="green" variant="soft">
                          {stream.latency}ms
                        </Badge>
                      )}
                      {stream.error && (
                        <Badge color="red" variant="soft">Error</Badge>
                      )}
                    </Flex>
                    
                    <ScrollArea style={{ flex: 1 }}>
                      {stream.error ? (
                        <Text size="2" color="red">{stream.error}</Text>
                      ) : (
                        <Code size="1" style={{ whiteSpace: 'pre-wrap' }}>
                          {stream.content || 'Waiting for response...'}
                        </Code>
                      )}
                    </ScrollArea>

                    {stream.isStreaming && (
                      <Progress size="1" />
                    )}
                  </Flex>
                </Card>
              </Box>
            ))}
          </Flex>
        )}

        {/* Judge Evaluation */}
        {(isJudging || judgeContent) && (
          <Card>
            <Flex direction="column" gap="3">
              <Flex justify="between" align="center">
                <Heading size="4">Judge Evaluation</Heading>
                {isJudging && (
                  <Badge color="blue" variant="soft">Evaluating...</Badge>
                )}
              </Flex>
              <ScrollArea style={{ maxHeight: '300px' }}>
                <Code size="1" style={{ whiteSpace: 'pre-wrap' }}>
                  {judgeContent || 'Starting evaluation...'}
                </Code>
              </ScrollArea>
              {isJudging && <Progress size="1" />}
            </Flex>
          </Card>
        )}

        {/* Results Table */}
        {evaluations.length > 0 && (
          <Card>
            <Flex direction="column" gap="4">
              <Heading size="4">Benchmark Results</Heading>
              
              <Table.Root>
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell>Model</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Total Score</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Relevance</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Reasoning</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Style</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Latency</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Cost</Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>

                <Table.Body>
                  {evaluations.map((evaluation, idx) => (
                    <Table.Row key={evaluation.model}>
                      <Table.Cell>
                        <Flex align="center" gap="2">
                          <Text weight={idx === 0 ? "bold" : "regular"}>
                            {evaluation.model.split('/')[1]}
                          </Text>
                          {idx === 0 && (
                            <Badge color="green" variant="solid">Winner</Badge>
                          )}
                        </Flex>
                      </Table.Cell>
                      <Table.Cell>
                        <Text weight="bold" size="3" color={idx === 0 ? "green" : undefined}>
                          {evaluation.finalScore.toFixed(2)}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>{evaluation.scores.relevance}/10</Table.Cell>
                      <Table.Cell>{evaluation.scores.reasoning}/5</Table.Cell>
                      <Table.Cell>{evaluation.scores.style}/5</Table.Cell>
                      <Table.Cell>{evaluation.latency}ms</Table.Cell>
                      <Table.Cell>${evaluation.cost.toFixed(6)}</Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>

              <Separator size="4" />

              <Flex justify="between" align="center">
                <Box>
                  <Text size="2" weight="bold">Scoring Formula</Text>
                  <Text size="1" color="gray">
                    Total = (Relevance × 2) + Reasoning + Style - (Latency/1000) - (Cost × 10)
                  </Text>
                </Box>
                <Box>
                  <Text size="2" weight="bold">Total Cost</Text>
                  <Text size="3" color="cyan" weight="bold">
                    ${totalCost.toFixed(6)}
                  </Text>
                </Box>
              </Flex>

              {winner && (
                <Card>
                  <Flex direction="column" gap="2">
                    <Text size="2" weight="bold">Winner: {winner.model.split('/')[1]}</Text>
                    <Text size="1" color="gray">{winner.scores.explanation}</Text>
                  </Flex>
                </Card>
              )}
            </Flex>
          </Card>
        )}
      </Flex>
    </Container>
  );
}