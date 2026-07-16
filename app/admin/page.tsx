"use client";

import React, { useState } from 'react';

interface AdminData {
  totalJoined: number;
  remaining: number;
  recentJoins: any[];
  allUsernames: string[];
  totalUsernames: number;
  maxQueue: number;
}

export default function AdminDashboard() {
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<AdminData | null>(null);
  const [resetting, setResetting] = useState(false);

  const ADMIN_PASSWORD = '9293020202';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (password !== ADMIN_PASSWORD) {
      setError('Mật khẩu không đúng');
      setIsLoading(false);
      return;
    }

    // Verify via API (optional but good)
    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      
      if (!res.ok) throw new Error();

      setIsLoggedIn(true);
      await fetchAdminData();
    } catch {
      setError('Lỗi xác thực. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAdminData = async () => {
    try {
      const res = await fetch('/api/admin/data', {
        headers: {
          'Authorization': `Bearer ${ADMIN_PASSWORD}`,
        },
      });
      if (!res.ok) throw new Error();
      const json = await res.json();
      setData(json);
    } catch {
      setError('Không thể tải dữ liệu');
    }
  };

  const handleReset = async () => {
    if (!confirm('Bạn chắc chắn muốn RESET toàn bộ hàng chờ? Hành động này không thể hoàn tác!')) return;

    setResetting(true);
    try {
      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ADMIN_PASSWORD}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'reset' }),
      });
      if (res.ok) {
        alert('Đã reset thành công!');
        await fetchAdminData();
      }
    } catch {
      alert('Lỗi khi reset');
    } finally {
      setResetting(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🔐</div>
            <h1 className="text-3xl font-black tracking-tight">Trang Quản Trị</h1>
            <p className="text-zinc-400 mt-2">Hàng Chờ Roblox - Giveaway</p>
          </div>

          <form onSubmit={handleLogin} className="roblox-card rounded-3xl p-8">
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2 text-zinc-300">MẬT KHẨU QUẢN TRỊ</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="roblox-input w-full px-5 py-3.5 rounded-2xl text-lg"
                placeholder="••••••••••"
                required
              />
            </div>

            {error && <div className="mb-4 text-red-400 text-sm">{error}</div>}

            <button 
              type="submit" 
              disabled={isLoading}
              className="roblox-btn roblox-btn-primary w-full py-3.5 rounded-2xl font-bold text-lg disabled:opacity-60"
            >
              {isLoading ? 'Đang xác thực...' : 'Đăng nhập'}
            </button>
          </form>

          <p className="text-center text-xs text-zinc-500 mt-6">Chỉ dành cho quản trị viên event</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-black tracking-tight">Quản Trị Hàng Chờ Roblox</h1>
            <p className="text-zinc-400">Giveaway Robux • Fun App</p>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="text-sm px-5 py-2 rounded-full border border-white/20 hover:bg-white/5"
          >
            Đăng xuất
          </button>
        </div>

        {data && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="roblox-card rounded-2xl p-6">
                <div className="text-xs text-zinc-400">TỔNG ĐÃ THAM GIA</div>
                <div className="text-5xl font-black text-[#00A2FF] mt-1">{data.totalJoined.toLocaleString('vi-VN')}</div>
              </div>
              <div className="roblox-card rounded-2xl p-6">
                <div className="text-xs text-zinc-400">CÒN SLOT</div>
                <div className="text-5xl font-black text-emerald-400 mt-1">{data.remaining.toLocaleString('vi-VN')}</div>
              </div>
              <div className="roblox-card rounded-2xl p-6">
                <div className="text-xs text-zinc-400">TỶ LỆ</div>
                <div className="text-5xl font-black mt-1">{Math.round((data.totalJoined / 5000) * 100)}<span className="text-3xl">%</span></div>
              </div>
              <div className="roblox-card rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="text-xs text-zinc-400">MAX QUEUE</div>
                  <div className="text-3xl font-black">5,000</div>
                </div>
                <button 
                  onClick={handleReset}
                  disabled={resetting}
                  className="mt-4 text-xs px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl font-semibold transition disabled:opacity-50"
                >
                  {resetting ? 'Đang reset...' : '🔄 RESET TOÀN BỘ QUEUE'}
                </button>
              </div>
            </div>

            {/* Recent + All list */}
            <div className="grid md:grid-cols-5 gap-6">
              {/* Recent */}
              <div className="md:col-span-2 roblox-card rounded-3xl p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2">🕒 Người mới tham gia gần đây</h3>
                {data.recentJoins.length > 0 ? (
                  <div className="space-y-2 text-sm">
                    {data.recentJoins.map((j, i) => (
                      <div key={i} className="flex justify-between py-2 border-b border-white/10 last:border-none">
                        <span className="font-mono text-[#00A2FF]">{j.masked}</span>
                        <span className="text-xs text-zinc-400">{new Date(j.joinedAt).toLocaleString('vi-VN')}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-zinc-400 text-sm">Chưa có ai tham gia</p>
                )}
              </div>

              {/* All Usernames */}
              <div className="md:col-span-3 roblox-card rounded-3xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold">📋 Danh sách tất cả ({data.totalUsernames})</h3>
                  <span className="text-xs px-3 py-1 bg-white/10 rounded-full">Tên đã lowercase</span>
                </div>

                {data.allUsernames.length > 0 ? (
                  <div className="max-h-[420px] overflow-auto pr-2 custom-scroll">
                    <table className="admin-table w-full text-sm">
                      <thead className="sticky top-0">
                        <tr>
                          <th className="text-left px-4 py-3 rounded-tl-2xl">#</th>
                          <th className="text-left px-4 py-3">Tên Roblox</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.allUsernames.map((name, index) => (
                          <tr key={index}>
                            <td className="px-4 py-3 font-mono text-xs text-zinc-400 w-12">{index + 1}</td>
                            <td className="px-4 py-3 font-mono text-[#00A2FF]">{name}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-zinc-400">Chưa có dữ liệu</p>
                )}
              </div>
            </div>
          </>
        )}

        {!data && isLoggedIn && <div className="text-center py-10 text-zinc-400">Đang tải dữ liệu...</div>}
      </div>
    </div>
  );
}
