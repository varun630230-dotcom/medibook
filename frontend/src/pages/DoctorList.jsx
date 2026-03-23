import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { doctorAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const SPECIALTIES = ['All','Cardiology','Neurology','Pediatrics','Orthopedics','Dermatology','Dentistry','Ophthalmology','General Practice','ENT','Psychiatry'];

function Stars({ rating=0 }) {
  return <span style={{color:'#f59e0b',fontSize:12,letterSpacing:1}}>{'★'.repeat(Math.round(rating))}{'☆'.repeat(5-Math.round(rating))}</span>;
}

function DoctorCard({ doctor, onDelete, index=0 }) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [deleting, setDeleting] = useState(false);

  const del = async e => {
    e.preventDefault();
    if (!confirm('Remove this doctor? This cannot be undone.')) return;
    setDeleting(true);
    try { await doctorAPI.deleteDoctor(doctor.id); toast.success('Doctor removed'); onDelete?.(doctor.id); }
    catch (err) { toast.error('Failed: ' + (err.response?.data?.error || err.message)); setDeleting(false); }
  };

  const initials = `${doctor.firstName?.[0]||''}${doctor.lastName?.[0]||''}`;
  const gradients = ['linear-gradient(135deg,#0ea5e9,#0369a1)','linear-gradient(135deg,#10b981,#059669)','linear-gradient(135deg,#8b5cf6,#6d28d9)','linear-gradient(135deg,#f59e0b,#d97706)','linear-gradient(135deg,#ef4444,#dc2626)','linear-gradient(135deg,#0ea5e9,#6366f1)'];
  const gradient = gradients[(doctor.firstName?.charCodeAt(0)||0) % gradients.length];

  return (
    <div className="card card-hover" style={{ padding:22, display:'flex', flexDirection:'column', gap:14, animation:`fadeInUp .4s ease ${index*40}ms both` }}>
      <div style={{display:'flex', gap:14, alignItems:'flex-start'}}>
        <div style={{ width:56, height:56, borderRadius:16, background:gradient, display:'flex', alignItems:'center', justifyContent:'center', fontSize:19, fontWeight:800, color:'#fff', flexShrink:0, letterSpacing:-.5 }}>
          {initials}
        </div>
        <div style={{flex:1, minWidth:0}}>
          <div style={{fontWeight:700, fontSize:15, color:'#0f172a', marginBottom:2}}>Dr. {doctor.firstName} {doctor.lastName}</div>
          <div style={{fontSize:13, color:'#0369a1', fontWeight:600, marginBottom:3}}>{doctor.specialization||'General Practice'}</div>
          <div style={{fontSize:12, color:'#64748b'}}>{doctor.qualification}{doctor.experienceYears ? ` · ${doctor.experienceYears} yrs` : ''}</div>
        </div>
        <span style={{
          background: doctor.available ? '#d1fae5' : '#fee2e2',
          color: doctor.available ? '#065f46' : '#991b1b',
          fontSize:11, fontWeight:700, padding:'3px 9px', borderRadius:999, flexShrink:0,
          display:'flex', alignItems:'center', gap:4,
        }}>
          <span style={{width:5,height:5,borderRadius:'50%',background:doctor.available?'#10b981':'#ef4444'}} />
          {doctor.available ? 'Available' : 'Busy'}
        </span>
      </div>

      {doctor.hospital && (
        <div style={{fontSize:12, color:'#64748b', display:'flex', gap:12, flexWrap:'wrap'}}>
          {doctor.hospital && <span>🏥 {doctor.hospital}</span>}
          {doctor.location && <span>📍 {doctor.location}</span>}
        </div>
      )}

      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div style={{display:'flex', alignItems:'center', gap:6}}>
          <Stars rating={doctor.rating} />
          <span style={{fontSize:12, color:'#94a3b8', fontWeight:500}}>
            {doctor.rating ? doctor.rating.toFixed(1) : '—'} {doctor.totalReviews ? `(${doctor.totalReviews})` : ''}
          </span>
        </div>
        {doctor.consultationFee > 0 && (
          <span style={{fontSize:15, fontWeight:800, color:'#0f172a'}}>₹{doctor.consultationFee}</span>
        )}
      </div>

      <div style={{display:'flex', gap:8}}>
        <Link to={`/doctors/${doctor.id}`} className="btn btn-outline btn-sm" style={{flex:1, justifyContent:'center'}}>View Profile</Link>
        {isAdmin ? (
          <button onClick={del} disabled={deleting} className="btn btn-sm" style={{flex:1, justifyContent:'center', background:'#ef4444', color:'#fff', border:'none', cursor:'pointer'}}>
            {deleting ? 'Removing…' : '🗑 Remove'}
          </button>
        ) : (
          <Link to={doctor.available ? `/book/${doctor.id}` : '#'} className={`btn btn-sm ${doctor.available?'btn-primary':'btn-secondary'}`}
            style={{flex:1, justifyContent:'center', cursor:doctor.available?'pointer':'not-allowed', opacity:doctor.available?1:.6}}
            onClick={e=>!doctor.available&&e.preventDefault()}>
            {doctor.available ? 'Book Now' : 'Unavailable'}
          </Link>
        )}
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
  const [search, setSearch] = useState('');
  const [specialty, setSpecialty] = useState('All');
  const [availOnly, setAvailOnly] = useState(false);
  const dSearch = useDebounce(search, 300);

  useEffect(() => {
    doctorAPI.getAll().then(r=>{ setDoctors(r.data); }).catch(console.error).finally(()=>setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let r = doctors;
    if (availOnly) r = r.filter(d=>d.available);
    if (specialty !== 'All') r = r.filter(d=>d.specialization?.toLowerCase().includes(specialty.toLowerCase()));
    if (dSearch.trim()) {
      const s = dSearch.toLowerCase();
      r = r.filter(d => `${d.firstName} ${d.lastName}`.toLowerCase().includes(s) || d.specialization?.toLowerCase().includes(s) || d.hospital?.toLowerCase().includes(s));
    }
    return r;
  }, [doctors, specialty, dSearch, availOnly]);

  const specCount = s => s==='All' ? doctors.length : doctors.filter(d=>d.specialization?.toLowerCase().includes(s.toLowerCase())).length;

  return (
    <div className="page-container fade-in">
      <div style={{marginBottom:28}}>
        <h1 style={{fontFamily:'Fraunces, serif', fontSize:32, fontWeight:900, color:'#0f172a', marginBottom:6, letterSpacing:'-.02em'}}>Find a Doctor</h1>
        <p style={{color:'#64748b', fontSize:15}}>{loading ? 'Loading…' : `${doctors.length} verified healthcare professionals`}</p>
      </div>

      {/* Search + Filter */}
      <div style={{display:'flex', gap:12, marginBottom:18, flexWrap:'wrap'}}>
        <div style={{position:'relative', flex:1, minWidth:240}}>
          <span style={{position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', fontSize:17, pointerEvents:'none', color:'#94a3b8'}}>🔍</span>
          <input className="form-input" style={{paddingLeft:44, height:48, borderRadius:14, background:'#fff', fontSize:14}}
            placeholder="Search by name, specialty, or hospital…"
            value={search} onChange={e=>setSearch(e.target.value)} />
          {search && <button onClick={()=>setSearch('')} style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'#94a3b8',fontSize:16}}>✕</button>}
        </div>
        <button onClick={()=>setAvailOnly(!availOnly)} style={{
          padding:'0 20px', height:48, borderRadius:14, border:`1.5px solid ${availOnly?'#10b981':'#e2e8f0'}`,
          background:availOnly?'#d1fae5':'#fff', color:availOnly?'#065f46':'#64748b',
          fontWeight:600, fontSize:13, cursor:'pointer', transition:'all .18s',
          fontFamily:'Plus Jakarta Sans, sans-serif', display:'flex', alignItems:'center', gap:6,
        }}>
          {availOnly ? '✅' : <span style={{width:16,height:16,border:'1.5px solid #cbd5e1',borderRadius:4,display:'inline-block'}} />} Available Only
        </button>
      </div>

      {/* Specialty pills */}
      <div style={{display:'flex', gap:7, flexWrap:'wrap', marginBottom:24}}>
        {SPECIALTIES.map(s => {
          const cnt = specCount(s);
          return (
            <button key={s} onClick={()=>setSpecialty(s)} style={{
              padding:'6px 14px', borderRadius:999, border:'1.5px solid', fontSize:13, fontWeight:specialty===s?700:500,
              borderColor: specialty===s ? '#0369a1' : '#e2e8f0',
              background: specialty===s ? '#e0f2fe' : '#fff',
              color: specialty===s ? '#0369a1' : cnt===0?'#c4cdd6':'#64748b',
              cursor:'pointer', transition:'all .15s', fontFamily:'Plus Jakarta Sans, sans-serif',
              display:'flex', alignItems:'center', gap:5,
            }}>
              {s}
              {cnt > 0 && <span style={{background:specialty===s?'rgba(3,105,161,.15)':'#f1f5f9', color:specialty===s?'#0369a1':'#94a3b8', fontSize:11, padding:'0 6px', borderRadius:999}}>{cnt}</span>}
            </button>
          );
        })}
      </div>

      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18}}>
        <span style={{fontSize:13.5, color:'#64748b'}}>{loading ? 'Loading…' : `${filtered.length} doctor${filtered.length!==1?'s':''} found`}</span>
        {(search || specialty!=='All' || availOnly) && (
          <button onClick={()=>{setSearch('');setSpecialty('All');setAvailOnly(false);}} style={{background:'none',border:'none',color:'#0369a1',cursor:'pointer',fontSize:13,fontWeight:600}}>Clear filters</button>
        )}
      </div>

      {loading ? (
        <div className="loading-center" style={{minHeight:300}}><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div style={{fontSize:56}}>🔍</div>
          <h3>No doctors found</h3>
          <p>Try adjusting your search or filters</p>
          <button onClick={()=>{setSearch('');setSpecialty('All');setAvailOnly(false);}} className="btn btn-primary btn-sm" style={{marginTop:16}}>Clear Filters</button>
        </div>
      ) : (
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:18}}>
          {filtered.map((d, i) => <DoctorCard key={d.id} doctor={d} onDelete={id=>setDoctors(p=>p.filter(x=>x.id!==id))} index={i} />)}
        </div>
      )}
    </div>
  );
}
