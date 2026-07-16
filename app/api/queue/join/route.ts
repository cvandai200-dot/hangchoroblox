// app/api/queue/join/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { checkCanJoin ,joinQueue } from '../../../../lib/queue-store'

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json();

    if (!username || typeof username !== 'string') {
      return NextResponse.json({ error: 'Thiếu tên Roblox' }, { status: 400 });
    }

    // Get IP (Vercel + local support)
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : 
               request.headers.get('x-real-ip') || 
               '127.0.0.1';

    // Check if can join
    const check = await checkCanJoin(username, ip);

    if (!check.canJoin) {
      let message = '';
      if (check.reason === 'USERNAME_USED') message = 'Tên Roblox này đã tham gia rồi!';
      if (check.reason === 'IP_USED') message = 'IP của bạn đã tham gia giveaway này rồi.';
      if (check.reason === 'QUEUE_FULL') message = 'Hàng chờ đã đầy (5000 người). Cảm ơn bạn đã quan tâm!';

      return NextResponse.json({ 
        success: false, 
        reason: check.reason,
        message 
      }, { status: 409 });
    }

    // Join!
    const result = await joinQueue(username, ip);

    if (!result.success) {
      return NextResponse.json({ success: false, message: 'Không thể tham gia lúc này' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      position: result.position,
      totalJoined: result.totalJoined,
      remaining: result.remaining,
      masked: result.masked,
      estimatedWait: "2 - 3 giờ",
    });

  } catch (error) {
    console.error('Join queue error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Lỗi server. Vui lòng thử lại sau.' 
    }, { status: 500 });
  }
}
