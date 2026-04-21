import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api from '../utils/api'; // Menggunakan instance api pusat

const Teams = ({ token }) => {
  const [inviteUser, setInviteUser] = useState("");
  const [invitations, setInvitations] = useState([]); // State tambahan untuk notifikasi

  // Fungsi tambahan: Ambil daftar undangan saat komponen dimuat
  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      const res = await api.get('/teams/invitations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInvitations(res.data);
    } catch (err) {
      console.error("Gagal mengambil undangan:", err);
    }
  };

  // Fungsi tambahan: Menerima undangan
  const handleAcceptInvite = async (teamId) => {
    try {
      await api.put('/teams/accept', { teamId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Swal.fire({
        icon: 'success',
        title: 'Joined!',
        text: 'Berhasil bergabung dengan tim.',
        timer: 2000,
        showConfirmButton: false
      });
      fetchInvitations(); // Refresh daftar notifikasi
    } catch (err) {
      Swal.fire('Error', 'Gagal menerima undangan', 'error');
    }
  };

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
      { username: inviteUser, teamId: 1 }, 
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

      {/* Tambahan: UI Notification Box untuk Undangan Pending */}
      {invitations.length > 0 && (
        <div className="mb-6 bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 p-5 rounded-r-2xl animate-pulse-once">
          <h4 className="font-bold text-amber-800 dark:text-amber-400 text-sm mb-3 flex items-center gap-2">
            🔔 Pending Invitations
          </h4>
          <div className="space-y-3">
            {invitations.map((inv) => (
              <div key={inv.team_id} className="flex justify-between items-center bg-white dark:bg-zinc-800 p-3 rounded-xl shadow-sm">
                <span className="text-sm dark:text-zinc-300">Undangan dari: <b>{inv.team_name}</b></span>
                <button 
                  onClick={() => handleAcceptInvite(inv.team_id)}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs px-4 py-2 rounded-lg font-bold transition-colors"
                >
                  Accept
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

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
            "Undangan akan masuk ke daftar pending user sebelum mereka bergabung ke tim."
          </p>
        </div>
      </div>
    </div>
  );
};

export default Teams;