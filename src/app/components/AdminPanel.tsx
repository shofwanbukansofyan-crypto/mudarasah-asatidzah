import { useState, useEffect } from 'react';
import type { User, Halaqah, Kitab, Jadwal, Soal } from '../types';
import type { UserRole } from '../types';
import { UserStore, HalaqahStore, KitabStore, JadwalStore, SoalStore } from '../../app/store';
import { Users, BookOpen, Plus, Pencil, Trash2, X } from 'lucide-react';

type AdminTab = 'dashboard' | 'halaqah' | 'akun';

interface AdminPanelProps {
  user: User;
  activeTab: AdminTab;
  setActiveTab?: (t: AdminTab) => void;
}

function PageHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h2 className="text-xl mb-1" style={{ fontFamily: "'Amiri', serif", color: '#0F354D', fontWeight: 700 }}>{title}</h2>
        {subtitle && <p className="text-sm" style={{ color: '#8B7355' }}>{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function StatCard({ icon, value, label, color }: { icon: React.ReactNode; value: number | string; label: string; color: string }) {
  return (
    <div className="bg-card rounded-xl border border-border p-5 flex items-center gap-4 shadow-sm">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color + '18' }}>
        <span style={{ color }}>{icon}</span>
      </div>
      <div>
        <p className="text-2xl font-semibold" style={{ color: '#3D2C1E' }}>{value}</p>
        <p className="text-xs" style={{ color: '#8B7355' }}>{label}</p>
      </div>
    </div>
  );
}

