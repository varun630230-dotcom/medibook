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
        {[1,2,3,4,5].map(i => <div key={i} style={{ flex:1, height:3, borderRadius:2, background: i<=score ? colors[score] : '#e2e8f0', transition:'background .3s' }} />)}
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
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 520, animation: 'fadeInUp .4s ease' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, textDecoration: 'none', marginBottom: 24 }}>
            <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #0ea5e9, #0369a1)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🏥</div>
            <span style={{ fontFamily: 'Fraunces, serif', fontWeight: 900, fontSize: 22, color: '#0f172a' }}>MediBook</span>
          </Link>
          <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 28, fontWeight: 900, color: '#0f172a', marginBottom: 6 }}>Create your account</h1>
          <p style={{ color: '#64748b', fontSize: 14 }}>Join MediBook — it's free</p>
        </div>

        <div className="card" style={{ padding: 32, borderRadius: 24 }}>
          {/* Role toggle */}
          <div style={{ display: 'flex', gap: 0, marginBottom: 28, background: '#f1f5f9', borderRadius: 12, padding: 4 }}>
            {[{r:'PATIENT', icon:'🤒', label:'I\'m a Patient'}, {r:'DOCTOR', icon:'👨‍⚕️', label:'I\'m a Doctor'}].map(({r,icon,label}) => (
              <button key={r} onClick={() => setForm(p=>({...p, role:r}))} style={{
                flex:1, padding:'10px', borderRadius:10, border:'none', cursor:'pointer',
                background: form.role===r ? '#fff' : 'transparent',
                color: form.role===r ? '#0369a1' : '#64748b',
                fontWeight: form.role===r ? 700 : 500, fontSize:13,
                boxShadow: form.role===r ? '0 1px 6px rgba(0,0,0,.12)' : 'none',
                transition:'all .2s', fontFamily:'Plus Jakarta Sans, sans-serif',
                display:'flex', alignItems:'center', justifyContent:'center', gap:6,
              }}>{icon} {label}</button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              {[{n:'firstName',label:'First Name',ph:'John'},{n:'lastName',label:'Last Name',ph:'Doe'}].map(f => (
                <div key={f.n} className="form-group">
                  <label className="form-label">{f.label} *</label>
                  <input name={f.n} placeholder={f.ph} value={form[f.n]} onChange={ch} className="form-input" required style={{background:'#fafafa'}} />
                </div>
              ))}
            </div>

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input type="email" name="email" placeholder="you@email.com" value={form.email} onChange={ch} className="form-input" required style={{background:'#fafafa'}} autoComplete="email" />
            </div>

            <div className="form-group">
              <label className="form-label">Password *</label>
              <div style={{ position:'relative' }}>
                <input type={showPwd?'text':'password'} name="password" placeholder="Min. 6 characters" value={form.password} onChange={ch} className="form-input" required style={{paddingRight:44,background:'#fafafa'}} autoComplete="new-password" />
                <button type="button" onClick={()=>setShowPwd(!showPwd)} style={{ position:'absolute', right:12, top:11, background:'none', border:'none', cursor:'pointer', fontSize:17, color:'#94a3b8', padding:0 }}>
                  {showPwd?'🙈':'👁️'}
                </button>
              </div>
              <PasswordStrength pwd={form.password} />
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input name="phone" placeholder="+91 98765 43210" value={form.phone} onChange={ch} className="form-input" style={{background:'#fafafa'}} />
              </div>
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select name="gender" value={form.gender} onChange={ch} className="form-input" style={{background:'#fafafa'}}>
                  <option value="">Select</option>
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Date of Birth</label>
              <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={ch} className="form-input" style={{background:'#fafafa'}} max={new Date().toISOString().split('T')[0]} />
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ height:48, fontSize:15, marginTop:4 }}>
              {loading ? <><span className="spinner" style={{width:18,height:18,borderWidth:2}} /> Creating Account...</> : `Create ${form.role==='DOCTOR'?'Doctor':'Patient'} Account →`}
            </button>
          </form>
        </div>

        <p style={{ textAlign:'center', marginTop:20, fontSize:14, color:'#64748b' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color:'#0369a1', fontWeight:700, textDecoration:'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
