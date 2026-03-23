import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.login(form);
      login(res.data);
      toast.success(`Welcome back, ${res.data.firstName}! 👋`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid email or password');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      {/* Left decorative panel */}
      <div style={{
        flex: '0 0 44%', background: 'linear-gradient(160deg, #0369a1 0%, #0ea5e9 55%, #38bdf8 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 52px',
        position: 'relative', overflow: 'hidden',
      }} className="auth-panel">
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 80% 20%, rgba(255,255,255,.12), transparent 60%)', pointerEvents: 'none' }} />
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 60, position: 'relative' }}>
          <div style={{ width: 40, height: 40, background: 'rgba(255,255,255,.2)', backdropFilter: 'blur(8px)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, border: '1px solid rgba(255,255,255,.3)' }}>🏥</div>
          <span style={{ fontFamily: 'Fraunces, serif', fontWeight: 900, fontSize: 22, color: '#fff' }}>MediBook</span>
        </div>
        <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 36, fontWeight: 900, color: '#fff', lineHeight: 1.15, marginBottom: 20, position: 'relative' }}>
          Your health journey starts here.
        </h2>
        <p style={{ color: 'rgba(255,255,255,.8)', fontSize: 15, lineHeight: 1.7, position: 'relative' }}>
          Connect with verified specialists, book appointments instantly, and take control of your wellbeing.
        </p>
        <div style={{ marginTop: 52, display: 'flex', flexDirection: 'column', gap: 16, position: 'relative' }}>
          {['500+ Verified Doctors', 'Instant Booking', 'Secure & Private'].map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(255,255,255,.9)', fontSize: 14, fontWeight: 500 }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>✓</div>
              {f}
            </div>
          ))}
        </div>
        {/* Decorative circle */}
        <div style={{ position: 'absolute', bottom: -80, right: -80, width: 280, height: 280, borderRadius: '50%', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.08)' }} />
        <div style={{ position: 'absolute', bottom: -20, right: 20, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,.04)' }} />
      </div>

      {/* Right form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 32px', background: '#f8fafc' }}>
        <div style={{ width: '100%', maxWidth: 400, animation: 'fadeIn .4s ease' }}>
          <div style={{ marginBottom: 36 }}>
            <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 30, fontWeight: 900, color: '#0f172a', marginBottom: 6 }}>Welcome back</h1>
            <p style={{ color: '#64748b', fontSize: 15 }}>Sign in to your MediBook account</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" name="email" placeholder="you@email.com" value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className="form-input" required autoComplete="email"
                style={{ background: '#fff', height: 48 }} />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showPwd ? 'text' : 'password'} name="password" placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  className="form-input" required style={{ paddingRight: 46, background: '#fff', height: 48 }} />
                <button type="button" onClick={() => setShowPwd(!showPwd)} style={{
                  position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', fontSize: 17, color: '#94a3b8',
                  padding: 0, lineHeight: 1,
                }}>{showPwd ? '🙈' : '👁️'}</button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}
              style={{ height: 48, fontSize: 15, marginTop: 4 }}>
              {loading ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Signing in...</> : 'Sign In →'}
            </button>
          </form>

          {/* Demo accounts */}
          <div style={{ marginTop: 28, padding: 16, background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: '#94a3b8', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
              Quick Demo Access
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { label: 'Patient', email: 'varun630230@gmail.com', pass: 'varun0779', color: '#0ea5e9' },
                { label: 'Doctor', email: 'rajiv@gmail.com', pass: 'varun0779', color: '#10b981' },
                { label: 'Admin', email: 'admin@gmail.com', pass: 'password123', color: '#8b5cf6' },
              ].map(d => (
                <button key={d.label} onClick={() => setForm({ email: d.email, password: d.pass })}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left',
                    padding: '8px 12px', background: '#f8fafc', border: '1px solid #e2e8f0',
                    borderRadius: 10, cursor: 'pointer', transition: 'all .15s',
                    fontFamily: 'Plus Jakarta Sans, sans-serif',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = d.color; e.currentTarget.style.background = '#fff'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#f8fafc'; }}>
                  <span style={{
                    background: d.color, color: '#fff', padding: '2px 8px',
                    borderRadius: 6, fontSize: 11, fontWeight: 700, flexShrink: 0,
                  }}>{d.label}</span>
                  <span style={{ fontSize: 12.5, color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.email}</span>
                </button>
              ))}
            </div>
          </div>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: '#64748b' }}>
            No account?{' '}
            <Link to="/register" style={{ color: '#0369a1', fontWeight: 700, textDecoration: 'none' }}>Create one free</Link>
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) { .auth-panel { display: none !important; } }
      `}</style>
    </div>
  );
}
