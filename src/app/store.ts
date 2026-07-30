import type { User, Halaqah, Kitab, Jadwal, Absensi, Soal, SoalSubmission } from './types';

const API_URL = 'https://mudarasah-asatidzah-production.up.railway.app/api';

const KEYS = {
  users: 'mudarasah_users',
  halaqah: 'mudarasah_halaqah',
  kitab: 'mudarasah_kitab',
  jadwal: 'mudarasah_jadwal',
  absensi: 'mudarasah_absensi',
  soal: 'mudarasah_soal',
  submissions: 'mudarasah_submissions',
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

// ================= USER STORE (Hibrida API & Lokal untuk stabilitas UI) =================
export const UserStore = {
  async login(email: string, pass: string) {
    try {
      const res = await fetch(`${API_URL}/login`, {
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
      const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      const list = load<User>(KEYS.users, []);
      save(KEYS.users, [...list, data]);
      return data;
    } catch (err) {
      console.error(err);
      return null;
    }
  },

  getAll: (): User[] => load<User>(KEYS.users, []),
  getById: (id: string): User | undefined => load<User>(KEYS.users, []).find((u: User) => u.id === id),
  getByEmail: (email: string): User | undefined => load<User>(KEYS.users, []).find((u: User) => u.email === email),
  getByRole: (role: string): User[] => load<User>(KEYS.users, []).filter((u: User) => u.role === role),
  
  update(id: string, data: Partial<User>) {
    const list = load<User>(KEYS.users, []);
    const updated = list.map((u: User) => u.id === id ? { ...u, ...data } : u);
    save(KEYS.users, updated);
  },

  delete(id: string) {
    const list = load<User>(KEYS.users, []);
    const filtered = list.filter((u: User) => u.id !== id);
    save(KEYS.users, filtered);
  }
};

// ================= HALAQAH STORE =================
export const HalaqahStore = {
  getAll: (): Halaqah[] => load<Halaqah>(KEYS.halaqah, []),
  getById: (id: string): Halaqah | undefined => load<Halaqah>(KEYS.halaqah, []).find((h: Halaqah) => h.id === id),
  getByGuru: (guruId: string): Halaqah | undefined => load<Halaqah>(KEYS.halaqah, []).find((h: Halaqah) => h.guruId === guruId),
  
  create(data: Omit<Halaqah, 'id' | 'createdAt'>): Halaqah {
    const list = load<Halaqah>(KEYS.halaqah, []);
    const newH: Halaqah = { ...data, id: 'h' + genId(), createdAt: new Date().toISOString().split('T')[0] };
    save(KEYS.halaqah, [...list, newH]);
    return newH;
  },
  
  update(id: string, data: Partial<Halaqah>) {
    save(KEYS.halaqah, load<Halaqah>(KEYS.halaqah, []).map((h: Halaqah) => h.id === id ? { ...h, ...data } : h));
  },
  
  delete(id: string) {
    save(KEYS.halaqah, load<Halaqah>(KEYS.halaqah, []).filter((h: Halaqah) => h.id !== id));
  },
};

// ================= KITAB STORE =================
export const KitabStore = {
  getAll: (): Kitab[] => load<Kitab>(KEYS.kitab, []),
  getByHalaqah: (halaqahId: string): Kitab[] => load<Kitab>(KEYS.kitab, []).filter((k: Kitab) => k.halaqahId === halaqahId),
  getByGuru: (guruId: string): Kitab[] => [],
  create(data: Omit<Kitab, 'id' | 'uploadedAt'>): Kitab {
    const list = load<Kitab>(KEYS.kitab, []);
    const newK: Kitab = { ...data, id: 'k' + genId(), uploadedAt: new Date().toISOString().split('T')[0] };
    save(KEYS.kitab, [...list, newK]);
    return newK;
  },
  update(id: string, data: Partial<Kitab>) {
    save(KEYS.kitab, load<Kitab>(KEYS.kitab, []).map((k: Kitab) => k.id === id ? { ...k, ...data } : k));
  },
  delete(id: string) {
    save(KEYS.kitab, load<Kitab>(KEYS.kitab, []).filter((k: Kitab) => k.id !== id));
  },
};

// ================= JADWAL STORE =================
export const JadwalStore = {
  getAll: (): Jadwal[] => load<Jadwal>(KEYS.jadwal, []),
  getByHalaqah: (halaqahId: string): Jadwal[] => load<Jadwal>(KEYS.jadwal, []).filter((j: Jadwal) => j.halaqahId === halaqahId),
  create(data: Omit<Jadwal, 'id' | 'createdAt'>): Jadwal {
    const list = load<Jadwal>(KEYS.jadwal, []);
    const newJ: Jadwal = { ...data, id: 'j' + genId(), createdAt: new Date().toISOString().split('T')[0] };
    save(KEYS.jadwal, [...list, newJ]);
    return newJ;
  },
  update(id: string, data: Partial<Jadwal>) {
    save(KEYS.jadwal, load<Jadwal>(KEYS.jadwal, []).map((j: Jadwal) => j.id === id ? { ...j, ...data } : j));
  },
  delete(id: string) {
    save(KEYS.jadwal, load<Jadwal>(KEYS.jadwal, []).filter((j: Jadwal) => j.id !== id));
  },
};

// ================= ABSENSI STORE =================
export const AbsensiStore = {
  getAll: (): Absensi[] => load<Absensi>(KEYS.absensi, []),
  getByJadwal: (jadwalId: string): Absensi[] => load<Absensi>(KEYS.absensi, []).filter((a: Absensi) => a.jadwalId === jadwalId),
  getByUser: (userId: string): Absensi[] => load<Absensi>(KEYS.absensi, []).filter((a: Absensi) => a.userId === userId),
  getByUserAndJadwal: (userId: string, jadwalId: string) =>
    load<Absensi>(KEYS.absensi, []).find((a: Absensi) => a.userId === userId && a.jadwalId === jadwalId),
  create(data: Omit<Absensi, 'id'>): Absensi {
    const list = load<Absensi>(KEYS.absensi, []);
    const newA: Absensi = { ...data, id: 'a' + genId() };
    save(KEYS.absensi, [...list, newA]);
    return newA;
  },
  update(id: string, data: Partial<Absensi>) {
    save(KEYS.absensi, load<Absensi>(KEYS.absensi, []).map((a: Absensi) => a.id === id ? { ...a, ...data } : a));
  },
};

// ================= SOAL STORE =================
export const SoalStore = {
  getAll: (): Soal[] => load<Soal>(KEYS.soal, []),
  getByHalaqah: (halaqahId: string): Soal[] => load<Soal>(KEYS.soal, []).filter((s: Soal) => s.halaqahId === halaqahId),
  getByGuru: (guruId: string): Soal[] => [],
  getById: (id: string): Soal | undefined => load<Soal>(KEYS.soal, []).find((s: Soal) => s.id === id),
  create(data: Omit<Soal, 'id' | 'createdAt'>): Soal {
    const list = load<Soal>(KEYS.soal, []);
    const newS: Soal = { ...data, id: 's' + genId(), createdAt: new Date().toISOString().split('T')[0] };
    save(KEYS.soal, [...list, newS]);
    return newS;
  },
  delete(id: string) {
    save(KEYS.soal, load<Soal>(KEYS.soal, []).filter((s: Soal) => s.id !== id));
  },
};

// ================= SUBMISSION STORE =================
export const SubmissionStore = {
  getAll: (): SoalSubmission[] => load<SoalSubmission>(KEYS.submissions, []),
  getBySoal: (soalId: string): SoalSubmission[] => load<SoalSubmission>(KEYS.submissions, []).filter((s: SoalSubmission) => s.soalId === soalId),
  getByUserAndSoal: (userId: string, soalId: string) =>
    load<SoalSubmission>(KEYS.submissions, []).find((s: SoalSubmission) => s.userId === userId && s.soalId === soalId),
  create(data: Omit<SoalSubmission, 'id'>): SoalSubmission {
    const list = load<SoalSubmission>(KEYS.submissions, []);
    const newSub: SoalSubmission = { ...data, id: 'sub' + genId() };
    save(KEYS.submissions, [...list, newSub]);
    return newSub;
  },
};