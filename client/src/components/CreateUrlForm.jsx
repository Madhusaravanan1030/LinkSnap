import { useState } from 'react';
import api from '../api/axios';

export default function CreateUrlForm({ onCreated }) {
  const [longUrl,     setLongUrl]     = useState('');
  const [alias,       setAlias]       = useState('');
  const [expiresAt,   setExpiresAt]   = useState('');
  const [loading,     setLoading]     = useState(false);
  const [errors,      setErrors]      = useState({});
  const [serverError, setServerError] = useState('');

  function validate() {
    const e = {};
    if (!longUrl.trim()) {
      e.longUrl = 'URL is required';
    } else {
      try { new URL(longUrl); } catch { e.longUrl = 'Enter a valid URL (include https://)'; }
    }
    if (alias && !/^[a-zA-Z0-9_-]{3,30}$/.test(alias)) {
      e.alias = 'Alias must be 3–30 chars (letters, numbers, hyphens only)';
    }
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError('');
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);

    try {
      const payload = { originalUrl: longUrl };
      if (alias)     payload.customAlias = alias;
      if (expiresAt) payload.expiresAt   = expiresAt;

      const res = await api.post('/urls', payload);
      onCreated(res.data);
      setLongUrl(''); setAlias(''); setExpiresAt('');
    } catch (err) {
      setServerError(err.response?.data?.error || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleClear() {
    setLongUrl(''); setAlias(''); setExpiresAt('');
    setErrors({}); setServerError('');
  }

  return (
    <div className="ls-card" style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)', marginBottom: 16 }}>
        Shorten a URL
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {/* Long URL */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>
            Long URL <span style={{ color: '#F09595' }}>*</span>
          </label>
          <input
            className={`ls-input${errors.longUrl ? ' ls-input-error' : ''}`}
            type="url"
            placeholder="https://your-very-long-url.com/goes/here"
            value={longUrl}
            onChange={(e) => { setLongUrl(e.target.value); setErrors((p) => ({ ...p, longUrl: '' })); }}
          />
          {errors.longUrl && (
            <div style={{ fontSize: 11, color: '#F09595', marginTop: 4 }}>
              <i className="ti ti-alert-circle" aria-hidden="true" style={{ fontSize: 11 }} /> {errors.longUrl}
            </div>
          )}
        </div>

        {/* Custom alias + expiry — side by side */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          {/* Alias */}
          <div>
            <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>
              Custom alias <span style={{ color: 'var(--text3)' }}>(optional)</span>
            </label>
            <div style={{
              display: 'flex', alignItems: 'center',
              background: 'var(--bg3)', border: `0.5px solid ${errors.alias ? 'var(--red)' : 'var(--border)'}`,
              borderRadius: 9, overflow: 'hidden',
            }}>
              <span style={{ fontSize: 12, color: 'var(--text3)', padding: '10px 10px 10px 14px', borderRight: '0.5px solid var(--border)', whiteSpace: 'nowrap' }}>
                lnk.snap/
              </span>
              <input
                style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--text)', fontSize: 13, padding: '10px 12px', width: '100%', fontFamily: 'inherit' }}
                placeholder="my-link"
                value={alias}
                onChange={(e) => { setAlias(e.target.value); setErrors((p) => ({ ...p, alias: '' })); }}
              />
            </div>
            {errors.alias && (
              <div style={{ fontSize: 11, color: '#F09595', marginTop: 4 }}>{errors.alias}</div>
            )}
          </div>

          {/* Expiry */}
          <div>
            <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>
              Expiry date <span style={{ color: 'var(--text3)' }}>(optional)</span>
            </label>
            <input
              className="ls-input"
              type="date"
              style={{ colorScheme: 'dark' }}
              value={expiresAt}
              min={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setExpiresAt(e.target.value)}
            />
          </div>
        </div>

        {/* Server error */}
        {serverError && (
          <div style={{ fontSize: 12, color: '#F09595', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <i className="ti ti-alert-circle" aria-hidden="true" />
            {serverError}
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="ls-btn-primary" type="submit" disabled={loading} style={{ padding: '9px 22px', fontSize: 14 }}>
            {loading ? (
              <><div className="ls-spinner" />Shortening...</>
            ) : (
              <><i className="ti ti-scissors" aria-hidden="true" style={{ fontSize: 14 }} />Shorten</>
            )}
          </button>
          <button className="ls-btn-secondary" type="button" onClick={handleClear}>
            Clear
          </button>
        </div>
      </form>
    </div>
  );
}
