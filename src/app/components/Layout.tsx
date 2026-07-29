import { useState } from 'react';
import type { User } from '../types';
import { AdminPanel } from './AdminPanel';
import { GuruPanel } from './GuruPanel';
import { AsatidzPanel } from './AsatidzPanel';
import {
  LayoutDashboard, CalendarCheck, BookOpen, FileQuestion, Calendar,
  Users, BookMarked, LogOut, Menu, ChevronRight, Shield, GraduationCap, UserCheck
} from 'lucide-react';

interface LayoutProps {
  user: User;
  onLogout: () => void;
}

type AdminTab = 'dashboard' | 'halaqah' | 'akun';
type GuruTab = 'dashboard' | 'jadwal' | 'kitab' | 'soal' | 'rekap';
type AsatidzTab = 'beranda' | 'absensi' | 'kitab' | 'simulasi';
type ActiveTab = AdminTab | GuruTab | AsatidzTab;

function roleLabel(role: User['role']) {
  if (role === 'admin') return { label: 'Administrator', icon: <Shield size={14} />, color: '#C9A054' };
  if (role === 'guru') return { label: 'Guru', icon: <GraduationCap size={14} />, color: '#4A9B6F' };
  return { label: 'Asatidz', icon: <UserCheck size={14} />, color: '#4A7B9D' };
}

function adminNav(active: ActiveTab, setTab: (t: ActiveTab) => void) {
  const items: { key: AdminTab; label: string; icon: React.ReactNode }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { key: 'halaqah', label: 'Kelola Halaqah', icon: <Users size={18} /> },
    { key: 'akun', label: 'Kelola Akun', icon: <UserCheck size={18} /> },
  ];
  return items.map(item => (
    <NavItem key={item.key} active={active === item.key} icon={item.icon} label={item.label} onClick={() => setTab(item.key)} />
  ));
}

function guruNav(active: ActiveTab, setTab: (t: ActiveTab) => void) {
  const items: { key: GuruTab; label: string; icon: React.ReactNode }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { key: 'jadwal', label: 'Jadwal Mudarasah', icon: <Calendar size={18} /> },
    { key: 'kitab', label: 'Kitab', icon: <BookMarked size={18} /> },
    { key: 'soal', label: 'Soal Simulasi', icon: <FileQuestion size={18} /> },
    { key: 'rekap', label: 'Rekap Absensi', icon: <CalendarCheck size={18} /> },
  ];
  return items.map(item => (
    <NavItem key={item.key} active={active === item.key} icon={item.icon} label={item.label} onClick={() => setTab(item.key)} />
  ));
}

function asatidzNav(active: ActiveTab, setTab: (t: ActiveTab) => void) {
  const items: { key: AsatidzTab; label: string; icon: React.ReactNode }[] = [
    { key: 'beranda', label: 'Beranda', icon: <LayoutDashboard size={18} /> },
    { key: 'absensi', label: 'Absensi', icon: <CalendarCheck size={18} /> },
    { key: 'kitab', label: 'Kitab', icon: <BookOpen size={18} /> },
    { key: 'simulasi', label: 'Soal Simulasi', icon: <FileQuestion size={18} /> },
  ];
  return items.map(item => (
    <NavItem key={item.key} active={active === item.key} icon={item.icon} label={item.label} onClick={() => setTab(item.key)} />
  ));
}

function NavItem({ active, icon, label, onClick }: { active: boolean; icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200 text-left group"
      style={{
        backgroundColor: active ? 'rgba(201,160,84,0.15)' : 'transparent',
        color: active ? '#C9A054' : 'rgba(247,245,236,0.75)',
      }}
      onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(255,255,255,0.07)'; }}
      onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; }}
    >
      <span style={{ color: active ? '#C9A054' : 'rgba(227,218,201,0.6)' }}>{icon}</span>
      <span>{label}</span>
      {active && <ChevronRight size={14} className="ml-auto" style={{ color: '#C9A054' }} />}
    </button>
  );
}

export function Layout({ user, onLogout }: LayoutProps) {
  const defaultTab = user.role === 'admin' ? 'dashboard' : user.role === 'guru' ? 'dashboard' : 'beranda';
  const [activeTab, setActiveTab] = useState<ActiveTab>(defaultTab as ActiveTab);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { label, icon, color } = roleLabel(user.role);

  const sidebar = (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#0F354D' }}>
      {/* Logo */}
      <div className="px-5 py-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(201,160,84,0.2)' }}>
            <svg viewBox="0 0 32 32" width="22" height="22" fill="none">
              <path d="M16 3 L16 29 M3 16 L29 16 M5.5 5.5 L26.5 26.5 M26.5 5.5 L5.5 26.5" stroke="#C9A054" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="16" cy="16" r="5.5" stroke="#C9A054" strokeWidth="1.5" />
              <circle cx="16" cy="16" r="2" fill="#C9A054" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-xs leading-tight" style={{ fontFamily: "'Amiri', serif", color: '#C9A054', fontWeight: 700 }}>
              Al-Fayyadh
            </p>
            <p className="text-xs leading-tight" style={{ color: 'rgba(247,245,236,0.6)' }}>Sistem Mudarasah</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-4 text-xs mb-2 uppercase tracking-wider" style={{ color: 'rgba(227,218,201,0.4)' }}>Menu Utama</p>
        {user.role === 'admin' && adminNav(activeTab, (t) => { setActiveTab(t); setSidebarOpen(false); })}
        {user.role === 'guru' && guruNav(activeTab, (t) => { setActiveTab(t); setSidebarOpen(false); })}
        {user.role === 'asatidz' && asatidzNav(activeTab, (t) => { setActiveTab(t); setSidebarOpen(false); })}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0" style={{ backgroundColor: 'rgba(201,160,84,0.25)', color: '#C9A054' }}>
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm truncate" style={{ color: '#F7F5EC' }}>{user.username}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <span style={{ color }}>{icon}</span>
              <span className="text-xs" style={{ color: 'rgba(227,218,201,0.6)' }}>{label}</span>
            </div>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all"
          style={{ color: 'rgba(247,245,236,0.6)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(192,57,43,0.15)'; (e.currentTarget as HTMLButtonElement).style.color = '#E74C3C'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(247,245,236,0.6)'; }}
        >
          <LogOut size={16} />
          <span>Keluar</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#F7F5EC' }}>
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-col w-60 flex-shrink-0 shadow-xl">
        {sidebar}
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="flex flex-col w-64 shadow-2xl">{sidebar}</div>
          <div className="flex-1 bg-black/40" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile topbar */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 shadow-sm" style={{ backgroundColor: '#0F354D' }}>
          <button onClick={() => setSidebarOpen(true)} style={{ color: '#F7F5EC' }}>
            <Menu size={22} />
          </button>
          <p className="text-sm font-medium" style={{ fontFamily: "'Amiri', serif", color: '#C9A054' }}>Al-Fayyadh</p>
          <div className="w-6" />
        </div>

        <div className="flex-1 overflow-y-auto">
          {user.role === 'admin' && <AdminPanel user={user} activeTab={activeTab as AdminTab} setActiveTab={(t) => setActiveTab(t)} />}
          {user.role === 'guru' && <GuruPanel user={user} activeTab={activeTab as GuruTab} setActiveTab={(t) => setActiveTab(t)} />}
          {user.role === 'asatidz' && <AsatidzPanel user={user} activeTab={activeTab as AsatidzTab} setActiveTab={(t) => setActiveTab(t)} />}
        </div>
      </div>
    </div>
  );
}
