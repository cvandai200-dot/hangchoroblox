'use client';

import { useState } from 'react';

export default function RobloxQueue() {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Validate Roblox username
  const validateUsername = async () => {
    if (!username.trim()) {
      setError('Vui lòng nhập tên Roblox');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Get user ID
      const userRes = await fetch('https://users.roblox.com/v1/usernames/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usernames: [username.trim()],
          excludeBannedUsers: true
        })
      });

      const userData = await userRes.json();

      if (!userData.data || userData.data.length === 0) {
        setError('Tên Roblox không tồn tại');
        setLoading(false);
        return;
      }

      const userId = userData.data[0].id;
      const name = userData.data[0].displayName || username;

      // Get avatar
      const avatarRes = await fetch(
        `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=420x420&format=Png&isCircular=false`
      );
      const avatarData = await avatarRes.json();

      const avatar = avatarData.data?.[0]?.imageUrl || '';

      setDisplayName(name);
      setAvatarUrl(avatar);
      setStep(2);
    } catch (err) {
      setError('Không thể kết nối Roblox. Vui lòng thử lại.');
    }

    setLoading(false);
  };

  // Join queue
  const joinQueue = async () => {
    if (!email || !email.includes('@')) {
      setError('Vui lòng nhập email hợp lệ');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim()
        })
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.message || 'Không thể tham gia');
      }
    } catch (err) {
      setError('Lỗi server. Vui lòng thử lại.');
    }

    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="text-6xl mb-6">🎉</div>
          <h1 className="text-4xl font-bold mb-4">Tham gia thành công!</h1>
          <div className="roblox-card p-6 rounded-2xl mb-6">
            {avatarUrl && (
              <img src={avatarUrl} alt="Avatar" className="w-24 h-24 mx-auto rounded-full mb-4 border-4 border-[#00A2FF]" />
            )}
            <p className="text-xl font-semibold">{displayName}</p>
            <p className="text-sm text-gray-400 mt-1">{email}</p>
          </div>
          <p className="text-gray-400">Cảm ơn bạn đã tham gia hàng chờ Giveaway Robux!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <div className="max-w-lg mx-auto px-6 pt-12 pb-20">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-black tracking-tight">HÀNG CHỜ ROBLOX</h1>
          <p className="text-[#00A2FF] mt-2">Giveaway Robux • Mỗi người chỉ tham gia 1 lần</p>
        </div>

        {/* Step 1: Validate Username */}
        {step === 1 && (
          <div className="roblox-card p-8 rounded-3xl">
            <h2 className="text-2xl font-bold mb-6">Bước 1: Nhập tên Roblox</h2>
            
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nhập tên Roblox của bạn"
              className="input-roblox w-full px-5 py-4 rounded-2xl text-lg mb-4"
            />

            {error && <p className="text-red-400 mb-4 text-sm">{error}</p>}

            <button
              onClick={validateUsername}
              disabled={loading}
              className="roblox-btn w-full bg-[#00A2FF] hover:bg-[#0088cc] py-4 rounded-2xl font-bold text-lg disabled:opacity-60"
            >
              {loading ? 'Đang kiểm tra...' : 'Kiểm tra & Tiếp tục'}
            </button>
          </div>
        )}

        {/* Step 2: Email + Join */}
        {step === 2 && (
          <div className="roblox-card p-8 rounded-3xl">
            <h2 className="text-2xl font-bold mb-6">Bước 2: Xác nhận tham gia</h2>

            {avatarUrl && (
              <div className="flex items-center gap-4 mb-6 p-4 bg-[#1e2937] rounded-2xl">
                <img src={avatarUrl} alt="Avatar" className="w-16 h-16 rounded-full border-2 border-[#00A2FF]" />
                <div>
                  <p className="font-bold text-lg">{displayName}</p>
                  <p className="text-sm text-gray-400">@{username}</p>
                </div>
              </div>
            )}

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email của bạn"
              className="input-roblox w-full px-5 py-4 rounded-2xl text-lg mb-4"
            />

            {error && <p className="text-red-400 mb-4 text-sm">{error}</p>}

            <button
              onClick={joinQueue}
              disabled={loading}
              className="roblox-btn w-full bg-emerald-500 hover:bg-emerald-600 py-4 rounded-2xl font-bold text-lg disabled:opacity-60 mb-3"
            >
              {loading ? 'Đang xử lý...' : 'Xác nhận tham gia hàng chờ'}
            </button>

            <button 
              onClick={() => { setStep(1); setError(''); setAvatarUrl(''); }}
              className="w-full text-sm text-gray-400 hover:text-white"
            >
              ← Quay lại bước 1
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
