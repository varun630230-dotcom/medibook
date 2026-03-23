import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { appointmentAPI } from '../services/api';

const STATUS_CONFIG = {
  PENDING:   { bg:'#fef3c7', color:'#92400e', dot:'#f59e0b', label:'Pending' },
  CONFIRMED: { bg:'#d1fae5', color:'#065f46', dot:'#10b981', label:'Confirmed' },
  CANCELLED: { bg:'#fee2e2', color:'#991b1b', dot:'#ef4444', label:'Cancelled' },
  COMPLETED: { bg:'#e0f2fe', color:'#075985', dot:'#0ea5e9', label:'Completed' },
};

export default function PatientDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    appointmentAPI.getPatientAppointments(user.id)
      .then(r => setAppointments(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user.id]);

  const upcoming = appointments.filter(a => ['PENDING','CONFIRMED'].includes(a.status)).slice(0, 5);
  const stats = [
    { label:'Total', value: appointments.length, icon:'📋', color:'#0369a1', bg:'#e0f2fe' },
    { label:'Confirmed', value: appointments.filter(a=>a.status==='CONFIRMED').length, icon:'✅', color:'#059669', bg:'#d1fae5' },
    { label:'Completed', value: appointments.filter(a=>a.status==='COMPLETED').length, icon:'🎉', color:'#6366f1', bg:'#ede9fe' },
    { label:'Cancelled', value: appointments.filter(a=>a.status==='CANCELLED').length, icon:'❌', color:'#dc2626', bg:'#fee2e2' },
  ];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="page-container fade-in">
      {/* Welcome Banner */}
      <div className="welcome-banner" style={{ marginBottom: 28, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:16 }}>
        <div style={{ position:'relative' }}>
          <div style={{ fontSize:13, opacity:.8, marginBottom:6 }}>
            {new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long' })}
          </div>
          <h1 style={{ fontFamily:'Fraunces, serif', fontSize:26, fontWeight:900, marginBottom:6, letterSpacing:'-.01em' }}>
            {greeting}, {user?.firstName}! 👋
          </h1>
          <p style={{ opacity:.85, fontSize:14 }}>Here's your health overview for today</p>
        </div>
        <Link to="/doctors" className="btn" style={{
          background:'rgba(255,255,255,.95)', color:'#0369a1', fontWeight:700, fontSize:13,
          boxShadow:'0 4px 14px rgba(0,0,0,.12)', borderRadius:12, flexShrink:0,
        }}>+ Book Appointment</Link>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:28 }} className="stats-grid stagger">
        {loading ? [1,2,3,4].map(i => (
          <div key={i} className="stat-card" style={{height:88}}>
            <div className="skeleton" style={{height:16,width:'60%',marginBottom:8}} />
            <div className="skeleton" style={{height:28,width:'40%'}} />
          </div>
        )) : stats.map(s => (
          <div key={s.label} className="stat-card fade-in-up">
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ width:44, height:44, borderRadius:13, background:s.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:21, flexShrink:0 }}>{s.icon}</div>
              <div>
                <div style={{ fontSize:26, fontWeight:800, color:s.color, lineHeight:1 }}>{s.value}</div>
                <div style={{ fontSize:12, color:'#64748b', marginTop:3 }}>{s.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upcoming appointments */}
      <div className="card" style={{ marginBottom:22 }}>
        <div className="card-header">
          <div>
            <div className="section-title">Upcoming Appointments</div>
            <div className="section-subtitle">{upcoming.length} scheduled</div>
          </div>
          <Link to="/appointments" className="btn btn-ghost btn-sm" style={{color:'#0369a1', fontWeight:700}}>View All →</Link>
        </div>
        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : upcoming.length === 0 ? (
          <div className="empty-state">
            <div style={{fontSize:44}}>📅</div>
            <h3>No upcoming appointments</h3>
            <p>Book with a top-rated doctor today</p>
            <Link to="/doctors" className="btn btn-primary btn-sm" style={{marginTop:16}}>Find a Doctor</Link>
          </div>
        ) : (
          <div style={{ padding:'0 8px 10px' }}>
            {upcoming.map((appt, i) => {
              const sc = STATUS_CONFIG[appt.status] || STATUS_CONFIG.PENDING;
              return (
                <div key={appt.id} style={{
                  display:'flex', alignItems:'center', gap:14, padding:'13px 16px',
                  borderRadius:12, transition:'background .18s', animation:`fadeInUp .35s ease ${i*60}ms both`,
                }}
                  onMouseEnter={e=>e.currentTarget.style.background='#f8fafc'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <div style={{ width:42, height:42, borderRadius:12, background:'linear-gradient(135deg,#e0f2fe,#bae6fd)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:19, flexShrink:0 }}>👨‍⚕️</div>
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{fontWeight:700, fontSize:14, color:'#0f172a'}}>Dr. {appt.doctorName}</div>
                    <div style={{fontSize:12, color:'#64748b', marginTop:2}}>{appt.doctorSpecialization} · {appt.appointmentDate} at {appt.appointmentTime}</div>
                  </div>
                  <div style={{display:'flex', gap:7, alignItems:'center', flexShrink:0}}>
                    <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 10px', borderRadius:999, background:sc.bg, color:sc.color, fontSize:11.5, fontWeight:700 }}>
                      <span style={{width:6,height:6,borderRadius:'50%',background:sc.dot,flexShrink:0}} /> {sc.label}
                    </span>
                    <span style={{ fontSize:11, color:'#94a3b8', padding:'3px 9px', background:'#f1f5f9', borderRadius:7, fontWeight:500 }}>
                      {appt.type?.replace('_',' ')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:22 }} className="quick-grid">
        {[
          { to:'/doctors', icon:'🔍', title:'Find Doctors', desc:'Browse specialists', color:'#0369a1', bg:'#e0f2fe' },
          { to:'/appointments', icon:'📋', title:'My Appointments', desc:'View all bookings', color:'#059669', bg:'#d1fae5' },
          { to:'/profile', icon:'👤', title:'My Profile', desc:'Update your info', color:'#6366f1', bg:'#ede9fe' },
        ].map((l, i) => (
          <Link key={l.to} to={l.to} style={{
            textDecoration:'none', background:'#fff', borderRadius:18, padding:'20px',
            border:'1px solid #e2e8f0', transition:'all .2s',
            boxShadow:'0 1px 4px rgba(0,0,0,.04)',
            animation:`fadeInUp .4s ease ${i*80}ms both`,
          }}
            onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.borderColor=l.color;e.currentTarget.style.boxShadow='0 6px 20px rgba(0,0,0,.08)';}}
            onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.borderColor='#e2e8f0';e.currentTarget.style.boxShadow='0 1px 4px rgba(0,0,0,.04)';}}>
            <div style={{width:44,height:44,borderRadius:13,background:l.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:21,marginBottom:12}}>{l.icon}</div>
            <div style={{fontWeight:700,fontSize:14,color:'#0f172a'}}>{l.title}</div>
            <div style={{fontSize:12,color:'#64748b',marginTop:3}}>{l.desc}</div>
          </Link>
        ))}
      </div>

      {/* Help */}
      <div className="card">
        <div className="card-header"><div className="section-title">🎧 Help & Support</div></div>
        <div style={{padding:24, display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:20}}>
          <div style={{background:'#f8fafc',padding:20,borderRadius:14,border:'1px solid #e2e8f0'}}>
            <h3 style={{fontSize:14,fontWeight:700,color:'#0f172a',marginBottom:10}}>24/7 Helpline</h3>
            <p style={{color:'#64748b',fontSize:13,marginBottom:14,lineHeight:1.6}}>Our support team is available any time for urgent queries.</p>
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <div style={{width:42,height:42,background:'#e0f2fe',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',fontSize:19}}>📞</div>
              <div>
                <div style={{fontSize:11,color:'#94a3b8',fontWeight:600,textTransform:'uppercase',letterSpacing:.5}}>Toll-Free</div>
                <div style={{fontSize:20,fontWeight:800,color:'#0369a1',marginTop:1}}>1800-123-4567</div>
              </div>
            </div>
          </div>
          <div style={{background:'#f8fafc',padding:20,borderRadius:14,border:'1px solid #e2e8f0'}}>
            <h3 style={{fontSize:14,fontWeight:700,color:'#0f172a',marginBottom:14}}>How to Book</h3>
            {['Click "Find Doctors" and search for a specialist.','Select a doctor and tap "Book Appointment".','Pick a date, choose a time slot, add symptoms & confirm.'].map((t,i) => (
              <div key={i} style={{display:'flex',gap:10,alignItems:'flex-start',marginBottom:12}}>
                <span style={{background:'#0369a1',color:'#fff',width:22,height:22,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800,flexShrink:0}}>{i+1}</span>
                <span style={{fontSize:13,color:'#334155',lineHeight:1.55}}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .stats-grid { grid-template-columns: repeat(2,1fr) !important; }
          .quick-grid  { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
