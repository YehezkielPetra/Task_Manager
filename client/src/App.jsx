import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Import Komponen UI
import Sidebar from './components/Sidebar';
import Header from './components/Header';

// Import Halaman (Pages)
import KanbanBoard from './pages/KanbanBoard';
import Dashboard from './pages/Dashboard';
import Teams from './pages/Teams';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import History from './pages/History';
import Auth from './pages/Auth';

function App() {
  // PERSISTENSI DARK MODE: Cek localStorage saat pertama kali load
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [currentPage, setCurrentPage] = useState('dashboard');

  // Efek untuk menangani perubahan tema
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const handleLogout = () => {
    localStorage.clear();
    setToken(null);
    setUser(null);
    window.location.reload();
  };

  if (!token) {
    return (
      <Auth 
        setToken={(t) => { setToken(t); localStorage.setItem('token', t); }} 
        setUser={(u) => { setUser(u); localStorage.setItem('user', JSON.stringify(u)); }} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 transition-colors duration-500 font-sans">
      <div className="flex h-screen overflow-hidden">
        
        {/* SIDEBAR */}
        <Sidebar active={currentPage} setPage={setCurrentPage} />

        <div className="flex-1 flex flex-col overflow-hidden">
          
          {/* HEADER */}
          <Header 
            user={user} 
            isDarkMode={isDarkMode} 
            setIsDarkMode={setIsDarkMode} 
            onLogout={handleLogout}
            setPage={setCurrentPage} 
          />

          {/* DYNAMIC CONTENT */}
          <main className="flex-1 overflow-y-auto p-6 md:p-10">
            <div className="max-w-6xl mx-auto">
              {currentPage === 'dashboard' && <Dashboard user={user} />}
              {currentPage === 'tasks' && <KanbanBoard token={token} />}
              {currentPage === 'teams' && <Teams token={token} />}
              {currentPage === 'history' && <History token={token} />}
              {currentPage === 'profile' && <Profile user={user} setUser={setUser} token={token} />}
              {currentPage === 'settings' && <Settings />}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;