import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = ({ user }) => {
  const [stats, setStats] = useState({ todo: 0, inProgress: 0, done: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const res = await axios.get('http://localhost:5000/api/tasks', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = res.data;
      setStats({
        todo: data.filter(t => t.status === 'todo').length,
        inProgress: data.filter(t => t.status === 'in progress').length,
        done: data.filter(t => t.status === 'done').length,
      });
    };
    fetchStats();
  }, []);

  const CardStat = ({ label, count, color }) => (
    <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2rem] border border-slate-100 dark:border-zinc-800 shadow-sm">
      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">{label}</p>
      <div className="flex items-end gap-2">
        <h3 className="text-4xl font-black dark:text-white">{count}</h3>
        <span className={`text-xs font-bold mb-1 ${color}`}>Tasks</span>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl">
      <header className="mb-12">
        <h2 className="text-4xl font-black tracking-tight dark:text-white">Welcome back, {user.username}! 👋</h2>
        <p className="text-slate-500 mt-2">Berikut adalah ringkasan produktivitas Anda hari ini.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <CardStat label="To Do" count={stats.todo} color="text-slate-400" />
        <CardStat label="In Progress" count={stats.inProgress} color="text-amber-500" />
        <CardStat label="Completed" count={stats.done} color="text-green-500" />
      </div>

      <div className="bg-blue-600 rounded-[2.5rem] p-10 text-white flex justify-between items-center overflow-hidden relative shadow-xl shadow-blue-500/20">
        <div className="z-10">
          <h3 className="text-2xl font-bold mb-2">Siap untuk berkolaborasi?</h3>
          <p className="opacity-80 max-w-sm text-sm">Undang rekan tim Anda dan mulai selesaikan proyek besar bersama-sama di menu Teams.</p>
        </div>
        <div className="text-8xl opacity-20 font-black absolute -right-4 -bottom-4 tracking-tighter">TASKFLOW</div>
      </div>
    </div>
  );
};

export default Dashboard;