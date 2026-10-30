import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitAssessment } from '../api';
import '../styles/Assessment.css';

export default function Assessment() {
  const [pushups, setPushups] = useState('');
  const [running, setRunning] = useState('');
  const [flexibility, setFlexibility] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await submitAssessment(
        parseInt(pushups) || 0,
        parseFloat(running) || 0,
        parseInt(flexibility) || 0
      );
      setResult(res.data);
    } catch (err) {
      alert('Assessment failed');
    }
    setLoading(false);
  };

  if (result) {
    return (
      <div className="assessment-container">
        <div className="result-box">
          <h1>Assessment Complete!</h1>
          <p className="score">Fitness Score: {result.fitness_score}/100</p>
          <p className="level">Level: {result.level.toUpperCase()}</p>
          <p className="message">{result.message}</p>
          
          <div className="level-info">
            {result.level === 'beginner' && (
              <div>
                <h3>Beginner Tips:</h3>
                <ul>
                  <li>Start with 5,000 steps daily</li>
                  <li>Drink 2L water daily</li>
                  <li>Get 7-8 hours sleep</li>
                </ul>
              </div>
            )}
            {result.level === 'intermediate' && (
              <div>
                <h3>Intermediate Tips:</h3>
                <ul>
                  <li>Aim for 10,000 steps daily</li>
                  <li>Add strength training 3x/week</li>
                  <li>Maintain consistent sleep schedule</li>
                </ul>
              </div>
            )}
            {result.level === 'advanced' && (
              <div>
                <h3>Advanced Tips:</h3>
                <ul>
                  <li>Add weight training 4x/week</li>
                  <li>Track macronutrients</li>
                  <li>Optimize sleep for recovery</li>
                </ul>
              </div>
            )}
          </div>

          <button onClick={() => {
            if (!localStorage.getItem('onboarding_completed')) {
            navigate('/onboarding');
            } else {
               navigate('/dashboard');
                   }
}} className="btn-primary">
  {localStorage.getItem('onboarding_completed') ? 'Go to Dashboard' : 'Continue Setup'}
</button>

          
        </div>
      </div>
    );
  }

  return (
    <div className="assessment-container">
      <div className="assessment-box">
        <h1> Fitness Assessment Quiz</h1>
        <p>Answer these questions to calculate your fitness level</p>

        <form onSubmit={handleSubmit}>
          <div className="question">
            <label>How many pushups can you do?</label>
            <input
              type="number"
              value={pushups}
              onChange={(e) => setPushups(e.target.value)}
              placeholder="0"
              required
            />
          </div>

          <div className="question">
            <label>How long can you run? (minutes)</label>
            <input
              type="number"
              value={running}
              onChange={(e) => setRunning(e.target.value)}
              placeholder="0"
              step="0.5"
              required
            />
          </div>

          <div className="question">
            <label>Flexibility score (1-10)</label>
            <input
              type="number"
              min="1"
              max="10"
              value={flexibility}
              onChange={(e) => setFlexibility(e.target.value)}
              placeholder="5"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? ' Calculating...' : ' Calculate Fitness Score'}
          </button>
        </form>
      </div>
    </div>
  );
}