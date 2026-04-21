import React, { useState } from 'react';
import Swal from 'sweetalert2';
import api from '../utils/api'; // Menggunakan instance api pusat

const Teams = ({ token }) => {
  const [inviteUser, setInviteUser] = useState("");

  const handleInvite = async (e) => {
    e.preventDefault();
    
    // Menampilkan loading pop-up
    Swal.fire({
      title: 'Sending Invite...',
      text: 'Mencari user dan mengirim undangan...',
      allowOutsideClick: false,
      didOpen: () => { 
        Swal.showLoading(); 
      }
    });

    try {
      // Menggunakan instance 'api' dengan endpoint relatif
      await api.post('/teams/invite', 
        { targetUsername: inviteUser, teamId: 1 }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      Swal.fire({
        icon: 'success',
        title: 'Invite Sent!',
        text: `${inviteUser} telah berhasil diundang ke tim.`,
        confirmButtonColor: '#2563eb',
        timer: 3000
      });
      
      setInviteUser("");
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Invite Failed',
        text: err.response?.data?.message || 'Username tidak ditemukan atau koneksi bermasalah.',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  return (
    <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-10">
        <h2 className="text-3xl font-black dark:text-white tracking-tight">Teams & Collaboration</h2>
        <p className="text-slate-500 text-sm mt-1">Bangun tim Anda dan selesaikan proyek bersama.</p>
      </div>

      <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl flex items-center justify-center text-lg">
            👥
          </div>
          <h4 className="font-bold dark:text-white text-lg">Invite Members</h4>
        </div>

        <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3">
          <input 
            type="text" 
            placeholder="Search by username (e.g. petra)" 
            required
            className="flex-1 bg-slate-50 dark:bg-zinc-800 p-4 rounded-2xl outline-none dark:text-white border border-transparent focus:border-blue-500 transition-all shadow-inner"
            value={inviteUser} 
            onChange={(e) => setInviteUser(e.target.value)}
          />
          <button 
            type="submit" 
            className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 transition-all active:scale-95"
          >
            Send Invite
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t dark:border-zinc-800">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tips</p>
          <p className="text-xs text-slate-400 mt-2 italic">
            "Undangan akan langsung memasukkan user ke dalam tim jika username valid."
          </p>
        </div>
      </div>
    </div>
  );
};

export default Teams;