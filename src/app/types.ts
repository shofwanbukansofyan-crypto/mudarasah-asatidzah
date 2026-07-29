export type UserRole = 'admin' | 'guru' | 'asatidz';
export type AbsenStatus = 'hadir' | 'izin' | 'alpha';

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  role: UserRole;
  halaqahId?: string;
  createdAt: string;
}

export interface Halaqah {
  id: string;
  name: string;
  guruId: string;
  memberIds: string[];
  createdAt: string;
}

export interface Kitab {
  id: string;
  title: string;
  author: string;
  description: string;
  guruId: string;
  halaqahId: string;
  fileUrl: string;
  coverColor: string;
  uploadedAt: string;
}

export interface Jadwal {
  id: string;
  halaqahId: string;
  guruId: string;
  date: string;
  time: string;
  topic: string;
  location?: string;
  createdAt: string;
}

export interface Absensi {
  id: string;
  jadwalId: string;
  userId: string;
  status: AbsenStatus;
  keterangan?: string;
  timestamp: string;
}

export interface Question {
  id: string;
  text: string;
}

export interface Soal {
  id: string;
  title: string;
  description: string;
  guruId: string;
  halaqahId: string;
  jadwalId?: string;
  questions: Question[];
  deadline?: string;
  createdAt: string;
}

export interface SoalSubmission {
  id: string;
  soalId: string;
  userId: string;
  answers: { questionId: string; answer: string }[];
  submittedAt: string;
}
