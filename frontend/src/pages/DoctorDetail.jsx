import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doctorAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

function Stars({ rating = 0 }) {
  return (
    <div style={{color:'#f59e0b', fontSize: 14, letterSpacing: 2}}>
      {[1, 2, 3, 4, 5].map(s => <span key={s}>{s <= rating ? '★' : '☆'}</span>)}
    </div>
  );
}

export default function DoctorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [doctor, setDoctor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('about');

  useEffect(() => {
    Promise.all([doctorAPI.getById(id), doctorAPI.getReviews(id)])
      .then(([dRes, rRes]) => { setDoctor(dRes.data); setReviews(rRes.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading-center" style={{ minHeight: '60vh' }}><div className="spinner" /></div>;
  if (!doctor) return <div className="page-container"><p>Doctor not found.</p></div>;

  const isAdmin = user?.role === 'ADMIN';

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '32px 0 60px' }}>
      
      {/* Header / Breadcrumbs */}
      <div className="search-page-header" style={{ marginBottom: 32, padding: '24px 0', borderBottom: 'none', background: 'transparent', maxWidth: 1200, margin: '0 auto' }}>
        <div className="search-breadcrumbs">
          <Link to="/" style={{color:'inherit',textDecoration:'none'}}>Home</Link> <span>›</span>
          <Link to="/doctors" style={{color:'inherit',textDecoration:'none'}}>Find Doctor</Link> <span>›</span>
          <span>{doctor.specialization}</span> <span>›</span>
          <span className="active">Dr. {doctor.firstName} {doctor.lastName}</span>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 360px', gap: 32, alignItems: 'start' }} className="search-layout">
        
        {/* Left Column: Doctor Profile & Content */}
        <div>
          {/* Main Profile Card */}
          <div className="card" style={{ padding: 32, borderRadius: 24, marginBottom: 24, display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <div style={{ width: 120, height: 120, borderRadius: 20, background: '#0ea5e9', color: '#fff', fontSize: 40, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', textTransform: 'uppercase', flexShrink: 0 }}>
              {doctor.firstName?.[0]}{doctor.lastName?.[0]}
            </div>
            
            <div style={{ flex: 1, minWidth: 250 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <div>
                  <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 28, fontWeight: 900, color: '#0f172a', marginBottom: 4 }}>Dr. {doctor.firstName} {doctor.lastName}</h1>
                  <div style={{ color: '#0369a1', fontWeight: 600, fontSize: 15 }}>{doctor.specialization || 'General Practice'}</div>
                </div>
                <span style={{ background: doctor.available ? '#d1fae5' : '#fee2e2', color: doctor.available ? '#059669' : '#dc2626', padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700 }}>
                  {doctor.available ? '● Available' : '● Unavailable'}
                </span>
              </div>
              
              <div style={{ display: 'flex', gap: 20, fontSize: 14, color: '#64748b', marginTop: 16, marginBottom: 16, flexWrap: 'wrap' }}>
                <span style={{ display:'flex', alignItems:'center', gap:6 }}><span style={{fontSize:16}}>💼</span> {doctor.experienceYears || '12'} Years Exp.</span>
                <span style={{ display:'flex', alignItems:'center', gap:6 }}><span style={{fontSize:16}}>🏥</span> {doctor.hospital || 'MediBook Clinic'}</span>
                <span style={{ display:'flex', alignItems:'center', gap:6 }}><span style={{fontSize:16}}>📍</span> {doctor.location || 'New Delhi, India'}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ background: '#fffbeb', padding: '4px 8px', borderRadius: 8 }}><Stars rating={Math.round(doctor.rating || 4.8)} /></span>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{doctor.rating ? doctor.rating.toFixed(1) : '4.8'}</span>
                <span style={{ fontSize: 13, color: '#94a3b8' }}>({doctor.totalReviews || 124} Patient Reviews)</span>
              </div>
            </div>
          </div>

          {/* Details Tabs */}
          <div className="card" style={{ padding: '8px 8px', borderRadius: 16, marginBottom: 24, display: 'inline-flex', background: '#fff' }}>
            {['about', 'schedule', 'reviews'].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: '10px 24px', borderRadius: 12, border: 'none', cursor: 'pointer',
                background: tab === t ? '#0ea5e9' : 'transparent',
                color: tab === t ? 'white' : '#64748b',
                fontWeight: 600, fontSize: 14, transition: 'all 0.2s', textTransform: 'capitalize'
              }}>{t}</button>
            ))}
          </div>

          {/* Details Content */}
          <div className="card" style={{ padding: 32, borderRadius: 24, minHeight: 300 }}>
            {tab === 'about' && (
              <div className="fade-in">
                <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16, color: '#0f172a' }}>About Dr. {doctor.lastName}</h3>
                <p style={{ color: '#475569', fontSize: 15, lineHeight: 1.8, marginBottom: 24 }}>
                  {doctor.bio || `Dr. ${doctor.firstName} ${doctor.lastName} is a highly experienced ${doctor.specialization} dedicated to providing top-notch medical care. With over ${doctor.experienceYears || 10} years of experience, they have established a strong reputation for accurate diagnoses and compassionate patient care at ${doctor.hospital || 'their clinic'}.`}
                </p>
                
                <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16, color: '#0f172a' }}>Professional Details</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <div style={{ background: '#f8fafc', padding: 16, borderRadius: 12 }}>
                    <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Qualification</div>
                    <div style={{ fontSize: 15, color: '#0f172a', fontWeight: 600 }}>{doctor.qualification || 'MBBS, MD'}</div>
                  </div>
                  <div style={{ background: '#f8fafc', padding: 16, borderRadius: 12 }}>
                    <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Spoken Languages</div>
                    <div style={{ fontSize: 15, color: '#0f172a', fontWeight: 600 }}>English, Hindi</div>
                  </div>
                </div>
              </div>
            )}

            {tab === 'schedule' && (
              <div className="fade-in">
                <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16, color: '#0f172a' }}>Clinic Schedule</h3>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 32 }}>
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                    const active = (doctor.availableDays || []).includes(day);
                    return (
                      <span key={day} style={{
                        padding: '8px 16px', borderRadius: 100, fontSize: 13, fontWeight: active ? 700 : 500,
                        background: active ? '#e0f2fe' : '#f1f5f9', color: active ? '#0369a1' : '#94a3b8',
                      }}>{day.slice(0, 3)}</span>
                    )
                  })}
                </div>

                <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16, color: '#0f172a' }}>Consultation Timings</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 12 }}>
                  {(doctor.timeSlots?.length ? doctor.timeSlots : [{startTime:'09:00 AM',endTime:'01:00 PM'},{startTime:'04:00 PM',endTime:'08:00 PM'}]).map((slot, i) => (
                    <div key={i} style={{ padding: '12px', background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 12, fontSize: 13, fontWeight: 700, color: '#334155', textAlign: 'center' }}>
                      {slot.startTime} – {slot.endTime}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === 'reviews' && (
              <div className="fade-in">
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>Patient Feedback</h3>
                  <div style={{ display:'flex', alignItems:'center', gap:8, background:'#fffbeb', padding:'6px 16px', borderRadius:100 }}>
                    <span style={{ fontSize:16, color:'#f59e0b', fontWeight:800 }}>{doctor.rating ? doctor.rating.toFixed(1) : '4.8'}</span>
                    <span style={{ fontSize:13, color:'#b45309', fontWeight:600 }}>Overall Rating</span>
                  </div>
                </div>

                {reviews.length === 0 ? (
                  <div className="empty-state" style={{ background: '#f8fafc', borderRadius: 16, padding: '40px 20px' }}>
                    <div style={{ fontSize: 40, opacity: 0.5, marginBottom: 10 }}>💬</div>
                    <h3 style={{ fontSize: 16 }}>No reviews yet</h3>
                    <p>Be the first to share your experience with Dr. {doctor.lastName}.</p>
                  </div>
                ) : reviews.map((r, i) => (
                  <div key={r.id} style={{ padding: '20px', border: '1.5px solid #e2e8f0', borderRadius: 16, marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#f1f5f9', display:'flex', alignItems:'center', justifyContent:'center', fontSize: 16, color:'#64748b', fontWeight:700 }}>
                          {r.patientName[0]}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{r.patientName}</div>
                          <div style={{ fontSize: 12, color: '#94a3b8' }}>Verified Patient</div>
                        </div>
                      </div>
                      <Stars rating={r.rating} />
                    </div>
                    <p style={{ color: '#475569', fontSize: 14, lineHeight: 1.6 }}>"{r.comment}"</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Sticky Booking / Price Widget */}
        <div style={{ position: 'sticky', top: 100 }}>
          <div className="card" style={{ padding: 32, borderRadius: 24, textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: '#e0f2fe', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize: 24, marginBottom: 16, color:'#0284c7' }}>
              💶
            </div>
            <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Consultation Fee</div>
            <div style={{ fontSize: 36, fontWeight: 900, color: '#0f172a', marginBottom: 24, fontFamily: 'Fraunces, serif' }}>
              ₹{doctor.consultationFee || '500'}
            </div>
            
            <div style={{ background: '#f8fafc', borderRadius: 12, padding: 16, textAlign: 'left', marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <span style={{ fontSize: 18 }}>🏥</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#334155' }}>In-Clinic Visit</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 18 }}>💻</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#334155' }}>Video Consultation</span>
              </div>
            </div>

            {isAdmin ? (
               <button className="btn btn-full" disabled style={{ padding: 16, borderRadius: 14, background: '#f1f5f9', color: '#94a3b8', fontSize: 15 }}>
               Admin View Only
             </button>
            ) : doctor.available ? (
              <Link to={`/book/${doctor.id}`} className="btn btn-primary btn-full" style={{ padding: 16, borderRadius: 14, fontSize: 15, boxShadow: '0 8px 24px rgba(3,105,161,.25)' }}>
                Book Appointment
              </Link>
            ) : (
              <button className="btn btn-full" disabled style={{ padding: 16, borderRadius: 14, background: '#fee2e2', color: '#dc2626', fontSize: 15, fontWeight: 700 }}>
                Doctor Unavailable
              </button>
            )}
            
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 16 }}>
              Instant confirmation • No booking fees
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
