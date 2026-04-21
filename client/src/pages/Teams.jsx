import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api from '../utils/api';

const Teams = ({ token }) => {
  const [teamData, setTeamData] = useState({ hasTeam: false });
  const [teamNameInput, setTeamNameInput] = useState("");
  const [inviteUser, setInviteUser] = useState("");
  const [invitations, setInvitations] = useState([]);

  // Decode token untuk mendapatkan ID user login (untuk cek role leader secara frontend)
  const currentUser = token ? JSON.parse(atob(token.split('.')[1])) : null;

  useEffect(() => {
    fetchMyTeam();
    fetchInvitations();
  }, []);

  const fetchMyTeam = async () => {
    try {
      const res = await api.get('/teams/my-team', { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setTeamData(res.data);
    } catch (err) { 
      console.error("Gagal mengambil data tim:", err); 
    }
  };

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

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    Swal.fire({ title: 'Creating Team...', didOpen: () => Swal.showLoading() });
    try {
      await api.post('/teams/create', 
        { teamName: teamNameInput }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Swal.fire('Success', 'Team berhasil dibuat!', 'success');
      setTeamNameInput("");
      fetchMyTeam();
    } catch (err) { 
      Swal.fire('Error', 'Gagal membuat team', 'error'); 
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    Swal.fire({ title: 'Sending Invite...', didOpen: () => Swal.showLoading() });
    try {
      await api.post('/teams/invite', 
        { username: inviteUser, teamId: teamData.teamInfo.team_id }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Swal.fire('Sent!', `Undangan berhasil dikirim ke ${inviteUser}`, 'success');
      setInviteUser("");
    } catch (err) { 
      Swal.fire('Invite Failed', err.response?.data?.message || 'Terjadi kesalahan', 'error'); 
    }
  };

  const handleAcceptInvite = async (teamId) => {
    try {
      await api.put('/teams/accept', { teamId }, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      Swal.fire('Joined!', 'Anda telah bergabung dengan tim.', 'success');
      fetchMyTeam();
      fetchInvitations();
    } catch (err) { 
      Swal.fire('Error', 'Gagal menerima undangan', 'error'); 
    }
  };

  return (
    <div className="max-w-4xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-10">
        <h2 className="text-3xl font-black dark:text-white tracking-tight">Teams & Collaboration</h2>
        <p className="text-slate-500 text-sm mt-1">Bangun tim Anda dan selesaikan proyek bersama.</p>
      </div>

      {/* NOTIFIKASI UNDANGAN (Muncul jika ada) */}
      {invitations.length > 0 && (
        <div className="mb-8 bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 p-5 rounded-r-2xl">
          <h4 className="font-bold text-amber-800 dark:text-amber-400 text-sm mb-3 flex items-center gap-2">
            🔔 Pending Invitations
          </h4>
          <div className="space-y-3">
            {invitations.map((inv) => (
              <div key={inv.team_id} className="flex justify-between items-center bg-white dark:bg-zinc-800 p-3 rounded-xl shadow-sm">
                <span className="text-sm dark:text-zinc-300">Undangan bergabung: <b>{inv.team_name}</b></span>
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

      {teamData.hasTeam ? (
        /* TAMPILAN JIKA SUDAH PUNYA TIM */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List Anggota */}
          <div className="lg:col-span-2 bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-zinc-800 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h4 className="font-bold text-xl dark:text-white">Team: {teamData.teamInfo.team_name}</h4>
              <span className="text-[10px] bg-blue-100 text-blue-600 px-3 py-1 rounded-full font-black uppercase">Active</span>
            </div>
            
            <div className="space-y-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Members</p>
              {teamData.members.map((m) => (
                <div key={m.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-200 dark:bg-zinc-700 rounded-full flex items-center justify-center overflow-hidden">
                      {m.photo_profile ? <img src={m.photo_profile} alt="p" /> : "👤"}
                    </div>
                    <div>
                      <p className="text-sm font-bold dark:text-white">{m.username}</p>
                      <p className="text-[10px] text-slate-500">ID: #{m.id}</p>
                    </div>
                  </div>
                  <span className={`text-[9px] px-3 py-1 rounded-lg font-black uppercase ${m.role === 'leader' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                    {m.role}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Form Invite (Hanya untuk Leader) */}
          <div className="bg-blue-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-500/20">
            <h4 className="font-bold text-lg mb-4">Invite Member</h4>
            {teamData.teamInfo.leader_id === currentUser?.id ? (
              <form onSubmit={handleInvite} className="space-y-4">
                <p className="text-xs text-blue-100 mb-4 italic">Hanya Anda (Ketua) yang dapat mengundang anggota baru.</p>
                <input 
                  type="text" 
                  placeholder="Username" 
                  required
                  className="w-full p-4 rounded-2xl bg-white/10 border border-white/20 outline-none placeholder:text-blue-200 text-sm"
                  value={inviteUser} 
                  onChange={(e) => setInviteUser(e.target.value)}
                />
                <button type="submit" className="w-full bg-white text-blue-600 p-4 rounded-2xl font-black text-sm hover:bg-blue-50 transition-all active:scale-95">
                  Send Invitation
                </button>
              </form>
            ) : (
              <div className="text-center py-10">
                <p className="text-5xl mb-4">🛡️</p>
                <p className="text-sm font-bold">Anda adalah Member</p>
                <p className="text-[10px] text-blue-100 mt-2">Hubungi <b>{teamData.teamInfo.leader_name}</b> untuk menambah anggota.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* TAMPILAN JIKA BELUM PUNYA TIM */
        <div className="bg-white dark:bg-zinc-900 p-12 rounded-[3rem] border border-dashed border-slate-300 dark:border-zinc-700 text-center">
          <div className="w-20 h-20 bg-slate-100 dark:bg-zinc-800 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6">
            🚩
          </div>
          <h4 className="text-2xl font-black dark:text-white mb-2">Anda belum bergabung dalam Tim</h4>
          <p className="text-slate-500 text-sm mb-8 max-w-sm mx-auto">
            Mulai kolaborasi dengan membuat tim baru atau tunggu undangan dari teman Anda.
          </p>
          
          <form onSubmit={handleCreateTeam} className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
            <input 
              type="text" 
              placeholder="Nama Tim Baru..." 
              required
              className="flex-1 bg-slate-50 dark:bg-zinc-800 p-4 rounded-2xl outline-none dark:text-white border border-transparent focus:border-blue-500 transition-all"
              value={teamNameInput} 
              onChange={(e) => setTeamNameInput(e.target.value)}
            />
            <button 
              type="submit" 
              className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-500/30"
            >
              Create Team
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Teams;