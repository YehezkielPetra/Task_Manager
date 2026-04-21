import React, { useState, useRef } from 'react';
import axios from 'axios';
import Webcam from "react-webcam";
import Swal from 'sweetalert2';

const Profile = ({ user, setUser, token }) => {
  const [formData, setFormData] = useState({ 
    username: user.username, 
    photo: user.photo || 'https://i.pravatar.cc/150', 
    password: '' 
  });
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const webcamRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => { setFormData({ ...formData, photo: reader.result }); };
    if (file) reader.readAsDataURL(file);
  };

  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setFormData({ ...formData, photo: imageSrc });
    setIsCameraOpen(false);
    Swal.fire({ icon: 'success', title: 'Photo Captured!', timer: 1000, showConfirmButton: false });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put('http://localhost:5000/api/user/update', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser({ ...user, username: formData.username, photo: formData.photo });
      localStorage.setItem('user', JSON.stringify({ ...user, username: formData.username, photo: formData.photo }));
      Swal.fire({ icon: 'success', title: 'Profile Updated!', timer: 1500, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Update Failed' });
    }
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-3xl font-black mb-10 dark:text-white">Profile Settings</h2>
      <form onSubmit={handleUpdate} className="bg-white dark:bg-zinc-900 p-10 rounded-[2.5rem] border border-slate-100 dark:border-zinc-800 shadow-sm space-y-8">
        
        {/* Photo Selection */}
        <div className="flex flex-col items-center gap-6 p-8 bg-slate-50 dark:bg-zinc-800/50 rounded-3xl border border-dashed border-slate-200 dark:border-zinc-700">
          <img src={formData.photo} className="w-40 h-40 rounded-full border-4 border-white shadow-2xl object-cover" alt="profile" />
          <div className="flex gap-4">
            <label className="bg-zinc-900 text-white px-6 py-3 rounded-xl text-xs font-bold cursor-pointer hover:scale-105 transition-all">
              Choose File
              <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
            </label>
            <button type="button" onClick={() => setIsCameraOpen(true)} className="bg-blue-600 text-white px-6 py-3 rounded-xl text-xs font-bold hover:scale-105 transition-all">
              Live Camera
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <input className="w-full bg-slate-100 dark:bg-zinc-800 p-4 rounded-2xl outline-none dark:text-white" 
                 value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} />
          <input className="w-full bg-slate-100 dark:bg-zinc-800 p-4 rounded-2xl outline-none dark:text-white" 
                 type="password" placeholder="Enter new password to change"
                 onChange={(e) => setFormData({...formData, password: e.target.value})} />
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white py-5 rounded-2xl font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all">
          Save All Changes
        </button>
      </form>

      {/* Camera Modal */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-[3rem] p-8 max-w-sm w-full">
            <div className="rounded-[2rem] overflow-hidden mb-6 border-4 border-blue-600">
              <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" width="100%" />
            </div>
            <div className="flex gap-4">
              <button onClick={() => setIsCameraOpen(false)} className="flex-1 font-bold text-slate-500">Cancel</button>
              <button onClick={capture} className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold">Capture</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;