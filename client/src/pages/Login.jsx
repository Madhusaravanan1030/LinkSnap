import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Login() {
  const { login }  = useAuth();
  const navigate   = useNavigate();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [errors,   setErrors]   = useState({});
  const [serverErr,setServerErr] = useState('');
  const [loading,  setLoading]  = useState(false);

  function validate() {
    const e = {};
    if (!email.trim())    e.email    = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email address';
    if (!password)        e.password = 'Password is required';
    return e;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    setServerErr('');
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.user, res.data.token);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setServerErr(err.response?.data?.error || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px',
    }}>
      <div className="ls-card" style={{ width: '100%', maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--pink)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
          <i className="ti ti-link" aria-hidden="true" />
          LinkSnap
        </div>

        <div style={{ fontSize: 18, fontWeight: 500, color: 'var(--text)', marginBottom: 4 }}>Welcome back</div>
        <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 20 }}>Sign in to your account</div>

        {serverErr && (
          <div style={{
            background: 'rgba(226,75,74,0.12)', border: '0.5px solid rgba(226,75,74,0.3)',
            borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#F09595', marginBottom: 16,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <i className="ti ti-alert-circle" aria-hidden="true" />
            {serverErr}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>Email</label>
            <input
              className={`ls-input${errors.email ? ' ls-input-error' : ''}`}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: '' })); }}
              autoComplete="email"
            />
            {errors.email && <div style={{ fontSize: 11, color: '#F09595', marginTop: 4 }}><i className="ti ti-alert-circle" style={{ fontSize: 11 }} /> {errors.email}</div>}
          </div>

          {/* Password */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>Password</label>
            <input
              className={`ls-input${errors.password ? ' ls-input-error' : ''}`}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: '' })); }}
              autoComplete="current-password"
            />
            {errors.password && <div style={{ fontSize: 11, color: '#F09595', marginTop: 4 }}><i className="ti ti-alert-circle" style={{ fontSize: 11 }} /> {errors.password}</div>}
          </div>

          <button className="ls-btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '10px', fontSize: 14 }}>
            {loading ? <><div className="ls-spinner" />Signing in...</> : 'Sign in'}
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--text3)', marginTop: 14 }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--pink)', textDecoration: 'none' }}>Register</Link>
        </div>
      </div>
    </div>
  );
}
