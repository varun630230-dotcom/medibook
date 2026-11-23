import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { doctorAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const SPECIALTIES = ['All','Cardiology','Neurology','Pediatrics','Orthopedics','Dermatology','Dentistry','Ophthalmology','General Practice','ENT','Psychiatry'];

function DoctorListCard({ doctor }) {
  const navigate = useNavigate();

  return (
    <div className="doc-card-h">
      {/* Avatar */}
      <div 
        className="doc-avatar-lg" 
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', 
          background: 'linear-gradient(135deg, #e0f2fe, #bae6fd)', 
          color: '#0369a1', fontSize: 32, fontWeight: 800, textTransform: 'uppercase'
        }}
      >
        {doctor.firstName?.[0]}{doctor.lastName?.[0]}
      </div>
      
      {/* Main Info */}
      <div className="doc-info-main">
        <div className="doc-name">Dr. {doctor.firstName} {doctor.lastName} <span style={{fontSize:14}}>☑️</span></div>
        <div className="doc-spec">{doctor.specialization || 'General Practice'}</div>
        
        <div className="doc-meta-row">
          <div className="doc-meta-item">
            <span style={{color:'#f59e0b'}}>⭐</span> 
            <span style={{fontWeight:600, color:'#0f172a'}}>{doctor.rating ? doctor.rating.toFixed(1) : '4.8'}</span> 
            <span>({doctor.totalReviews || 124} reviews)</span>
          </div>
          <div className="doc-meta-item">
            <span>💼</span> {doctor.experienceYears || '12'} Years Exp.
          </div>
        </div>
        
        <div className="doc-meta-row" style={{ marginTop: 2 }}>
          <div className="doc-meta-item">
            <span>🏥</span> {doctor.hospital || 'MediCare Hospital'}
          </div>
          <div className="doc-meta-item">
            <span>📍</span> {doctor.location || 'New Delhi, India'}
          </div>
        </div>
      </div>

      {/* Actions Pane */}
      <div className="doc-actions-pane">
        <div style={{textAlign:'right'}}>
          <div className="doc-price">₹{doctor.consultationFee || '500'}</div>
          <div className="doc-price-sub">per consultation</div>
        </div>
        
        <div className="doc-btns-v">
          <Link to={`/doctors/${doctor.id}`} className="btn btn-outline btn-full" style={{fontSize: 13, padding: '8px', height: '40px'}}>
            View Profile
          </Link>
          <button 
            className="btn btn-primary btn-full" 
            style={{fontSize: 13, padding: '8px', height: '40px', opacity: doctor.available ? 1 : 0.6, cursor: doctor.available ? 'pointer' : 'not-allowed'}}
            onClick={() => doctor.available && navigate(`/book/${doctor.id}`)}
          >
            {doctor.available ? 'Book Visit' : 'Unavailable'}
          </button>
        </div>
      </div>
    </div>
  );
}

function useDebounce(v, d) {
  const [dv, setDv] = useState(v);
  useEffect(() => { const t = setTimeout(()=>setDv(v), d); return ()=>clearTimeout(t); }, [v,d]);
  return dv;
}

export default function DoctorList() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search state
  const [searchName, setSearchName] = useState('');
  const [specialty, setSpecialty] = useState('All');
  
  const debouncedSearch = useDebounce(searchName, 300);

  useEffect(() => {
    doctorAPI.getAll().then(r => setDoctors(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let r = doctors;
    if (specialty !== 'All') r = r.filter(d => d.specialization?.toLowerCase() === specialty.toLowerCase());
    if (debouncedSearch.trim()) {
      const s = debouncedSearch.toLowerCase();
      r = r.filter(d => `${d.firstName} ${d.lastName}`.toLowerCase().includes(s));
    }
    return r;
  }, [doctors, specialty, debouncedSearch]);

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: 60 }}>
      {/* Top Header / Search Bar area */}
      <div className="search-page-header">
        
        <div className="search-controls">
          <div className="search-input-wrapper">
            <span>🔍</span>
            <input 
              placeholder="Search by doctor name..." 
              value={searchName} 
              onChange={e => setSearchName(e.target.value)}
            />
          </div>
          <div className="search-input-wrapper">
            <span>⚕️</span>
            <select value={specialty} onChange={e => setSpecialty(e.target.value)}>
              {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <button className="search-primary-btn">
            Search Doctors
          </button>
        </div>

      </div>

      {/* Main Layout */}
      <div className="search-layout">
        {/* Left List */}
        <div className="search-results-list">
          <div style={{fontSize: 17, fontWeight: 700, color: '#0f172a', marginBottom: 8}}>
            {loading ? 'Searching doctors...' : `${filtered.length} Doctors Available`}
          </div>

          {loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state card" style={{background:'#fff'}}>
              <div style={{fontSize:48, marginBottom:16}}>🔍</div>
              <h3>No match found</h3>
              <p>Try adjusting your search filters.</p>
              <button onClick={()=>{setSearchName('');setSpecialty('All');}} className="btn btn-primary" style={{marginTop:16}}>Clear Filters</button>
            </div>
          ) : (
            filtered.map(d => <DoctorListCard key={d.id} doctor={d} />)
          )}
        </div>

      </div>
    </div>
  );
}
