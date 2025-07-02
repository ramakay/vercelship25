import { NextResponse } from 'next/server';

// Try to import from @vercel/queue
let send: ((topic: string, payload: unknown) => Promise<void>) | undefined;
// @ts-expect-error - Dynamic import for optional dependency
const loadQueue = async () => {
  try {
    const queue = await import('@vercel/queue');
    send = queue.send;
    console.log('Vercel Queue imported successfully from @vercel/queue');
  } catch {
    console.log('@vercel/queue not available');
  }
};

// Load queue on startup
void loadQueue();

export async function POST(req: Request) {
  try {
    const { topic, payload } = await req.json();
    
    // Check if we have Vercel Queue available
    if (send) {
      try {
        // Try to send the message
        await send(topic, payload);
        
        return NextResponse.json({ 
          success: true, 
          message: 'Message sent to queue',
          topic,
          queueAvailable: true
        });
      } catch (error) {
        console.error('Queue operation error:', error);
        return NextResponse.json({ 
          success: false, 
          message: error instanceof Error ? error.message : 'Queue operation failed',
          queueAvailable: true
        }, { status: 500 });
      }
    }
    
    // If no queue, return unavailable
    return NextResponse.json({ 
      success: false, 
      message: 'Vercel Queue not available in this environment',
      queueAvailable: false
    }, { status: 503 });
    
  } catch (error) {
    console.error('Queue endpoint error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

export async function GET() {
  // Health check endpoint
  const hasQueue = !!send;
  
  // Try a test to see if queue is actually available
  let testResult = 'not tested';
  if (hasQueue && send) {
    try {
      // Note: This might fail if queue isn't set up
      await send('test-topic', { test: true });
      testResult = 'success';
    } catch (error) {
      testResult = error instanceof Error ? error.message : 'failed';
    }
  }
  
  return NextResponse.json({
    service: 'cost-log-queue',
    status: hasQueue ? 'available' : 'unavailable',
    queuePackage: hasQueue ? '@vercel/functions' : null,
    testResult,
    info: 'POST to this endpoint to send messages to queue',
    usage: {
      send: 'POST /api/queue/cost-log with { topic, payload }',
      receive: 'Queue consumer will process messages automatically'
    }
  });
}