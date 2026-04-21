// src/utils/api.js
import axios from 'axios';

const instance = axios.create({
  // Jika sedang dideploy, pakai URL server online. Jika tidak, pakai localhost.
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

export default instance;