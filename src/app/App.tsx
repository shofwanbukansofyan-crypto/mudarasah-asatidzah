import { useState, useEffect } from 'react';
import type { User } from './types';
import { LoginPage } from './components/LoginPage';
import { Layout } from './components/Layout';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('mudarasah_current_user');
      if (saved) {
        // Langsung gunakan data user yang tersimpan di sesi browser
        const parsed = JSON.parse(saved) as User;
        setCurrentUser(parsed);
      }
    } catch {
      localStorage.removeItem('mudarasah_current_user');
    }
    setReady(true);
  }, []);

  const handleLogin = (user: User) => {
    localStorage.setItem('mudarasah_current_user', JSON.stringify(user));
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('mudarasah_current_user');
    setCurrentUser(null);
  };

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F7F5EC' }}>
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-3" style={{ borderColor: '#0F354D', borderTopColor: 'transparent' }} />
          <p className="text-sm" style={{ color: '#8B7355' }}>Memuat sistem...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return <Layout user={currentUser} onLogout={handleLogout} />;
}