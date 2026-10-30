import { useState, useEffect } from 'react';
import { getGoals, updateGoals } from '../api';
import '../styles/Goals.css';

export default function Goals() {
  const [goals, setGoals] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const res = await getGoals();
      setGoals(res.data);
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
      await updateGoals(formData);
      setGoals(formData);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert('Failed to update goals');
    }
    setLoading(false);
  };

  if (!goals) return <div className="loading">Loading...</div>;

  return (
    <div className="goals-container">
      <h1> Daily Goals</h1>

      {saved && <div className="success-msg"> Goals saved successfully!</div>}

      <form onSubmit={handleSave} className="goals-form">
        <div className="goal-item">
          <div className="goal-label">
            <span> Daily Steps</span>
            <span className="current">{formData.daily_steps}</span>
          </div>
          <input
            type="number"
            name="daily_steps"
            value={formData.daily_steps}
            onChange={handleChange}
          />
          <small>Recommended: 10,000</small>
        </div>

        <div className="goal-item">
          <div className="goal-label">
            <span> Daily Water</span>
            <span className="current">{formData.daily_water}L</span>
          </div>
          <input
            type="number"
            name="daily_water"
            value={formData.daily_water}
            onChange={handleChange}
            step="0.1"
          />
          <small>Recommended: 2L</small>
        </div>

        <div className="goal-item">
          <div className="goal-label">
            <span> Daily Sleep</span>
            <span className="current">{formData.daily_sleep}hrs</span>
          </div>
          <input
            type="number"
            name="daily_sleep"
            value={formData.daily_sleep}
            onChange={handleChange}
            step="0.5"
          />
          <small>Recommended: 8 hours</small>
        </div>

        <div className="goal-item">
          <div className="goal-label">
            <span> Daily Calories</span>
            <span className="current">{formData.daily_calories}</span>
          </div>
          <input
            type="number"
            name="daily_calories"
            value={formData.daily_calories}
            onChange={handleChange}
          />
          <small>Recommended: 2000</small>
        </div>

        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? ' Saving...' : 'Save Goals'}
        </button>
      </form>
    </div>
  );
}