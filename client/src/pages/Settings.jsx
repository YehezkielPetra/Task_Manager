import React from 'react';
import Swal from 'sweetalert2';
import api from '../utils/api'; // Jika ingin hit API delete account

const Settings = ({ token, onLogout }) => {
  
  const handleDeleteAccount = () => {
    Swal.fire({
      title: 'Hapus Akun Permanen?',
      text: "Seluruh tugas, tim, dan data profil Anda akan dihapus selamanya. Tindakan ini tidak dapat dibatalkan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus Akun Saya',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Kamu perlu membuat endpoint DELETE /api/user di backend jika ingin ini jalan
          // await api.delete('/user', { headers: { Authorization: `Bearer ${token}` } });
          
          Swal.fire('Terhapus!', 'Akun Anda telah dihapus.', 'success');
          onLogout(); // Paksa logout setelah hapus akun
        } catch (err) {
          Swal.fire('Error', 'Gagal menghapus akun. Silakan coba lagi.', 'error');
        }
      }
    });
  };

  return (
    <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      <h2 className="text-3xl font-black mb-10 dark:text-white tracking-tight">App Settings</h2>
      
      <div className="space-y-6">
        <section className="bg-white dark:bg-zinc-900 p-8 rounded-[2rem] border border-slate-100 dark:border-zinc-800 shadow-sm">
          <h4 className="font-bold mb-6 dark:text-white text-lg">General Preferences</h4>
          
          <div className="space-y-6">
            {/* Email Notifications */}
            <div className="flex justify-between items-center group">
              <div>
                <p className="font-bold text-sm dark:text-white group-hover:text-blue-600 transition-colors">Email Notifications</p>
                <p className="text-xs text-slate-400">Terima ringkasan tugas harian melalui email.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Auto-Archive */}
            <div className="flex justify-between items-center pt-6 border-t dark:border-zinc-800 group">
              <div>
                <p className="font-bold text-sm dark:text-white group-hover:text-blue-600 transition-colors">Auto-Archive Done Tasks</p>
                <p className="text-xs text-slate-400">Pindahkan tugas ke History secara otomatis setelah 7 hari.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="bg-red-50 dark:bg-red-900/10 p-8 rounded-[2.5rem] border border-red-100 dark:border-red-900/20">
          <h4 className="font-bold mb-2 text-red-600">Danger Zone</h4>
          <p className="text-xs text-red-400 mb-6 font-medium">Menghapus akun akan menghapus seluruh data tim, history, dan tugas Anda secara permanen dari server kami.</p>
          <button 
            onClick={handleDeleteAccount}
            className="bg-red-600 text-white px-8 py-3 rounded-2xl text-sm font-bold hover:bg-red-700 transition-all active:scale-95 shadow-lg shadow-red-500/20"
          >
            Delete My Account
          </button>
        </section>
      </div>
    </div>
  );
};

export default Settings;