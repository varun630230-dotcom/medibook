import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

function PasswordStrength({ pwd }) {
  const score = [pwd.length >= 6, pwd.length >= 10, /[A-Z]/.test(pwd), /[0-9]/.test(pwd), /[^a-zA-Z0-9]/.test(pwd)].filter(Boolean).length;
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  const colors = ['#e2e8f0','#ef4444','#f59e0b','#eab308','#10b981','#0ea5e9'];
  if (!pwd) return null;
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ display: 'flex', gap: 3 }}>
        {[1,2,3,4,5].map(i => <div key={i} style={{ flex:1, height:4, borderRadius:2, background: i<=score ? colors[score] : '#e2e8f0', transition:'background .3s' }} />)}
      </div>
      <span style={{ fontSize: 11, color: colors[score], fontWeight: 700, marginTop: 4, display: 'block' }}>{labels[score]}</span>
    </div>
  );
}

export default function Register() {
  const { login } = useAuth();
  const [form, setForm] = useState({ firstName:'', lastName:'', email:'', password:'', phone:'', gender:'', dateOfBirth:'', role:'PATIENT' });
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const ch = e => setForm(p => ({...p, [e.target.name]: e.target.value}));

  const handleSubmit = async e => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const res = await authAPI.register(form);
      login(res.data);
      toast.success('Account created! Welcome to MediBook 🎉');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-container">
      {/* Left Form Panel */}
      <div className="auth-left">
        <div className="auth-form-wrapper" style={{ maxWidth: 480 }}>
          <Link to="/" className="auth-logo">
            <div className="logo-icon">+</div>
            <span>MediBook</span>
          </Link>

          <div className="auth-header">
            <h1>Create your account</h1>
            <p>Join MediBook — it's free</p>
          </div>

          {/* Role Toggle */}
          <div className="auth-role-toggle">
            <button 
              type="button"
              className={form.role === 'PATIENT' ? 'active' : ''} 
              onClick={() => setForm(p => ({...p, role: 'PATIENT'}))}
            >
              <span className="icon">🤒</span> Patient
            </button>
            <button 
              type="button"
              className={form.role === 'DOCTOR' ? 'active' : ''} 
              onClick={() => setForm(p => ({...p, role: 'DOCTOR'}))}
            >
              <span className="icon">👨‍⚕️</span> Doctor
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form" style={{ gap: 12 }}>
            <div className="auth-grid">
              <div className="input-group">
                <span className="input-icon">👤</span>
                <input name="firstName" placeholder="First Name *" value={form.firstName} onChange={ch} required />
              </div>
              <div className="input-group">
                <span className="input-icon">👤</span>
                <input name="lastName" placeholder="Last Name *" value={form.lastName} onChange={ch} required />
              </div>
            </div>

            <div className="input-group">
              <span className="input-icon">✉️</span>
              <input type="email" name="email" placeholder="Email Address *" value={form.email} onChange={ch} required autoComplete="email" />
            </div>

            <div className="input-group" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
              <div style={{ position: 'relative', width: '100%' }}>
                <span className="input-icon" style={{ top: 15 }}>🔒</span>
                <input type={showPwd ? 'text' : 'password'} name="password" placeholder="Password (Min. 6 characters) *" value={form.password} onChange={ch} required autoComplete="new-password" style={{ paddingRight: 40 }} />
                <button type="button" onClick={() => setShowPwd(!showPwd)} style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#94a3b8'
                }}>
                  {showPwd ? '🙈' : '👁️'}
                </button>
              </div>
              <PasswordStrength pwd={form.password} />
            </div>

            <div className="auth-grid">
              <div className="input-group">
                <span className="input-icon">📞</span>
                <input name="phone" placeholder="Phone Number" value={form.phone} onChange={ch} />
              </div>
              <div className="input-group">
                <span className="input-icon">⚧️</span>
                <select name="gender" value={form.gender} onChange={ch}>
                  <option value="">Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="input-group">
              <span className="input-icon">🎂</span>
              <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={ch} max={new Date().toISOString().split('T')[0]} />
            </div>

            <div className="auth-actions" style={{ marginTop: 16 }}>
              <button type="submit" className="btn-login" disabled={loading} style={{ width: '100%' }}>
                {loading ? 'Creating...' : `Create ${form.role==='DOCTOR' ? 'Doctor' : 'Patient'} Account`}
              </button>
            </div>
          </form>

          <p className="auth-footer">
            Already have an account? <Link to="/login">Sign in ↗</Link>
          </p>
        </div>
      </div>


    </div>
  );
}
