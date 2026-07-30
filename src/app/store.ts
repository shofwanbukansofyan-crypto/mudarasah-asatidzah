import type { User, Halaqah, Kitab, Jadwal, Absensi, Soal, SoalSubmission } from './types';

const KEYS = {
  users: 'mudarasah_users',
  halaqah: 'mudarasah_halaqah',
  kitab: 'mudarasah_kitab',
  jadwal: 'mudarasah_jadwal',
  absensi: 'mudarasah_absensi',
  soal: 'mudarasah_soal',
  submissions: 'mudarasah_submissions',
  initialized: 'mudarasah_initialized',
};

function getDateOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function buildInitData() {
  const today = getDateOffset(0);
  const lastWeek = getDateOffset(-7);
  const twoWeeksAgo = getDateOffset(-14);
  const nextWeek = getDateOffset(7);

  const users: User[] = [
    { id: 'u1', username: 'Admin Mudarasah', email: 'admin@mudarasah.com', password: 'admin123', role: 'admin', createdAt: '2024-01-01' },
    { id: 'u2', username: 'Ustadz Ahmad Fayyadh', email: 'ahmad@mudarasah.com', password: 'guru123', role: 'guru', halaqahId: 'h1', createdAt: '2024-01-02' },
    { id: 'u3', username: 'Ustadz Ibrahim Al-Hasan', email: 'ibrahim@mudarasah.com', password: 'guru123', role: 'guru', halaqahId: 'h2', createdAt: '2024-01-03' },
    { id: 'u4', username: 'Akh. Muhammad Rafi', email: 'rafi@mudarasah.com', password: 'asatidz123', role: 'asatidz', halaqahId: 'h1', createdAt: '2024-01-10' },
    { id: 'u5', username: 'Akh. Abdullah Aziz', email: 'aziz@mudarasah.com', password: 'asatidz123', role: 'asatidz', halaqahId: 'h1', createdAt: '2024-01-10' },
    { id: 'u6', username: 'Akh. Yusuf Hakim', email: 'yusuf@mudarasah.com', password: 'asatidz123', role: 'asatidz', halaqahId: 'h1', createdAt: '2024-01-11' },
    { id: 'u7', username: 'Akh. Zaid Mubarak', email: 'zaid@mudarasah.com', password: 'asatidz123', role: 'asatidz', halaqahId: 'h2', createdAt: '2024-01-12' },
    { id: 'u8', username: 'Akh. Hamzah Siddiq', email: 'hamzah@mudarasah.com', password: 'asatidz123', role: 'asatidz', halaqahId: 'h2', createdAt: '2024-01-12' },
    { id: 'u9', username: 'Akh. Umar Al-Farouq', email: 'umar@mudarasah.com', password: 'asatidz123', role: 'asatidz', halaqahId: 'h2', createdAt: '2024-01-15' },
  ];

  const halaqah: Halaqah[] = [
    { id: 'h1', name: 'Halaqah Al-Fatihah', guruId: 'u2', memberIds: ['u4', 'u5', 'u6'], createdAt: '2024-01-05' },
    { id: 'h2', name: 'Halaqah Al-Baqarah', guruId: 'u3', memberIds: ['u7', 'u8', 'u9'], createdAt: '2024-01-05' },
  ];

  const jadwal: Jadwal[] = [
    { id: 'j1', halaqahId: 'h1', guruId: 'u2', date: twoWeeksAgo, time: '08:00', topic: 'Tafsir Surah Al-Mulk Ayat 1-5', location: 'Masjid Al-Fayyadh', createdAt: '2024-01-01' },
    { id: 'j2', halaqahId: 'h1', guruId: 'u2', date: lastWeek, time: '08:00', topic: 'Tafsir Surah Al-Mulk Ayat 6-14', location: 'Masjid Al-Fayyadh', createdAt: '2024-01-08' },
    { id: 'j3', halaqahId: 'h1', guruId: 'u2', date: today, time: '08:00', topic: 'Tafsir Surah Al-Mulk Ayat 15-30', location: 'Masjid Al-Fayyadh', createdAt: '2024-01-15' },
    { id: 'j4', halaqahId: 'h1', guruId: 'u2', date: nextWeek, time: '08:00', topic: 'Mudarasah: Syarah Hadits Arbain No. 1', location: 'Masjid Al-Fayyadh', createdAt: '2024-01-22' },
    { id: 'j5', halaqahId: 'h2', guruId: 'u3', date: twoWeeksAgo, time: '10:00', topic: 'Fiqh Shalat: Syarat dan Rukun', location: 'Aula Pesantren', createdAt: '2024-01-01' },
    { id: 'j6', halaqahId: 'h2', guruId: 'u3', date: lastWeek, time: '10:00', topic: 'Fiqh Shalat: Sunnah Ab\'ad dan Hai\'ah', location: 'Aula Pesantren', createdAt: '2024-01-08' },
    { id: 'j7', halaqahId: 'h2', guruId: 'u3', date: today, time: '10:00', topic: 'Fiqh Shalat: Pembatal Shalat', location: 'Aula Pesantren', createdAt: '2024-01-15' },
  ];

  const kitab: Kitab[] = [
    { id: 'k1', title: 'Riyadhus Shalihin', author: 'Imam An-Nawawi', description: 'Kumpulan hadits pilihan tentang akhlak, ibadah, dan adab seorang Muslim', guruId: 'u2', halaqahId: 'h1', fileUrl: 'https://ia801405.us.archive.org/33/items/riyadussalihinbookurduenglishtranslation/Riyadus-Salihin.pdf', coverColor: '#1B4D3E', uploadedAt: '2024-01-10' },
    { id: 'k2', title: 'Bulughul Maram', author: 'Ibnu Hajar Al-Asqalani', description: 'Himpunan hadits-hadits yang berkaitan dengan hukum fiqh Islam', guruId: 'u2', halaqahId: 'h1', fileUrl: 'https://ia801302.us.archive.org/20/items/BulughulMaramIbnuHajar/bulughul-maram.pdf', coverColor: '#4A3728', uploadedAt: '2024-01-12' },
    { id: 'k3', title: 'Minhajul Muslim', author: 'Abu Bakar Jabir Al-Jazairi', description: 'Panduan hidup seorang Muslim yang lengkap dan komprehensif', guruId: 'u3', halaqahId: 'h2', fileUrl: 'https://archive.org/download/minhajul-muslim/minhajul-muslim.pdf', coverColor: '#0F354D', uploadedAt: '2024-01-15' },
    { id: 'k4', title: 'Fiqhus Sunnah', author: 'Sayyid Sabiq', description: 'Fikih berdasarkan sunnah Nabi Muhammad SAW yang mudah dipahami', guruId: 'u3', halaqahId: 'h2', fileUrl: 'https://archive.org/download/fiqhus-sunnah/fiqhus-sunnah.pdf', coverColor: '#5C3317', uploadedAt: '2024-01-18' },
  ];

  const absensi: Absensi[] = [
    { id: 'a1', jadwalId: 'j1', userId: 'u4', status: 'hadir', timestamp: twoWeeksAgo + 'T08:05:00' },
    { id: 'a2', jadwalId: 'j1', userId: 'u5', status: 'hadir', timestamp: twoWeeksAgo + 'T08:10:00' },
    { id: 'a3', jadwalId: 'j1', userId: 'u6', status: 'izin', keterangan: 'Sakit demam', timestamp: twoWeeksAgo + 'T07:30:00' },
    { id: 'a4', jadwalId: 'j2', userId: 'u4', status: 'hadir', timestamp: lastWeek + 'T08:02:00' },
    { id: 'a5', jadwalId: 'j2', userId: 'u5', status: 'alpha', timestamp: lastWeek + 'T08:00:00' },
    { id: 'a6', jadwalId: 'j2', userId: 'u6', status: 'hadir', timestamp: lastWeek + 'T08:07:00' },
    { id: 'a7', jadwalId: 'j5', userId: 'u7', status: 'hadir', timestamp: twoWeeksAgo + 'T10:02:00' },
    { id: 'a8', jadwalId: 'j5', userId: 'u8', status: 'alpha', timestamp: twoWeeksAgo + 'T10:00:00' },
    { id: 'a9', jadwalId: 'j5', userId: 'u9', status: 'hadir', timestamp: twoWeeksAgo + 'T10:05:00' },
    { id: 'a10', jadwalId: 'j6', userId: 'u7', status: 'hadir', timestamp: lastWeek + 'T10:01:00' },
    { id: 'a11', jadwalId: 'j6', userId: 'u8', status: 'izin', keterangan: 'Ada keperluan keluarga', timestamp: lastWeek + 'T09:30:00' },
    { id: 'a12', jadwalId: 'j6', userId: 'u9', status: 'hadir', timestamp: lastWeek + 'T10:04:00' },
  ];

  const soal: Soal[] = [
    {
      id: 's1',
      title: 'Simulasi Pra-Mudarasah: Tafsir Al-Mulk',
      description: 'Soal simulasi sebelum mudarasah pekan ini tentang Tafsir Surah Al-Mulk ayat 15-30. Kerjakan dengan sungguh-sungguh.',
      guruId: 'u2',
      halaqahId: 'h1',
      jadwalId: 'j3',
      questions: [
        { id: 'q1', text: 'Jelaskan makna "huwal-ladzii ja\'ala lakumul-ardha dzaluulan" (ayat 15) dan hikmah apa yang dapat diambil dari ayat tersebut!' },
        { id: 'q2', text: 'Sebutkan dan jelaskan isi kandungan ayat 19-22 Surah Al-Mulk tentang nikmat Allah yang terus mengalir!' },
        { id: 'q3', text: 'Bagaimana cara Al-Quran menggambarkan azab bagi orang-orang yang ingkar di akhirat berdasarkan ayat 27-28 Surah Al-Mulk?' },
      ],
      deadline: today + 'T07:30:00',
      createdAt: getDateOffset(-2),
    },
    {
      id: 's2',
      title: 'Simulasi Pra-Mudarasah: Fiqh Shalat Pembatal',
      description: 'Soal untuk mempersiapkan materi mudarasah tentang pembatal-pembatal shalat menurut empat mazhab.',
      guruId: 'u3',
      halaqahId: 'h2',
      jadwalId: 'j7',
      questions: [
        { id: 'q4', text: 'Sebutkan minimal 8 perkara yang membatalkan shalat beserta dalil atau alasannya!' },
        { id: 'q5', text: 'Apakah perbedaan pendapat ulama mengenai gerakan yang banyak (al-amal al-katsir) dalam shalat? Jelaskan batasan masing-masing pendapat!' },
        { id: 'q6', text: 'Seseorang shalat lalu teringat bahwa ia berhadats. Apa yang harus dilakukannya? Jelaskan berdasarkan pendapat yang kuat!' },
      ],
      deadline: today + 'T09:30:00',
      createdAt: getDateOffset(-3),
    },
  ];

  return { users, halaqah, jadwal, kitab, absensi, soal };
}

