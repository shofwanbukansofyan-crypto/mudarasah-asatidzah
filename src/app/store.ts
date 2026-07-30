import type { User, Halaqah, Kitab, Jadwal, Absensi, Soal, SoalSubmission } from './types';

const API_URL = 'https://mudarasah-asatidzah-production.up.railway.app/api';

export function genId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export const UserStore = {
  async login(email: string, pass: string) {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data;
  },

  async create(userData: { username: string; email: string; password: string; role: string }) {
    const res = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data;
  },

  async getAll(): Promise<User[]> {
    const res = await fetch(`${API_URL}/users`);
    return res.ok ? await res.json() : [];
  },

  async delete(id: string) {
    await fetch(`${API_URL}/users/${id}`, { method: 'DELETE' });
  }
};

export const HalaqahStore = {
  async getAll(): Promise<Halaqah[]> {
    const res = await fetch(`${API_URL}/halaqah`);
    return res.ok ? await res.json() : [];
  },
  async create(data: any) {
    const res = await fetch(`${API_URL}/halaqah`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  },
  async delete(id: string) {
    await fetch(`${API_URL}/halaqah/${id}`, { method: 'DELETE' });
  }
};

export const KitabStore = {
  async getAll(): Promise<Kitab[]> {
    const res = await fetch(`${API_URL}/kitab`);
    return res.ok ? await res.json() : [];
  },
  async create(data: any) {
    const res = await fetch(`${API_URL}/kitab`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  },
  async delete(id: string) {
    await fetch(`${API_URL}/kitab/${id}`, { method: 'DELETE' });
  }
};

export const JadwalStore = {
  async getAll(): Promise<Jadwal[]> {
    const res = await fetch(`${API_URL}/jadwal`);
    return res.ok ? await res.json() : [];
  },
  async create(data: any) {
    const res = await fetch(`${API_URL}/jadwal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  },
  async delete(id: string) {
    await fetch(`${API_URL}/jadwal/${id}`, { method: 'DELETE' });
  }
};

export const AbsensiStore = {
  async getAll(): Promise<Absensi[]> {
    const res = await fetch(`${API_URL}/absensi`);
    return res.ok ? await res.json() : [];
  },
  async create(data: any) {
    const res = await fetch(`${API_URL}/absensi`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  }
};

export const SoalStore = {
  async getAll(): Promise<Soal[]> {
    const res = await fetch(`${API_URL}/soal`);
    return res.ok ? await res.json() : [];
  },
  async create(data: any) {
    const res = await fetch(`${API_URL}/soal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  },
  async delete(id: string) {
    await fetch(`${API_URL}/soal/${id}`, { method: 'DELETE' });
  }
};

export const SubmissionStore = {
  async getAll(): Promise<SoalSubmission[]> {
    const res = await fetch(`${API_URL}/submissions`);
    return res.ok ? await res.json() : [];
  },
  async create(data: any) {
    const res = await fetch(`${API_URL}/submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  }
};