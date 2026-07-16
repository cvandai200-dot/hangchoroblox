import { NextResponse } from 'next/server';
import { addToQueue } from '../../../lib/queue';

export async function POST(request) {
  try {
    const { username, email } = await request.json();
    const ip = request.headers.get('x-forwarded-for') || 'unknown';

    if (!username || !email) {
      return NextResponse.json({ success: false, message: 'Thiếu thông tin' }, { status: 400 });
    }

    const result = addToQueue({
      username,
      email,
      ip
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Lỗi server' }, { status: 500 });
  }
}
