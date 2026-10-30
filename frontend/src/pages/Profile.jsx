import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile } from '../api';
import '../styles/Profile.css';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await getProfile();
      setProfile(res.data);
      setFormData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateProfile(formData);
      setProfile(formData);
      setEditing(false);
      alert('Profile updated!');
    } catch (err) {
      alert('Update failed');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!profile) return <div className="loading">Loading...</div>;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1> My Profile</h1>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>

      <div className="profile-box">
        {!editing ? (
          <div>
            <div className="profile-item">
              <label>Username:</label>
              <span>{profile.username}</span>
            </div>
            <div className="profile-item">
              <label>Email:</label>
              <span>{profile.email}</span>
            </div>
            <div className="profile-item">
              <label>Age:</label>
              <span>{profile.age || 'Not set'}</span>
            </div>
            <div className="profile-item">
              <label>Weight (kg):</label>
              <span>{profile.weight || 'Not set'}</span>
            </div>
            <div className="profile-item">
              <label>Height (cm):</label>
              <span>{profile.height || 'Not set'}</span>
            </div>
            <div className="profile-item">
              <label>Fitness Level:</label>
              <span>{profile.fitness_level}</span>
            </div>
            <div className="profile-item">
              <label>Fitness Score:</label>
              <span className="score">{profile.fitness_score}/100</span>
            </div>

            <button onClick={() => setEditing(true)} className="btn-primary">
               Edit Profile
            </button>
          </div>
        ) : (
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label>Age</label>
              <input
                type="number"
                name="age"
                value={formData.age || ''}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Weight (kg)</label>
              <input
                type="number"
                name="weight"
                value={formData.weight || ''}
                onChange={handleChange}
                step="0.1"
              />
            </div>
            <div className="form-group">
              <label>Height (cm)</label>
              <input
                type="number"
                name="height"
                value={formData.height || ''}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Gender</label>
              <select name="gender" value={formData.gender || 'M'} onChange={handleChange}>
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="O">Other</option>
              </select>
            </div>

            <div className="button-group">
              <button type="submit" disabled={loading} className="btn-primary">
                 Save
              </button>
              <button type="button" onClick={() => setEditing(false)} className="btn-secondary">
                 Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}