import { useState } from 'react';
import type { User, Jadwal, Kitab, Soal, Question } from '../types';
import { UserStore, HalaqahStore, JadwalStore, KitabStore, SoalStore, AbsensiStore, SubmissionStore, genId } from '../store';
import { Plus, Trash2, X, BookOpen, Calendar, FileQuestion, CalendarCheck, ExternalLink, Pencil, Search, Eye, EyeOff } from 'lucide-react';

type GuruTab = 'dashboard' | 'jadwal' | 'kitab' | 'soal' | 'rekap';

interface GuruPanelProps {
  user: User;
  activeTab: GuruTab;
  setActiveTab?: (t: GuruTab) => void;
}

function PageHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
      <div>
        <h2 className="text-xl mb-1" style={{ fontFamily: "'Amiri', serif", color: '#0F354D', fontWeight: 700 }}>{title}</h2>
        {subtitle && <p className="text-sm" style={{ color: '#8B7355' }}>{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function Modal({ open, title, onClose, children, wide }: { open: boolean; title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}>
      <div className={`bg-card rounded-2xl shadow-2xl w-full ${wide ? 'max-w-2xl' : 'max-w-lg'} max-h-[90vh] overflow-y-auto border border-border`}>
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

function formatDate(d: string) {
  const dt = new Date(d + 'T00:00:00');
  return dt.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

// ---- Dashboard ----
function DashboardSection({ user }: { user: User }) {
  const halaqah = HalaqahStore.getByGuru(user.id);
  const jadwal = halaqah ? JadwalStore.getByHalaqah(halaqah.id) : [];
  const kitab = halaqah ? KitabStore.getByHalaqah(halaqah.id) : [];
  const soal = halaqah ? SoalStore.getByHalaqah(halaqah.id) : [];
  
  const today = new Date().toISOString().split('T')[0];
  const upcoming = jadwal.filter(j => j.date >= today).sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div>
      <PageHeader title="Dashboard Guru" subtitle={`Selamat datang, ${user.username}.`} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<Calendar size={20} />} value={jadwal.length} label="Total Jadwal" color="#0F354D" />
        <StatCard icon={<BookOpen size={20} />} value={kitab.length} label="Kitab Diunggah" color="#C9A054" />
        <StatCard icon={<FileQuestion size={20} />} value={soal.length} label="Soal Dibuat" color="#4A9B6F" />
        <StatCard icon={<CalendarCheck size={20} />} value={upcoming.length} label="Jadwal Mendatang" color="#4A7B9D" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
          <h3 className="font-semibold mb-3 text-sm" style={{ color: '#705C3B' }}>Halaqah Saya</h3>
          {halaqah ? (
            <div>
              <p className="font-semibold" style={{ fontFamily: "'Amiri', serif", color: '#0F354D' }}>{halaqah.name}</p>
              <p className="text-sm mt-1" style={{ color: '#8B7355' }}>{halaqah.memberIds.length} anggota terdaftar</p>
            </div>
          ) : (
            <p className="text-sm" style={{ color: '#8B7355' }}>Anda belum ditugaskan ke halaqah. Hubungi admin.</p>
          )}
        </div>
        <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
          <h3 className="font-semibold mb-3 text-sm" style={{ color: '#705C3B' }}>Jadwal Mendatang</h3>
          {upcoming.slice(0, 3).map(j => (
            <div key={j.id} className="py-2 border-b border-border last:border-0">
              <p className="text-sm font-medium" style={{ color: '#3D2C1E' }}>{j.topic}</p>
              <p className="text-xs mt-0.5" style={{ color: '#8B7355' }}>{formatDate(j.date)} · {j.time} {j.endTime ? `- ${j.endTime}` : ''} WITA</p>
            </div>
          ))}
          {upcoming.length === 0 && <p className="text-sm" style={{ color: '#8B7355' }}>Tidak ada jadwal mendatang.</p>}
        </div>
      </div>
    </div>
  );
}

// ---- Jadwal ----
function JadwalSection({ user }: { user: User }) {
  const halaqah = HalaqahStore.getByGuru(user.id);
  const [jadwal, setJadwal] = useState(() => halaqah ? JadwalStore.getByHalaqah(halaqah.id) : []);
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ date: '', time: '08:00', endTime: '10:00', topic: '', location: '' });
  const [error, setError] = useState('');

  const refresh = () => setJadwal(halaqah ? JadwalStore.getByHalaqah(halaqah.id) : []);

  const openCreateModal = () => {
    setEditId(null);
    setForm({ date: '', time: '08:00', endTime: '10:00', topic: '', location: '' });
    setError('');
    setModal(true);
  };

  const openEditModal = (j: Jadwal) => {
    setEditId(j.id);
    setForm({
      date: j.date,
      time: j.time,
      endTime: j.endTime || '',
      topic: j.topic,
      location: j.location || ''
    });
    setError('');
    setModal(true);
  };

  const handleSave = () => {
    if (!form.date || !form.topic.trim()) { setError('Tanggal dan topik wajib diisi.'); return; }
    if (!halaqah) return;

    if (editId) {
      JadwalStore.update(editId, {
        halaqahId: halaqah.id,
        guruId: user.id,
        date: form.date,
        time: form.time,
        endTime: form.endTime,
        topic: form.topic.trim(),
        location: form.location.trim()
      });
    } else {
      JadwalStore.create({
        halaqahId: halaqah.id,
        guruId: user.id,
        date: form.date,
        time: form.time,
        endTime: form.endTime,
        topic: form.topic.trim(),
        location: form.location.trim()
      });
    }
    setModal(false);
    refresh();
  };

  const handleDelete = (j: Jadwal) => {
    if (!confirm(`Hapus jadwal "${j.topic}"?`)) return;
    JadwalStore.delete(j.id);
    refresh();
  };

  const sorted = [...jadwal].sort((a, b) => b.date.localeCompare(a.date));
  const today = new Date().toISOString().split('T')[0];

  return (
    <div>
      <PageHeader title="Jadwal Mudarasah" subtitle="Atur jadwal mudarasah untuk halaqah Anda.">
        {halaqah && (
          <button onClick={openCreateModal} className={btnPrimary} style={{ background: '#0F354D' }}>
            <Plus size={16} className="inline mr-1.5" />Buat Jadwal
          </button>
        )}
      </PageHeader>

      {!halaqah && (
        <div className="bg-card rounded-xl border border-border p-8 text-center shadow-sm">
          <p style={{ color: '#8B7355' }}>Anda belum ditugaskan ke halaqah. Hubungi admin untuk pengaturan halaqah.</p>
        </div>
      )}

      <div className="space-y-3">
        {sorted.map(j => {
          const isPast = j.date < today;
          const isToday = j.date === today;
          return (
            <div key={j.id} className="bg-card rounded-xl border border-border p-4 shadow-sm flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl flex flex-col items-center justify-center" style={{ backgroundColor: isToday ? '#0F354D' : isPast ? '#EDE8DC' : '#E3F4ED' }}>
                <p className="text-xs leading-none font-semibold" style={{ color: isToday ? '#C9A054' : isPast ? '#8B7355' : '#1B5E3B' }}>
                  {new Date(j.date + 'T00:00:00').toLocaleDateString('id-ID', { day: '2-digit' })}
                </p>
                <p className="text-xs leading-none mt-0.5" style={{ color: isToday ? '#E3DAC9' : isPast ? '#8B7355' : '#1B5E3B' }}>
                  {new Date(j.date + 'T00:00:00').toLocaleDateString('id-ID', { month: 'short' })}
                </p>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-sm" style={{ color: '#3D2C1E' }}>{j.topic}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#8B7355' }}>
                      {j.time} {j.endTime ? `- ${j.endTime}` : ''} WITA · {j.location || 'Lokasi tidak disebutkan'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isToday && <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: '#0F354D', color: '#C9A054' }}>Hari Ini</span>}
                    {isPast && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#EDE8DC', color: '#8B7355' }}>Selesai</span>}
                    <button onClick={() => openEditModal(j)} className="p-1 rounded hover:bg-muted transition" style={{ color: '#705C3B' }} title="Edit Jadwal"><Pencil size={14} /></button>
                    <button onClick={() => handleDelete(j)} className="p-1 rounded hover:bg-red-50 transition" style={{ color: '#C0392B' }} title="Hapus Jadwal"><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {jadwal.length === 0 && halaqah && (
          <div className="bg-card rounded-xl border border-border p-10 text-center shadow-sm">
            <Calendar size={36} className="mx-auto mb-3" style={{ color: '#C4B99A' }} />
            <p className="text-sm" style={{ color: '#8B7355' }}>Belum ada jadwal. Buat jadwal mudarasah pertama Anda.</p>
          </div>
        )}
      </div>

      <Modal open={modal} title={editId ? "Edit Jadwal Mudarasah" : "Buat Jadwal Mudarasah"} onClose={() => setModal(false)}>
        {error && <p className="mb-4 text-sm px-3 py-2 rounded-lg" style={{ background: '#FEF2F2', color: '#991B1B' }}>{error}</p>}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm mb-1.5" style={{ color: '#705C3B' }}>Tanggal</label>
              <input type="date" className={inputCls} value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm mb-1.5" style={{ color: '#705C3B' }}>Jam Mulai</label>
              <input type="time" className={inputCls} value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm mb-1.5" style={{ color: '#705C3B' }}>Jam Selesai</label>
              <input type="time" className={inputCls} value={form.endTime || ''} onChange={e => setForm({ ...form, endTime: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-sm mb-1.5" style={{ color: '#705C3B' }}>Topik / Materi</label>
            <input className={inputCls} placeholder="cth: Tafsir Surah Al-Mulk Ayat 1-10" value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm mb-1.5" style={{ color: '#705C3B' }}>Lokasi</label>
            <input className={inputCls} placeholder="cth: Masjid Al-Fayyadh" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModal(false)} className="flex-1 py-2 rounded-lg border border-border text-sm transition hover:bg-muted" style={{ color: '#705C3B' }}>Batal</button>
            <button onClick={handleSave} className="flex-1 py-2 rounded-lg text-sm font-medium text-white" style={{ background: '#0F354D' }}>Simpan</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ---- Kitab ----
const COVER_COLORS = ['#0F354D', '#1B4D3E', '#4A3728', '#5C3317', '#2C3E50', '#6B2D8B', '#8B1A1A'];

function KitabSection({ user }: { user: User }) {
  const halaqah = HalaqahStore.getByGuru(user.id);
  const [kitab, setKitab] = useState(() => halaqah ? KitabStore.getByHalaqah(halaqah.id) : []);
  const [modal, setModal] = useState(false);
  
  const [form, setForm] = useState({ 
    title: '', 
    author: '', 
    description: '', 
    fileUrl: '', 
    coverColor: '#0F354D' 
  });
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const refresh = () => setKitab(halaqah ? KitabStore.getByHalaqah(halaqah.id) : []);

  const handleSave = async () => {
    if (!form.title.trim() || !form.author.trim()) { setError('Judul dan pengarang wajib diisi.'); return; }
    if (!form.fileUrl.trim()) { setError('Link URL Kitab (GDrive) wajib diisi.'); return; }
    if (!halaqah) { setError('Anda belum ditugaskan ke halaqah.'); return; }

    setUploading(true);
    try {
      KitabStore.create({ 
        title: form.title.trim(), 
        author: form.author.trim(), 
        description: form.description.trim(), 
        guruId: user.id, 
        halaqahId: halaqah.id, 
        fileUrl: form.fileUrl.trim(), 
        coverColor: form.coverColor 
      });
      
      setModal(false);
      refresh();
    } catch (err) {
      setError('Gagal menyimpan data kitab.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <PageHeader title="Kelola Kitab" subtitle="Tambahkan kitab PDF untuk diakses asatidz halaqah Anda.">
        {halaqah && (
          <button onClick={() => { setForm({ title: '', author: '', description: '', fileUrl: '', coverColor: '#0F354D' }); setError(''); setModal(true); }} className={btnPrimary} style={{ background: '#0F354D' }}>
            <Plus size={16} className="inline mr-1.5" />Tambah Kitab
          </button>
        )}
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kitab.map(k => (
          <div key={k.id} className="bg-card rounded-xl border border-border shadow-sm overflow-hidden group">
            <div className="h-24 flex items-center justify-center p-4" style={{ backgroundColor: k.coverColor }}>
              <div className="text-center">
                <p className="text-sm font-semibold leading-tight" style={{ fontFamily: "'Amiri', serif", color: '#F7F5EC', direction: 'rtl' }}>الكتاب</p>
                <div className="w-12 h-0.5 mx-auto mt-1" style={{ backgroundColor: '#C9A054' }} />
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-sm leading-tight" style={{ color: '#3D2C1E' }}>{k.title}</h3>
              <p className="text-xs mt-1" style={{ color: '#8B7355' }}>{k.author}</p>
              {k.description && <p className="text-xs mt-2 line-clamp-2" style={{ color: '#705C3B' }}>{k.description}</p>}
              <div className="flex gap-2 mt-3">
                <a href={k.fileUrl} target="_blank" rel="noopener noreferrer" className="flex-1 py-1.5 rounded-lg text-xs font-medium text-center transition flex items-center justify-center gap-1.5" style={{ background: '#0F354D', color: '#FFFFFF' }}>
                  <ExternalLink size={12} /> Buka PDF
                </a>
                <button onClick={() => { if (confirm(`Hapus kitab "${k.title}"?`)) { KitabStore.delete(k.id); refresh(); } }} className="px-3 py-1.5 rounded-lg text-xs transition" style={{ background: '#FEF2F2', color: '#C0392B' }}>
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {kitab.length === 0 && (
          <div className="col-span-3 bg-card rounded-xl border border-border p-10 text-center shadow-sm">
            <BookOpen size={36} className="mx-auto mb-3" style={{ color: '#C4B99A' }} />
            <p className="text-sm" style={{ color: '#8B7355' }}>Belum ada kitab. Tambahkan kitab PDF untuk asatidz Anda.</p>
          </div>
        )}
      </div>

      <Modal open={modal} title="Tambah Kitab" onClose={() => setModal(false)}>
        {error && <p className="mb-4 text-sm px-3 py-2 rounded-lg" style={{ background: '#FEF2F2', color: '#991B1B' }}>{error}</p>}
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1.5 font-medium" style={{ color: '#705C3B' }}>Judul Kitab</label>
            <input className={inputCls} placeholder="cth: Riyadhus Shalihin" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm mb-1.5 font-medium" style={{ color: '#705C3B' }}>Pengarang</label>
            <input className={inputCls} placeholder="cth: Imam An-Nawawi" value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm mb-1.5 font-medium" style={{ color: '#705C3B' }}>Deskripsi Singkat</label>
            <textarea className={inputCls} rows={2} placeholder="Deskripsi isi kitab..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          
          <div>
            <label className="block text-sm mb-1.5" style={{ color: '#705C3B' }}>Link GDrive Kitab / Materi</label>
            <input 
              type="url" 
              className={inputCls} 
              placeholder="cth: https://drive.google.com/file/d/..." 
              value={form.fileUrl} 
              onChange={e => setForm({ ...form, fileUrl: e.target.value })} 
            />
          </div>

          <div>
            <label className="block text-sm mb-1.5 font-medium" style={{ color: '#705C3B' }}>Warna Cover</label>
            <div className="flex gap-2">
              {COVER_COLORS.map(c => (
                <button key={c} onClick={() => setForm(f => ({ ...f, coverColor: c }))} className="w-7 h-7 rounded-lg border-2 transition" style={{ backgroundColor: c, borderColor: form.coverColor === c ? '#C9A054' : 'transparent' }} />
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)} className="flex-1 py-2 rounded-lg border border-border text-sm font-medium transition hover:bg-muted" style={{ color: '#705C3B' }}>Batal</button>
            <button type="button" onClick={handleSave} disabled={uploading} className="flex-1 py-2 rounded-lg text-sm font-medium text-white transition disabled:opacity-50" style={{ background: '#0F354D' }}>
              {uploading ? 'Memproses...' : 'Simpan'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ---- Soal Simulasi ----
function SoalSection({ user }: { user: User }) {
  const halaqah = HalaqahStore.getByGuru(user.id);
  const jadwalList = halaqah ? JadwalStore.getByHalaqah(halaqah.id) : [];
  
  const [soal, setSoal] = useState(() => halaqah ? SoalStore.getByHalaqah(halaqah.id) : []);
  const [modal, setModal] = useState(false);
  const [viewSoal, setViewSoal] = useState<Soal | null>(null);
  
  // State untuk melacak nomor soal mana yang sedang dilihat jawabannya
  const [selectedQuestion, setSelectedQuestion] = useState<{ question: Question; index: number } | null>(null);
  const [searchAsatidz, setSearchAsatidz] = useState('');

  const [form, setForm] = useState({ title: '', description: '', jadwalId: '', deadline: '', questions: [{ id: genId(), text: '' }] as Question[] });
  const [error, setError] = useState('');

  const refresh = () => setSoal(halaqah ? SoalStore.getByHalaqah(halaqah.id) : []);

  const addQuestion = () => setForm(f => ({ ...f, questions: [...f.questions, { id: genId(), text: '' }] }));
  const removeQuestion = (id: string) => setForm(f => ({ ...f, questions: f.questions.filter(q => q.id !== id) }));
  const updateQuestion = (id: string, text: string) => setForm(f => ({ ...f, questions: f.questions.map(q => q.id === id ? { ...q, text } : q) }));

  const handleSave = () => {
    if (!form.title.trim()) { setError('Judul soal wajib diisi.'); return; }
    if (form.questions.some(q => !q.text.trim())) { setError('Semua pertanyaan harus diisi.'); return; }
    if (!halaqah) { setError('Anda belum ditugaskan ke halaqah.'); return; }
    SoalStore.create({ title: form.title.trim(), description: form.description.trim(), guruId: user.id, halaqahId: halaqah.id, jadwalId: form.jadwalId || undefined, questions: form.questions, deadline: form.deadline || undefined });
    setModal(false);
    refresh();
  };

  const memberIds = halaqah?.memberIds || [];
  const allUsers = UserStore.getAll();
  const asatidzMembers = allUsers.filter(u => memberIds.includes(u.id));
  const submissions = viewSoal ? SubmissionStore.getBySoal(viewSoal.id) : [];

  return (
    <div>
      <PageHeader title="Soal Simulasi" subtitle="Buat soal esai untuk asatidz kerjakan sebelum mudarasah.">
        {halaqah && (
          <button onClick={() => { setForm({ title: '', description: '', jadwalId: '', deadline: '', questions: [{ id: genId(), text: '' }] }); setError(''); setModal(true); }} className={btnPrimary} style={{ background: '#0F354D' }}>
            <Plus size={16} className="inline mr-1.5" />Buat Soal
          </button>
        )}
      </PageHeader>

      <div className="space-y-3">
        {soal.map(s => {
          const jadwal = jadwalList.find(j => j.id === s.jadwalId);
          return (
            <div key={s.id} className="bg-card rounded-xl border border-border p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm" style={{ color: '#3D2C1E' }}>{s.title}</h3>
                  {s.description && <p className="text-xs mt-1 line-clamp-1" style={{ color: '#8B7355' }}>{s.description}</p>}
                  <div className="flex flex-wrap gap-3 mt-2">
                    <span className="text-xs" style={{ color: '#705C3B' }}>📝 {s.questions.length} pertanyaan</span>
                    {jadwal && <span className="text-xs" style={{ color: '#705C3B' }}>📅 {formatDate(jadwal.date)}</span>}
                    {s.deadline && <span className="text-xs" style={{ color: '#705C3B' }}>⏰ Deadline: {new Date(s.deadline).toLocaleString('id-ID')}</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setViewSoal(s); setSelectedQuestion(null); setSearchAsatidz(''); }} className="px-3 py-1.5 rounded-lg text-xs border border-border transition hover:bg-muted font-medium" style={{ color: '#0F354D' }}>Lihat Soal & Jawaban</button>
                  <button onClick={() => { if (confirm(`Hapus soal "${s.title}"?`)) { SoalStore.delete(s.id); refresh(); } }} className="p-1.5 rounded-lg transition hover:bg-red-50" style={{ color: '#C0392B' }}><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          );
        })}
        {soal.length === 0 && (
          <div className="bg-card rounded-xl border border-border p-10 text-center shadow-sm">
            <FileQuestion size={36} className="mx-auto mb-3" style={{ color: '#C4B99A' }} />
            <p className="text-sm" style={{ color: '#8B7355' }}>Belum ada soal simulasi. Buat soal untuk asatidz Anda.</p>
          </div>
        )}
      </div>

      {/* View Soal & Jawaban Modal */}
      <Modal open={!!viewSoal} title={viewSoal?.title || ''} onClose={() => { setViewSoal(null); setSelectedQuestion(null); setSearchAsatidz(''); }} wide>
        {viewSoal && (
          <div>
            {!selectedQuestion ? (
              /* TAMPILAN DAFTAR SOAL */
              <div>
                {viewSoal.description && <p className="text-sm mb-4" style={{ color: '#705C3B' }}>{viewSoal.description}</p>}
                <div className="space-y-3">
                  {viewSoal.questions.map((q, i) => {
                    const answeredCount = submissions.filter(sub => 
                      sub.answers?.some(a => a.questionId === q.id && a.answer && a.answer.trim() !== '')
                    ).length;

                    return (
                      <div key={q.id} className="p-4 rounded-xl border border-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3" style={{ background: '#F7F5EC' }}>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold px-2 py-0.5 rounded text-white" style={{ background: '#0F354D' }}>Soal {i + 1}</span>
                            <span className="text-xs font-medium" style={{ color: '#8B7355' }}>
                              {answeredCount} / {asatidzMembers.length} Asatidz Menjawab
                            </span>
                          </div>
                          <p className="text-sm font-medium mt-1" style={{ color: '#3D2C1E' }}>{q.text}</p>
                        </div>
                        <button
                          onClick={() => { setSelectedQuestion({ question: q, index: i }); setSearchAsatidz(''); }}
                          className="px-3.5 py-2 rounded-lg text-xs font-medium text-white transition-all flex items-center justify-center gap-1.5 flex-shrink-0"
                          style={{ background: '#0F354D' }}
                        >
                          <BookOpen size={14} /> Lihat Jawaban
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* TAMPILAN JAWABAN ASATIDZ PER NOMOR SOAL */
              <div>
                <button
                  onClick={() => setSelectedQuestion(null)}
                  className="mb-4 text-xs font-medium px-3 py-1.5 rounded-lg border border-border transition hover:bg-muted inline-flex items-center gap-1"
                  style={{ color: '#0F354D' }}
                >
                  ← Kembali ke Daftar Soal
                </button>

                <div className="p-4 rounded-xl border border-border mb-4" style={{ background: '#F0EDE3' }}>
                  <span className="text-xs font-bold px-2 py-0.5 rounded text-white mb-1.5 inline-block" style={{ background: '#0F354D' }}>
                    Soal Nomor {selectedQuestion.index + 1}
                  </span>
                  <p className="text-sm font-semibold" style={{ color: '#3D2C1E' }}>{selectedQuestion.question.text}</p>
                </div>

                {/* Filter / Pencarian Asatidz */}
                <div className="mb-4">
                  <input
                    type="text"
                    className={inputCls}
                    placeholder="Cari nama asatidz..."
                    value={searchAsatidz}
                    onChange={e => setSearchAsatidz(e.target.value)}
                  />
                </div>

                {/* List Jawaban Asatidz */}
                <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                  {asatidzMembers
                    .filter(m => m.username.toLowerCase().includes(searchAsatidz.toLowerCase()) || m.email.toLowerCase().includes(searchAsatidz.toLowerCase()))
                    .map(m => {
                      const userSub = submissions.find(s => s.userId === m.id);
                      const userAns = userSub?.answers?.find(a => a.questionId === selectedQuestion.question.id)?.answer;
                      const hasAnswered = !!(userAns && userAns.trim() !== '');

                      return (
                        <div key={m.id} className="p-4 rounded-xl border border-border bg-card shadow-sm">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-sm" style={{ color: '#3D2C1E' }}>{m.username}</p>
                              <span className="text-xs" style={{ color: '#8B7355' }}>({m.email})</span>
                            </div>
                            {hasAnswered ? (
                              <span className="text-xs px-2.5 py-0.5 rounded-full font-medium" style={{ background: '#D1FAE5', color: '#065F46' }}>
                                ✓ Sudah Menjawab
                              </span>
                            ) : (
                              <span className="text-xs px-2.5 py-0.5 rounded-full font-medium" style={{ background: '#F3F4F6', color: '#9CA3AF' }}>
                                ○ Belum Menjawab
                              </span>
                            )}
                          </div>

                          <div className="p-3 rounded-lg text-xs leading-relaxed" style={{ background: hasAnswered ? '#FDFBF4' : '#FAFAFA', border: '1px solid #EDE8DC', color: hasAnswered ? '#3D2C1E' : '#9CA3AF' }}>
                            {hasAnswered ? (
                              <p className="whitespace-pre-wrap">{userAns}</p>
                            ) : (
                              <p className="italic">Asatidz ini belum mengirimkan jawaban untuk soal nomor ini.</p>
                            )}
                          </div>
                        </div>
                      );
                    })}

                  {asatidzMembers.filter(m => m.username.toLowerCase().includes(searchAsatidz.toLowerCase())).length === 0 && (
                    <div className="p-6 text-center text-sm" style={{ color: '#8B7355' }}>
                      Tidak ada asatidz yang sesuai dengan pencarian "{searchAsatidz}".
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Create Modal */}
      <Modal open={modal} title="Buat Soal Simulasi" onClose={() => setModal(false)} wide>
        {error && <p className="mb-4 text-sm px-3 py-2 rounded-lg" style={{ background: '#FEF2F2', color: '#991B1B' }}>{error}</p>}
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1.5" style={{ color: '#705C3B' }}>Judul Soal</label>
            <input className={inputCls} placeholder="cth: Simulasi Pra-Mudarasah Pekan Ini" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm mb-1.5" style={{ color: '#705C3B' }}>Deskripsi / Petunjuk</label>
            <textarea className={inputCls} rows={2} placeholder="Petunjuk pengerjaan soal..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1.5" style={{ color: '#705C3B' }}>Jadwal Terkait (opsional)</label>
              <select className={inputCls} value={form.jadwalId} onChange={e => setForm(f => ({ ...f, jadwalId: e.target.value }))}>
                <option value="">-- Pilih Jadwal --</option>
                {jadwalList.map(j => <option key={j.id} value={j.id}>{formatDate(j.date)} - {j.topic.slice(0, 30)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1.5" style={{ color: '#705C3B' }}>Deadline</label>
              <input type="datetime-local" className={inputCls} value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium" style={{ color: '#705C3B' }}>Pertanyaan Esai</label>
              <button onClick={addQuestion} className="text-xs px-3 py-1 rounded-lg border border-border transition hover:bg-muted" style={{ color: '#0F354D' }}>+ Tambah Soal</button>
            </div>
            <div className="space-y-3">
              {form.questions.map((q, i) => (
                <div key={q.id} className="flex gap-2">
                  <span className="text-sm font-medium mt-2.5 flex-shrink-0 w-5" style={{ color: '#705C3B' }}>{i + 1}.</span>
                  <textarea className={`${inputCls} flex-1`} rows={2} placeholder={`Tulis pertanyaan ${i + 1}...`} value={q.text} onChange={e => updateQuestion(q.id, e.target.value)} />
                  {form.questions.length > 1 && (
                    <button onClick={() => removeQuestion(q.id)} className="mt-2 p-1 rounded hover:bg-red-50 flex-shrink-0" style={{ color: '#C0392B' }}><X size={14} /></button>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModal(false)} className="flex-1 py-2 rounded-lg border border-border text-sm transition hover:bg-muted" style={{ color: '#705C3B' }}>Batal</button>
            <button onClick={handleSave} className="flex-1 py-2 rounded-lg text-sm font-medium text-white" style={{ background: '#0F354D' }}>Simpan Soal</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ---- Rekap Absensi ----
function RekapAbsensiSection({ user }: { user: User }) {
  const halaqah = HalaqahStore.getByGuru(user.id);
  const jadwalList = halaqah ? JadwalStore.getByHalaqah(halaqah.id).sort((a, b) => b.date.localeCompare(a.date)) : [];
  const memberIds = halaqah?.memberIds || [];
  const allUsers = UserStore.getAll();
  const members = allUsers.filter(u => memberIds.includes(u.id));
  
  const [allAbsensi, setAllAbsensi] = useState(() => AbsensiStore.getAll());
  const [editModal, setEditModal] = useState<{userId: string, jadwalId: string, currentStatus: string | null} | null>(null);

  const refreshAbsensi = () => setAllAbsensi(AbsensiStore.getAll());

  const getStatus = (userId: string, jadwalId: string) => {
    const a = allAbsensi.find(a => a.userId === userId && a.jadwalId === jadwalId);
    return a?.status || null;
  };

  const handleUpdateStatus = (newStatus: string) => {
    if (!editModal) return;
    const existing = allAbsensi.find(a => a.userId === editModal.userId && a.jadwalId === editModal.jadwalId);
    if (existing) {
      AbsensiStore.update(existing.id, { status: newStatus as any });
    } else {
      AbsensiStore.create({
        jadwalId: editModal.jadwalId,
        userId: editModal.userId,
        status: newStatus as any,
        keterangan: 'Diedit oleh Guru',
        timestamp: new Date().toISOString()
      });
    }
    setEditModal(null);
    refreshAbsensi();
  };

  const StatusBadge = ({ status }: { status: string | null }) => {
    if (status === 'hadir') return <span className="inline-block w-16 text-center text-xs py-0.5 rounded-full font-medium shadow-sm transition hover:scale-105 cursor-pointer" style={{ background: '#D1FAE5', color: '#065F46' }}>Hadir</span>;
    if (status === 'izin') return <span className="inline-block w-16 text-center text-xs py-0.5 rounded-full font-medium shadow-sm transition hover:scale-105 cursor-pointer" style={{ background: '#FEF3C7', color: '#92400E' }}>Izin</span>;
    if (status === 'alpha') return <span className="inline-block w-16 text-center text-xs py-0.5 rounded-full font-medium shadow-sm transition hover:scale-105 cursor-pointer" style={{ background: '#FEE2E2', color: '#991B1B' }}>Alpha</span>;
    return <span className="inline-block w-16 text-center text-xs py-0.5 rounded-full shadow-sm transition hover:scale-105 cursor-pointer hover:bg-gray-200 border" style={{ background: '#F3F4F6', color: '#9CA3AF' }}>—</span>;
  };

  if (!halaqah) return (
    <div className="bg-card rounded-xl border border-border p-8 text-center shadow-sm">
      <p style={{ color: '#8B7355' }}>Anda belum ditugaskan ke halaqah.</p>
    </div>
  );

  const totals = (userId: string) => {
    const hadir = jadwalList.filter(j => getStatus(userId, j.id) === 'hadir').length;
    const izin = jadwalList.filter(j => getStatus(userId, j.id) === 'izin').length;
    const alpha = jadwalList.filter(j => getStatus(userId, j.id) === 'alpha').length;
    return { hadir, izin, alpha };
  };

  return (
    <div>
      <PageHeader title="Rekap Absensi" subtitle={`Klik pada status kehadiran untuk mengedit absensi asatidz ${halaqah.name}.`} />

      {jadwalList.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-10 text-center shadow-sm">
          <CalendarCheck size={36} className="mx-auto mb-3" style={{ color: '#C4B99A' }} />
          <p className="text-sm" style={{ color: '#8B7355' }}>Belum ada jadwal yang terdaftar.</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="text-xs w-full">
              <thead>
                <tr style={{ backgroundColor: '#0F354D' }}>
                  <th className="px-4 py-3 text-left sticky left-0 z-10 min-w-36" style={{ color: '#E3DAC9', backgroundColor: '#0F354D' }}>Nama Asatidz</th>
                  {jadwalList.map(j => (
                    <th key={j.id} className="px-2 py-3 text-center whitespace-nowrap min-w-20" style={{ color: '#E3DAC9' }}>
                      <div>{new Date(j.date + 'T00:00:00').toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}</div>
                    </th>
                  ))}
                  <th className="px-3 py-3 text-center" style={{ color: '#C9A054' }}>Hadir</th>
                  <th className="px-3 py-3 text-center" style={{ color: '#FEF3C7' }}>Izin</th>
                  <th className="px-3 py-3 text-center" style={{ color: '#FCA5A5' }}>Alpha</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m, i) => {
                  const { hadir, izin, alpha } = totals(m.id);
                  return (
                    <tr key={m.id} style={{ backgroundColor: i % 2 === 0 ? '#FDFBF4' : '#FAF8F0', borderBottom: '1px solid #EDE8DC' }}>
                      <td className="px-4 py-2.5 font-medium sticky left-0 z-10" style={{ color: '#3D2C1E', backgroundColor: i % 2 === 0 ? '#FDFBF4' : '#FAF8F0' }}>
                        {m.username}
                      </td>
                      {jadwalList.map(j => (
                        <td key={j.id} className="px-2 py-2.5 text-center" onClick={() => setEditModal({userId: m.id, jadwalId: j.id, currentStatus: getStatus(m.id, j.id)})}>
                          <StatusBadge status={getStatus(m.id, j.id)} />
                        </td>
                      ))}
                      <td className="px-3 py-2.5 text-center font-semibold" style={{ color: '#065F46' }}>{hadir}</td>
                      <td className="px-3 py-2.5 text-center font-semibold" style={{ color: '#92400E' }}>{izin}</td>
                      <td className="px-3 py-2.5 text-center font-semibold" style={{ color: '#991B1B' }}>{alpha}</td>
                    </tr>
                  );
                })}
                {members.length === 0 && (
                  <tr><td colSpan={jadwalList.length + 4} className="px-4 py-6 text-center" style={{ color: '#8B7355' }}>Belum ada anggota di halaqah ini.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Edit Absen */}
      <Modal open={!!editModal} title="Edit Kehadiran Asatidz" onClose={() => setEditModal(null)}>
        <div className="space-y-3">
          <p className="text-sm mb-4" style={{ color: '#705C3B' }}>Pilih status kehadiran baru untuk asatidz ini:</p>
          <div className="grid grid-cols-3 gap-3">
            <button onClick={() => handleUpdateStatus('hadir')} className="py-2.5 rounded-lg font-medium transition hover:brightness-95" style={{ background: '#D1FAE5', color: '#065F46' }}>Hadir</button>
            <button onClick={() => handleUpdateStatus('izin')} className="py-2.5 rounded-lg font-medium transition hover:brightness-95" style={{ background: '#FEF3C7', color: '#92400E' }}>Izin</button>
            <button onClick={() => handleUpdateStatus('alpha')} className="py-2.5 rounded-lg font-medium transition hover:brightness-95" style={{ background: '#FEE2E2', color: '#991B1B' }}>Alpha</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export function GuruPanel({ user, activeTab }: GuruPanelProps) {
  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      {activeTab === 'dashboard' && <DashboardSection user={user} />}
      {activeTab === 'jadwal' && <JadwalSection user={user} />}
      {activeTab === 'kitab' && <KitabSection user={user} />}
      {activeTab === 'soal' && <SoalSection user={user} />}
      {activeTab === 'rekap' && <RekapAbsensiSection user={user} />}
    </div>
  );
}