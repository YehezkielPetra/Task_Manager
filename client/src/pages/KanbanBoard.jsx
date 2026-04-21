import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const API_URL = 'http://localhost:5000/api/tasks';

const KanbanBoard = ({ token }) => {
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '' });

  const fetchTasks = useCallback(async () => {
    try {
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(res.data);
    } catch (err) { console.error(err); }
  }, [token]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  // MAJU KE FASE BERIKUTNYA
  const nextStatus = async (id, currentStatus) => {
    const statusOrder = ['todo', 'in progress', 'done'];
    const currentIndex = statusOrder.indexOf(currentStatus.toLowerCase().trim());
    
    if (currentIndex === 2) return; // Berhenti di Done

    const next = statusOrder[currentIndex + 1];
    await updateApiStatus(id, next);
  };

  // MUNDUR KE FASE SEBELUMNYA
  const prevStatus = async (id, currentStatus) => {
    const statusOrder = ['todo', 'in progress', 'done'];
    const currentIndex = statusOrder.indexOf(currentStatus.toLowerCase().trim());
    
    if (currentIndex === 0) return; // Berhenti di To Do

    const prev = statusOrder[currentIndex - 1];
    await updateApiStatus(id, prev);
  };

  const updateApiStatus = async (id, status) => {
    try {
      await axios.put(`${API_URL}/${id}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTasks();
      const Toast = Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 800 });
      Toast.fire({ icon: 'success', title: `Status: ${status.toUpperCase()}` });
    } catch (err) { Swal.fire({ icon: 'error', title: 'Gagal update status' }); }
  };

  const deleteTask = (id) => {
    Swal.fire({
      title: 'Hapus Tugas?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Hapus',
      confirmButtonColor: '#ef4444'
    }).then(async (result) => {
      if (result.isConfirmed) {
        await axios.delete(`${API_URL}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        fetchTasks();
      }
    });
  };

  const Column = ({ title, status }) => (
    <div className="flex-1 min-w-[320px]">
      <div className="flex justify-between items-center mb-6 px-2">
        <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500">{title}</h2>
      </div>
      <div className="space-y-4">
        {tasks.filter(t => t.status.toLowerCase().trim() === status).map(task => (
          <div key={task.id} className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-slate-100 dark:border-zinc-800 shadow-sm group transition-all">
            <div className="flex justify-between mb-4">
              <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded-full dark:bg-blue-900/20">ID-{task.id}</span>
              <button onClick={() => deleteTask(task.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
            </div>
            <h3 className="font-bold text-lg dark:text-white mb-1">{task.title}</h3>
            <p className="text-xs text-slate-400 mb-6">{task.description}</p>
            
            <div className="flex gap-2">
              {/* Tombol Back (Hanya muncul jika bukan To Do) */}
              {status !== 'todo' && (
                <button 
                  onClick={() => prevStatus(task.id, task.status)}
                  className="flex-1 py-3 bg-slate-100 dark:bg-zinc-800 dark:text-zinc-400 rounded-2xl text-[10px] font-bold uppercase hover:bg-slate-200 dark:hover:bg-zinc-700 transition-all"
                >
                  ← Back
                </button>
              )}
              
              {/* Tombol Next */}
              <button 
                onClick={() => nextStatus(task.id, task.status)}
                disabled={status === 'done'}
                className={`flex-[2] py-3 rounded-2xl text-[10px] font-bold uppercase transition-all ${
                  status === 'done' 
                  ? 'bg-green-50 text-green-600 cursor-default dark:bg-green-900/10' 
                  : 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700'
                }`}
              >
                {status === 'done' ? '✓ Completed' : 'Next Phase ➔'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-black dark:text-white">Project Board</h1>
        <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold">
          + New Task
        </button>
      </div>

      <div className="flex gap-8 overflow-x-auto pb-10 no-scrollbar">
        <Column title="To Do" status="todo" />
        <Column title="In Progress" status="in progress" />
        <Column title="Done" status="done" />
      </div>

      {/* Modal logic tetap sama */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95">
             <h3 className="text-2xl font-black mb-6 dark:text-white">New Task</h3>
             <form onSubmit={(e) => {
               e.preventDefault();
               axios.post(API_URL, { ...form, status: 'todo' }, { headers: { Authorization: `Bearer ${token}` }})
               .then(() => { setShowModal(false); fetchTasks(); Swal.fire({ icon: 'success', title: 'Created', timer: 1000, showConfirmButton: false })});
             }} className="space-y-4">
               <input type="text" placeholder="Task Name" required className="w-full bg-slate-50 dark:bg-zinc-800 p-4 rounded-2xl outline-none dark:text-white" onChange={e => setForm({...form, title: e.target.value})} />
               <textarea placeholder="Description" className="w-full bg-slate-50 dark:bg-zinc-800 p-4 rounded-2xl outline-none h-32 dark:text-white" onChange={e => setForm({...form, description: e.target.value})} />
               <div className="flex gap-4 pt-2">
                 <button type="button" onClick={() => setShowModal(false)} className="flex-1 font-bold text-slate-500">Cancel</button>
                 <button type="submit" className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold">Create</button>
               </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default KanbanBoard;