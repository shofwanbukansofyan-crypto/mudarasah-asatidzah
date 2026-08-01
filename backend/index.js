const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

// Fungsi untuk menyuntikkan akun Admin permanen
async function seedAdmin() {
  try {
    const adminEmail = 'admin@mudarasah.com';
    const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
    
    if (!existingAdmin) {
      await prisma.user.create({
        data: { 
          username: 'Admin Mudarasah', 
          email: adminEmail, 
          password: 'admin123', 
          role: 'admin' 
        }
      });
      console.log('✅ Akun Admin permanen berhasil disuntikkan ke database!');
    }
  } catch (err) {
    console.error('❌ Gagal menyuntikkan akun Admin:', err);
  }
}

app.get('/', (req, res) => {
  res.send('Backend Full-Stack Mudarasah Asatidzah aktif!');
});

// ================= USERS & AUTH =================
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.password !== password) {
      return res.status(400).json({ error: 'Email atau password salah.' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/register', async (req, res) => {
  const { username, email, password, role } = req.body;
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Email sudah terdaftar.' });
    }
    const newUser = await prisma.user.create({
      data: { username, email, password, role: role || 'asatidz' }
    });
    res.json(newUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ message: 'User berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= HALAQAH =================
app.get('/api/halaqah', async (req, res) => {
  try {
    const data = await prisma.halaqah.findMany({ include: { guru: true } });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/halaqah', async (req, res) => {
  try {
    const newItem = await prisma.halaqah.create({ data: req.body });
    res.json(newItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/halaqah/:id', async (req, res) => {
  try {
    const { nama, deskripsi, guruId, memberIds } = req.body;
    const updated = await prisma.halaqah.update({
      where: { id: req.params.id },
      data: { 
        nama, 
        deskripsi, 
        guruId, 
        memberIds // <-- Ini yang bakal nyimpen data Fadhil dkk
      }
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/halaqah/:id', async (req, res) => {
  try {
    await prisma.halaqah.delete({ where: { id: req.params.id } });
    res.json({ message: 'Halaqah dihapus' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= KITAB =================
app.get('/api/kitab', async (req, res) => {
  try {
    const data = await prisma.kitab.findMany();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/kitab', async (req, res) => {
  try {
    // Tambahkan deskripsi, fileUrl, coverColor, dan guruId di sini
    const { judul, penulis, deskripsi, fileUrl, coverColor, guruId, halaqahId } = req.body;
    const kitab = await prisma.kitab.create({
      data: { judul, penulis, deskripsi, fileUrl, coverColor, guruId, halaqahId }
    });
    res.json(kitab);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.delete('/api/kitab/:id', async (req, res) => {
  try {
    await prisma.kitab.delete({ where: { id: req.params.id } });
    res.json({ message: 'Kitab dihapus' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= JADWAL =================
app.get('/api/jadwal', async (req, res) => {
  try {
    const data = await prisma.jadwal.findMany();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/jadwal', async (req, res) => {
  try {
    // Tambahkan jamSelesai, lokasi, dan guruId di sini
    const { hari, jam, jamSelesai, materi, lokasi, guruId, halaqahId } = req.body;
    const jadwal = await prisma.jadwal.create({
      data: { hari, jam, jamSelesai, materi, lokasi, guruId, halaqahId }
    });
    res.json(jadwal);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.put('/api/jadwal/:id', async (req, res) => {
  try {
    const { hari, jam, jamSelesai, materi, lokasi, guruId, halaqahId } = req.body;
    const updated = await prisma.jadwal.update({
      where: { id: req.params.id },
      data: { hari, jam, jamSelesai, materi, lokasi, guruId, halaqahId }
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/jadwal/:id', async (req, res) => {
  try {
    await prisma.jadwal.delete({ where: { id: req.params.id } });
    res.json({ message: 'Jadwal dihapus' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= ABSENSI =================
app.get('/api/absensi', async (req, res) => {
  try {
    const data = await prisma.absensi.findMany();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/absensi', async (req, res) => {
  try {
    // Tambahkan timestamp dan keterangan di sini
    const { jadwalId, userId, status, keterangan, timestamp } = req.body;
    const absen = await prisma.absensi.create({
      data: { jadwalId, userId, status, keterangan, timestamp }
    });
    res.json(absen);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ================= SOAL & SUBMISSIONS =================
app.get('/api/soal', async (req, res) => {
  try {
    const data = await prisma.soal.findMany();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/soal', async (req, res) => {
  try {
    // Tambahkan deskripsi, jadwalId, dan deadline di sini
    const { judul, deskripsi, jadwalId, deadline, pertanyaan, halaqahId } = req.body;
    const soal = await prisma.soal.create({
      data: { judul, deskripsi, jadwalId, deadline, pertanyaan, halaqahId }
    });
    res.json(soal);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.delete('/api/soal/:id', async (req, res) => {
  try {
    await prisma.soal.delete({ where: { id: req.params.id } });
    res.json({ message: 'Soal dihapus' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/submissions', async (req, res) => {
  try {
    const data = await prisma.soalSubmission.findMany();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/submissions', async (req, res) => {
  try {
    const { soalId, userId, jawaban, nilai } = req.body;
    const submission = await prisma.soalSubmission.create({
      data: { soalId, userId, jawaban, nilai }
    });
    res.json(submission);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, async () => {
  console.log(`Backend server berjalan di port ${PORT}`);
  await seedAdmin();
});