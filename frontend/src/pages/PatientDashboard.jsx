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
  const past = appointments.filter(a => ['COMPLETED','CANCELLED'].includes(a.status)).slice(0, 5);
  
  const stats = [
    { label:'Upcoming Appts', value: appointments.filter(a=>['PENDING','CONFIRMED'].includes(a.status)).length, sub:'Active bookings', icon:'📅', trend:'+2' },
    { label:'Past Visits', value: appointments.filter(a=>a.status==='COMPLETED').length, sub:'Health history', icon:'🏥', trend:'+12%' },
    { label:'Cancelled', value: appointments.filter(a=>a.status==='CANCELLED').length, sub:'Missed', icon:'❌', trend:'-1' },
    { label:'Overall Health', value: 'Good', sub:'Based on recent visits', icon:'❤️', trend:'Stable' },
  ];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="page-container fade-in" style={{ padding: '32px', maxWidth: 1400 }}>
      {/* Top Breadcrumb Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 24 }}>
        <div style={{ display:'flex', alignItems:'center', gap: 8, color: '#0369a1', fontWeight: 700, fontSize: 18 }}>
          <div style={{width:32,height:32,background:'linear-gradient(135deg,#0ea5e9,#0284c7)',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff'}}>+</div>
          Patient Dashboard
        </div>
        <div style={{ display:'flex', gap: 12 }}>
          <Link to="/doctors" className="btn btn-outline" style={{borderRadius: 12}}>Find Doctor</Link>
          <Link to="/appointments" className="btn btn-primary" style={{borderRadius: 12}}>My Bookings</Link>
        </div>
      </div>

      {/* Dark Navy Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        borderRadius: 24, padding: '40px 48px', color: '#fff',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 32, position: 'relative', overflow: 'hidden',
        boxShadow: '0 12px 32px rgba(15, 23, 42, 0.15)'
      }}>
        <div style={{ position:'absolute', right: -60, top: -100, width: 400, height: 400, background: 'radial-gradient(circle, rgba(14,165,233,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, position: 'relative', zIndex: 1 }}>
          <div style={{ width: 80, height: 80, borderRadius: 20, border: '4px solid rgba(255,255,255,0.1)', background: '#0ea5e9', color: '#fff', fontSize: 32, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, textTransform: 'uppercase' }}>
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div>
            <h1 style={{ fontFamily:'Fraunces, serif', fontSize: 32, fontWeight: 900, marginBottom: 8, display:'flex', alignItems:'center', gap:10 }}>
              {greeting}, {user?.firstName} {user?.lastName}
              <span style={{fontSize: 14, background: '#10b981', color: '#fff', padding: '4px 10px', borderRadius: 999, fontWeight: 700, letterSpacing: 0.5}}>VERIFIED PATIENT</span>
            </h1>
            <p style={{ color: '#94a3b8', fontSize: 15 }}>Your health summary & upcoming appointments, always updated.</p>
          </div>
        </div>
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'right' }}>
          <div style={{ fontSize: 14, color: '#94a3b8', marginBottom: 4 }}>Today's Date</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>{new Date().toLocaleDateString('en-US', { weekday:'short', month:'long', day:'numeric' })}</div>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap: 20, marginBottom: 32 }}>
        {stats.map((s, i) => (
          <div key={i} className="card doc-card-h" style={{ padding: 24, display:'flex', flexDirection:'column', gap: 16 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
              <div>
                <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600, marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 32, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{s.value}</div>
              </div>
              <div style={{ fontSize: 24 }}>{s.icon}</div>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', borderTop: '1px solid #f1f5f9', paddingTop: 12 }}>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>{s.sub}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: s.trend.startsWith('-') ? '#ef4444' : '#10b981', background: s.trend.startsWith('-') ? '#fee2e2' : '#d1fae5', padding: '2px 8px', borderRadius: 6 }}>{s.trend}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Split Content */}
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap: 24 }}>
        
        {/* Left Column: Appointments */}
        <div className="card" style={{ borderRadius: 24, padding: 32 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 24 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>Upcoming Appointments</h2>
            <Link to="/appointments" style={{ fontSize: 14, color: '#0369a1', fontWeight: 600, textDecoration: 'none' }}>View All →</Link>
          </div>
          
          {loading ? (
            <div className="loading-center"><div className="spinner"/></div>
          ) : upcoming.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px 20px' }}>
              <div style={{fontSize:40, opacity:0.5}}>📅</div>
              <h3 style={{margin:'10px 0'}}>No upcoming visits</h3>
              <p>You have no scheduled appointments.</p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap: 16 }}>
              {upcoming.map(appt => {
                const sc = STATUS_CONFIG[appt.status];
                return (
                  <div key={appt.id} style={{ display:'flex', alignItems:'center', gap: 20, padding: 20, border: '1px solid #e2e8f0', borderRadius: 16, transition: 'all .2s' }} className="card-hover">
                    <div style={{ width: 56, height: 56, borderRadius: 14, background: '#f1f5f9', color: '#0f172a', fontSize: 20, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', textTransform: 'uppercase', flexShrink: 0 }}>
                      {appt.doctorName?.split(" ")?.[0]?.[0]}{appt.doctorName?.split(" ")?.[1]?.[0] || ""}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>Dr. {appt.doctorName}</div>
                      <div style={{ fontSize: 13, color: '#64748b' }}>{appt.doctorSpecialization} • {appt.type?.replace('_',' ')}</div>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>{appt.appointmentDate} • {appt.appointmentTime}</div>
                      <span style={{ display:'inline-block', padding: '4px 12px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: sc.bg, color: sc.color }}>
                        {sc.label}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right Column: Quick Actions & Health */}
        <div style={{ display:'flex', flexDirection:'column', gap: 24 }}>
          
          <div className="card" style={{ borderRadius: 24, padding: 32, background: 'linear-gradient(135deg, #0ea5e9, #0369a1)', color: '#fff' }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12 }}>Need a Doctor?</h2>
            <p style={{ fontSize: 14, opacity: 0.9, marginBottom: 24 }}>Book an online consultation or clinic visit with verified specialists.</p>
            <Link to="/doctors" className="btn" style={{ background: '#fff', color: '#0369a1', width: '100%', fontSize: 14, padding: 14, borderRadius: 12 }}>
              Book Appointment Now
            </Link>
          </div>

          <div className="card" style={{ borderRadius: 24, padding: 32 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 20 }}>Past Visits</h2>
            {past.length === 0 ? (
               <p style={{ fontSize: 14, color: '#64748b' }}>No past visits recorded.</p>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap: 16 }}>
                {past.slice(0, 3).map(appt => (
                  <div key={appt.id} style={{ display:'flex', alignItems:'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, background: '#f8fafc', borderRadius: 10, display:'flex', alignItems:'center', justifyContent:'center', fontSize: 18 }}>🏥</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Dr. {appt.doctorName}</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>{appt.appointmentDate}</div>
                    </div>
                    <Link to={`/doctors/${appt.doctorId}`} style={{ fontSize: 12, color: '#0369a1', fontWeight: 600, textDecoration: 'none', background: '#e0f2fe', padding: '6px 12px', borderRadius: 8 }}>Rebook</Link>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
