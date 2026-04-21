const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Konfigurasi Database
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 11696,
    waitForConnections: true,
    connectionLimit: 10,
    ssl: {
        rejectUnauthorized: false
    }
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

// --- TASK CRUD (UPDATED: PEMISAHAN PERSONAL & TEAM) ---

// 1. Ambil Task Pribadi (Hanya milik sendiri dan tidak terikat tim)
app.get('/api/tasks/personal', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.execute(
            "SELECT * FROM tasks WHERE creator_id = ? AND team_id IS NULL ORDER BY created_at DESC", 
            [req.user.id]
        );
        res.json(rows);
    } catch (error) { res.status(500).json(error); }
});

// 2. Ambil Task Tim (Berdasarkan tim yang di-accept)
app.get('/api/tasks/team', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT t.*, u.username as creator_name 
            FROM tasks t
            JOIN team_members tm ON t.team_id = tm.team_id
            JOIN users u ON t.creator_id = u.id
            WHERE tm.user_id = ? AND tm.status = 'accepted' AND t.team_id IS NOT NULL
            ORDER BY t.created_at DESC
        `, [req.user.id]);
        res.json(rows);
    } catch (error) { res.status(500).json(error); }
});

// 3. Create Task (Mendukung team_id)
app.post('/api/tasks', authenticateToken, async (req, res) => {
    try {
        const { title, description, status, team_id } = req.body;
        // Jika team_id ada, simpan sebagai team task, jika null simpan sebagai personal task
        await pool.execute(
            "INSERT INTO tasks (title, description, status, creator_id, team_id) VALUES (?, ?, ?, ?, ?)", 
            [title, description, status || 'todo', req.user.id, team_id || null]
        );
        res.json({ message: "Task Created Successfully" });
    } catch (error) { res.status(500).json(error); }
});

app.put('/api/tasks/:id', authenticateToken, async (req, res) => {
    try {
        const { title, description, status } = req.body;
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

// --- ADVANCED TEAMS API ---

app.get('/api/teams/my-team', authenticateToken, async (req, res) => {
    try {
        const [membership] = await pool.execute(`
            SELECT tm.team_id, t.name as team_name, t.leader_id, u.username as leader_name
            FROM team_members tm
            JOIN teams t ON tm.team_id = t.id
            JOIN users u ON t.leader_id = u.id
            WHERE tm.user_id = ? AND tm.status = 'accepted'
        `, [req.user.id]);

        if (membership.length === 0) {
            return res.json({ hasTeam: false });
        }

        const teamId = membership[0].team_id;

        const [members] = await pool.execute(`
            SELECT u.id, u.username, u.photo_profile, tm.role 
            FROM team_members tm
            JOIN users u ON tm.user_id = u.id
            WHERE tm.team_id = ? AND tm.status = 'accepted'
        `, [teamId]);

        res.json({
            hasTeam: true,
            teamInfo: membership[0],
            members: members
        });
    } catch (error) { res.status(500).json(error); }
});

app.post('/api/teams/create', authenticateToken, async (req, res) => {
    try {
        const { teamName } = req.body;
        if (!teamName) return res.status(400).json({ message: "Nama tim harus diisi" });

        const [newTeam] = await pool.execute(
            "INSERT INTO teams (name, leader_id) VALUES (?, ?)",
            [teamName, req.user.id]
        );
        
        const teamId = newTeam.insertId;

        await pool.execute(
            "INSERT INTO team_members (team_id, user_id, status, role) VALUES (?, ?, 'accepted', 'leader')",
            [teamId, req.user.id]
        );

        res.json({ message: "Team berhasil dibuat!", teamId });
    } catch (error) { res.status(500).json(error); }
});

app.post('/api/teams/invite', authenticateToken, async (req, res) => {
    try {
        const { username, teamId } = req.body;
        if (!username) return res.status(400).json({ message: "Username harus diisi" });

        const [team] = await pool.execute("SELECT leader_id FROM teams WHERE id = ?", [teamId]);
        if (team.length === 0 || team[0].leader_id !== req.user.id) {
            return res.status(403).json({ message: "Hanya ketua tim yang bisa mengundang!" });
        }

        const [users] = await pool.execute("SELECT id FROM users WHERE username = ?", [username]);
        if (users.length === 0) return res.status(404).json({ message: "Username tidak ditemukan" });

        const targetUserId = users[0].id;
        if (targetUserId === req.user.id) return res.status(400).json({ message: "Tidak bisa mengundang diri sendiri" });

        await pool.execute(
            "INSERT IGNORE INTO team_members (team_id, user_id, status, role) VALUES (?, ?, 'pending', 'member')",
            [teamId, targetUserId]
        );

        res.json({ message: `Undangan berhasil dikirim ke ${username}` });
    } catch (error) { res.status(500).json(error); }
});

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

app.put('/api/teams/accept', authenticateToken, async (req, res) => {
    try {
        const { teamId } = req.body;
        await pool.execute(
            "UPDATE team_members SET status = 'accepted' WHERE team_id = ? AND user_id = ?",
            [teamId, req.user.id]
        );
        res.json({ message: "Berhasil bergabung dengan tim!" });
    } catch (error) { res.status(500).json(error); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));