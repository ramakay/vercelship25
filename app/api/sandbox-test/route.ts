import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { code } = await req.json();
    
    // Try different possible Sandbox API endpoints
    const sandboxEndpoints = [
      'https://api.vercel.com/v1/sandbox/execute',
      'https://api.vercel.com/sandbox/execute',
      '/api/sandbox/execute',
    ];
    
    // Try Vercel's internal sandbox if available
    // @ts-ignore - Checking if global Vercel object exists
    if (typeof global.vercel !== 'undefined' && global.vercel.sandbox) {
      try {
        // @ts-ignore
        const result = await global.vercel.sandbox.execute(code);
        return NextResponse.json({ 
          success: true, 
          method: 'vercel.sandbox',
          result 
        });
      } catch (err) {
        console.log('Vercel sandbox object error:', err);
      }
    }
    
    // Check for process.env sandbox URL
    if (process.env.VERCEL_SANDBOX_URL) {
      return NextResponse.json({ 
        info: 'Found VERCEL_SANDBOX_URL',
        url: process.env.VERCEL_SANDBOX_URL 
      });
    }
    
    // Return info about what we found
    return NextResponse.json({ 
      success: false,
      message: 'Sandbox API not found',
      checkedMethods: [
        'global.vercel.sandbox',
        'process.env.VERCEL_SANDBOX_URL',
      ],
      env: {
        hasVercelEnv: !!process.env.VERCEL,
        region: process.env.VERCEL_REGION,
        runtime: process.env.VERCEL_RUNTIME,
      }
    });
    
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

export async function GET() {
  // Create a cool Three.js animation code for testing
  const threejsCode = `
// Three.js Particle Galaxy Animation
console.log('🌌 Creating a mesmerizing particle galaxy...');

// Simulate Three.js scene setup
const scene = { particles: [] };
const particleCount = 1000;

// Create spiral galaxy particles
for (let i = 0; i < particleCount; i++) {
  const angle = i * 0.1;
  const radius = Math.sqrt(i) * 2;
  
  const particle = {
    x: Math.cos(angle) * radius,
    y: (Math.random() - 0.5) * 10,
    z: Math.sin(angle) * radius,
    velocity: {
      x: Math.random() * 0.02 - 0.01,
      y: Math.random() * 0.02 - 0.01,
      z: Math.random() * 0.02 - 0.01
    },
    color: \`hsl(\${(i / particleCount) * 360}, 70%, 50%)\`
  };
  
  scene.particles.push(particle);
}

console.log(\`✨ Created \${particleCount} particles in spiral formation\`);

// Simulate animation loop
let frame = 0;
const maxFrames = 60;

console.log('🎬 Starting animation...');

for (let f = 0; f < maxFrames; f++) {
  frame++;
  
  // Update particle positions
  scene.particles.forEach((particle, i) => {
    // Rotate around Y axis
    const angle = 0.01;
    const x = particle.x * Math.cos(angle) - particle.z * Math.sin(angle);
    const z = particle.x * Math.sin(angle) + particle.z * Math.cos(angle);
    
    particle.x = x;
    particle.z = z;
    
    // Add some floating motion
    particle.y += Math.sin(frame * 0.1 + i * 0.01) * 0.05;
    
    // Apply velocity
    particle.x += particle.velocity.x;
    particle.y += particle.velocity.y;
    particle.z += particle.velocity.z;
  });
  
  if (frame % 10 === 0) {
    console.log(\`Frame \${frame}: Galaxy rotation angle = \${(frame * 0.01).toFixed(2)} radians\`);
  }
}

// Calculate final statistics
const avgRadius = scene.particles.reduce((sum, p) => 
  sum + Math.sqrt(p.x * p.x + p.z * p.z), 0
) / particleCount;

console.log('🎯 Animation complete!');
console.log(\`📊 Stats: Average radius = \${avgRadius.toFixed(2)} units\`);
console.log('🚀 Your particle galaxy is ready to blow your socks off!');

// Return some cool visualization data
const visualization = {
  type: 'particle-galaxy',
  particles: particleCount,
  frames: maxFrames,
  averageRadius: avgRadius,
  effect: 'mind-blowing'
};

console.log('💫 Visualization data:', JSON.stringify(visualization, null, 2));
`;

  return NextResponse.json({ 
    info: 'POST to this endpoint with { code: "your-js-code" }',
    exampleCode: threejsCode,
    note: 'This endpoint will attempt to execute code via Vercel Sandbox if available'
  });
}