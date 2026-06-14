import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Register() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors]    = useState({});
  const [serverErr, setServerErr] = useState('');
  const [loading, setLoading]  = useState(false);

  function set(field, val) {
    setForm((p) => ({ ...p, [field]: val }));
    setErrors((p) => ({ ...p, [field]: '' }));
  }

  function validate() {
    const e = {};
    if (!form.name.trim())  e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address';
    if (!form.password)     e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (!form.confirm)      e.confirm = 'Please confirm your password';
    else if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
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
      const res = await api.post('/auth/register', {
        name: form.name, email: form.email, password: form.password,
      });
      // Auto-login — no need to redirect to /login
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

        <div style={{ fontSize: 18, fontWeight: 500, color: 'var(--text)', marginBottom: 4 }}>Create account</div>
        <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 20 }}>Start shortening links for free</div>

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
          {[
            { key: 'name',     label: 'Full name',        type: 'text',     ph: 'Arjun Kumar',      hint: '' },
            { key: 'email',    label: 'Email',            type: 'email',    ph: 'you@example.com',  hint: '' },
            { key: 'password', label: 'Password',         type: 'password', ph: '••••••••',          hint: 'Min 6 characters' },
            { key: 'confirm',  label: 'Confirm password', type: 'password', ph: '••••••••',          hint: '' },
          ].map(({ key, label, type, ph, hint }) => (
            <div key={key} style={{ marginBottom: key === 'confirm' ? 18 : 14 }}>
              <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>{label}</label>
              <input
                className={`ls-input${errors[key] ? ' ls-input-error' : ''}`}
                type={type}
                placeholder={ph}
                value={form[key]}
                onChange={(e) => set(key, e.target.value)}
                autoComplete={key === 'confirm' ? 'new-password' : key}
              />
              {errors[key] && (
                <div style={{ fontSize: 11, color: '#F09595', marginTop: 4 }}>
                  <i className="ti ti-alert-circle" style={{ fontSize: 11 }} /> {errors[key]}
                </div>
              )}
              {!errors[key] && hint && (
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>{hint}</div>
              )}
            </div>
          ))}

          <button className="ls-btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '10px', fontSize: 14 }}>
            {loading ? <><div className="ls-spinner" />Creating account...</> : 'Create account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--text3)', marginTop: 14 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--pink)', textDecoration: 'none' }}>Login</Link>
        </div>
      </div>
    </div>
  );
}
