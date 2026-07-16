// app/api/admin/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';

const ADMIN_PASSWORD = '9293020202'; // As provided by user

export async function POST(request: NextRequest) {
  const { password } = await request.json();

  if (password === ADMIN_PASSWORD) {
    return NextResponse.json({ success: true, message: 'Đăng nhập thành công' });
  }
  
  return NextResponse.json({ success: false, message: 'Mật khẩu sai' }, { status: 401 });
}
