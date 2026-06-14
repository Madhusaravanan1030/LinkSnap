import { useParams, useNavigate } from 'react-router-dom';
import { format, formatDistanceToNow } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useState } from 'react';
import Navbar          from '../components/Navbar';
import { useAnalytics } from '../hooks/useAnalytics';

// Fill all days in range with 0 for missing ones
function fillDailyGaps(trend, days) {
  const map = Object.fromEntries((trend || []).map((d) => [d.date, d.clicks]));
  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    result.push({ date: key, label: d.toLocaleDateString('en', { month: 'short', day: 'numeric' }), clicks: map[key] || 0 });
  }
  return result;
}

function MetricCard({ label, value, sub, valueColor }) {
  return (
    <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: '12px 14px' }}>
      <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 500, color: valueColor || 'var(--text)' }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

// Skeleton for analytics page
function AnalyticsSkeleton() {
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 10 }}>
        {[1,2,3].map((n) => <div key={n} className="ls-skeleton" style={{ height: 72, borderRadius: 10 }} />)}
      </div>
      <div className="ls-skeleton" style={{ height: 160, borderRadius: 10, marginBottom: 10 }} />
      <div className="ls-skeleton" style={{ height: 200, borderRadius: 14 }} />
    </>
  );
}

export default function Analytics() {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const { data, loading, error } = useAnalytics(id);
  const [range, setRange] = useState(7);

  const chartData = data ? fillDailyGaps(data.dailyTrend, range) : [];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '24px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <Navbar />

        {/* Back button */}
        <button className="ls-btn-secondary" style={{ marginBottom: 20, fontSize: 12, padding: '6px 14px' }} onClick={() => navigate('/dashboard')}>
          <i className="ti ti-arrow-left" aria-hidden="true" style={{ fontSize: 13 }} />
          Back to dashboard
        </button>

        {error && (
          <div style={{ background: 'rgba(226,75,74,0.12)', border: '0.5px solid rgba(226,75,74,0.3)', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: '#F09595' }}>
            {error}
          </div>
        )}

        {loading && <AnalyticsSkeleton />}

        {data && !loading && (
          <>
            {/* URL info */}
            <div className="ls-card" style={{ marginBottom: 10 }}>
              <div className="ls-pill" style={{ marginBottom: 8 }}>
                <i className="ti ti-link" aria-hidden="true" style={{ fontSize: 12 }} />
                {data.url.shortUrl.replace(/^https?:\/\//, '')}
              </div>
              <div className="ls-url-truncate" title={data.url.originalUrl}>{data.url.originalUrl}</div>
            </div>

            {/* Metric cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 10 }}>
              <MetricCard
                label="Total clicks"
                value={data.totalClicks.toLocaleString()}
                valueColor="var(--pink)"
                sub={`${data.url.clickCount} recorded`}
              />
              <MetricCard
                label="Last visited"
                value={data.lastVisitedAt ? formatDistanceToNow(new Date(data.lastVisitedAt), { addSuffix: true }) : 'Never'}
                sub={data.lastVisitedAt ? format(new Date(data.lastVisitedAt), 'MMM d · HH:mm') : ''}
              />
              <MetricCard
                label="Created"
                value={format(new Date(data.url.createdAt), 'MMM d, yyyy')}
                sub={`${Math.floor((Date.now() - new Date(data.url.createdAt)) / 86400000)} days active`}
              />
            </div>

            {/* Daily chart */}
            <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: '14px 16px', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>Daily clicks</div>
                {/* 7d / 30d toggle */}
                <div style={{ display: 'flex', gap: 4, background: 'var(--bg)', borderRadius: 8, padding: 3 }}>
                  {[7, 30].map((d) => (
                    <button
                      key={d}
                      onClick={() => setRange(d)}
                      style={{
                        fontSize: 11, padding: '3px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
                        background: range === d ? 'var(--pink)' : 'transparent',
                        color:      range === d ? '#fff'       : 'var(--text2)',
                        fontFamily: 'inherit',
                      }}
                    >
                      {d}d
                    </button>
                  ))}
                </div>
              </div>

              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10, fill: 'var(--text3)' }}
                    tickLine={false}
                    axisLine={false}
                    interval={range === 30 ? 4 : 0}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: 'var(--text3)' }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{ background: 'var(--bg2)', border: '0.5px solid var(--border)', borderRadius: 8, fontSize: 12, color: 'var(--text)' }}
                    cursor={{ fill: 'rgba(212,83,126,0.08)' }}
                  />
                  <Bar dataKey="clicks" fill="var(--pink)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Visit history */}
            <div className="ls-card" style={{ padding: '14px 16px' }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 12 }}>Visit history</div>

              {data.recentVisits.length === 0 ? (
                <div style={{ fontSize: 13, color: 'var(--text3)', textAlign: 'center', padding: '16px 0' }}>No visits recorded yet</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['Timestamp', 'Device', 'Browser', 'OS'].map((h) => (
                        <th key={h} style={{ fontSize: 11, color: 'var(--text3)', textAlign: 'left', padding: '0 0 8px', fontWeight: 500 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentVisits.map((v) => (
                      <tr key={v._id}>
                        <td style={{ fontSize: 12, color: 'var(--text)', padding: '7px 0', borderTop: '0.5px solid var(--border)' }}>
                          {format(new Date(v.visitedAt), 'MMM d · HH:mm')}
                        </td>
                        <td style={{ fontSize: 12, color: 'var(--text2)', padding: '7px 0', borderTop: '0.5px solid var(--border)' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
                            <i
                              className={`ti ${v.device === 'mobile' ? 'ti-device-mobile' : 'ti-device-desktop'}`}
                              aria-hidden="true"
                              style={{ fontSize: 12, color: v.device === 'mobile' ? 'var(--teal)' : 'var(--pink)' }}
                            />
                            {v.device === 'mobile' ? 'Mobile' : 'Desktop'}
                          </span>
                        </td>
                        <td style={{ fontSize: 12, color: 'var(--text2)', padding: '7px 0', borderTop: '0.5px solid var(--border)' }}>
                          <span className="ls-badge ls-badge-gray">{v.browser}</span>
                        </td>
                        <td style={{ fontSize: 12, color: 'var(--text2)', padding: '7px 0', borderTop: '0.5px solid var(--border)' }}>
                          {v.os}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {data.recentVisits.length > 0 && (
                <div style={{ textAlign: 'center', paddingTop: 12, fontSize: 12, color: 'var(--text3)' }}>
                  Showing {data.recentVisits.length} of {data.totalClicks} visits
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
