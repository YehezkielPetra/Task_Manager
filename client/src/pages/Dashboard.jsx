import React, { useState, useEffect } from 'react';
import api from '../utils/api'; // Menggunakan instance api baru

const Dashboard = ({ user }) => {
  // State statistik dipisah antara Personal dan Team
  const [personalStats, setPersonalStats] = useState({ todo: 0, inProgress: 0, done: 0 });
  const [teamStats, setTeamStats] = useState({ todo: 0, inProgress: 0, done: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllStats = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        // Ambil data dari dua endpoint berbeda
        const [resPersonal, resTeam] = await Promise.all([
          api.get('/tasks/personal', { headers }),
          api.get('/tasks/team', { headers })
        ]);

        // Helper untuk menghitung statistik berdasarkan status
        const calculateStats = (data) => ({
          todo: data.filter(t => t.status.toLowerCase().trim() === 'todo').length,
          inProgress: data.filter(t => t.status.toLowerCase().trim() === 'in progress').length,
          done: data.filter(t => t.status.toLowerCase().trim() === 'done').length,
        });

        setPersonalStats(calculateStats(resPersonal.data));
        setTeamStats(calculateStats(resTeam.data));
      } catch (err) {
        console.error("Gagal mengambil statistik dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllStats();
  }, []);

  const CardStat = ({ label, count, color, type }) => (
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-slate-100 dark:border-zinc-800 shadow-sm transition-all hover:scale-[1.02]">
      <div className="flex justify-between items-start mb-2">
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{label}</p>
        <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase ${type === 'personal' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
          {type}
        </span>
      </div>
      <div className="flex items-end gap-2">
        <h3 className="text-3xl font-black dark:text-white">{count}</h3>
        <span className={`text-xs font-bold mb-1 ${color}`}>Tasks</span>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl animate-in fade-in duration-700">
      <header className="mb-12">
        <h2 className="text-4xl font-black tracking-tight dark:text-white">
          Welcome back, {user?.username || 'User'}! 👋
        </h2>
        <p className="text-slate-500 mt-2">Berikut adalah ringkasan produktivitas Anda hari ini.</p>
      </header>

      {/* SECTION: MY TASKS (Pribadi) */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-2 h-6 bg-blue-600 rounded-full"></div>
          <h3 className="font-bold text-xl dark:text-white">My Personal Tasks</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CardStat label="To Do" count={personalStats.todo} color="text-slate-400" type="personal" />
          <CardStat label="In Progress" count={personalStats.inProgress} color="text-amber-500" type="personal" />
          <CardStat label="Completed" count={personalStats.done} color="text-green-500" type="personal" />
        </div>
      </div>

      {/* SECTION: TEAM TASKS (Kolektif) */}
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-2 h-6 bg-purple-600 rounded-full"></div>
          <h3 className="font-bold text-xl dark:text-white">Team Collaboration Tasks</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CardStat label="To Do" count={teamStats.todo} color="text-slate-400" type="team" />
          <CardStat label="In Progress" count={teamStats.inProgress} color="text-amber-500" type="team" />
          <CardStat label="Completed" count={teamStats.done} color="text-green-500" type="team" />
        </div>
      </div>

      <div className="bg-blue-600 rounded-[2.5rem] p-10 text-white flex justify-between items-center overflow-hidden relative shadow-xl shadow-blue-500/20">
        <div className="z-10">
          <h3 className="text-2xl font-bold mb-2">Siap untuk berkolaborasi?</h3>
          <p className="opacity-80 max-w-sm text-sm">Undang rekan tim Anda dan mulai selesaikan proyek besar bersama-sama di menu Teams.</p>
        </div>
        <div className="text-8xl opacity-20 font-black absolute -right-4 -bottom-4 tracking-tighter select-none">
          TASKFLOW
        </div>
      </div>
    </div>
  );
};

export default Dashboard;