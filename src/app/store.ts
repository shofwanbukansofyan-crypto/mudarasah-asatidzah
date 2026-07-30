import type { User, Halaqah, Kitab, Jadwal, Absensi, Soal, SoalSubmission } from './types';

const API_URL = 'https://mudarasah-asatidzah-production.up.railway.app/api';

export function genId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// Helper untuk fetch sinkron (Cache System)
// Ini membuat AdminPanel tidak error karena langsung menerima array/object, bukan Promise
const DataCache: Record<string, any[]> = {
  users: [],
  halaqah: [],
  kitab: [],
  jadwal: [],
  absensi: [],
  soal: [],
  submissions: []
};

// Inisialisasi data di background
export async function initializeStore() {
  try {
    const endpoints = ['users', 'halaqah', 'kitab', 'jadwal', 'absensi', 'soal', 'submissions'];
    for (const ep of endpoints) {
      const res = await fetch(`${API_URL}/${ep}`);
      if (res.ok) {
        DataCache[ep] = await res.json();
      }
    }
    console.log('Store initialized with backend data');
  } catch (e) {
    console.error('Failed to initialize store:', e);
  }
}

// ================= USER STORE =================
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
      DataCache.users.push(data); // Update cache lokal
      return data;
    } catch (err) {
      console.error(err);
      return null;
    }
  },

  // FUNGSI SINKRON UNTUK ADMIN PANEL (Tidak pakai async/await)
  getAll: (): User[] => DataCache.users,
  getById: (id: string): User | undefined => DataCache.users.find((u: User) => u.id === id),
  getByEmail: (email: string): User | undefined => DataCache.users.find((u: User) => u.email === email),
  getByRole: (role: string): User[] => DataCache.users.filter((u: User) => u.role === role),
  
  async delete(id: string) {
    try {
      await fetch(`${API_URL}/users/${id}`, { method: 'DELETE' });
      DataCache.users = DataCache.users.filter((u: User) => u.id !== id);
    } catch (err) {
      console.error(err);
    }
  },
  
  update(id: string, data: Partial<User>) {
    DataCache.users = DataCache.users.map((u: User) => u.id === id ? { ...u, ...data } : u);
  }
};

// ================= HALAQAH STORE =================
export const HalaqahStore = {
  getAll: (): Halaqah[] => DataCache.halaqah,
  getById: (id: string): Halaqah | undefined => DataCache.halaqah.find((h: Halaqah) => h.id === id),
  getByGuru: (guruId: string): Halaqah | undefined => DataCache.halaqah.find((h: Halaqah) => h.guruId === guruId),
  
  // Pastikan TIDAK ADA kata 'async' di sini, agar mengembalikan objek Halaqah langsung
  create(data: Omit<Halaqah, 'id' | 'createdAt'>): Halaqah {
    const newHalaqah: Halaqah = {
      ...data,
      id: 'h' + genId(),
      createdAt: new Date().toISOString().split('T')[0]
    };
    DataCache.halaqah.push(newHalaqah);

    // Sync ke backend Railway di background secara aman
    fetch(`${API_URL}/halaqah`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newHalaqah)
    }).catch(err => console.error(err));

    return newHalaqah;
  },
  
  async delete(id: string) {
    try {
      await fetch(`${API_URL}/halaqah/${id}`, { method: 'DELETE' });
      DataCache.halaqah = DataCache.halaqah.filter((h: Halaqah) => h.id !== id);
    } catch (err) {
      console.error(err);
    }
  },
  
  update(id: string, data: Partial<Halaqah>) {
    DataCache.halaqah = DataCache.halaqah.map((h: Halaqah) => h.id === id ? { ...h, ...data } : h);
  }
};

