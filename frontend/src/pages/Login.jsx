import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('PATIENT');

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
    <div className="auth-container">
      {/* Left Form Panel */}
      <div className="auth-left">
        <div className="auth-form-wrapper">
          <Link to="/" className="auth-logo">
            <div className="logo-icon">+</div>
            <span>MediBook</span>
          </Link>

          <div className="auth-header" style={{ marginBottom: 32 }}>
            <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 32, fontWeight: 900, color: '#0f172a', marginBottom: 8 }}>Welcome Back 👋</h1>
            <p style={{ color: '#64748b', fontSize: 15 }}>Log in to manage your appointments and health records securely.</p>
          </div>

          {/* Role Toggle */}
          <div className="auth-role-toggle">
            <button 
              type="button"
              className={role === 'PATIENT' ? 'active' : ''} 
              onClick={() => setRole('PATIENT')}
            >
              <span className="icon">🤒</span> Patient
            </button>
            <button 
              type="button"
              className={role === 'DOCTOR' ? 'active' : ''} 
              onClick={() => setRole('DOCTOR')}
            >
              <span className="icon">👨‍⚕️</span> Doctor
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="input-group">
              <span className="input-icon">✉️</span>
              <input 
                type="email" 
                placeholder="Email" 
                value={form.email}
                onChange={e => setForm(p => ({...p, email: e.target.value}))}
                required 
              />
            </div>

            <div className="input-group">
              <span className="input-icon">🔒</span>
              <input 
                type="password" 
                placeholder="Password" 
                value={form.password}
                onChange={e => setForm(p => ({...p, password: e.target.value}))}
                required 
              />
            </div>

            <div className="auth-actions" style={{ marginTop: 24 }}>
              <button type="submit" className="btn-login" disabled={loading} style={{ width: '100%', padding: '14px', fontSize: 16, fontWeight: 700, borderRadius: 12, background: 'linear-gradient(135deg, #4f46e5, #6366f1)', color: '#fff', border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)' }}>
                {loading ? 'Logging in...' : 'Log in to Account'}
              </button>
              <button type="button" className="btn-google">
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" width="18" />
                Google
              </button>
            </div>
          </form>

          <p className="auth-footer">
            Don't have an account? <Link to="/register">Create account ↗</Link>
          </p>
        </div>
      </div>

    </div>
  );
}
