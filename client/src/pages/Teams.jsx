import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const Teams = ({ token }) => {
  const [inviteUser, setInviteUser] = useState("");

  const handleInvite = async (e) => {
    e.preventDefault();
    
    // Show Loading
    Swal.fire({
      title: 'Sending Invite...',
      allowOutsideClick: false,
      didOpen: () => { Swal.showLoading(); }
    });

    try {
      await axios.post('http://localhost:5000/api/teams/invite', 
        { targetUsername: inviteUser, teamId: 1 }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      Swal.fire({
        icon: 'success',
        title: 'Invite Sent!',
        text: `${inviteUser} telah berhasil diundang ke tim.`,
        confirmButtonColor: '#2563eb'
      });
      setInviteUser("");
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Invite Failed',
        text: err.response?.data?.message || 'Username tidak ditemukan.',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-3xl font-black mb-10 dark:text-white">Teams & Collaboration</h2>
      <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2rem] border border-slate-100 dark:border-zinc-800 shadow-sm">
        <h4 className="font-bold mb-6 dark:text-white">Invite Members</h4>
        <form onSubmit={handleInvite} className="flex gap-3">
          <input 
            type="text" placeholder="Enter username..." required
            className="flex-1 bg-slate-50 dark:bg-zinc-800 p-4 rounded-2xl outline-none dark:text-white"
            value={inviteUser} onChange={(e) => setInviteUser(e.target.value)}
          />
          <button type="submit" className="bg-blue-600 text-white px-8 rounded-2xl font-bold hover:bg-blue-700 transition-all">
            Invite
          </button>
        </form>
      </div>
    </div>
  );
};

export default Teams;