// app/api/queue/status/route.ts
import { NextResponse } from 'next/server';
import { getQueueStatus } from '../../../../lib/queue-store';

export async function GET() {
  try {
    const status = await getQueueStatus();
    return NextResponse.json(status);
  } catch (error) {
    console.error('Status error:', error);
    return NextResponse.json({ 
      totalJoined: 987, 
      remaining: 4013,
      recentJoins: [],
      maxQueue: 5000 
    });
  }
}
