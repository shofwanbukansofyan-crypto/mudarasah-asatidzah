import { useState } from 'react';
import type { User } from './types';
import { UserStore } from './store'; 
import { LoginPage } from './components/LoginPage';
import { Layout } from './components/Layout';

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('mudarasah_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    localStorage.setItem('mudarasah_current_user', JSON.stringify(loggedInUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('mudarasah_current_user');
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#F7F5EC] text-[#3D2C1E] selection:bg-[#C9A054]/20">
      {!user ? (
        <LoginPage onLogin={handleLogin} />
      ) : (
        <Layout user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}