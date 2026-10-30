import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Goals from './pages/Goals';
import Assessment from './pages/Assessment';
import Analytics from './pages/Analytics';
import './App.css';

function App() {
  const token = localStorage.getItem('token');

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/profile" element={token ? <Profile /> : <Navigate to="/login" />} />
        <Route path="/goals" element={token ? <Goals /> : <Navigate to="/login" />} />
        <Route path="/assessment" element={token ? <Assessment /> : <Navigate to="/login" />} />
        <Route path="/analytics" element={token ? <Analytics /> : <Navigate to="/login" />} />
        <Route path="/" element={<Navigate to={token ? '/dashboard' : '/login'} />} />
      </Routes>
    </Router>
  );
}

export default App;