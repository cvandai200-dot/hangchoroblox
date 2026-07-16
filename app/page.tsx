"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface RecentJoin {
  username: string;
  masked: string;
  joinedAt: string;
}

interface QueueStatus {
  totalJoined: number;
  remaining: number;
  recentJoins: RecentJoin[];
  maxQueue: number;
}

export default function RobloxQueueGiveaway() {
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [userId, setUserId] = useState<number | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState<any>(null);
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);

  // Fetch initial queue status
  const fetchQueueStatus = async () => {
    try {
      const res = await fetch('/api/queue/status');
      const data = await res.json();
      setQueueStatus(data);
    } catch (e) {
      console.error('Failed to fetch status');
    }
  };

  useEffect(() => {
    fetchQueueStatus();
    // Refresh status every 30s
    const interval = setInterval(fetchQueueStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  // Validate Roblox username + get avatar
  const validateRoblox = async () => {
    if (!username.trim() || username.trim().length < 3) {
      setError('Vui lòng nhập tên Roblox hợp lệ (ít nhất 3 ký tự)');
      return;
    }

    setIsValidating(true);
    setError('');
    setAvatarUrl(null);

    try {
      const res = await fetch('/api/roblox/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim() }),
      });

      const data = await res.json();

      if (!data.valid) {
        setError(data.error || 'Tên Roblox không tồn tại');
        return;
      }

      setAvatarUrl(data.avatarUrl);
      setDisplayName(data.displayName);
      setUserId(data.userId);
      setError('');
    } catch (err) {
      setError('Không thể kết nối. Vui lòng thử lại.');
    } finally {
      setIsValidating(false);
    }
  };

  // Join the giveaway queue
  const joinGiveaway = async () => {
    if (!username.trim() || !avatarUrl) return;

    setIsJoining(true);
    setError('');

    try {
      const res = await fetch('/api/queue/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim() }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message || 'Không thể tham gia lúc này');
        return;
      }

      // Success!
      setSuccessData({
        position: data.position,
        totalJoined: data.totalJoined,
        remaining: data.remaining,
        masked: data.masked,
        estimatedWait: data.estimatedWait,
      });
      setShowSuccess(true);
      setHasJoined(true);

      // Refresh global status
      await fetchQueueStatus();

      // Scroll to success
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (err) {
      setError('Lỗi khi tham gia. Vui lòng thử lại sau.');
    } finally {
      setIsJoining(false);
    }
  };

  const resetForm = () => {
    setUsername('');
    setAvatarUrl(null);
    setDisplayName('');
    setUserId(null);
    setError('');
    setSuccessData(null);
    setShowSuccess(false);
    setHasJoined(false);
  };

  const formatNumber = (num: number) => num.toLocaleString('vi-VN');

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Top Bar */}
      <div className="border-b border-white/10 bg-black/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#00A2FF] flex items-center justify-center text-xl font-black">R</div>
            <div>
              <div className="font-black text-2xl tracking-tighter">HÀNG CHỜ ROBLOX</div>
              <div className="text-[10px] text-[#00A2FF] -mt-1 font-mono">GIVEAWAY ROBUX</div>
            </div>
          </div>
          
          <a 
            href="/admin" 
            className="text-sm px-4 py-2 rounded-full border border-white/20 hover:bg-white/5 transition flex items-center gap-2"
          >
            <span>🔐</span> 
            <span className="hidden sm:inline">Quản trị</span>
          </a>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 pt-10 pb-20">
        {/* Hero Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00A2FF]/10 text-[#00A2FF] text-sm font-semibold mb-4">
            🎁 EVENT GIVEAWAY ROBUX • GIỚI HẠN 5.000 NGƯỜI
          </div>
          
          <h1 className="text-6xl sm:text-7xl font-black tracking-tighter mb-3">
            HÀNG CHỜ<br />GIVEAWAY ROBUX
          </h1>
          <p className="text-xl text-zinc-400 max-w-md mx-auto">
            Tham gia ngay! Mỗi tên Roblox chỉ được tham gia <span className="text-white font-semibold">1 lần</span>.
          </p>
          <p className="text-sm text-zinc-500 mt-2">~1.000 người chơi giàu có đang xếp hàng • Vui lòng đợi</p>
        </div>

        {/* Live Stats Bar */}
        {queueStatus && (
          <div className="mb-8 flex justify-center">
            <div className="inline-flex items-center gap-8 bg-[#121218] border border-white/10 rounded-2xl px-8 py-3 text-sm">
              <div>
                <span className="text-[#00A2FF] font-mono text-2xl font-black">{formatNumber(queueStatus.totalJoined)}</span>
                <span className="text-zinc-400 ml-2">đã tham gia</span>
              </div>
              <div className="h-3 w-px bg-white/20" />
              <div>
                <span className="text-emerald-400 font-mono text-2xl font-black">{formatNumber(queueStatus.remaining)}</span>
                <span className="text-zinc-400 ml-2">còn slot</span>
              </div>
            </div>
          </div>
        )}

        {/* SUCCESS STATE */}
        {showSuccess && successData && (
          <div className="mb-10 pop-in">
            <div className="roblox-card rounded-3xl p-8 md:p-10 text-center success-glow border-emerald-500/30">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-4xl font-black tracking-tight mb-2 text-emerald-400">THAM GIA THÀNH CÔNG!</h2>
              <p className="text-xl text-zinc-300 mb-6">Bạn đã được thêm vào danh sách Giveaway Robux</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
                <div className="bg-black/40 rounded-2xl p-5">
                  <div className="text-xs text-zinc-400 mb-1">VỊ TRÍ CỦA BẠN</div>
                  <div className="text-4xl font-black text-[#00A2FF]">#{formatNumber(successData.position)}</div>
                </div>
                <div className="bg-black/40 rounded-2xl p-5">
                  <div className="text-xs text-zinc-400 mb-1">TỔNG NGƯỜI THAM GIA</div>
                  <div className="text-4xl font-black">{formatNumber(successData.totalJoined)}<span className="text-base align-super text-zinc-400">/5000</span></div>
                </div>
                <div className="bg-black/40 rounded-2xl p-5">
                  <div className="text-xs text-zinc-400 mb-1">THỜI GIAN CHỜ ƯỚC TÍNH</div>
                  <div className="text-3xl font-black text-amber-400">{successData.estimatedWait}</div>
                </div>
              </div>

              {/* Progress */}
              <div className="max-w-md mx-auto mb-8">
                <div className="flex justify-between text-xs mb-1.5 text-zinc-400">
                  <div>Đã tham gia</div>
                  <div>{Math.round((successData.totalJoined / 5000) * 100)}%</div>
                </div>
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-3 bg-gradient-to-r from-[#00A2FF] to-emerald-400 rounded-full progress-bar" 
                    style={{ width: `${Math.min((successData.totalJoined / 5000) * 100, 100)}%` }}
                  />
                </div>
              </div>

              <button 
                onClick={resetForm}
                className="roblox-btn roblox-btn-primary px-10 py-3.5 rounded-2xl text-lg font-bold"
              >
                Tham gia bằng tên Roblox khác (nếu có)
              </button>
              <p className="text-xs text-zinc-500 mt-4">Mỗi IP và mỗi tên Roblox chỉ được tham gia 1 lần</p>
            </div>
          </div>
        )}

        {/* MAIN FORM - Only show if not joined yet */}
        {!showSuccess && (
          <div className="max-w-lg mx-auto">
            <div className="roblox-card rounded-3xl p-8 md:p-9">
              <div className="mb-6">
                <div className="uppercase tracking-[3px] text-xs font-bold text-[#00A2FF] mb-1">BƯỚC 1</div>
                <h3 className="text-2xl font-black">Nhập tên Roblox của bạn</h3>
              </div>

              {/* Username Input */}
              <div className="mb-4">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !avatarUrl) validateRoblox(); }}
                  placeholder="Ví dụ: Builderman hoặc tên Roblox của bạn"
                  className="roblox-input w-full px-6 py-4 rounded-2xl text-xl placeholder:text-zinc-500"
                  disabled={!!avatarUrl || hasJoined}
                />
              </div>

              {!avatarUrl && (
                <button
                  onClick={validateRoblox}
                  disabled={isValidating || !username.trim()}
                  className="roblox-btn roblox-btn-primary w-full py-4 rounded-2xl text-lg font-bold disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isValidating ? (
                    <>Đang kiểm tra tên Roblox...</>
                  ) : (
                    <>Kiểm tra &amp; Xem Avatar Roblox</>
                  )}
                </button>
              )}

              {/* Error */}
              {error && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl text-sm">
                  {error}
                </div>
              )}

              {/* Avatar Preview + Confirm */}
              {avatarUrl && (
                <div className="mt-6 pop-in">
                  <div className="text-center mb-4">
                    <div className="inline-block avatar-frame rounded-2xl overflow-hidden">
                      <img 
                        src={avatarUrl} 
                        alt="Roblox Avatar" 
                        className="w-[220px] h-[220px] object-cover"
                        onError={() => setAvatarUrl(null)}
                      />
                    </div>
                  </div>

                  <div className="text-center mb-6">
                    <div className="font-mono text-sm text-zinc-400">@{username}</div>
                    <div className="text-2xl font-black tracking-tight">{displayName}</div>
                  </div>

                  <button
                    onClick={joinGiveaway}
                    disabled={isJoining}
                    className="roblox-btn roblox-btn-primary w-full py-5 rounded-2xl text-xl font-black tracking-wider disabled:opacity-70 flex items-center justify-center gap-3"
                  >
                    {isJoining ? (
                      "ĐANG XỬ LÝ..."
                    ) : (
                      <>XÁC NHẬN THAM GIA GIVEAWAY 🎁</>
                    )}
                  </button>

                  <button 
                    onClick={() => { setAvatarUrl(null); setError(''); }}
                    className="mt-3 w-full text-sm text-zinc-400 hover:text-white transition"
                  >
                    ← Chọn tên khác
                  </button>
                </div>
              )}
            </div>

            {/* Info boxes */}
            <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <div className="bg-[#121218] border border-white/10 rounded-2xl p-4">
                <div className="font-semibold text-emerald-400">✓ Mỗi tên Roblox</div>
                <div className="text-zinc-400 text-xs mt-0.5">Chỉ được tham gia 1 lần duy nhất</div>
              </div>
              <div className="bg-[#121218] border border-white/10 rounded-2xl p-4">
                <div className="font-semibold text-emerald-400">✓ Mỗi IP</div>
                <div className="text-zinc-400 text-xs mt-0.5">Chỉ được tham gia 1 lần (chống spam)</div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Joiners */}
        {queueStatus && queueStatus.recentJoins.length > 0 && !showSuccess && (
          <div className="max-w-lg mx-auto mt-10">
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="uppercase text-xs tracking-[2px] font-bold text-zinc-400">Người mới tham gia gần đây</div>
              <div className="text-xs text-zinc-500">Ẩn danh 1 phần</div>
            </div>
            <div className="roblox-card rounded-3xl divide-y divide-white/10 overflow-hidden">
              {queueStatus.recentJoins.map((join, index) => (
                <div key={index} className="recent-item px-6 py-4 flex items-center justify-between text-sm">
                  <div className="font-mono text-[#00A2FF]">{join.masked}</div>
                  <div className="text-xs text-zinc-400">
                    {new Date(join.joinedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-center text-[10px] text-zinc-500 mt-3">Tên đã được ẩn danh để bảo vệ quyền riêng tư</p>
          </div>
        )}

        {/* Footer note */}
        <div className="text-center mt-16 text-xs text-zinc-500 max-w-xs mx-auto">
          Đây là <span className="font-semibold text-zinc-400">Fun App / Event giả lập</span> vui nhộn. 
          Không phải giveaway Robux thật. Hãy vui vẻ và chia sẻ cho bạn bè cùng tham gia!
        </div>
      </div>
    </div>
  );
}
