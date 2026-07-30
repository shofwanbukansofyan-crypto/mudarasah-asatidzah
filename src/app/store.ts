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

// ================= MAPPER: Database (Indo) -> Frontend (Eng) =================
export async function initializeStore() {
  try {
    const fetchAndMap = async (endpoint: string, key: string, mapper: (item: any) => any) => {
      const res = await fetch(`${API_URL}/${endpoint}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          save(key, data.map(mapper));
        }
      }
    };

    await Promise.all([
      fetchAndMap('users', KEYS.users, (u: any) => u),
      
      // PERBAIKAN: Baca JSON memberIds jadi Array
      fetchAndMap('halaqah', KEYS.halaqah, (h: any) => {
        let parsedMembers = [];
        try { parsedMembers = typeof h.memberIds === 'string' ? JSON.parse(h.memberIds) : (h.memberIds || []); } catch {}
        return { ...h, name: h.nama, description: h.deskripsi, memberIds: parsedMembers };
      }),
      
      fetchAndMap('kitab', KEYS.kitab, (k: any) => ({ ...k, title: k.judul, author: k.penulis, fileUrl: k.fileUrl })),
      fetchAndMap('jadwal', KEYS.jadwal, (j: any) => ({ ...j, date: j.hari, time: j.jam, topic: j.materi })),
      fetchAndMap('absensi', KEYS.absensi, (a: any) => a),
      
      fetchAndMap('soal', KEYS.soal, (s: any) => {
        let parsedQ = [];
        try { parsedQ = typeof s.pertanyaan === 'string' ? JSON.parse(s.pertanyaan) : s.pertanyaan; } catch {}
        return { ...s, title: s.judul, description: s.deskripsi || '', jadwalId: s.jadwalId || '', deadline: s.deadline || '', questions: parsedQ };
      }),
    ]);
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
    
    fetch(`${API_URL}/halaqah`, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({
        nama: newH.name,
        deskripsi: (newH as any).description || '',
        guruId: newH.guruId,
        memberIds: JSON.stringify(newH.memberIds || []) 
      }) 
    }).catch(console.error);
    return newH;
  },
  
  update(id: string, data: Partial<Halaqah>) {
    const list = load<Halaqah>(KEYS.halaqah, []);
    const updatedHalaqah = { ...list.find(h => h.id === id), ...data } as Halaqah;
    save(KEYS.halaqah, list.map(h => h.id === id ? updatedHalaqah : h));
    
    fetch(`${API_URL}/halaqah/${id}`, { 
      method: 'PUT', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({
        nama: updatedHalaqah.name,
        deskripsi: (updatedHalaqah as any).description || '',
        guruId: updatedHalaqah.guruId,
        memberIds: JSON.stringify(updatedHalaqah.memberIds || []) 
      }) 
    }).catch(console.error);
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
  getByGuru: (guruId: string): Kitab[] => load<Kitab>(KEYS.kitab, []).filter(k => k.guruId === guruId),
  
  create(data: Omit<Kitab, 'id' | 'uploadedAt'>): Kitab {
    const list = load<Kitab>(KEYS.kitab, []);
    const newK: Kitab = { ...data, id: 'k' + genId(), uploadedAt: new Date().toISOString().split('T')[0] };
    save(KEYS.kitab, [...list, newK]);
    
    fetch(`${API_URL}/kitab`, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({
        judul: newK.title,
        penulis: newK.author,
        fileUrl: newK.fileUrl || '',
        halaqahId: newK.halaqahId
      }) 
    }).catch(console.error);
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
    
    fetch(`${API_URL}/jadwal`, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({
        hari: newJ.date,
        jam: newJ.time,
        materi: newJ.topic,
        halaqahId: newJ.halaqahId
      }) 
    }).catch(console.error);
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
  getByGuru: (guruId: string): Soal[] => load<Soal>(KEYS.soal, []).filter(s => (s as any).guruId === guruId),
  getById: (id: string): Soal | undefined => load<Soal>(KEYS.soal, []).find(s => s.id === id),
  
  create(data: Omit<Soal, 'id' | 'createdAt'>): Soal {
    const list = load<Soal>(KEYS.soal, []);
    const newS: Soal = { ...data, id: 's' + genId(), createdAt: new Date().toISOString().split('T')[0] };
    save(KEYS.soal, [...list, newS]);
    
    fetch(`${API_URL}/soal`, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({
        judul: newS.title,
        deskripsi: (newS as any).description || '',
        jadwalId: (newS as any).jadwalId || null,
        deadline: (newS as any).deadline || null,
        pertanyaan: JSON.stringify(newS.questions),
        halaqahId: newS.halaqahId
      }) 
    }).catch(console.error);
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