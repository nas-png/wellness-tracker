
import { useState, useEffect } from 'react';
import { getHistory, getStats } from '../api';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import '../styles/Analytics.css';

const CHART_GREEN = '#34d399';
const CHART_GREEN_DARK = '#10b981';
const GRID_COLOR = '#263241';
const TEXT_COLOR = '#94a3b8';

const chartMargin = {
  top: 8,
  right: 12,
  left: 0,
  bottom: 4,
};

const axisStyle = {
  fill: TEXT_COLOR,
  fontSize: 12,
};

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div
      style={{
        background: '#0b1118',
        border: '1px solid #263241',
        borderRadius: 10,
        padding: '12px 15px',
        boxShadow: '0 8px 25px rgba(0,0,0,0.25)',
      }}
    >
      <p style={{ color: '#f1f5f9', margin: '0 0 8px', fontWeight: 700 }}>
        {label}
      </p>

      {payload.map((entry, index) => (
        <p
          key={`${entry.dataKey}-${index}`}
          style={{
            color: CHART_GREEN,
            margin: '5px 0',
            fontSize: 13,
          }}
        >
          {entry.name || entry.dataKey}: {entry.value}
          {entry.dataKey === 'water_liters'
            ? ' L'
            : entry.dataKey === 'sleep_hours'
              ? ' hrs'
              : ''}
        </p>
      ))}
    </div>
  );
}

function ChartAxes() {
  return (
    <>
      <CartesianGrid
        stroke={GRID_COLOR}
        strokeDasharray="4 4"
        vertical={false}
      />
      <XAxis
        dataKey="date"
        tick={axisStyle}
        axisLine={{ stroke: GRID_COLOR }}
        tickLine={false}
        tickMargin={10}
      />
      <YAxis
        tick={axisStyle}
        axisLine={false}
        tickLine={false}
        width={48}
      />
      <Tooltip content={<ChartTooltip />} />
    </>
  );
}

function ChartCard({ title, subtitle, children }) {
  return (
    <section className="chart">
      <div className="chart-heading">
        <div>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
        <span className="chart-indicator" />
      </div>

      <div className="chart-plot">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export default function Analytics() {
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        const [historyRes, statsRes] = await Promise.all([
          getHistory(),
          getStats(),
        ]);

        if (cancelled) return;

        const historyData = Array.isArray(historyRes.data)
          ? historyRes.data
          : [];

        setHistory(
          historyData.map((item) => ({
            ...item,
            date: new Date(item.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            }),
          }))
        );

        setStats(statsRes.data);
      } catch (err) {
        console.error('Failed to load analytics:', err);

        if (!cancelled) {
          setError('We could not load your analytics. Please try again.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, []);

  const statCards = stats
    ? [
        {
          title: 'Total Steps',
          value: stats.total_steps ?? 0,
          
        },
        {
          title: 'Average Water',
          value: `${stats.avg_water ?? 0} L`,
          
        },
        {
          title: 'Average Sleep',
          value: `${stats.avg_sleep ?? 0} hrs`,
          
        },
        {
          title: 'Total Calories',
          value: stats.total_calories ?? 0,
          
        },
        {
          title: 'Days Logged',
          value: stats.days_logged ?? 0,
          
        },
      ]
    : [];

  if (loading) {
    return (
      <main className="analytics-container">
        <div className="analytics-state">
          <div className="analytics-spinner" />
          <p>Loading your analytics...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="analytics-container">
      <header className="analytics-header">
        <div>
          <p className="analytics-eyebrow">YOUR PERFORMANCE</p>
          <h1>Weekly Analytics</h1>
          <p className="analytics-description">
            Understand your habits and track your progress over time.
          </p>
        </div>

        <div className="analytics-period">
          <span className="period-dot" />
          Your recorded history
        </div>
      </header>

      {error && (
        <div className="analytics-error" role="alert">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>
            Try again
          </button>
        </div>
      )}

      {!error && stats && (
        <>
          <section className="stats-grid">
            {statCards.map((stat) => (
              <article className="stat-card" key={stat.title}>
                <div className="stat-card-top">
                  <span className="stat-icon">{stat.icon}</span>
                  <span className="stat-status">TRACKED</span>
                </div>

                <p className="stat-title">{stat.title}</p>
                <p className="big-stat">{stat.value}</p>
              </article>
            ))}
          </section>

          <div className="analytics-section-heading">
            <div>
              <h2>Your activity</h2>
              <p>Daily breakdown of your health metrics.</p>
            </div>
          </div>

          {history.length > 0 ? (
            <section className="charts-container">
              <ChartCard
                title="Steps over time"
                subtitle="Daily movement"
              >
                <LineChart data={history} margin={chartMargin}>
                  <ChartAxes />
                  <Legend
                    wrapperStyle={{
                      color: TEXT_COLOR,
                      fontSize: 12,
                      paddingTop: 12,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="steps"
                    name="Steps"
                    stroke={CHART_GREEN}
                    strokeWidth={3}
                    dot={{ r: 3, fill: CHART_GREEN, strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: CHART_GREEN_DARK }}
                  />
                </LineChart>
              </ChartCard>

              <ChartCard
                title="Calories over time"
                subtitle="Daily calorie intake"
              >
                <BarChart data={history} margin={chartMargin}>
                  <ChartAxes />
                  <Bar
                    dataKey="calories"
                    name="Calories"
                    fill={CHART_GREEN}
                    radius={[5, 5, 0, 0]}
                    maxBarSize={36}
                  />
                </BarChart>
              </ChartCard>

              <ChartCard
                title="Sleep pattern"
                subtitle="Hours of rest per day"
              >
                <LineChart data={history} margin={chartMargin}>
                  <ChartAxes />
                  <Line
                    type="monotone"
                    dataKey="sleep_hours"
                    name="Sleep (hrs)"
                    stroke={CHART_GREEN}
                    strokeWidth={3}
                    dot={{ r: 3, fill: CHART_GREEN, strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: CHART_GREEN_DARK }}
                  />
                </LineChart>
              </ChartCard>

              <ChartCard
                title="Water intake"
                subtitle="Daily hydration in litres"
              >
                <BarChart data={history} margin={chartMargin}>
                  <ChartAxes />
                  <Bar
                    dataKey="water_liters"
                    name="Water (L)"
                    fill={CHART_GREEN}
                    radius={[5, 5, 0, 0]}
                    maxBarSize={36}
                  />
                </BarChart>
              </ChartCard>
            </section>
          ) : (
            <section className="analytics-empty">
              <span>📊</span>
              <h3>Your charts will appear here</h3>
              <p>
                Start logging your daily health data to build your progress
                history.
              </p>
            </section>
          )}
        </>
      )}

      {!error && !stats && (
        <section className="analytics-empty">
          <span>📈</span>
          <h3>No analytics available yet</h3>
          <p>Once your statistics are available, they will appear here.</p>
        </section>
      )}
    </main>
  );
}

