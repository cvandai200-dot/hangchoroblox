import { NextResponse } from 'next/server';
import { getAllParticipants, resetQueue } from '../../../lib/queue';

const ADMIN_PASSWORD = 'admin123';

export async function GET(request) {
  const auth = request.headers.get('authorization');
  if (auth !== `Bearer ${ADMIN_PASSWORD}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const participants = getAllParticipants();
  return NextResponse.json({ participants });
}

export async function POST(request) {
  const auth = request.headers.get('authorization');
  if (auth !== `Bearer ${ADMIN_PASSWORD}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { action } = await request.json();

  if (action === 'reset') {
    resetQueue();
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
