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
    return raw ? JSON.parse(raw) as T[] : fallback;
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

// Inisialisasi background untuk narik data API ke lokal saat web pertama kali dibuka
export async function initializeStore() {
  try {
    const endpoints = Object.keys(KEYS);
    for (const ep of endpoints) {
      const res = await fetch(`${API_URL}/${ep}`);
      if (res.ok) {
        save(KEYS[ep as keyof typeof KEYS], await res.json());
      }
    }
  } catch (e) {
    console.error('Gagal sinkronisasi dengan Railway:', e);
  }
}

// ================= USER STORE =================
export const UserStore = {
  async login(email: string, pass: string): Promise<User | null> {
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

  async create(userData: { username: string; email: string; password: string; role: string }): Promise<User | null> {
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
  getById: (id: string): User | undefined => load<User>(KEYS.users, []).find(u => u.id === id),
  getByEmail: (email: string): User | undefined => load<User>(KEYS.users, []).find(u => u.email === email),
  getByRole: (role: string): User[] => load<User>(KEYS.users, []).filter(u => u.role === role),
  
  update(id: string, data: Partial<User>) {
    const updated = load<User>(KEYS.users, []).map(u => u.id === id ? { ...u, ...data } : u);
    save(KEYS.users, updated);
    // Silent API Update jika endpoint tersedia
  },

  delete(id: string) {
    const filtered = load<User>(KEYS.users, []).filter(u => u.id !== id);
    save(KEYS.users, filtered);
    fetch(`${API_URL}/users/${id}`, { method: 'DELETE' }).catch(console.error);
  }
};

// ================= HALAQAH STORE =================
export const HalaqahStore = {
  getAll: (): Halaqah[] => load<Halaqah>(KEYS.halaqah, []),
  getById: (id: string): Halaqah | undefined => load<Halaqah>(KEYS.halaqah, []).find(h => h.id === id),
  getByGuru: (guruId: string): Halaqah | undefined => load<Halaqah>(KEYS.halaqah, []).find(h => h.guruId === guruId),
  
  create(data: Omit<Halaqah, 'id' | 'createdAt'>): Halaqah {
    const list = load<Halaqah>(KEYS.halaqah, []);
    const newH: Halaqah = { ...data, id: 'h' + genId(), createdAt: new Date().toISOString().split('T')[0] };
    save(KEYS.halaqah, [...list, newH]);
    fetch(`${API_URL}/halaqah`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newH) }).catch(console.error);
    return newH;
  },
  
  update(id: string, data: Partial<Halaqah>) {
    save(KEYS.halaqah, load<Halaqah>(KEYS.halaqah, []).map(h => h.id === id ? { ...h, ...data } : h));
  },
  
  delete(id: string) {
    save(KEYS.halaqah, load<Halaqah>(KEYS.halaqah, []).filter(h => h.id !== id));
    fetch(`${API_URL}/halaqah/${id}`, { method: 'DELETE' }).catch(console.error);
  }
};

// ================= KITAB STORE =================
export const KitabStore = {
  getAll: (): Kitab[] => load<Kitab>(KEYS.kitab, []),
  getByHalaqah: (halaqahId: string): Kitab[] => load<Kitab>(KEYS.kitab, []).filter(k => k.halaqahId === halaqahId),
  getByGuru: (guruId: string): Kitab[] => [],
  
  create(data: Omit<Kitab, 'id' | 'uploadedAt'>): Kitab {
    const list = load<Kitab>(KEYS.kitab, []);
    const newK: Kitab = { ...data, id: 'k' + genId(), uploadedAt: new Date().toISOString().split('T')[0] };
    save(KEYS.kitab, [...list, newK]);
    fetch(`${API_URL}/kitab`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newK) }).catch(console.error);
    return newK;
  },
  
  update(id: string, data: Partial<Kitab>) {
    save(KEYS.kitab, load<Kitab>(KEYS.kitab, []).map(k => k.id === id ? { ...k, ...data } : k));
  },
  
  delete(id: string) {
    save(KEYS.kitab, load<Kitab>(KEYS.kitab, []).filter(k => k.id !== id));
    fetch(`${API_URL}/kitab/${id}`, { method: 'DELETE' }).catch(console.error);
  }
};

