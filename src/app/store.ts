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

// Terhubung ke Database PostgreSQL via Backend Railway
export const UserStore = {
  async login(email: string, pass: string) {
    try {
      const res = await fetch('https://mudarasah-asatidzah-production.up.railway.app/api/login', {
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
      const res = await fetch('https://mudarasah-asatidzah-production.up.railway.app/api/register', {
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