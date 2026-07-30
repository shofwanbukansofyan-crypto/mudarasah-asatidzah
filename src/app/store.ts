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