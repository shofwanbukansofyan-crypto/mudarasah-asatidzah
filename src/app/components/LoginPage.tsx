import { useState } from 'react';
import type { User } from '../types';
import { UserStore } from '../store';
import { IslamicPattern } from './IslamicPattern';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [view, setView] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ email: '', password: '', username: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [k]: e.target.value }));
    setError('');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) { setError('Email dan password wajib diisi.'); return; }
    setLoading(true);
    setTimeout(() => {
      const user = UserStore.login(form.email.trim(), form.password);
      if (!user) { setError('Email atau password salah.'); setLoading(false); return; }
      onLogin(user);
    }, 300);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.username || !form.email || !form.password || !form.confirmPassword) {
      setError('Semua field wajib diisi.'); return;
    }
    if (form.password.length < 6) { setError('Password minimal 6 karakter.'); return; }
    if (form.password !== form.confirmPassword) { setError('Password tidak cocok.'); return; }
    if (UserStore.getByEmail(form.email.trim())) { setError('Email sudah terdaftar.'); return; }
    setLoading(true);
    setTimeout(() => {
      const user = UserStore.create({ username: form.username.trim(), email: form.email.trim(), password: form.password, role: 'asatidz' });
      onLogin(user);
    }, 300);
  };

  const inputCls = 'w-full px-4 py-2.5 rounded-lg border border-border bg-input-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition';

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4" style={{ backgroundColor: '#F7F5EC' }}>
      <IslamicPattern opacity={0.55} />
      <div className="relative z-10 w-full max-w-md">
       {/* Logo/Header Diperbarui */}
<div className="text-center mb-6 flex flex-col items-center">
  <div className="w-24 h-24 mb-3 flex items-center justify-center">
    <img 
      src={"/img/Logo Al-Fayyadh.jpg"} // Sesuaikan path ini dengan lokasi gambar logo Anda
      alt={"Logo Mudarasah Al-Fayyadh"}
      className={"w-full h-full object-contain"}
    />
  </div>
  {/* Tambahkan Judul Teks Kembali Jika Perlu, Sesuai Gambar Asli */}
  <h1 className="text-2xl font-bold text-[#0F354D]">Mudarasah Asatidz Al-Fayyadh</h1>
  <p className="text-sm text-gray-600">Sistem Mudarasah Digital</p>
</div>
          <h1 className="text-xl mb-0.5" style={{ fontFamily: "'Amiri', Georgia, serif", color: '#0F354D', fontWeight: 700 }}>
            Mudarasah Asatidz Al-Fayyadh
          </h1>
          <p className="text-sm" style={{ color: '#8B7355' }}>Sistem Mudarasah Digital</p>
        </div>

        {/* Card */}
        <div className="bg-card rounded-2xl border border-border shadow-lg overflow-hidden">
          {/* Arabic bismillah header */}
          <div className="px-8 pt-6 pb-4 border-b border-border" style={{ background: 'linear-gradient(135deg, #0F354D 0%, #1a4f70 100%)' }}>
            <p className="text-center text-lg mb-1" style={{ fontFamily: "'Amiri', serif", color: '#C9A054', direction: 'rtl' }}>
              بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
            </p>
            <p className="text-center text-sm" style={{ color: 'rgba(227,218,201,0.8)' }}>
              {view === 'login' ? 'Masuk ke Akun Anda' : 'Daftar Akun Baru'}
            </p>
          </div>

          <div className="px-8 py-6">
            {error && (
              <div className="mb-4 px-4 py-2.5 rounded-lg text-sm border" style={{ background: '#FEF2F2', borderColor: '#FECACA', color: '#991B1B' }}>
                {error}
              </div>
            )}

            {view === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm mb-1.5" style={{ color: '#705C3B' }}>Email</label>
                  <input type="email" placeholder="email@contoh.com" className={inputCls} value={form.email} onChange={set('email')} />
                </div>
                <div>
                  <label className="block text-sm mb-1.5" style={{ color: '#705C3B' }}>Password</label>
                  <input type="password" placeholder="••••••••" className={inputCls} value={form.password} onChange={set('password')} />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-lg font-medium text-white transition-all duration-200 mt-2"
                  style={{ background: loading ? '#4A7B9D' : '#0F354D' }}
                >
                  {loading ? 'Memproses...' : 'Masuk'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-sm mb-1.5" style={{ color: '#705C3B' }}>Nama Lengkap</label>
                  <input type="text" placeholder="Masukkan nama lengkap" className={inputCls} value={form.username} onChange={set('username')} />
                </div>
                <div>
                  <label className="block text-sm mb-1.5" style={{ color: '#705C3B' }}>Email</label>
                  <input type="email" placeholder="email@contoh.com" className={inputCls} value={form.email} onChange={set('email')} />
                </div>
                <div>
                  <label className="block text-sm mb-1.5" style={{ color: '#705C3B' }}>Password</label>
                  <input type="password" placeholder="Min. 6 karakter" className={inputCls} value={form.password} onChange={set('password')} />
                </div>
                <div>
                  <label className="block text-sm mb-1.5" style={{ color: '#705C3B' }}>Konfirmasi Password</label>
                  <input type="password" placeholder="Ulangi password" className={inputCls} value={form.confirmPassword} onChange={set('confirmPassword')} />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-lg font-medium text-white transition-all duration-200 mt-2"
                  style={{ background: loading ? '#4A7B9D' : '#0F354D' }}
                >
                  {loading ? 'Memproses...' : 'Daftar'}
                </button>
              </form>
            )}

            <div className="mt-5 pt-4 border-t border-border text-center">
              {view === 'login' ? (
                <p className="text-sm" style={{ color: '#8B7355' }}>
                  Belum punya akun?{' '}
                  <button onClick={() => { setView('register'); setError(''); setForm({ email: '', password: '', username: '', confirmPassword: '' }); }} className="font-medium hover:underline" style={{ color: '#705C3B' }}>
                    Buat Akun Baru
                  </button>
                </p>
              ) : (
                <p className="text-sm" style={{ color: '#8B7355' }}>
                  Sudah punya akun?{' '}
                  <button onClick={() => { setView('login'); setError(''); setForm({ email: '', password: '', username: '', confirmPassword: '' }); }} className="font-medium hover:underline" style={{ color: '#705C3B' }}>
                    Masuk Sekarang
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>

       
      </div>
    
  );
}
