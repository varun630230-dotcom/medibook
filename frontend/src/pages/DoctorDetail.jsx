import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doctorAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

function Stars({ rating = 0, interactive = false, onSet }) {
  return (
    <div className="stars">
      {[1, 2, 3, 4, 5].map(s => (
        <span key={s} className={`star ${s <= rating ? 'filled' : 'empty'}`}
          onClick={() => interactive && onSet && onSet(s)}
          style={{ cursor: interactive ? 'pointer' : 'default', fontSize: 20 }}>
          {s <= rating ? '★' : '☆'}
        </span>
      ))}
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
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    Promise.all([doctorAPI.getById(id), doctorAPI.getReviews(id)])
      .then(([dRes, rRes]) => {
        setDoctor(dRes.data);
        setReviews(rRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading-center" style={{ minHeight: '60vh' }}><div className="spinner" /></div>;
  if (!doctor) return <div className="page-container"><p>Doctor not found.</p></div>;

  const initials = `${doctor.firstName?.[0] || ''}${doctor.lastName?.[0] || ''}`;
  const isAdmin = user?.role === 'ADMIN';

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to remove this doctor? This action cannot be undone.')) return;
    setIsDeleting(true);
    try {
      await doctorAPI.deleteDoctor(id);
      toast.success('Doctor removed successfully');
      navigate('/doctors');
    } catch (err) {
      toast.error('Failed to remove doctor: ' + (err.response?.data?.error || err.message));
      setIsDeleting(false);
    }
  };

  return (
    <div className="page-container fade-in">
      {/* Back */}
      <Link to="/doctors" style={{ color: '#64748b', textDecoration: 'none', fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
        ← Back to Doctors
      </Link>

      {/* Hero Card */}
      <div className="card" style={{ padding: 32, marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div className="avatar" style={{ width: 80, height: 80, fontSize: 28, borderRadius: 20 }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 6 }}>
              <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 700, color: '#0f172a' }}>
                Dr. {doctor.firstName} {doctor.lastName}
              </h1>
              <span style={{
                background: doctor.available ? '#dcfce7' : '#fee2e2',
                color: doctor.available ? '#166534' : '#991b1b',
                fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100
              }}>
                {doctor.available ? '● Available' : '● Unavailable'}
              </span>
            </div>
            <div style={{ color: '#0ea5e9', fontWeight: 700, fontSize: 15, marginBottom: 8 }}>
              {doctor.specialization || 'General Practice'}
            </div>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: 14, color: '#64748b' }}>
              {doctor.qualification && <span>🎓 {doctor.qualification}</span>}
              {doctor.experienceYears > 0 && <span>⏱️ {doctor.experienceYears} years experience</span>}
              {doctor.hospital && <span>🏥 {doctor.hospital}</span>}
              {doctor.location && <span>📍 {doctor.location}</span>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
              <Stars rating={Math.round(doctor.rating || 0)} />
              <span style={{ fontSize: 13, color: '#64748b' }}>
                {doctor.rating ? doctor.rating.toFixed(1) : 'No ratings'} ({doctor.totalReviews || 0} reviews)
              </span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            {doctor.consultationFee > 0 && !isAdmin && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 2 }}>Consultation Fee</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a' }}>₹{doctor.consultationFee}</div>
              </div>
            )}
            {isAdmin ? (
              <button onClick={handleDelete} disabled={isDeleting} className="btn" style={{ background: '#ef4444', color: 'white', fontWeight: 600, padding: '12px 24px', borderRadius: 12, border: 'none', cursor: 'pointer' }}>
                {isDeleting ? 'Removing...' : 'Remove Doctor'}
              </button>
            ) : (
              <Link to={`/book/${doctor.id}`} className="btn btn-primary btn-lg">
                Book Appointment
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ gap: 0, marginBottom: 20, background: 'white', borderRadius: 12, padding: 4, border: '1px solid #e2e8f0', display: 'inline-flex' }}>
        {['about', 'schedule', 'reviews'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer',
            background: tab === t ? '#0ea5e9' : 'transparent',
            color: tab === t ? 'white' : '#64748b',
            fontWeight: 600, fontSize: 13, transition: 'all 0.2s',
            textTransform: 'capitalize', fontFamily: 'DM Sans, sans-serif'
          }}>{t}</button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'about' && (
        <div className="card" style={{ padding: 28 }}>
          {doctor.bio && (
            <>
              <h3 style={{ fontWeight: 700, marginBottom: 12, color: '#0f172a' }}>About</h3>
              <p style={{ color: '#64748b', fontSize: 15, lineHeight: 1.8, marginBottom: 24 }}>{doctor.bio}</p>
            </>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {[
              { label: 'Specialization', value: doctor.specialization },
              { label: 'Qualification', value: doctor.qualification },
              { label: 'Experience', value: doctor.experienceYears ? `${doctor.experienceYears} years` : 'N/A' },
              { label: 'Phone', value: doctor.phone || 'N/A' },
              { label: 'Email', value: doctor.email },
              { label: 'Hospital', value: doctor.hospital || 'N/A' },
            ].filter(x => x.value).map(x => (
              <div key={x.label}>
                <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>{x.label}</div>
                <div style={{ fontSize: 14, color: '#0f172a', fontWeight: 500 }}>{x.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'schedule' && (
        <div className="card" style={{ padding: 28 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16, color: '#0f172a' }}>Available Days</h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
              <span key={day} style={{
                padding: '6px 16px', borderRadius: 100, fontSize: 13, fontWeight: 600,
                background: (doctor.availableDays || []).includes(day) ? '#e0f2fe' : '#f1f5f9',
                color: (doctor.availableDays || []).includes(day) ? '#0284c7' : '#94a3b8',
              }}>{day.slice(0, 3)}</span>
            ))}
          </div>
          {doctor.timeSlots?.length > 0 && (
            <>
              <h3 style={{ fontWeight: 700, marginBottom: 12, color: '#0f172a' }}>Time Slots</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8 }}>
                {doctor.timeSlots.map((slot, i) => (
                  <div key={i} style={{
                    padding: '10px 14px', background: '#f0f9ff', borderRadius: 10,
                    fontSize: 13, fontWeight: 600, color: '#0284c7', textAlign: 'center',
                    border: '1px solid #bae6fd'
                  }}>
                    {slot.startTime} – {slot.endTime}
                  </div>
                ))}
              </div>
            </>
          )}
          <div style={{ marginTop: 24 }}>
            {isAdmin ? (
              <button onClick={handleDelete} disabled={isDeleting} className="btn" style={{ background: '#ef4444', color: 'white', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                {isDeleting ? 'Removing...' : 'Remove Doctor'}
              </button>
            ) : (
              <Link to={`/book/${doctor.id}`} className="btn btn-primary">
                Book a Slot
              </Link>
            )}
          </div>
        </div>
      )}

      {tab === 'reviews' && (
        <div className="card" style={{ padding: 28 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 20, color: '#0f172a' }}>
            Patient Reviews ({reviews.length})
          </h3>
          {reviews.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: 48 }}>⭐</div>
              <h3>No reviews yet</h3>
              <p>Be the first to review Dr. {doctor.lastName}</p>
            </div>
          ) : reviews.map(r => (
            <div key={r.id} style={{ padding: '16px 0', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{r.patientName}</div>
                <Stars rating={r.rating} />
              </div>
              <p style={{ color: '#64748b', fontSize: 14 }}>{r.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
