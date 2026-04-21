import React, { useState, useRef } from 'react';
import Webcam from "react-webcam";
import Swal from 'sweetalert2';
import api from '../utils/api'; // Menggunakan instance api pusat

const Profile = ({ user, setUser, token }) => {
  const [formData, setFormData] = useState({ 
    username: user?.username || '', 
    photo: user?.photo || 'https://i.pravatar.cc/150', 
    password: '' 
  });
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const webcamRef = useRef(null);

  // HANDLE UPLOAD DARI STORAGE
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { 
        setFormData({ ...formData, photo: reader.result }); 
      };
      reader.readAsDataURL(file);
    }
  };

  // CAPTURE DARI KAMERA
  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      setFormData({ ...formData, photo: imageSrc });
      setIsCameraOpen(false);
      Swal.fire({ 
        icon: 'success', 
        title: 'Photo Captured!', 
        timer: 1000, 
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });
    }
  };

  // UPDATE KE DATABASE
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      Swal.showLoading();
      
      // Menggunakan instance 'api' dengan endpoint relatif
      const res = await api.put('/user/update', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update State Global dan LocalStorage agar perubahan langsung terlihat
      const updatedUser = { ...user, username: formData.username, photo: formData.photo };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      Swal.fire({ 
        icon: 'success', 
        title: 'Profile Updated!', 
        text: 'Perubahan berhasil disimpan.',
        timer: 1500, 
        showConfirmButton: false 
      });

      // Kosongkan field password setelah update berhasil
      setFormData(prev => ({ ...prev, password: '' }));

    } catch (err) {
      console.error("Update error:", err);
      Swal.fire({ 
        icon: 'error', 
        title: 'Update Failed',
        text: err.response?.data?.message || 'Terjadi kesalahan saat menyimpan data.'
      });
    }
  };

  return (
    <div className="max-w-2xl animate-in fade-in duration-700">
      <h2 className="text-3xl font-black mb-10 dark:text-white tracking-tight">Profile Settings</h2>
      
      <form onSubmit={handleUpdate} className="bg-white dark:bg-zinc-900 p-10 rounded-[2.5rem] border border-slate-100 dark:border-zinc-800 shadow-sm space-y-8">
        
        {/* Photo Selection Area */}
        <div className="flex flex-col items-center gap-6 p-8 bg-slate-50 dark:bg-zinc-800/50 rounded-3xl border border-dashed border-slate-200 dark:border-zinc-700">
          <div className="relative group">
            <img 
              src={formData.photo} 
              className="w-40 h-40 rounded-full border-4 border-white dark:border-zinc-800 shadow-2xl object-cover transition-transform group-hover:scale-105" 
              alt="profile" 
            />
          </div>
          
          <div className="flex gap-4">
            <label className="bg-zinc-900 text-white px-6 py-3 rounded-xl text-xs font-bold cursor-pointer hover:bg-black transition-all active:scale-95">
              Choose File
              <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
            </label>
            <button 
              type="button" 
              onClick={() => setIsCameraOpen(true)} 
              className="bg-blue-600 text-white px-6 py-3 rounded-xl text-xs font-bold hover:bg-blue-700 transition-all active:scale-95"
            >
              Live Camera
            </button>
          </div>
        </div>

        {/* Input Fields */}
        <div className="space-y-5">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-2 tracking-widest">Username</label>
            <input 
              className="w-full bg-slate-100 dark:bg-zinc-800 p-4 rounded-2xl outline-none dark:text-white border border-transparent focus:border-blue-500 transition-all" 
              value={formData.username} 
              onChange={(e) => setFormData({...formData, username: e.target.value})} 
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-2 tracking-widest">Security</label>
            <input 
              className="w-full bg-slate-100 dark:bg-zinc-800 p-4 rounded-2xl outline-none dark:text-white border border-transparent focus:border-blue-500 transition-all" 
              type="password" 
              placeholder="Leave blank to keep current password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})} 
            />
          </div>
        </div>

        <button 
          type="submit" 
          className="w-full bg-blue-600 text-white py-5 rounded-2xl font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-[0.98]"
        >
          Save All Changes
        </button>
      </form>

      {/* Camera Modal Overlay */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-zinc-900 rounded-[3rem] p-8 max-w-sm w-full shadow-2xl">
            <h3 className="text-xl font-black mb-6 dark:text-white text-center">Capture Photo</h3>
            <div className="rounded-[2rem] overflow-hidden mb-6 border-4 border-blue-600 shadow-inner">
              <Webcam 
                audio={false} 
                ref={webcamRef} 
                screenshotFormat="image/jpeg" 
                width="100%" 
                videoConstraints={{ facingMode: "user" }}
              />
            </div>
            <div className="flex gap-4">
              <button 
                type="button"
                onClick={() => setIsCameraOpen(false)} 
                className="flex-1 font-bold text-slate-500 hover:text-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={capture} 
                className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all"
              >
                Capture
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;