function load<T>(key: string, fallback: T[]): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T[];
  } catch {
    return fallback;
  }
}

function save<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

export function genId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function initStore(): void {
  if (localStorage.getItem(KEYS.initialized)) return;
  const { users, halaqah, jadwal, kitab, absensi, soal } = buildInitData();
  save(KEYS.users, users);
  save(KEYS.halaqah, halaqah);
  save(KEYS.jadwal, jadwal);
  save(KEYS.kitab, kitab);
  save(KEYS.absensi, absensi);
  save(KEYS.soal, soal);
  save(KEYS.submissions, []);
  localStorage.setItem(KEYS.initialized, '1');
}

export const UserStore = {
  async login(email: string, pass: string) {
    try {
      const res = await fetch('https://url-backend-railway-anda/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    } catch (err) {
      console.error(err);
      return null;
    }
  },

  async create(userData: { username: string; email: string; password: string; role: string }) {
    try {
      const res = await fetch('https://url-backend-railway-anda/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    } catch (err) {
      console.error(err);
      return null;
    }
  }
};

export const HalaqahStore = {
  getAll: () => load<Halaqah>(KEYS.halaqah, []),
  getById: (id: string) => load<Halaqah>(KEYS.halaqah, []).find(h => h.id === id),
  getByGuru: (guruId: string) => load<Halaqah>(KEYS.halaqah, []).find(h => h.guruId === guruId),
  create: (data: Omit<Halaqah, 'id' | 'createdAt'>) => {
    const list = load<Halaqah>(KEYS.halaqah, []);
    const newH: Halaqah = { ...data, id: 'h' + genId(), createdAt: new Date().toISOString().split('T')[0] };
    save(KEYS.halaqah, [...list, newH]);
    return newH;
  },
  update: (id: string, data: Partial<Halaqah>) => {
    save(KEYS.halaqah, load<Halaqah>(KEYS.halaqah, []).map(h => h.id === id ? { ...h, ...data } : h));
  },
  delete: (id: string) => {
    save(KEYS.halaqah, load<Halaqah>(KEYS.halaqah, []).filter(h => h.id !== id));
  },
};

export const KitabStore = {
  getAll: () => load<Kitab>(KEYS.kitab, []),
  getByHalaqah: (halaqahId: string) => load<Kitab>(KEYS.kitab, []).filter(k => k.halaqahId === halaqahId),
  getByGuru: (guruId: string) => load<Kitab>(KEYS.kitab, []).filter(k => k.guruId === guruId),
  create: (data: Omit<Kitab, 'id' | 'uploadedAt'>) => {
    const list = load<Kitab>(KEYS.kitab, []);
    const newK: Kitab = { ...data, id: 'k' + genId(), uploadedAt: new Date().toISOString().split('T')[0] };
    save(KEYS.kitab, [...list, newK]);
    return newK;
  },
  update: (id: string, data: Partial<Kitab>) => {
    save(KEYS.kitab, load<Kitab>(KEYS.kitab, []).map(k => k.id === id ? { ...k, ...data } : k));
  },
  delete: (id: string) => {
    save(KEYS.kitab, load<Kitab>(KEYS.kitab, []).filter(k => k.id !== id));
  },
};

export const JadwalStore = {
  getAll: () => load<Jadwal>(KEYS.jadwal, []),
  getByHalaqah: (halaqahId: string) => load<Jadwal>(KEYS.jadwal, []).filter(j => j.halaqahId === halaqahId),
  create: (data: Omit<Jadwal, 'id' | 'createdAt'>) => {
    const list = load<Jadwal>(KEYS.jadwal, []);
    const newJ: Jadwal = { ...data, id: 'j' + genId(), createdAt: new Date().toISOString().split('T')[0] };
    save(KEYS.jadwal, [...list, newJ]);
    return newJ;
  },
  update: (id: string, data: Partial<Jadwal>) => {
    save(KEYS.jadwal, load<Jadwal>(KEYS.jadwal, []).map(j => j.id === id ? { ...j, ...data } : j));
  },
  delete: (id: string) => {
    save(KEYS.jadwal, load<Jadwal>(KEYS.jadwal, []).filter(j => j.id !== id));
  },
};

export const AbsensiStore = {
  getAll: () => load<Absensi>(KEYS.absensi, []),
  getByJadwal: (jadwalId: string) => load<Absensi>(KEYS.absensi, []).filter(a => a.jadwalId === jadwalId),
  getByUser: (userId: string) => load<Absensi>(KEYS.absensi, []).filter(a => a.userId === userId),
  getByUserAndJadwal: (userId: string, jadwalId: string) =>
    load<Absensi>(KEYS.absensi, []).find(a => a.userId === userId && a.jadwalId === jadwalId),
  create: (data: Omit<Absensi, 'id'>) => {
    const list = load<Absensi>(KEYS.absensi, []);
    const newA: Absensi = { ...data, id: 'a' + genId() };
    save(KEYS.absensi, [...list, newA]);
    return newA;
  },
  update: (id: string, data: Partial<Absensi>) => {
    save(KEYS.absensi, load<Absensi>(KEYS.absensi, []).map(a => a.id === id ? { ...a, ...data } : a));
  },
};

export const SoalStore = {
  getAll: () => load<Soal>(KEYS.soal, []),
  getByHalaqah: (halaqahId: string) => load<Soal>(KEYS.soal, []).filter(s => s.halaqahId === halaqahId),
  getByGuru: (guruId: string) => load<Soal>(KEYS.soal, []).filter(s => s.guruId === guruId),
  getById: (id: string) => load<Soal>(KEYS.soal, []).find(s => s.id === id),
  create: (data: Omit<Soal, 'id' | 'createdAt'>) => {
    const list = load<Soal>(KEYS.soal, []);
    const newS: Soal = { ...data, id: 's' + genId(), createdAt: new Date().toISOString().split('T')[0] };
    save(KEYS.soal, [...list, newS]);
    return newS;
  },
  delete: (id: string) => {
    save(KEYS.soal, load<Soal>(KEYS.soal, []).filter(s => s.id !== id));
  },
};

export const SubmissionStore = {
  getAll: () => load<SoalSubmission>(KEYS.submissions, []),
  getBySoal: (soalId: string) => load<SoalSubmission>(KEYS.submissions, []).filter(s => s.soalId === soalId),
  getByUserAndSoal: (userId: string, soalId: string) =>
    load<SoalSubmission>(KEYS.submissions, []).find(s => s.userId === userId && s.soalId === soalId),
  create: (data: Omit<SoalSubmission, 'id'>) => {
    const list = load<SoalSubmission>(KEYS.submissions, []);
    const newSub: SoalSubmission = { ...data, id: 'sub' + genId() };
    save(KEYS.submissions, [...list, newSub]);
    return newSub;
  },
};
