import React, { useState, useEffect } from 'react';
import api from '../utils/api'; // Menggunakan instance api baru

const History = ({ token }) => {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // Menggunakan instance 'api' dengan endpoint relatif
        const res = await api.get('/tasks', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Filter hanya yang sudah DONE (menggunakan lowercase dan trim untuk keamanan)
        const completedTasks = res.data.filter(
          t => t.status.toLowerCase().trim() === 'done'
        );
        
        setHistory(completedTasks);
      } catch (err) {
        console.error("Gagal memuat history:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, [token]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-10">
        <h2 className="text-3xl font-black dark:text-white tracking-tight">Task History</h2>
        <p className="text-slate-500 text-sm mt-1">Daftar seluruh tugas yang telah berhasil diselesaikan.</p>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-slate-100 dark:border-zinc-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-zinc-800/50 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <th className="px-8 py-5">Task Name</th>
                <th className="px-8 py-5">Description</th>
                <th className="px-8 py-5">Completed At</th>
                <th className="px-8 py-5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="px-8 py-20 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                  </td>
                </tr>
              ) : history.length > 0 ? (
                history.map(task => (
                  <tr key={task.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors group">
                    <td className="px-8 py-6 font-bold dark:text-white text-sm group-hover:text-blue-600 transition-colors">
                      {task.title}
                    </td>
                    <td className="px-8 py-6 text-xs text-slate-400 max-w-xs truncate">
                      {task.description || "No description"}
                    </td>
                    <td className="px-8 py-6 text-xs text-slate-400 font-medium">
                      {new Date(task.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-tighter">
                        ✓ Finished
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-4xl">📁</span>
                      <p className="text-slate-400 text-sm font-medium">Belum ada tugas yang diselesaikan.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default History;