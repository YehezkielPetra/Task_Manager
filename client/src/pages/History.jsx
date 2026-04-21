import React, { useState, useEffect } from 'react';
import axios from 'axios';

const History = ({ token }) => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      const res = await axios.get('http://localhost:5000/api/tasks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Filter hanya yang sudah DONE
      setHistory(res.data.filter(t => t.status === 'done'));
    };
    fetchHistory();
  }, [token]);

  return (
    <div className="animate-in fade-in duration-500">
      <h2 className="text-3xl font-black mb-8 dark:text-white tracking-tight">Task History</h2>
      <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border dark:border-zinc-800 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-zinc-800/50 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <th className="px-8 py-4">Task Name</th>
              <th className="px-8 py-4">Description</th>
              <th className="px-8 py-4">Completed At</th>
              <th className="px-8 py-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-zinc-800">
            {history.length > 0 ? history.map(task => (
              <tr key={task.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/30 transition-colors">
                <td className="px-8 py-5 font-bold dark:text-white text-sm">{task.title}</td>
                <td className="px-8 py-5 text-xs text-slate-400">{task.description}</td>
                <td className="px-8 py-5 text-xs text-slate-400">
                  {new Date(task.created_at).toLocaleDateString('id-ID')}
                </td>
                <td className="px-8 py-5 text-center">
                  <span className="bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase">Finished</span>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="4" className="px-8 py-20 text-center text-slate-400 text-sm">Belum ada tugas yang diselesaikan.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default History;