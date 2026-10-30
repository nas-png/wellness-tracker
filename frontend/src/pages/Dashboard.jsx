import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTodayMetrics, logHealth, getRecommendations } from '../api';
import '../styles/Dashboard.css';

export default function Dashboard() {
  const [metrics, setMetrics] = useState({
    steps: 0,
    water_liters: 0,
    sleep_hours: 0,
    calories: 0,
    distance_km: 0,
    calories_burned: 0,
    steps_progress: 0,
    water_progress: 0,
    sleep_progress: 0,
    calories_progress: 0,
    daily_goals: {
      steps: 10000,
      water: 2.0,
      sleep: 8.0,
      calories: 2000,
    }
  });
  
  const [recommendations, setRecommendations] = useState([]);
  const [steps, setSteps] = useState('');
  const [water, setWater] = useState('');
  const [sleep, setSleep] = useState('');
  const [calories, setCalories] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [metricsRes, recsRes] = await Promise.all([
        getTodayMetrics(),
        getRecommendations()
      ]);
      
      setMetrics(metricsRes.data || {
        steps: 0,
        water_liters: 0,
        sleep_hours: 0,
        calories: 0,
        distance_km: 0,
        calories_burned: 0,
        steps_progress: 0,
        water_progress: 0,
        sleep_progress: 0,
        calories_progress: 0,
        daily_goals: {
          steps: 10000,
          water: 2.0,
          sleep: 8.0,
          calories: 2000,
        }
      });
      
      setRecommendations(recsRes.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      alert('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleLog = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const stepsVal = parseInt(steps) || 0;
      const waterVal = parseFloat(water) || 0;
      const sleepVal = parseFloat(sleep) || 0;
      const caloriesVal = parseInt(calories) || 0;

      await logHealth(stepsVal, waterVal, sleepVal, caloriesVal);
      
      // Clear form
      setSteps('');
      setWater('');
      setSleep('');
      setCalories('');
      
      // Refetch data
      await fetchData();
      
      alert('Data logged successfully!');
    } catch (err) {
      console.error('Error logging data:', err);
      alert('Failed to log data');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const ProgressRing = ({ progress, label }) => {
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;
    
    return (
      <div className="progress-ring">
        <svg width="120" height="120">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="#eee" strokeWidth="8" />
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="#667eea"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 60 60)"
            style={{ transition: 'stroke-dashoffset 0.35s' }}
          />
          <text x="60" y="60" textAnchor="middle" dy="0.3em" fontSize="18" fontWeight="bold" fill="#667eea">
            {Math.round(Math.min(progress, 100))}%
          </text>
        </svg>
        <p>{label}</p>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your wellness dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="nav-header">
        <h1>Wellness Dashboard</h1>
        <div className="nav-buttons">
          <button onClick={() => navigate('/profile')} className="nav-btn">Profile</button>
          <button onClick={() => navigate('/goals')} className="nav-btn">Goals</button>
          <button onClick={() => navigate('/analytics')} className="nav-btn">Analytics</button>
          <button onClick={() => navigate('/assessment')} className="nav-btn">Assessment</button>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </div>

      <div className="progress-rings">
        <ProgressRing progress={metrics.steps_progress || 0} label="Steps" />
        <ProgressRing progress={metrics.water_progress || 0} label="Water" />
        <ProgressRing progress={metrics.sleep_progress || 0} label="Sleep" />
        <ProgressRing progress={metrics.calories_progress || 0} label="Calories" />
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <h3>Steps</h3>
          <p className="big-number">{metrics.steps || 0}</p>
          <small>{metrics.distance_km || 0} km • Goal: {metrics.daily_goals?.steps || 10000}</small>
        </div>
        <div className="metric-card">
          <h3>Water</h3>
          <p className="big-number">{metrics.water_liters || 0}L</p>
          <small>Goal: {metrics.daily_goals?.water || 2.0}L</small>
        </div>
        <div className="metric-card">
          <h3>Sleep</h3>
          <p className="big-number">{metrics.sleep_hours || 0}h</p>
          <small>Goal: {metrics.daily_goals?.sleep || 8.0}hrs</small>
        </div>
        <div className="metric-card">
          <h3>Calories</h3>
          <p className="big-number">{metrics.calories || 0}</p>
          <small>{metrics.calories_burned || 0} burned • Goal: {metrics.daily_goals?.calories || 2000}</small>
        </div>
      </div>

      <div className="container">
        <div className="form-section">
          <h2>Log Today's Data</h2>
          <form onSubmit={handleLog}>
            <input 
              type="number" 
              placeholder="Steps" 
              value={steps} 
              onChange={(e) => setSteps(e.target.value)}
              min="0"
            />
            <input 
              type="number" 
              placeholder="Water (L)" 
              step="0.1" 
              value={water} 
              onChange={(e) => setWater(e.target.value)}
              min="0"
            />
            <input 
              type="number" 
              placeholder="Sleep (hrs)" 
              step="0.5" 
              value={sleep} 
              onChange={(e) => setSleep(e.target.value)}
              min="0"
            />
            <input 
              type="number" 
              placeholder="Calories" 
              value={calories} 
              onChange={(e) => setCalories(e.target.value)}
              min="0"
            />
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Logging...' : 'LOG DATA'}
            </button>
          </form>
        </div>

        <div className="recommendations-section">
          <h2>Personalized Recommendations</h2>
          <div className="recommendations-list">
            {recommendations && recommendations.length > 0 ? (
              recommendations.map((rec, i) => (
                <div key={i} className="rec-card">
                  <h4>{rec.title}</h4>
                  <p>{rec.description}</p>
                  <span className={`difficulty ${rec.difficulty || 'easy'}`}>
                    {rec.difficulty || 'easy'}
                  </span>
                </div>
              ))
            ) : (
              <div className="rec-card">
                <p>Complete your fitness assessment to get personalized recommendations!</p>
                <button onClick={() => navigate('/assessment')} className="btn-small">
                  Take Assessment
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}