// ================= KITAB STORE =================
export const KitabStore = {
  getAll: (): Kitab[] => DataCache.kitab,
  getByHalaqah: (halaqahId: string): Kitab[] => DataCache.kitab.filter((k: Kitab) => k.halaqahId === halaqahId),
  getByGuru: (guruId: string): Kitab[] => [], // Implementasikan filter yang sesuai jika perlu
  
  async create(data: Omit<Kitab, 'id' | 'uploadedAt'>) {
    try {
      const res = await fetch(`${API_URL}/kitab`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      DataCache.kitab.push(json);
      return json;
    } catch (err) {
      console.error(err);
      return null;
    }
  },
  
  async delete(id: string) {
    try {
      await fetch(`${API_URL}/kitab/${id}`, { method: 'DELETE' });
      DataCache.kitab = DataCache.kitab.filter((k: Kitab) => k.id !== id);
    } catch (err) {
      console.error(err);
    }
  },
  
  update(id: string, data: Partial<Kitab>) {
    DataCache.kitab = DataCache.kitab.map((k: Kitab) => k.id === id ? { ...k, ...data } : k);
  }
};

// ================= JADWAL STORE =================
export const JadwalStore = {
  getAll: (): Jadwal[] => DataCache.jadwal,
  getByHalaqah: (halaqahId: string): Jadwal[] => DataCache.jadwal.filter((j: Jadwal) => j.halaqahId === halaqahId),
  
  async create(data: Omit<Jadwal, 'id' | 'createdAt'>) {
    try {
      const res = await fetch(`${API_URL}/jadwal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      DataCache.jadwal.push(json);
      return json;
    } catch (err) {
      console.error(err);
      return null;
    }
  },
  
  async delete(id: string) {
    try {
      await fetch(`${API_URL}/jadwal/${id}`, { method: 'DELETE' });
      DataCache.jadwal = DataCache.jadwal.filter((j: Jadwal) => j.id !== id);
    } catch (err) {
      console.error(err);
    }
  },
  
  update(id: string, data: Partial<Jadwal>) {
    DataCache.jadwal = DataCache.jadwal.map((j: Jadwal) => j.id === id ? { ...j, ...data } : j);
  }
};

// ================= ABSENSI STORE =================
export const AbsensiStore = {
  getAll: (): Absensi[] => DataCache.absensi,
  getByJadwal: (jadwalId: string): Absensi[] => DataCache.absensi.filter((a: Absensi) => a.jadwalId === jadwalId),
  getByUser: (userId: string): Absensi[] => DataCache.absensi.filter((a: Absensi) => a.userId === userId),
  getByUserAndJadwal: (userId: string, jadwalId: string): Absensi | undefined => DataCache.absensi.find((a: Absensi) => a.userId === userId && a.jadwalId === jadwalId),
  
  async create(data: Omit<Absensi, 'id'>) {
    try {
      const res = await fetch(`${API_URL}/absensi`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      DataCache.absensi.push(json);
      return json;
    } catch (err) {
      console.error(err);
      return null;
    }
  },
  
  update(id: string, data: Partial<Absensi>) {
    DataCache.absensi = DataCache.absensi.map((a: Absensi) => a.id === id ? { ...a, ...data } : a);
  }
};

// ================= SOAL STORE =================
export const SoalStore = {
  getAll: (): Soal[] => DataCache.soal,
  getByHalaqah: (halaqahId: string): Soal[] => DataCache.soal.filter((s: Soal) => s.halaqahId === halaqahId),
  getByGuru: (guruId: string): Soal[] => [],
  getById: (id: string): Soal | undefined => DataCache.soal.find((s: Soal) => s.id === id),
  
  async create(data: Omit<Soal, 'id' | 'createdAt'>) {
    try {
      const res = await fetch(`${API_URL}/soal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      DataCache.soal.push(json);
      return json;
    } catch (err) {
      console.error(err);
      return null;
    }
  },
  
  async delete(id: string) {
    try {
      await fetch(`${API_URL}/soal/${id}`, { method: 'DELETE' });
      DataCache.soal = DataCache.soal.filter((s: Soal) => s.id !== id);
    } catch (err) {
      console.error(err);
    }
  }
};

// ================= SUBMISSION STORE =================
export const SubmissionStore = {
  getAll: (): SoalSubmission[] => DataCache.submissions,
  getBySoal: (soalId: string): SoalSubmission[] => DataCache.submissions.filter((s: SoalSubmission) => s.soalId === soalId),
  getByUserAndSoal: (userId: string, soalId: string): SoalSubmission | undefined => DataCache.submissions.find((s: SoalSubmission) => s.userId === userId && s.soalId === soalId),
  
  async create(data: Omit<SoalSubmission, 'id'>) {
    try {
      const res = await fetch(`${API_URL}/submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      DataCache.submissions.push(json);
      return json;
    } catch (err) {
      console.error(err);
      return null;
    }
  }
};