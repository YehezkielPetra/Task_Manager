const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// --- MIDDLEWARE ---
app.use(cors());
// Limit diperbesar untuk mendukung upload foto profile Base64
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Konfigurasi Database
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10
});

const JWT_SECRET = process.env.JWT_SECRET;

// Middleware Proteksi
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: "Akses ditolak" });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: "Token kadaluarsa" });
        req.user = user;
        next();
    });
};

// --- AUTH API ---
app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const [existing] = await pool.execute("SELECT * FROM users WHERE username = ? OR email = ?", [username, email]);
        if (existing.length > 0) return res.status(400).json({ message: "Username/Email sudah ada" });

        const hashed = await bcrypt.hash(password, 10);
        await pool.execute("INSERT INTO users (username, email, password) VALUES (?, ?, ?)", [username, email, hashed]);
        res.status(201).json({ message: "Registrasi Berhasil" });
    } catch (error) { res.status(500).json(error); }
});

app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const [rows] = await pool.execute("SELECT * FROM users WHERE username = ?", [username]);
        if (rows.length === 0) return res.status(404).json({ message: "User tidak ditemukan" });

        const match = await bcrypt.compare(password, rows[0].password);
        if (!match) return res.status(401).json({ message: "Password salah" });

        const token = jwt.sign({ id: rows[0].id, username: rows[0].username }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, user: { id: rows[0].id, username: rows[0].username, photo: rows[0].photo_profile } });
    } catch (error) { res.status(500).json(error); }
});

// --- PROFILE UPDATE ---
app.put('/api/user/update', authenticateToken, async (req, res) => {
    try {
        const { username, photo, password } = req.body;
        let sql = "UPDATE users SET username = ?, photo_profile = ? WHERE id = ?";
        let params = [username, photo, req.user.id];

        if (password && password.trim() !== "") {
            const hash = await bcrypt.hash(password, 10);
            sql = "UPDATE users SET username = ?, photo_profile = ?, password = ? WHERE id = ?";
            params = [username, photo, hash, req.user.id];
        }
        await pool.execute(sql, params);
        res.json({ message: "Profil diperbarui" });
    } catch (error) { res.status(500).json(error); }
});

// --- TASK CRUD ---
app.get('/api/tasks', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.execute("SELECT * FROM tasks WHERE creator_id = ? ORDER BY created_at DESC", [req.user.id]);
        res.json(rows);
    } catch (error) { res.status(500).json(error); }
});

app.post('/api/tasks', authenticateToken, async (req, res) => {
    try {
        const { title, description, status } = req.body;
        await pool.execute("INSERT INTO tasks (title, description, status, creator_id) VALUES (?, ?, ?, ?)", [title, description, status || 'todo', req.user.id]);
        res.json({ message: "Task Created" });
    } catch (error) { res.status(500).json(error); }
});

app.put('/api/tasks/:id', authenticateToken, async (req, res) => {
    try {
        const { title, description, status } = req.body;
        // Menggunakan COALESCE agar jika field tidak dikirim (null), data lama tetap bertahan
        const [result] = await pool.execute(
            "UPDATE tasks SET title = COALESCE(?, title), description = COALESCE(?, description), status = COALESCE(?, status) WHERE id = ? AND creator_id = ?",
            [title || null, description || null, status || null, req.params.id, req.user.id]
        );
        res.json({ message: "Tugas diperbarui" });
    } catch (error) { res.status(500).json(error); }
});

app.delete('/api/tasks/:id', authenticateToken, async (req, res) => {
    try {
        await pool.execute("DELETE FROM tasks WHERE id = ? AND creator_id = ?", [req.params.id, req.user.id]);
        res.json({ message: "Deleted" });
    } catch (error) { res.status(500).json(error); }
});

app.listen(5000, () => console.log(`🚀 Server running on port 5000`));