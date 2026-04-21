import React, { useState, useEffect, useRef } from 'react';

const Header = ({ user, isDarkMode, setIsDarkMode, onLogout, setPage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(); // Ref untuk area menu

  // Fungsi untuk menutup menu saat klik di luar
  useEffect(() => {
    const closeMenu = (e) => {
      // Jika menu sedang buka DAN yang diklik bukan area menuRef
      if (isOpen && menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', closeMenu);
    return () => document.removeEventListener('mousedown', closeMenu);
  }, [isOpen]);

  return (
    <header className="px-10 py-6 flex justify-between items-center bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border-b dark:border-zinc-800">
      <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">TASKFLOW / DASHBOARD</div>
      
      <div className="flex items-center gap-6">
        <button onClick={() => setIsDarkMode(!isDarkMode)} className="text-xl">
          {isDarkMode ? '🌙' : '☀️'}
        </button>

        {/* Tambahkan ref={menuRef} di pembungkus profil */}
        <div className="relative" ref={menuRef}>
          <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-3">
             <div className="text-right hidden sm:block">
               <p className="text-sm font-bold dark:text-white">{user?.username}</p>
               <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Pro Member</p>
             </div>
             <img src={user?.photo} className="w-10 h-10 rounded-full border-2 border-blue-500 object-cover" alt="profile" />
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-3 w-48 bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
              <button onClick={() => {setPage('profile'); setIsOpen(false)}} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-zinc-800 dark:text-white">Edit Profile</button>
              <button onClick={() => {setPage('settings'); setIsOpen(false)}} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-zinc-800 dark:text-white">Settings</button>
              <hr className="my-2 dark:border-zinc-800" />
              <button onClick={onLogout} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 font-bold">Logout</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;