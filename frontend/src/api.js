import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

// AUTH
export const login = (email, password) => 
  API.post('/login/', { email, password });

export const register = (email, username, password) =>
  API.post('/register/', { email, username, password });

// PROFILE
export const getProfile = () => API.get('/profile/');
export const updateProfile = (data) => API.put('/profile/', data);

// GOALS
export const getGoals = () => API.get('/goals/');
export const updateGoals = (data) => API.put('/goals/', data);

// ASSESSMENT
export const submitAssessment = (pushups, running_time, flexibility) =>
  API.post('/assessment/', { pushups, running_time, flexibility });

// METRICS
export const logHealth = (steps, water_liters, sleep_hours, calories) =>
  API.post('/log/', { steps, water_liters, sleep_hours, calories });

export const getTodayMetrics = () => API.get('/today/');
export const getHistory = () => API.get('/history/');

// RECOMMENDATIONS
export const getRecommendations = () => API.get('/recommendations/');

// STATS
export const getStats = () => API.get('/stats/');

export default API;




