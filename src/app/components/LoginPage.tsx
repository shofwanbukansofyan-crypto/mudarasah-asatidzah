import { useState } from 'react';
import type { User } from '../types';
import { UserStore } from '../store';
import { Lock, Mail, User as UserIcon } from 'lucide-react';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        if (!username.trim() || !email.trim() || !password.trim()) {
          setError('Semua kolom wajib diisi.');
          setLoading(false);
          return;
        }
        const newUser = await UserStore.create({
          username: username.trim(),
          email: email.trim(),
          password,
          role: 'asatidz'
        });
        if (!newUser) throw new Error('Gagal mendaftarkan akun.');
        onLogin(newUser);
      } else {
        if (!email.trim() || !password.trim()) {
          setError('Email dan password wajib diisi.');
          setLoading(false);
          return;
        }
        const user = await UserStore.login(email.trim(), password);
        if (!user) throw new Error('Email atau password salah.');
        onLogin(user);
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#F7F5EC] overflow-y-auto">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-xl border border-border p-8 my-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl overflow-hidden shadow-md flex items-center justify-center bg-[#0F354D]">
            <img src="/img/Logo Al-Fayyadh.jpg" alt="Logo Al-Fayyadh" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "'Amiri', serif", color: '#0F354D' }}>
            Mudarasah Al-Fayyadh
          </h1>
          <p className="text-xs mt-1" style={{ color: '#8B7355' }}>Sistem Informasi Mudarasah Digital</p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl text-sm text-center font-medium bg-red-50 text-red-700 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#705C3B' }}>Nama Lengkap</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground"><UserIcon size={16} /></span>
                <input
                  type="text"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-border bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A054]"
                  placeholder="Nama lengkap"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#705C3B' }}>Email</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground"><Mail size={16} /></span>
              <input
                type="email"
                required
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-border bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A054]"
                placeholder="email@contoh.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#705C3B' }}>Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground"><Lock size={16} /></span>
              <input
                type="password"
                required
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-border bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A054]"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-xl text-sm font-semibold text-white transition shadow-md hover:opacity-95 disabled:opacity-50"
            style={{ backgroundColor: '#0F354D' }}
          >
            {loading ? 'Memproses...' : isRegister ? 'Daftar Akun' : 'Masuk Sistem'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => { setIsRegister(!isRegister); setError(''); }}
            className="text-xs font-medium hover:underline transition"
            style={{ color: '#C9A054' }}
          >
            {isRegister ? 'Sudah punya akun? Masuk di sini' : 'Belum punya akun? Daftar sebagai Asatidz'}
          </button>
        </div>
      </div>
    </div>
  );
}