// ================= JADWAL STORE =================
export const JadwalStore = {
  getAll: (): Jadwal[] => load<Jadwal>(KEYS.jadwal, []),
  getByHalaqah: (halaqahId: string): Jadwal[] => load<Jadwal>(KEYS.jadwal, []).filter(j => j.halaqahId === halaqahId),
  
  create(data: Omit<Jadwal, 'id' | 'createdAt'>): Jadwal {
    const list = load<Jadwal>(KEYS.jadwal, []);
    const newJ: Jadwal = { ...data, id: 'j' + genId(), createdAt: new Date().toISOString().split('T')[0] };
    save(KEYS.jadwal, [...list, newJ]);
    fetch(`${API_URL}/jadwal`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newJ) }).catch(console.error);
    return newJ;
  },
  
  update(id: string, data: Partial<Jadwal>) {
    save(KEYS.jadwal, load<Jadwal>(KEYS.jadwal, []).map(j => j.id === id ? { ...j, ...data } : j));
  },
  
  delete(id: string) {
    save(KEYS.jadwal, load<Jadwal>(KEYS.jadwal, []).filter(j => j.id !== id));
    fetch(`${API_URL}/jadwal/${id}`, { method: 'DELETE' }).catch(console.error);
  }
};

// ================= ABSENSI STORE =================
export const AbsensiStore = {
  getAll: (): Absensi[] => load<Absensi>(KEYS.absensi, []),
  getByJadwal: (jadwalId: string): Absensi[] => load<Absensi>(KEYS.absensi, []).filter(a => a.jadwalId === jadwalId),
  getByUser: (userId: string): Absensi[] => load<Absensi>(KEYS.absensi, []).filter(a => a.userId === userId),
  getByUserAndJadwal: (userId: string, jadwalId: string): Absensi | undefined => load<Absensi>(KEYS.absensi, []).find(a => a.userId === userId && a.jadwalId === jadwalId),
  
  create(data: Omit<Absensi, 'id'>): Absensi {
    const list = load<Absensi>(KEYS.absensi, []);
    const newA: Absensi = { ...data, id: 'a' + genId() };
    save(KEYS.absensi, [...list, newA]);
    fetch(`${API_URL}/absensi`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newA) }).catch(console.error);
    return newA;
  },
  
  update(id: string, data: Partial<Absensi>) {
    save(KEYS.absensi, load<Absensi>(KEYS.absensi, []).map(a => a.id === id ? { ...a, ...data } : a));
  }
};

// ================= SOAL STORE =================
export const SoalStore = {
  getAll: (): Soal[] => load<Soal>(KEYS.soal, []),
  getByHalaqah: (halaqahId: string): Soal[] => load<Soal>(KEYS.soal, []).filter(s => s.halaqahId === halaqahId),
  getByGuru: (guruId: string): Soal[] => [],
  getById: (id: string): Soal | undefined => load<Soal>(KEYS.soal, []).find(s => s.id === id),
  
  create(data: Omit<Soal, 'id' | 'createdAt'>): Soal {
    const list = load<Soal>(KEYS.soal, []);
    const newS: Soal = { ...data, id: 's' + genId(), createdAt: new Date().toISOString().split('T')[0] };
    save(KEYS.soal, [...list, newS]);
    fetch(`${API_URL}/soal`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newS) }).catch(console.error);
    return newS;
  },
  
  delete(id: string) {
    save(KEYS.soal, load<Soal>(KEYS.soal, []).filter(s => s.id !== id));
    fetch(`${API_URL}/soal/${id}`, { method: 'DELETE' }).catch(console.error);
  }
};

// ================= SUBMISSION STORE =================
export const SubmissionStore = {
  getAll: (): SoalSubmission[] => load<SoalSubmission>(KEYS.submissions, []),
  getBySoal: (soalId: string): SoalSubmission[] => load<SoalSubmission>(KEYS.submissions, []).filter(s => s.soalId === soalId),
  getByUserAndSoal: (userId: string, soalId: string): SoalSubmission | undefined => load<SoalSubmission>(KEYS.submissions, []).find(s => s.userId === userId && s.soalId === soalId),
  
  create(data: Omit<SoalSubmission, 'id'>): SoalSubmission {
    const list = load<SoalSubmission>(KEYS.submissions, []);
    const newSub: SoalSubmission = { ...data, id: 'sub' + genId() };
    save(KEYS.submissions, [...list, newSub]);
    fetch(`${API_URL}/submissions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newSub) }).catch(console.error);
    return newSub;
  }
};