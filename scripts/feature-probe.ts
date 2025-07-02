#!/usr/bin/env node

import { exec } from 'child_process';
import { promises as fs } from 'fs';
import { promisify } from 'util';
import fetch from 'node-fetch';

const execAsync = promisify(exec);

interface ProbeStatus {
  feature: string;
  endpoint?: string;
  command?: string;
  status: 'available' | 'unavailable' | 'error';
  response?: any;
  timestamp: string;
}

async function probeFeatures() {
  const probes: ProbeStatus[] = [];
  
  console.log('🔍 Probing Vercel Ship 2025 Features...\n');
  
  // 1. Gateway ping
  try {
    console.log('Testing AI Gateway...');
    const gwResponse = await fetch('https://api.ai.vercel.com/v1/models');
    probes.push({
      feature: 'AI Gateway',
      endpoint: 'https://api.ai.vercel.com/v1/models',
      status: gwResponse.ok ? 'available' : 'unavailable',
      response: gwResponse.status,
      timestamp: new Date().toISOString()
    });
    console.log(`✓ AI Gateway: ${gwResponse.ok ? 'Available' : 'Unavailable'} (${gwResponse.status})`);
  } catch (error) {
    probes.push({
      feature: 'AI Gateway',
      endpoint: 'https://api.ai.vercel.com/v1/models',
      status: 'error',
      response: error.message,
      timestamp: new Date().toISOString()
    });
    console.log(`✗ AI Gateway: Error - ${error.message}`);
  }
  
  // 2. Sandbox ping
  try {
    console.log('\nTesting Sandbox...');
    const { stdout, stderr } = await execAsync('npx sandbox ping');
    const sandboxAvailable = !stderr.includes('error') && stdout.includes('VM');
    probes.push({
      feature: 'Sandbox',
      command: 'npx sandbox ping',
      status: sandboxAvailable ? 'available' : 'unavailable',
      response: stdout || stderr,
      timestamp: new Date().toISOString()
    });
    console.log(`✓ Sandbox: ${sandboxAvailable ? 'Available' : 'Unavailable'}`);
  } catch (error) {
    probes.push({
      feature: 'Sandbox',
      command: 'npx sandbox ping',
      status: 'error',
      response: error.message,
      timestamp: new Date().toISOString()
    });
    console.log(`✗ Sandbox: Error - ${error.message}`);
  }
  
  // 3. Queue probe
  try {
    console.log('\nTesting Queues...');
    const { stdout, stderr } = await execAsync('vercel queue topics ls');
    const queuesAvailable = !stderr.includes('unknown') && !stderr.includes('404');
    probes.push({
      feature: 'Queues',
      command: 'vercel queue topics ls',
      status: queuesAvailable ? 'available' : 'unavailable',
      response: stdout || stderr,
      timestamp: new Date().toISOString()
    });
    console.log(`✓ Queues: ${queuesAvailable ? 'Available' : 'Unavailable'}`);
  } catch (error) {
    probes.push({
      feature: 'Queues',
      command: 'vercel queue topics ls',
      status: 'error',
      response: error.message,
      timestamp: new Date().toISOString()
    });
    console.log(`✗ Queues: Error - ${error.message}`);
  }
  
  // Save to status.json
  const status = {
    timestamp: new Date().toISOString(),
    probes,
    summary: {
      total: probes.length,
      available: probes.filter(p => p.status === 'available').length,
      unavailable: probes.filter(p => p.status === 'unavailable').length,
      errors: probes.filter(p => p.status === 'error').length
    }
  };
  
  await fs.writeFile('./status.json', JSON.stringify(status, null, 2));
  console.log('\n✅ Results saved to status.json');
  
  return status;
}

// Run if called directly
if (require.main === module) {
  probeFeatures().catch(console.error);
}