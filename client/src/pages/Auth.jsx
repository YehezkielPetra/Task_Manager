import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2'; // Import SweetAlert2 untuk pop-up profesional

const Auth = ({ setToken, setUser }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ 
    username: '', 
    email: '', 
    password: '', 
    rePassword: '' 
  });

  // Fungsi Validasi Email menggunakan Regex
  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasi Khusus untuk Register
    if (!isLogin) {
      if (!validateEmail(formData.email)) {
        return Swal.fire({
          icon: 'error',
          title: 'Email Tidak Valid',
          text: 'Harap gunakan format email yang benar (contoh: user@company.com)',
          confirmButtonColor: '#2563eb'
        });
      }
      if (formData.password !== formData.rePassword) {
        return Swal.fire({
          icon: 'warning',
          title: 'Password Tidak Cocok',
          text: 'Pastikan Re-enter Password sama dengan Password Anda.',
          confirmButtonColor: '#2563eb'
        });
      }
      if (formData.password.length < 6) {
        return Swal.fire({
          icon: 'info',
          title: 'Password Terlalu Pendek',
          text: 'Gunakan minimal 6 karakter demi keamanan akun Anda.',
          confirmButtonColor: '#2563eb'
        });
      }
    }

    const url = isLogin 
      ? 'http://localhost:5000/api/login' 
      : 'http://localhost:5000/api/register';
    
    try {
      // Menampilkan loading pop-up saat proses request
      Swal.showLoading();
      
      const res = await axios.post(url, formData);
      
      Swal.close(); // Tutup loading

      if (isLogin) {
        // Simpan data ke localStorage
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        
        // Update state di App.jsx
        setToken(res.data.token);
        setUser(res.data.user);

        // Pop-up Berhasil Login
        Swal.fire({
          icon: 'success',
          title: 'Login Berhasil',
          text: `Selamat datang kembali, ${res.data.user.username}!`,
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        // Pop-up Berhasil Registrasi
        Swal.fire({
          icon: 'success',
          title: 'Registrasi Berhasil',
          text: 'Akun Anda telah terdaftar. Silakan login sekarang.',
          confirmButtonColor: '#2563eb'
        });
        setIsLogin(true); // Pindah ke halaman login otomatis
      }
    } catch (err) {
      // Pop-up Error dari Backend
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: err.response?.data?.message || "Terjadi kesalahan pada koneksi server.",
        confirmButtonColor: '#ef4444'
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950 p-6 font-sans">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-zinc-800 transition-all duration-500">
        
        {/* Logo & Header */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl mb-4 shadow-xl shadow-blue-500/30 flex items-center justify-center text-white text-2xl font-black">
            T
          </div>
          <h2 className="text-3xl font-black tracking-tighter dark:text-white uppercase">
            Task<span className="text-blue-600">.</span>Flow
          </h2>
          <p className="text-slate-400 text-sm mt-2 font-medium">
            {isLogin ? 'Sign in to manage your workspace' : 'Create your business account'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-2 tracking-widest">Username</label>
            <input 
              type="text" 
              placeholder="e.g. yehezkiel" 
              required
              className="w-full bg-slate-50 dark:bg-zinc-800 p-4 rounded-2xl outline-none focus:ring-2 ring-blue-500/50 transition-all dark:text-white border border-transparent focus:border-blue-500"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
            />
          </div>

          {!isLogin && (
            <div className="space-y-1 animate-in slide-in-from-top-2 duration-300">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-2 tracking-widest">Email Address</label>
              <input 
                type="email" 
                placeholder="name@company.com" 
                required
                className="w-full bg-slate-50 dark:bg-zinc-800 p-4 rounded-2xl outline-none focus:ring-2 ring-blue-500/50 transition-all dark:text-white border border-transparent focus:border-blue-500"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-2 tracking-widest">Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              required
              className="w-full bg-slate-50 dark:bg-zinc-800 p-4 rounded-2xl outline-none focus:ring-2 ring-blue-500/50 transition-all dark:text-white border border-transparent focus:border-blue-500"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          {!isLogin && (
            <div className="space-y-1 animate-in slide-in-from-top-2 duration-300">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-2 tracking-widest">Re-enter Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                required
                className="w-full bg-slate-50 dark:bg-zinc-800 p-4 rounded-2xl outline-none focus:ring-2 ring-blue-500/50 transition-all dark:text-white border border-transparent focus:border-blue-500"
                value={formData.rePassword}
                onChange={(e) => setFormData({...formData, rePassword: e.target.value})}
              />
            </div>
          )}

          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98] mt-4"
          >
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-zinc-800 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm font-bold text-slate-500 dark:text-zinc-400 hover:text-blue-600 transition-colors"
          >
            {isLogin ? 'New here? Create an account' : 'Already have an account? Login'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;