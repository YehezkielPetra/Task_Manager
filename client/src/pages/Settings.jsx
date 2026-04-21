import React from 'react';

const Settings = () => {
  return (
    <div className="max-w-2xl animate-in fade-in duration-500">
      <h2 className="text-3xl font-black mb-10 dark:text-white tracking-tight">App Settings</h2>
      
      <div className="space-y-6">
        <section className="bg-white dark:bg-zinc-900 p-8 rounded-[2rem] border border-slate-100 dark:border-zinc-800 shadow-sm">
          <h4 className="font-bold mb-6 dark:text-white text-lg">General Preferences</h4>
          
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold text-sm dark:text-white">Email Notifications</p>
                <p className="text-xs text-slate-400">Terima ringkasan tugas harian.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex justify-between items-center pt-6 border-t dark:border-zinc-800">
              <div>
                <p className="font-bold text-sm dark:text-white">Auto-Archive Done Tasks</p>
                <p className="text-xs text-slate-400">Sembunyikan tugas yang sudah selesai setelah 7 hari.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </section>

        <section className="bg-red-50 dark:bg-red-900/10 p-8 rounded-[2rem] border border-red-100 dark:border-red-900/20">
          <h4 className="font-bold mb-2 text-red-600">Danger Zone</h4>
          <p className="text-xs text-red-400 mb-6">Menghapus akun akan menghapus seluruh data tim dan tugas Anda secara permanen.</p>
          <button className="bg-red-600 text-white px-8 py-3 rounded-2xl text-sm font-bold hover:bg-red-700 transition-all active:scale-95 shadow-lg shadow-red-500/20">
            Delete My Account
          </button>
        </section>
      </div>
    </div>
  );
};

export default Settings;