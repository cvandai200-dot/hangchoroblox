// app/api/roblox/validate/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json();

    if (!username || typeof username !== 'string' || username.trim().length < 3) {
      return NextResponse.json({ error: 'Tên Roblox không hợp lệ' }, { status: 400 });
    }

    const cleanUsername = username.trim();

    // Step 1: Get User ID from username
    const userResponse = await fetch('https://users.roblox.com/v1/usernames/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usernames: [cleanUsername],
        excludeBannedUsers: true,
      }),
    });

    if (!userResponse.ok) {
      return NextResponse.json({ error: 'Không thể kết nối Roblox API' }, { status: 502 });
    }

    const userData = await userResponse.json();

    if (!userData.data || userData.data.length === 0) {
      return NextResponse.json({ 
        error: 'Tên Roblox không tồn tại hoặc đã bị ban', 
        valid: false 
      }, { status: 404 });
    }

    const user = userData.data[0];
    const userId = user.id;
    const displayName = user.displayName || cleanUsername;

    // Step 2: Get Avatar Headshot 420x420
    const thumbnailUrl = `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=420x420&format=Png&isCircular=false`;

    // Verify thumbnail exists (optional but good)
    const thumbCheck = await fetch(thumbnailUrl, { method: 'HEAD' });
    
    return NextResponse.json({
      valid: true,
      username: cleanUsername,
      displayName,
      userId,
      avatarUrl: thumbCheck.ok ? thumbnailUrl : null,
    });

  } catch (error) {
    console.error('Roblox validate error:', error);
    return NextResponse.json({ 
      error: 'Lỗi khi kiểm tra tên Roblox. Vui lòng thử lại.' 
    }, { status: 500 });
  }
}
