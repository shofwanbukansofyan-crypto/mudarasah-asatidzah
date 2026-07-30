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
    } else {
      console.log('⚡ Akun Admin sudah tersedia di database.');
    }
  } catch (err) {
    console.error('❌ Gagal menyuntikkan akun Admin:', err);
  }
}

app.get('/', (req, res) => {
  res.send('Backend Mudarasah Asatidzah sudah online dan siap melayani API!');
});

// 1. Endpoint Login
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

// 2. Endpoint Register / Create User
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

// 3. Endpoint Ambil Semua User (Pengganti LocalStorage getAll)
app.get('/api/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { id: 'desc' }
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Endpoint Hapus User
app.delete('/api/users/:id', async (req, res) => {
  const { id } = req.get ? req.params : req.body; // fleksibel
  try {
    // Karena id di prisma bisa string/int, kita sesuaikan
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ message: 'User berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, async () => {
  console.log(`Backend server berjalan di port ${PORT}`);
  await seedAdmin();
});