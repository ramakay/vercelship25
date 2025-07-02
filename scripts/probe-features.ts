#!/usr/bin/env node

import { exec } from 'child_process';
import { promises as fs } from 'fs';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface ProbeResult {
  feature: string;
  command: string;
  status: 'available' | 'unavailable' | 'error';
  response?: string;
  error?: string;
  timestamp: string;
}

const probes: ProbeResult[] = [];

async function probeFeature(
  feature: string,
  command: string
): Promise<ProbeResult> {
  const timestamp = new Date().toISOString();
  
  try {
    const { stdout, stderr } = await execAsync(command);
    
    // Check if command succeeded
    const status = stderr.includes('403') || stderr.includes('404') || 
                  stdout.includes('not found') || stdout.includes('unauthorized')
                  ? 'unavailable' : 'available';
    
    return {
      feature,
      command,
      status,
      response: stdout || stderr,
      timestamp
    };
  } catch (error: any) {
    return {
      feature,
      command,
      status: 'error',
      error: error.message,
      timestamp
    };
  }
}

async function runProbes() {
  console.log('🔍 Probing Vercel Ship 2025 Features...\n');
  
  // Test Vercel CLI availability
  const vercelVersion = await probeFeature(
    'Vercel CLI',
    'vercel --version'
  );
  probes.push(vercelVersion);
  console.log(`✓ Vercel CLI: ${vercelVersion.status}`);
  
  // Test AI Gateway
  const aiGateway = await probeFeature(
    'AI Gateway',
    'vercel ai gateway ls'
  );
  probes.push(aiGateway);
  console.log(`✓ AI Gateway: ${aiGateway.status}`);
  
  // Test Queues
  const queues = await probeFeature(
    'Queues',
    'vercel queue topics ls'
  );
  probes.push(queues);
  console.log(`✓ Queues: ${queues.status}`);
  
  // Test Sandbox
  const sandbox = await probeFeature(
    'Sandbox',
    'vercel sandbox test'
  );
  probes.push(sandbox);
  console.log(`✓ Sandbox: ${sandbox.status}`);
  
  // Save results
  const logsDir = './logs';
  await fs.mkdir(logsDir, { recursive: true });
  
  const probeResults = {
    timestamp: new Date().toISOString(),
    probes,
    summary: {
      total: probes.length,
      available: probes.filter(p => p.status === 'available').length,
      unavailable: probes.filter(p => p.status === 'unavailable').length,
      errors: probes.filter(p => p.status === 'error').length
    }
  };
  
  await fs.writeFile(
    './logs/probes.json',
    JSON.stringify(probeResults, null, 2)
  );
  
  console.log('\n📊 Summary:');
  console.log(`   Total features probed: ${probeResults.summary.total}`);
  console.log(`   Available: ${probeResults.summary.available}`);
  console.log(`   Unavailable: ${probeResults.summary.unavailable}`);
  console.log(`   Errors: ${probeResults.summary.errors}`);
  console.log('\n✅ Results saved to logs/probes.json');
}

// Run the probes
runProbes().catch(console.error);