function Modal({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}>
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-border">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border">
          <h3 className="font-semibold" style={{ fontFamily: "'Amiri', serif", color: '#0F354D' }}>{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 transition hover:bg-muted" style={{ color: '#8B7355' }}><X size={18} /></button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

const inputCls = 'w-full px-3.5 py-2.5 rounded-lg border border-border bg-input-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm transition';
const btnPrimary = 'px-4 py-2 rounded-lg text-sm font-medium text-white transition-all';

// ---- Dashboard Section ----
function DashboardSection({ user }: { user: User }) {
  const [users, setUsers] = useState<User[]>([]);
  const [halaqah, setHalaqah] = useState<Halaqah[]>([]);
  const [kitab, setKitab] = useState<Kitab[]>([]);
  const [jadwal, setJadwal] = useState<Jadwal[]>([]);
  const [soalCount, setSoalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [u, h, k, j, s] = await Promise.all([
          UserStore.getAll(),
          HalaqahStore.getAll(),
          KitabStore.getAll(),
          JadwalStore.getAll(),
          SoalStore.getAll()
        ]);
        setUsers(u);
        setHalaqah(h);
        setKitab(k);
        setJadwal(j);
        setSoalCount(s.length);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-sm" style={{ color: '#8B7355' }}>Menghubungkan ke Cloud Railway...</div>;
  }

  const totalGuru = users.filter(u => u.role === 'guru').length;
  const totalAsatidz = users.filter(u => u.role === 'asatidz').length;

  return (
    <div>
      <PageHeader
        title="Dashboard Admin"
        subtitle={`Selamat datang, ${user.username}. Kelola sistem mudarasah dari cloud.`}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<Users size={20} />} value={halaqah.length} label="Total Halaqah" color="#0F354D" />
        <StatCard icon={<Users size={20} />} value={totalGuru} label="Total Guru" color="#4A9B6F" />
        <StatCard icon={<Users size={20} />} value={totalAsatidz} label="Total Asatidz" color="#4A7B9D" />
        <StatCard icon={<BookOpen size={20} />} value={kitab.length} label="Total Kitab" color="#C9A054" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
          <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide" style={{ color: '#705C3B' }}>Daftar Halaqah</h3>
          {halaqah.length === 0 ? (
            <p className="text-sm" style={{ color: '#8B7355' }}>Belum ada halaqah.</p>
          ) : halaqah.map(h => {
            const guru = users.find(u => u.id === h.guruId);
            return (
              <div key={h.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-medium" style={{ color: '#3D2C1E' }}>{h.name}</p>
                  <p className="text-xs" style={{ color: '#8B7355' }}>{guru?.username || '-'} · {h.memberIds?.length || 0} anggota</p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#E3F4ED', color: '#1B5E3B' }}>{h.memberIds?.length || 0} orang</span>
              </div>
            );
          })}
        </div>

        <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
          <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide" style={{ color: '#705C3B' }}>Ringkasan Sistem</h3>
          <div className="space-y-3">
            {[
              { label: 'Total Pengguna', val: users.length },
              { label: 'Total Jadwal', val: jadwal.length },
              { label: 'Total Kitab', val: kitab.length },
              { label: 'Total Soal Simulasi', val: soalCount },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-sm" style={{ color: '#705C3B' }}>{item.label}</span>
                <span className="text-sm font-semibold" style={{ color: '#0F354D' }}>{item.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- Halaqah Management ----
function HalaqahSection() {
  const [halaqah, setHalaqah] = useState<Halaqah[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [form, setForm] = useState({ name: '', guruId: '', memberIds: [] as string[] });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const [h, u] = await Promise.all([HalaqahStore.getAll(), UserStore.getAll()]);
    setHalaqah(h);
    setUsers(u);
  };

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-sm" style={{ color: '#8B7355' }}>Memuat data halaqah...</div>;

  const gurus = users.filter(u => u.role === 'guru');
  const asatidzList = users.filter(u => u.role === 'asatidz');

  const openCreate = () => {
    setForm({ name: '', guruId: '', memberIds: [] });
    setError('');
    setModal('create');
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Nama halaqah wajib diisi.'); return; }
    if (!form.guruId) { setError('Pilih guru terlebih dahulu.'); return; }

    if (modal === 'create') {
      await HalaqahStore.create({ name: form.name.trim(), guruId: form.guruId, memberIds: form.memberIds });
    }
    setModal(null);
    refresh();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus halaqah ini?')) return;
    await HalaqahStore.delete(id);
    refresh();
  };

  const toggleMember = (id: string) => {
    setForm(f => ({ ...f, memberIds: f.memberIds.includes(id) ? f.memberIds.filter(m => m !== id) : [...f.memberIds, id] }));
  };

  return (
    <div>
      <PageHeader title="Kelola Halaqah" subtitle="Buat dan atur grup mudarasah beserta anggotanya.">
        <button onClick={openCreate} className={btnPrimary} style={{ background: '#0F354D' }}>
          <Plus size={16} className="inline mr-1.5" />Buat Halaqah
        </button>
      </PageHeader>

      {halaqah.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center shadow-sm">
          <Users size={40} className="mx-auto mb-3" style={{ color: '#C4B99A' }} />
          <p className="font-medium" style={{ color: '#705C3B' }}>Belum ada halaqah</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {halaqah.map(h => {
            const guru = users.find(u => u.id === h.guruId);
            const members = users.filter(u => h.memberIds?.includes(u.id));
            return (
              <div key={h.id} className="bg-card rounded-xl border border-border p-5 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold" style={{ color: '#0F354D', fontFamily: "'Amiri', serif" }}>{h.name}</h3>
                    <p className="text-xs mt-0.5" style={{ color: '#8B7355' }}>Guru: {guru?.username || 'Tidak ada'}</p>
                  </div>
                  <button onClick={() => handleDelete(h.id)} className="p-1.5 rounded-lg transition hover:bg-red-50" style={{ color: '#C0392B' }}><Trash2 size={15} /></button>
                </div>
                <div>
                  <p className="text-xs mb-2 font-medium" style={{ color: '#705C3B' }}>Anggota ({members.length} orang):</p>
                  <div className="flex flex-wrap gap-1.5">
                    {members.map(m => (
                      <span key={m.id} className="text-xs px-2 py-0.5 rounded-full border" style={{ borderColor: '#D4C9B0', color: '#705C3B', backgroundColor: '#F0EDE3' }}>{m.username}</span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={!!modal} title="Buat Halaqah Baru" onClose={() => setModal(null)}>
        {error && <p className="mb-4 text-sm px-3 py-2 rounded-lg" style={{ background: '#FEF2F2', color: '#991B1B' }}>{error}</p>}
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1.5" style={{ color: '#705C3B' }}>Nama Halaqah</label>
            <input className={inputCls} placeholder="cth: Halaqah Al-Ikhlas" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm mb-1.5" style={{ color: '#705C3B' }}>Pilih Guru</label>
            <select className={inputCls} value={form.guruId} onChange={e => setForm(f => ({ ...f, guruId: e.target.value }))}>
              <option value="">-- Pilih Guru --</option>
              {gurus.map(g => <option key={g.id} value={g.id}>{g.username}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1.5" style={{ color: '#705C3B' }}>Pilih Anggota Asatidz</label>
            <div className="border border-border rounded-lg divide-y divide-border max-h-48 overflow-y-auto">
              {asatidzList.map(a => (
                <label key={a.id} className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-muted transition">
                  <input type="checkbox" checked={form.memberIds.includes(a.id)} onChange={() => toggleMember(a.id)} className="rounded" />
                  <span className="text-sm" style={{ color: '#3D2C1E' }}>{a.username}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModal(null)} className="flex-1 py-2 rounded-lg border border-border text-sm">Batal</button>
            <button onClick={handleSave} className="flex-1 py-2 rounded-lg text-sm font-medium text-white" style={{ background: '#0F354D' }}>Simpan</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ---- Account Management ----
function AkunSection() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const u = await UserStore.getAll();
    setUsers(u);
  };

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-sm" style={{ color: '#8B7355' }}>Memuat data akun...</div>;

  const filtered = users.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (u: User) => {
    if (u.role === 'admin') { alert('Akun admin tidak dapat dihapus.'); return; }
    if (!confirm(`Hapus akun "${u.username}"?`)) return;
    await UserStore.delete(u.id);
    refresh();
  };

  const roleBadge = (role: UserRole) => {
    const map = { admin: { bg: '#FEF3C7', color: '#92400E', label: 'Admin' }, guru: { bg: '#D1FAE5', color: '#065F46', label: 'Guru' }, asatidz: { bg: '#DBEAFE', color: '#1E40AF', label: 'Asatidz' } };
    const s = map[role];
    return <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: s.bg, color: s.color }}>{s.label}</span>;
  };

  return (
    <div>
      <PageHeader title="Kelola Akun" subtitle="Pantau semua akun yang terdaftar di cloud." />
      <div className="mb-4">
        <input className={inputCls} placeholder="Cari nama atau email..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: '#F0EDE3', borderBottom: '1px solid #D4C9B0' }}>
              {['Nama', 'Email', 'Role', 'Terdaftar', 'Aksi'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase" style={{ color: '#705C3B' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((u, i) => (
              <tr key={u.id} style={{ backgroundColor: i % 2 === 0 ? '#FDFBF4' : '#FAF8F0', borderBottom: '1px solid #EDE8DC' }}>
                <td className="px-4 py-3 font-medium" style={{ color: '#3D2C1E' }}>{u.username}</td>
                <td className="px-4 py-3" style={{ color: '#705C3B' }}>{u.email}</td>
                <td className="px-4 py-3">{roleBadge(u.role)}</td>
                <td className="px-4 py-3 text-xs" style={{ color: '#8B7355' }}>{u.createdAt || '-'}</td>
                <td className="px-4 py-3">
                  {u.role !== 'admin' && (
                    <button onClick={() => handleDelete(u)} className="p-1 rounded hover:bg-red-50 transition" style={{ color: '#C0392B' }}><Trash2 size={14} /></button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AdminPanel({ user, activeTab }: AdminPanelProps) {
  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      {activeTab === 'dashboard' && <DashboardSection user={user} />}
      {activeTab === 'halaqah' && <HalaqahSection />}
      {activeTab === 'akun' && <AkunSection />}
    </div>
  );
}