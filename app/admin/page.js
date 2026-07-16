'use client';

import { useState } from 'react';

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);

  const login = async () => {
    if (password !== 'admin123') {
      alert('Mật khẩu sai');
      return;
    }
    setLoggedIn(true);
    fetchData();
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin', {
        headers: { 'Authorization': 'Bearer admin123' }
      });
      const data = await res.json();
      setParticipants(data.participants || []);
    } catch (e) {
      alert('Lỗi tải dữ liệu');
    }
    setLoading(false);
  };

  const resetQueue = async () => {
    if (!confirm('Bạn chắc chắn muốn xóa toàn bộ danh sách?')) return;
    
    await fetch('/api/admin', {
      method: 'POST',
      headers: { 
        'Authorization': 'Bearer admin123',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ action: 'reset' })
    });
    alert('Đã reset!');
    fetchData();
  };

  const exportCSV = () => {
    if (participants.length === 0) return;

    let csv = 'Username,Email,Joined At,IP\n';
    participants.forEach(p => {
      csv += `${p.username},${p.email},${p.joinedAt},${p.ip}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'roblox-queue.csv';
    a.click();
  };

  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <h1 className="text-3xl font-bold text-center mb-8">Trang Quản Trị</h1>
          <div className="roblox-card p-8 rounded-3xl">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mật khẩu admin"
              className="input-roblox w-full px-5 py-3 rounded-2xl mb-4"
            />
            <button 
              onClick={login}
              className="w-full bg-[#00A2FF] py-3 rounded-2xl font-bold"
            >
              Đăng nhập
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Quản Trị Hàng Chờ Roblox</h1>
          <div className="flex gap-3">
            <button onClick={exportCSV} className="px-4 py-2 bg-emerald-500 rounded-xl font-semibold">Xuất CSV</button>
            <button onClick={resetQueue} className="px-4 py-2 bg-red-500 rounded-xl font-semibold">Reset</button>
          </div>
        </div>

        <div className="roblox-card rounded-3xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#1e2937]">
              <tr>
                <th className="text-left p-4">Username</th>
                <th className="text-left p-4">Email</th>
                <th className="text-left p-4">Thời gian</th>
                <th className="text-left p-4">IP</th>
              </tr>
            </thead>
            <tbody>
              {participants.length > 0 ? (
                participants.map((p, index) => (
                  <tr key={index} className="border-t border-gray-700">
                    <td className="p-4 font-mono">{p.username}</td>
                    <td className="p-4">{p.email}</td>
                    <td className="p-4 text-sm text-gray-400">{new Date(p.joinedAt).toLocaleString('vi-VN')}</td>
                    <td className="p-4 text-xs text-gray-500">{p.ip}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-gray-400">Chưa có người tham gia</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
