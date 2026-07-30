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

// Endpoint Halaman Utama
app.get('/', (req, res) => {
  res.send('Backend Mudarasah Asatidzah sudah online dan siap melayani API!');
});

// Endpoint Login
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

// Endpoint Register (Buat Akun)
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

const PORT = process.env.PORT || 5000;

// Jalankan server sekaligus panggil fungsi pembuat Admin
app.listen(PORT, async () => {
  console.log(`Backend server berjalan di port ${PORT}`);
  await seedAdmin(); 
});