import { useState } from 'react';
import type { User, Soal } from '../types';
import { HalaqahStore, JadwalStore, KitabStore, SoalStore, AbsensiStore, SubmissionStore, genId } from '../store';
import { CalendarCheck, BookOpen, FileQuestion, ExternalLink, CheckCircle, Clock, AlertCircle, Send } from 'lucide-react';


type AsatidzTab = 'beranda' | 'absensi' | 'kitab' | 'simulasi';

interface AsatidzPanelProps {
  user: User;
  activeTab: AsatidzTab;
  setActiveTab?: (t: AsatidzTab) => void;
}

function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-xl mb-1" style={{ fontFamily: "'Amiri', serif", color: '#0F354D', fontWeight: 700 }}>{title}</h2>
      {subtitle && <p className="text-sm" style={{ color: '#8B7355' }}>{subtitle}</p>}
    </div>
  );
}

function Modal({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}>
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-border">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border">
          <h3 className="font-semibold" style={{ fontFamily: "'Amiri', serif", color: '#0F354D' }}>{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 transition hover:bg-muted text-muted-foreground">✕</button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

const inputCls = 'w-full px-3.5 py-2.5 rounded-lg border border-border bg-input-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm transition';

function formatDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function NoHalaqahBanner() {
  return (
    <div className="bg-card rounded-xl border border-border p-8 text-center shadow-sm">
      <AlertCircle size={36} className="mx-auto mb-3" style={{ color: '#C9A054' }} />
      <p className="font-medium" style={{ color: '#705C3B' }}>Belum Terdaftar dalam Halaqah</p>
      <p className="text-sm mt-1" style={{ color: '#8B7355' }}>Akun Anda belum ditambahkan ke halaqah manapun. Hubungi admin untuk pendaftaran.</p>
    </div>
  );
}

// ---- Beranda ----
function BerandaSection({ user }: { user: User }) {
  const halaqah = HalaqahStore.getAll().find(h => {
  if (!h.memberIds) return false;
  const membersStr = JSON.stringify(h.memberIds);
  return membersStr.includes(user.id) || membersStr.includes(user.email) || membersStr.includes(user.username);
});
  const jadwalList = halaqah ? JadwalStore.getByHalaqah(halaqah.id) : [];
  const today = new Date().toISOString().split('T')[0];
  const myAbsensi = AbsensiStore.getByUser(user.id);
  const soalList = halaqah ? SoalStore.getByHalaqah(halaqah.id) : [];
  const submissions = SubmissionStore.getAll().filter(s => s.userId === user.id);

  const upcoming = jadwalList.filter(j => j.date >= today).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3);
  const hadirCount = myAbsensi.filter(a => a.status === 'hadir').length;
  const totalPast = jadwalList.filter(j => j.date < today).length;
  const pendingSoal = soalList.filter(s => !submissions.find(sub => sub.soalId === s.id));

  return (
    <div>
      <div className="mb-6 p-5 rounded-xl border border-border shadow-sm" style={{ background: 'linear-gradient(135deg, #0F354D, #1a4f70)' }}>
        <p className="text-sm" style={{ color: 'rgba(227,218,201,0.8)', fontFamily: "'Amiri', serif", direction: 'rtl' }}>بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</p>
        <h3 className="mt-2 text-lg font-semibold" style={{ color: '#F7F5EC' }}>Ahlan wa Sahlan, {user.username}</h3>
        {halaqah && <p className="text-sm mt-1" style={{ color: '#C9A054' }}>{halaqah.name}</p>}
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-card rounded-xl border border-border p-4 text-center shadow-sm">
          <p className="text-2xl font-semibold" style={{ color: '#065F46' }}>{hadirCount}</p>
          <p className="text-xs mt-1" style={{ color: '#8B7355' }}>Total Hadir</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center shadow-sm">
          <p className="text-2xl font-semibold" style={{ color: '#0F354D' }}>{totalPast}</p>
          <p className="text-xs mt-1" style={{ color: '#8B7355' }}>Total Jadwal</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center shadow-sm">
          <p className="text-2xl font-semibold" style={{ color: '#C9A054' }}>{pendingSoal.length}</p>
          <p className="text-xs mt-1" style={{ color: '#8B7355' }}>Soal Belum Dikerjakan</p>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
        <h3 className="font-semibold mb-3 text-sm" style={{ color: '#705C3B' }}>Jadwal Mendatang</h3>
        {upcoming.length === 0 ? (
          <p className="text-sm" style={{ color: '#8B7355' }}>Tidak ada jadwal mendatang.</p>
        ) : upcoming.map(j => {
          const absen = AbsensiStore.getByUserAndJadwal(user.id, j.id);
          const isToday = j.date === today;
          return (
            <div key={j.id} className="flex items-start gap-3 py-3 border-b border-border last:border-0">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl flex flex-col items-center justify-center" style={{ backgroundColor: isToday ? '#0F354D' : '#E3F4ED' }}>
                <p className="text-xs leading-none font-semibold" style={{ color: isToday ? '#C9A054' : '#1B5E3B' }}>
                  {new Date(j.date + 'T00:00:00').getDate().toString().padStart(2, '0')}
                </p>
                <p className="text-xs leading-none" style={{ color: isToday ? '#E3DAC9' : '#1B5E3B' }}>
                  {new Date(j.date + 'T00:00:00').toLocaleDateString('id-ID', { month: 'short' })}
                </p>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" style={{ color: '#3D2C1E' }}>{j.topic}</p>
                <p className="text-xs" style={{ color: '#8B7355' }}>{j.time} WITA · {j.location}</p>
              </div>
              {absen && (
                <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0" style={{
                  background: absen.status === 'hadir' ? '#D1FAE5' : absen.status === 'izin' ? '#FEF3C7' : '#FEE2E2',
                  color: absen.status === 'hadir' ? '#065F46' : absen.status === 'izin' ? '#92400E' : '#991B1B'
                }}>
                  {absen.status === 'hadir' ? 'Hadir' : absen.status === 'izin' ? 'Izin' : 'Alpha'}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---- Absensi ----
function AbsensiSection({ user }: { user: User }) {
  const halaqah = HalaqahStore.getAll().find(h => {
  if (!h.memberIds) return false;
  const membersStr = JSON.stringify(h.memberIds);
  return membersStr.includes(user.id) || membersStr.includes(user.email) || membersStr.includes(user.username);
});
  const [jadwalList] = useState(() => halaqah ? JadwalStore.getByHalaqah(halaqah.id).sort((a, b) => b.date.localeCompare(a.date)) : []);
  const [absensi, setAbsensi] = useState(() => AbsensiStore.getByUser(user.id));
  const [modal, setModal] = useState<{ jadwalId: string; topic: string } | null>(null);
  const [form, setForm] = useState<{ status: 'hadir' | 'izin'; keterangan: string }>({ status: 'hadir', keterangan: '' });
  const today = new Date().toISOString().split('T')[0];

  const refresh = () => setAbsensi(AbsensiStore.getByUser(user.id));

  const getAbsen = (jadwalId: string) => absensi.find(a => a.jadwalId === jadwalId);

  const handleAbsen = () => {
    if (!modal) return;
    AbsensiStore.create({
      jadwalId: modal.jadwalId,
      userId: user.id,
      status: form.status,
      keterangan: form.keterangan || undefined,
      timestamp: new Date().toISOString(),
    });
    setModal(null);
    refresh();
  };

  if (!halaqah) return <NoHalaqahBanner />;

  return (
    <div>
      <PageHeader title="Absensi Mudarasah" subtitle="Tandai kehadiran Anda sesuai jadwal yang telah ditentukan." />

      <div className="space-y-3">
       {jadwalList.map(j => {
  const absen = getAbsen(j.id);
  const isToday = j.date === today;
  const isPast = j.date < today;
  const isFuture = j.date > today;
  
  // LOGIKA WAKTU ABSEN KETAT
  const now = new Date();
  const currentHour = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
  
  // Asatidz cuma bisa absen JIKA: hari ini + belum absen + jam sekarang ada di antara jam mulai dan jam selesai
  const isWithinTime = j.endTime ? (currentHour >= j.time && currentHour <= j.endTime) : currentHour >= j.time;
  const canAbsen = isToday && !absen && isWithinTime;
  const isMissed = isToday && !absen && j.endTime && currentHour > j.endTime; // Waktu absen sudah lewat

          return (
            <div key={j.id} className="bg-card rounded-xl border shadow-sm p-4" style={{ borderColor: isToday ? '#C9A054' : '#D4C9B0' }}>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl flex flex-col items-center justify-center" style={{
                  backgroundColor: isToday ? '#0F354D' : isPast ? '#EDE8DC' : '#E3F4ED'
                }}>
                  <p className="text-sm leading-none font-bold" style={{ color: isToday ? '#C9A054' : isPast ? '#8B7355' : '#1B5E3B' }}>
                    {new Date(j.date + 'T00:00:00').getDate().toString().padStart(2, '0')}
                  </p>
                  <p className="text-xs leading-none mt-0.5" style={{ color: isToday ? '#E3DAC9' : isPast ? '#8B7355' : '#1B5E3B' }}>
                    {new Date(j.date + 'T00:00:00').toLocaleDateString('id-ID', { month: 'short' })}
                  </p>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <p className="font-medium text-sm" style={{ color: '#3D2C1E' }}>{j.topic}</p>
                      {/* INI BIAR RENTANG JAMNYA NAMPIL (Contoh: 08:00 - 10:00 WITA) */}
                      <p className="text-xs mt-0.5" style={{ color: '#8B7355' }}>
                        {formatDate(j.date)} · {j.time} {j.endTime ? `- ${j.endTime}` : ''} WITA
                      </p>
                      {j.location && <p className="text-xs" style={{ color: '#8B7355' }}>📍 {j.location}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      {absen ? (
                        <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{
                          background: absen.status === 'hadir' ? '#D1FAE5' : absen.status === 'izin' ? '#FEF3C7' : '#FEE2E2',
                          color: absen.status === 'hadir' ? '#065F46' : absen.status === 'izin' ? '#92400E' : '#991B1B'
                        }}>
                          {absen.status === 'hadir' ? '✓ Hadir' : absen.status === 'izin' ? '○ Izin' : '✗ Alpha'}
                        </span>
                      ) : isFuture ? (
                        <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: '#EDE8DC', color: '#8B7355' }}>
                          <Clock size={10} className="inline mr-1" />Belum Mulai
                        </span>
                      ) : canAbsen ? (
                        <button
                          onClick={() => { setForm({ status: 'hadir', keterangan: '' }); setModal({ jadwalId: j.id, topic: j.topic }); }}
                          className="text-xs px-3 py-1.5 rounded-lg font-medium text-white transition"
                          style={{ background: '#0F354D' }}
                        >
                          <CalendarCheck size={12} className="inline mr-1" />Absen Sekarang
                        </button>
                      ) : isMissed || isPast ? (
                         // INI KALAU WAKTUNYA UDAH LEWAT
                        <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: '#FEE2E2', color: '#991B1B' }}>Waktu Habis / Alpha</span>
                      ) : (
                        <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: '#FEE2E2', color: '#991B1B' }}>Tidak Absen</span>
                      )}
                    </div>
                  </div>
                  {absen?.keterangan && (
                    <p className="text-xs mt-2 px-2 py-1 rounded" style={{ background: '#F0EDE3', color: '#705C3B' }}>
                      Keterangan: {absen.keterangan}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {jadwalList.length === 0 && (
          <div className="bg-card rounded-xl border border-border p-10 text-center shadow-sm">
            <CalendarCheck size={36} className="mx-auto mb-3" style={{ color: '#C4B99A' }} />
            <p className="text-sm" style={{ color: '#8B7355' }}>Belum ada jadwal mudarasah yang dijadwalkan.</p>
          </div>
        )}
      </div>

      <Modal open={!!modal} title={`Absensi: ${modal?.topic}`} onClose={() => setModal(null)}>
        <div className="space-y-4">
          <p className="text-sm" style={{ color: '#705C3B' }}>Pilih status kehadiran Anda untuk mudarasah hari ini.</p>
          <div className="grid grid-cols-2 gap-3">
            {(['hadir', 'izin'] as const).map(s => (
              <button key={s} onClick={() => setForm(f => ({ ...f, status: s }))} className="py-3 rounded-xl border-2 transition" style={{
                borderColor: form.status === s ? (s === 'hadir' ? '#065F46' : '#92400E') : '#D4C9B0',
                background: form.status === s ? (s === 'hadir' ? '#D1FAE5' : '#FEF3C7') : 'transparent',
                color: form.status === s ? (s === 'hadir' ? '#065F46' : '#92400E') : '#705C3B',
              }}>
                {s === 'hadir' ? '✓ Hadir' : '○ Izin'}
              </button>
            ))}
          </div>
          {form.status === 'izin' && (
            <div>
              <label className="block text-sm mb-1.5" style={{ color: '#705C3B' }}>Keterangan Izin</label>
              <textarea className={inputCls} rows={2} placeholder="Alasan izin..." value={form.keterangan} onChange={e => setForm(f => ({ ...f, keterangan: e.target.value }))} />
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={() => setModal(null)} className="flex-1 py-2 rounded-lg border border-border text-sm transition hover:bg-muted" style={{ color: '#705C3B' }}>Batal</button>
            <button onClick={handleAbsen} className="flex-1 py-2 rounded-lg text-sm font-medium text-white" style={{ background: '#0F354D' }}>
              <Send size={14} className="inline mr-1.5" />Kirim Absensi
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ---- Kitab ----
function KitabSection({ user }: { user: User }) {
  const halaqah = HalaqahStore.getAll().find(h => {
  if (!h.memberIds) return false;
  const membersStr = JSON.stringify(h.memberIds);
  return membersStr.includes(user.id) || membersStr.includes(user.email) || membersStr.includes(user.username);
});
  const kitab = halaqah ? KitabStore.getByHalaqah(halaqah.id) : [];

  if (!halaqah) return <NoHalaqahBanner />;

  return (
    <div>
      <PageHeader title="Kitab & Materi" subtitle="Akses kitab dan materi yang disediakan guru untuk mudarasah." />

      {kitab.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-10 text-center shadow-sm">
          <BookOpen size={36} className="mx-auto mb-3" style={{ color: '#C4B99A' }} />
          <p className="text-sm" style={{ color: '#8B7355' }}>Belum ada kitab yang diunggah oleh guru.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {kitab.map(k => (
            <div key={k.id} className="bg-card rounded-xl border border-border shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-28 flex flex-col items-center justify-center px-4" style={{ backgroundColor: k.coverColor }}>
                <p className="text-center text-base" style={{ fontFamily: "'Amiri', serif", color: '#F7F5EC', fontWeight: 700, direction: 'rtl' }}>الكتاب</p>
                <div className="w-10 h-0.5 mt-1.5 rounded" style={{ backgroundColor: '#C9A054' }} />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-sm" style={{ color: '#3D2C1E', fontFamily: "'Amiri', serif" }}>{k.title}</h3>
                <p className="text-xs mt-0.5" style={{ color: '#8B7355' }}>oleh {k.author}</p>
                {k.description && <p className="text-xs mt-2 line-clamp-2" style={{ color: '#705C3B' }}>{k.description}</p>}
                <p className="text-xs mt-2" style={{ color: '#A08060' }}>Diunggah: {k.uploadedAt}</p>
                <a
                  href={k.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition"
                  style={{ background: '#0F354D', color: '#FFFFFF' }}
                >
                  <ExternalLink size={12} /> Buka Kitab
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- Soal Simulasi ----
function SimulasiSection({ user }: { user: User }) {
  const halaqah = HalaqahStore.getAll().find(h => {
  if (!h.memberIds) return false;
  const membersStr = JSON.stringify(h.memberIds);
  return membersStr.includes(user.id) || membersStr.includes(user.email) || membersStr.includes(user.username);
});
  const soalList = halaqah ? SoalStore.getByHalaqah(halaqah.id) : [];
  const [activeSoal, setActiveSoal] = useState<Soal | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submissions, setSubmissions] = useState(() => SubmissionStore.getAll().filter(s => s.userId === user.id));

  const openSoal = (s: Soal) => {
    const existingSub = submissions.find(sub => sub.soalId === s.id);
    if (existingSub) {
      const ansMap: Record<string, string> = {};
      existingSub.answers.forEach(a => { ansMap[a.questionId] = a.answer; });
      setAnswers(ansMap);
      setSubmitted(true);
    } else {
      setAnswers({});
      setSubmitted(false);
    }
    setActiveSoal(s);
  };

  const handleSubmit = () => {
    if (!activeSoal) return;
    const emptyAnswers = activeSoal.questions.filter(q => !answers[q.id]?.trim());
    if (emptyAnswers.length > 0) {
      alert('Semua pertanyaan harus dijawab terlebih dahulu.');
      return;
    }
    if (!confirm('Yakin ingin mengirimkan jawaban? Jawaban tidak dapat diubah setelah dikirim.')) return;
    SubmissionStore.create({
      soalId: activeSoal.id,
      userId: user.id,
      answers: activeSoal.questions.map(q => ({ questionId: q.id, answer: answers[q.id] || '' })),
      submittedAt: new Date().toISOString(),
    });
    setSubmitted(true);
    setSubmissions(SubmissionStore.getAll().filter(s => s.userId === user.id));
  };

  if (!halaqah) return <NoHalaqahBanner />;

  if (activeSoal) {
    const jadwal = JadwalStore.getAll().find(j => j.id === activeSoal.jadwalId);
    return (
      <div>
        <button onClick={() => setActiveSoal(null)} className="mb-5 text-sm flex items-center gap-1.5 transition hover:underline" style={{ color: '#705C3B' }}>
          ← Kembali ke Daftar Soal
        </button>
        <div className="bg-card rounded-xl border border-border shadow-sm p-6">
          <div className="mb-5 pb-4 border-b border-border">
            <h2 className="text-lg font-semibold" style={{ fontFamily: "'Amiri', serif", color: '#0F354D' }}>{activeSoal.title}</h2>
            {activeSoal.description && <p className="text-sm mt-1" style={{ color: '#705C3B' }}>{activeSoal.description}</p>}
            {jadwal && <p className="text-xs mt-2" style={{ color: '#8B7355' }}>Jadwal: {formatDate(jadwal.date)} · {jadwal.time}</p>}
            {activeSoal.deadline && <p className="text-xs mt-1" style={{ color: '#8B7355' }}>Deadline: {new Date(activeSoal.deadline).toLocaleString('id-ID')}</p>}
          </div>

          {submitted && (
            <div className="mb-5 px-4 py-3 rounded-xl flex items-center gap-3" style={{ background: '#D1FAE5' }}>
              <CheckCircle size={18} style={{ color: '#065F46' }} />
              <p className="text-sm font-medium" style={{ color: '#065F46' }}>Jawaban Anda sudah terkirim. Semoga bermanfaat!</p>
            </div>
          )}

          <div className="space-y-6">
            {activeSoal.questions.map((q, i) => (
              <div key={q.id}>
                <p className="text-sm font-semibold mb-1" style={{ color: '#0F354D' }}>Soal {i + 1}</p>
                <p className="text-sm mb-3" style={{ color: '#3D2C1E' }}>{q.text}</p>
                <textarea
                  className={inputCls}
                  rows={4}
                  placeholder="Tulis jawaban Anda di sini..."
                  value={answers[q.id] || ''}
                  onChange={e => setAnswers(a => ({ ...a, [q.id]: e.target.value }))}
                  disabled={submitted}
                />
              </div>
            ))}
          </div>

          {!submitted && (
            <button onClick={handleSubmit} className="mt-6 w-full py-2.5 rounded-xl font-medium text-white flex items-center justify-center gap-2 transition" style={{ background: '#0F354D' }}>
              <Send size={16} /> Kirim Jawaban
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Soal Simulasi" subtitle="Kerjakan soal simulasi sebelum mudarasah berlangsung." />

      {soalList.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-10 text-center shadow-sm">
          <FileQuestion size={36} className="mx-auto mb-3" style={{ color: '#C4B99A' }} />
          <p className="text-sm" style={{ color: '#8B7355' }}>Belum ada soal simulasi dari guru.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {soalList.map(s => {
            const sub = submissions.find(sub => sub.soalId === s.id);
            const jadwal = JadwalStore.getAll().find(j => j.id === s.jadwalId);
            const deadlinePassed = s.deadline ? new Date() > new Date(s.deadline) : false;

            return (
              <div key={s.id} className="bg-card rounded-xl border border-border p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm" style={{ color: '#3D2C1E' }}>{s.title}</h3>
                      {sub ? (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: '#D1FAE5', color: '#065F46' }}>✓ Selesai</span>
                      ) : deadlinePassed ? (
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#FEE2E2', color: '#991B1B' }}>Kadaluarsa</span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#FEF3C7', color: '#92400E' }}>Belum Dikerjakan</span>
                      )}
                    </div>
                    {s.description && <p className="text-xs mt-1 line-clamp-1" style={{ color: '#8B7355' }}>{s.description}</p>}
                    <div className="flex flex-wrap gap-3 mt-2">
                      <span className="text-xs" style={{ color: '#705C3B' }}>📝 {s.questions.length} pertanyaan</span>
                      {jadwal && <span className="text-xs" style={{ color: '#705C3B' }}>📅 {formatDate(jadwal.date)}</span>}
                      {s.deadline && <span className="text-xs" style={{ color: deadlinePassed ? '#C0392B' : '#705C3B' }}>⏰ {new Date(s.deadline).toLocaleString('id-ID')}</span>}
                    </div>
                  </div>
                  <button
                    onClick={() => openSoal(s)}
                    className="px-4 py-2 rounded-lg text-xs font-medium transition flex-shrink-0"
                    style={{ background: sub ? '#F0EDE3' : '#0F354D', color: sub ? '#705C3B' : '#FFFFFF' }}
                  >
                    {sub ? 'Lihat Jawaban' : 'Kerjakan'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function AsatidzPanel({ user, activeTab }: AsatidzPanelProps) {
  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      {activeTab === 'beranda' && <BerandaSection user={user} />}
      {activeTab === 'absensi' && <AbsensiSection user={user} />}
      {activeTab === 'kitab' && <KitabSection user={user} />}
      {activeTab === 'simulasi' && <SimulasiSection user={user} />}
    </div>
  );
}
