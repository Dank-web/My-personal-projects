import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

// Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('soundsphere_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('soundsphere_token');
      localStorage.removeItem('soundsphere_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authService = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
};

export const userService = {
  getProfile: () => API.get('/user/profile'),
  getLikedSongs: () => API.get('/user/liked-songs'),
  getRecentlyPlayed: () => API.get('/user/recently-played'),
  buyPremium: (plan) => API.post('/user/premium', { plan }),
  addCredits: (amount) => API.put('/user/credits', { amount }),
};

export const songService = {
  getAll: (params) => API.get('/songs', { params }),
  getTrending: () => API.get('/songs/trending'),
  getById: (id) => API.get(`/songs/${id}`),
  upload: (formData) => API.post('/songs/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  incrementPlay: (id) => API.put(`/songs/play/${id}`),
  toggleLike: (id) => API.put(`/songs/like/${id}`),
};

export const playlistService = {
  create: (data) => API.post('/playlists', data),
  getAll: () => API.get('/playlists'),
  getById: (id) => API.get(`/playlists/${id}`),
  update: (id, data) => API.put(`/playlists/${id}`, data),
  delete: (id) => API.delete(`/playlists/${id}`),
};

export const searchService = {
  search: (q, type) => API.get('/search', { params: { q, type } }),
  recommend: (genres) => API.get('/search/recommend', { params: { genres: genres?.join(',') } }),
};

export default API;
