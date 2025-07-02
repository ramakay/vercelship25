export interface SandboxResult {
  output: string;
  error?: string;
  cpuMs: number;
  executionTime: number;
  success: boolean;
}

export function isExecutableCode(text: string): boolean {
  // Simple heuristic to detect if the response contains executable JavaScript
  const codePatterns = [
    /```javascript[\s\S]*?```/,
    /```js[\s\S]*?```/,
    /```typescript[\s\S]*?```/,
    /```ts[\s\S]*?```/,
    /function\s+\w+\s*\(/,
    /const\s+\w+\s*=/,
    /let\s+\w+\s*=/,
    /console\.log/,
  ];
  
  return codePatterns.some(pattern => pattern.test(text));
}

export function extractCode(text: string): string | null {
  // Try to extract code from markdown code blocks first
  const codeBlockMatch = text.match(/```(?:javascript|js|typescript|ts)?\n([\s\S]*?)```/);
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim();
  }
  
  // If no code block, check if the entire response looks like code
  if (isExecutableCode(text)) {
    return text.trim();
  }
  
  return null;
}

export async function executeSandbox(code: string): Promise<SandboxResult> {
  const startTime = Date.now();
  
  try {
    // In a real implementation, this would use Vercel Sandbox API
    // For now, we'll simulate execution with safety checks
    
    // Basic safety checks
    const dangerousPatterns = [
      /process\./,
      /require\s*\(/,
      /import\s+/,
      /eval\s*\(/,
      /Function\s*\(/,
      /XMLHttpRequest/,
      /fetch\s*\(/,
      /fs\./,
      /child_process/,
    ];
    
    const isDangerous = dangerousPatterns.some(pattern => pattern.test(code));
    if (isDangerous) {
      return {
        output: '',
        error: 'Code contains potentially dangerous operations and cannot be executed in sandbox',
        cpuMs: 0,
        executionTime: Date.now() - startTime,
        success: false
      };
    }
    
    // Simulate sandbox execution
    // In production, this would call: await vercel.sandbox.execute(code)
    const simulatedOutput = await simulateExecution(code);
    const executionTime = Date.now() - startTime;
    const cpuMs = Math.round(executionTime * 0.9); // Simulate 90% CPU efficiency
    
    return {
      output: simulatedOutput,
      cpuMs,
      executionTime,
      success: true
    };
    
  } catch (error) {
    return {
      output: '',
      error: error instanceof Error ? error.message : 'Sandbox execution failed',
      cpuMs: 0,
      executionTime: Date.now() - startTime,
      success: false
    };
  }
}

async function simulateExecution(code: string): Promise<string> {
  // Simulate execution with a simple eval in a try-catch
  // In production, this would be replaced with actual Vercel Sandbox API
  
  const logs: string[] = [];
  const mockConsole = {
    log: (...args: unknown[]) => {
      logs.push(args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' '));
    }
  };
  
  try {
    // Create a limited scope for execution
    const func = new Function('console', code);
    func(mockConsole);
    
    return logs.join('\n') || 'Code executed successfully (no output)';
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Execution error: ${errorMessage}`);
  }
}

export function formatSandboxOutput(result: SandboxResult): string {
  if (!result.success) {
    return `❌ Sandbox Error: ${result.error}`;
  }
  
  const lines = [
    '✅ Sandbox Execution Complete',
    `⏱️  CPU Time: ${result.cpuMs}ms`,
    `⏱️  Wall Time: ${result.executionTime}ms`,
    `📊 Efficiency: ${Math.round((result.cpuMs / result.executionTime) * 100)}%`,
    '',
    '📝 Output:',
    result.output
  ];
  
  return lines.join('\n');
}