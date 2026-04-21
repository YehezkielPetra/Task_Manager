const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 11696,
    waitForConnections: true,
    connectionLimit: 10,
    ssl: { rejectUnauthorized: false }
});

const JWT_SECRET = process.env.JWT_SECRET;

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

// --- TEAMS API ---

// 1. Kirim Undangan (Status otomatis: pending)
app.post('/api/teams/invite', authenticateToken, async (req, res) => {
    try {
        const { username } = req.body;
        if (!username) return res.status(400).json({ message: "Username harus diisi" });

        const [users] = await pool.execute("SELECT id FROM users WHERE username = ?", [username]);
        if (users.length === 0) return res.status(404).json({ message: "Username tidak ditemukan" });

        const targetUserId = users[0].id;
        if (targetUserId === req.user.id) return res.status(400).json({ message: "Tidak bisa mengundang diri sendiri" });

        // team_id = 1 sebagai default team
        await pool.execute(
            "INSERT IGNORE INTO team_members (team_id, user_id, status) VALUES (?, ?, 'pending')",
            [1, targetUserId]
        );

        res.json({ message: `Undangan berhasil dikirim ke ${username}` });
    } catch (error) {
        res.status(500).json({ message: "Gagal mengirim undangan" });
    }
});

// 2. Ambil daftar undangan pending untuk user yang login
app.get('/api/teams/invitations', authenticateToken, async (req, res) => {
    try {
        const [invites] = await pool.execute(`
            SELECT tm.team_id, t.name as team_name 
            FROM team_members tm
            JOIN teams t ON tm.team_id = t.id
            WHERE tm.user_id = ? AND tm.status = 'pending'
        `, [req.user.id]);
        res.json(invites);
    } catch (error) { res.status(500).json(error); }
});

// 3. Terima Undangan (Ubah status ke accepted)
app.put('/api/teams/accept', authenticateToken, async (req, res) => {
    try {
        const { teamId } = req.body;
        await pool.execute(
            "UPDATE team_members SET status = 'accepted' WHERE team_id = ? AND user_id = ?",
            [teamId, req.user.id]
        );
        res.json({ message: "Selamat! Anda telah bergabung ke tim." });
    } catch (error) { res.status(500).json(error); }
});

// --- TASK API (Update Filter: Muncul jika sudah accepted) ---
app.get('/api/tasks', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT DISTINCT t.* FROM tasks t
            LEFT JOIN team_members tm ON t.team_id = tm.team_id
            WHERE t.creator_id = ? OR (tm.user_id = ? AND tm.status = 'accepted')
            ORDER BY t.created_at DESC
        `, [req.user.id, req.user.id]);
        res.json(rows);
    } catch (error) { res.status(500).json(error); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));