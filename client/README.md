# 🚀 Task Management System (Kanban Board)

Aplikasi manajemen tugas berbasis web dengan antarmuka **Kanban Board** yang modern. Dilengkapi dengan sistem autentikasi, manajemen profil (termasuk upload foto), dark mode yang persisten, dan fitur history tugas.

## ✨ Fitur Utama

-   **Dashboard** – Ringkasan aktivitas dan status tugas.
-   **Kanban Board** – Kelola tugas dengan kolom *To Do*, *In Progress*, dan *Done*.
-   **Undo & Redo Phase** – Kemampuan untuk memajukan atau memundurkan fase tugas.
-   **History Tasks** – Rekam jejak tugas yang telah diselesaikan (Done).
-   **User Auth** – Sistem login dan register menggunakan JWT (JSON Web Token).
-   **Profile Management** – Update username, password, dan foto profil (Base64 support).
-   **Persistent Dark Mode** – Tema gelap yang tetap aktif meskipun halaman di-refresh.
-   **Responsive Design** – Tampilan elegan dengan Tailwind CSS dan animasi transisi.

## 🛠️ Teknologi yang Digunakan

### Frontend:
-   **React.js** (Vite)
-   **Tailwind CSS** (Styling)
-   **Axios** (API Requests)
-   **SweetAlert2** (Notifikasi/Pop-up)
-   **Lucide React / Emojis** (Icons)

### Backend:
-   **Node.js & Express**
-   **MySQL** (Database)
-   **JSON Web Token** (Authentication)
-   **Bcrypt** (Password Hashing)
-   **MySQL2** (Database Driver)

## 📦 Instalasi

### 1. Persiapan Database
1.  Buka **phpMyAdmin** atau MySQL Client lainnya.
2.  Buat database baru dengan nama `task_management`.
3.  Jalankan query berikut untuk membuat tabel:

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  photo_profile LONGTEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status ENUM('todo', 'in progress', 'done') DEFAULT 'todo',
  creator_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
);

