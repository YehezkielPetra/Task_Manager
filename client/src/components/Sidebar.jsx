import React from 'react';

const SidebarItem = ({ icon, label, active, onClick }) => (
  <div 
    onClick={onClick} 
    className={`flex items-center gap-3 px-4 py-3 rounded-2xl cursor-pointer transition-all ${
      active 
      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
      : 'text-slate-500 dark:text-zinc-500 hover:bg-slate-100 dark:hover:bg-zinc-800'
    }`}
  >
    <span className="text-lg">{icon}</span>
    <span className="text-sm font-bold">{label}</span>
  </div>
);

const Sidebar = ({ active, setPage }) => (
  <aside className="w-72 border-r border-slate-200 dark:border-zinc-800 p-8 hidden lg:flex flex-col bg-white dark:bg-zinc-950">
    <div className="flex items-center gap-3 mb-12 px-2">
      <div className="w-10 h-10 bg-blue-600 rounded-xl shadow-lg flex items-center justify-center text-white font-black text-xl">T</div>
      <h1 className="text-2xl font-black tracking-tighter dark:text-white">TASK<span className="text-blue-600">.</span></h1>
    </div>
    
    <nav className="space-y-2 flex-1">
      <SidebarItem icon="📊" label="Dashboard" active={active === 'dashboard'} onClick={() => setPage('dashboard')} />
      <SidebarItem icon="✅" label="My Tasks" active={active === 'tasks'} onClick={() => setPage('tasks')} />
      {/* MENU HISTORY */}
      <SidebarItem icon="🕒" label="History" active={active === 'history'} onClick={() => setPage('history')} />
      <SidebarItem icon="👥" label="Teams" active={active === 'teams'} onClick={() => setPage('teams')} />
      <SidebarItem icon="⚙️" label="Settings" active={active === 'settings'} onClick={() => setPage('settings')} />
    </nav>

    <div className="mt-auto p-6 bg-slate-50 dark:bg-zinc-900 rounded-[2rem] border dark:border-zinc-800">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Storage</p>
      <div className="w-full bg-slate-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
        <div className="bg-blue-600 h-full w-[65%]" />
      </div>
    </div>
  </aside>
);

export default Sidebar;