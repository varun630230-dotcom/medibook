import React, { useEffect, useState, useMemo } from 'react';
import { appointmentAPI, doctorAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [updatingId, setUpdatingId] = useState(null);
  const [apptSearch, setApptSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [docSearch, setDocSearch] = useState('');

  const load = async () => {
    try {
      const [ar, dr, sr] = await Promise.all([appointmentAPI.getAllAppointments(), doctorAPI.getAll(), appointmentAPI.getStats()]);
      setAppointments(ar.data); setDoctors(dr.data); setStats(sr.data);
    } catch { toast.error('Failed to load data'); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    try { await appointmentAPI.updateStatus(id,{status}); toast.success(`Updated to ${status.toLowerCase()}`); load(); }
    catch { toast.error('Update failed'); } finally { setUpdatingId(null); }
  };

  const filteredAppts = useMemo(() => {
    let r = appointments;
    if (statusFilter !== 'All') r = r.filter(a=>a.status===statusFilter);
    if (apptSearch.trim()) { const s=apptSearch.toLowerCase(); r=r.filter(a=>a.patientName?.toLowerCase().includes(s)||a.doctorName?.toLowerCase().includes(s)||a.patientEmail?.toLowerCase().includes(s)); }
    return r;
  }, [appointments, statusFilter, apptSearch]);

  const filteredDocs = useMemo(() => {
    if (!docSearch.trim()) return doctors;
    const s=docSearch.toLowerCase();
    return doctors.filter(d=>`${d.firstName} ${d.lastName}`.toLowerCase().includes(s)||d.specialization?.toLowerCase().includes(s)||d.hospital?.toLowerCase().includes(s));
  }, [doctors, docSearch]);

  if (loading) return <div className="loading-center" style={{minHeight:'60vh'}}><div className="spinner"/></div>;

  const statCards = [
    {label:'Total',     value:stats.total,     icon:'📋', color:'#6366f1', bg:'#ede9fe', key:'All'},
    {label:'Pending',   value:stats.pending,   icon:'⏳', color:'#d97706', bg:'#fef3c7', key:'PENDING'},
    {label:'Confirmed', value:stats.confirmed, icon:'✅', color:'#059669', bg:'#d1fae5', key:'CONFIRMED'},
    {label:'Completed', value:stats.completed, icon:'🎉', color:'#0369a1', bg:'#e0f2fe', key:'COMPLETED'},
    {label:'Cancelled', value:stats.cancelled, icon:'❌', color:'#dc2626', bg:'#fee2e2', key:'CANCELLED'},
  ];

  return (
    <div className="page-container fade-in">
      {/* Header */}
      <div style={{background:'linear-gradient(135deg,#4f46e5,#6366f1)', borderRadius:22, padding:'24px 28px', color:'#fff', marginBottom:24, position:'relative', overflow:'hidden'}}>
        <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse at 80% 0%,rgba(255,255,255,.12),transparent 60%)',pointerEvents:'none'}}/>
        <h1 style={{fontFamily:'Fraunces, serif',fontSize:25,fontWeight:900,marginBottom:3,position:'relative'}}>🛡️ Admin Dashboard</h1>
        <p style={{opacity:.75,fontSize:13,position:'relative'}}>{new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'})} · MediBook System Overview</p>
      </div>

      {/* Stats - clickable */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:12,marginBottom:24}} className="admin-stats stagger">
        {statCards.map((s,i)=>(
          <div key={s.label} onClick={()=>{setTab('appointments');setStatusFilter(s.key);}}
            className="stat-card fade-in-up" style={{textAlign:'center',cursor:'pointer',animationDelay:`${i*40}ms`,userSelect:'none'}}>
            <div style={{fontSize:22,marginBottom:8}}>{s.icon}</div>
            <div style={{fontSize:24,fontWeight:800,color:s.color}}>{s.value??0}</div>
            <div style={{fontSize:11,color:'#94a3b8',marginTop:3}}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{display:'flex',gap:6,marginBottom:20,background:'#f8fafc',padding:5,borderRadius:14,width:'fit-content'}}>
        {[{k:'overview',l:'📊 Overview'},{k:'appointments',l:`📋 Appointments (${appointments.length})`},{k:'doctors',l:`👨‍⚕️ Doctors (${doctors.length})`}].map(t=>(
          <button key={t.k} onClick={()=>setTab(t.k)} className={`pill-tab ${tab===t.k?'active':''}`}
            style={{background:tab===t.k?'#6366f1':undefined}}>{t.l}</button>
        ))}
      </div>

      {/* Overview */}
      {tab==='overview' && (
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}} className="overview-grid">
          <div className="card">
            <div className="card-header"><div className="section-title">Recent Appointments</div><button className="btn btn-ghost btn-sm" style={{color:'#6366f1'}} onClick={()=>setTab('appointments')}>View all →</button></div>
            <div style={{padding:'0 8px 8px'}}>
              {appointments.slice(0,8).map(a=>(
                <div key={a.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'11px 16px',borderRadius:10,transition:'background .15s'}}
                  onMouseEnter={e=>e.currentTarget.style.background='#f8fafc'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <div>
                    <div style={{fontWeight:600,fontSize:13}}>{a.patientName}</div>
                    <div style={{fontSize:11,color:'#94a3b8'}}>→ Dr. {a.doctorName} · {a.appointmentDate}</div>
                  </div>
                  <span className={`badge badge-${a.status.toLowerCase()}`} style={{fontSize:10}}>{a.status}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="card-header"><div className="section-title">Doctors Overview</div><button className="btn btn-ghost btn-sm" style={{color:'#6366f1'}} onClick={()=>setTab('doctors')}>View all →</button></div>
            <div style={{padding:'0 8px 8px'}}>
              {doctors.slice(0,8).map(d=>(
                <div key={d.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'11px 16px',borderRadius:10,transition:'background .15s'}}
                  onMouseEnter={e=>e.currentTarget.style.background='#f8fafc'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <div>
                    <div style={{fontWeight:600,fontSize:13}}>Dr. {d.firstName} {d.lastName}</div>
                    <div style={{fontSize:11,color:'#0369a1'}}>{d.specialization}</div>
                  </div>
                  <span style={{fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:999,background:d.available?'#d1fae5':'#fee2e2',color:d.available?'#065f46':'#991b1b'}}>{d.available?'Active':'Off'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Appointments table */}
      {tab==='appointments' && (
        <div>
          <div style={{display:'flex',gap:12,marginBottom:16,flexWrap:'wrap',alignItems:'center'}}>
            <div style={{position:'relative',flex:1,minWidth:200}}>
              <span style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',fontSize:15,color:'#94a3b8'}}>🔍</span>
              <input className="form-input" style={{paddingLeft:36}} placeholder="Search patient or doctor…" value={apptSearch} onChange={e=>setApptSearch(e.target.value)} />
            </div>
            <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
              {['All','PENDING','CONFIRMED','COMPLETED','CANCELLED'].map(s=>(
                <button key={s} onClick={()=>setStatusFilter(s)} style={{
                  padding:'6px 13px',borderRadius:999,border:'none',cursor:'pointer',fontSize:12,fontWeight:600,
                  background:statusFilter===s?'#6366f1':'#f1f5f9', color:statusFilter===s?'#fff':'#64748b',
                  fontFamily:'Plus Jakarta Sans, sans-serif', transition:'all .15s',
                }}>{s}</button>
              ))}
            </div>
          </div>
          <div style={{fontSize:12,color:'#94a3b8',marginBottom:12}}>Showing {filteredAppts.length} of {appointments.length}</div>
          <div className="card" style={{overflow:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse',minWidth:700}}>
              <thead>
                <tr style={{background:'#f8fafc'}}>
                  {['Patient','Doctor','Date & Time','Type','Status','Actions'].map(h=>(
                    <th key={h} style={{padding:'11px 16px',textAlign:'left',fontSize:11,fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:.5,whiteSpace:'nowrap'}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredAppts.length===0 ? (
                  <tr><td colSpan={6} style={{textAlign:'center',padding:'40px',color:'#94a3b8'}}>No appointments found</td></tr>
                ) : filteredAppts.map(a=>(
                  <tr key={a.id} style={{borderTop:'1px solid #f1f5f9',transition:'background .15s'}}
                    onMouseEnter={e=>e.currentTarget.style.background='#fafafa'}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <td style={{padding:'12px 16px',fontSize:13}}>
                      <div style={{fontWeight:600}}>{a.patientName}</div>
                      <div style={{fontSize:11,color:'#94a3b8'}}>{a.patientEmail}</div>
                    </td>
                    <td style={{padding:'12px 16px',fontSize:13}}>
                      <div style={{fontWeight:600}}>Dr. {a.doctorName}</div>
                      <div style={{fontSize:11,color:'#0369a1'}}>{a.doctorSpecialization}</div>
                    </td>
                    <td style={{padding:'12px 16px',fontSize:13,whiteSpace:'nowrap'}}>
                      <div>{a.appointmentDate}</div><div style={{color:'#94a3b8'}}>{a.appointmentTime}</div>
                    </td>
                    <td style={{padding:'12px 16px',fontSize:12,color:'#64748b'}}>{a.type?.replace('_',' ')}</td>
                    <td style={{padding:'12px 16px'}}><span className={`badge badge-${a.status.toLowerCase()}`}>{a.status}</span></td>
                    <td style={{padding:'12px 16px'}}>
                      <div style={{display:'flex',gap:5}}>
                        {a.status==='PENDING' && (<><button className="btn btn-success btn-sm" disabled={updatingId===a.id} onClick={()=>updateStatus(a.id,'CONFIRMED')}>✓</button><button className="btn btn-danger btn-sm" disabled={updatingId===a.id} onClick={()=>updateStatus(a.id,'CANCELLED')}>✗</button></>)}
                        {a.status==='CONFIRMED' && <button className="btn btn-primary btn-sm" disabled={updatingId===a.id} onClick={()=>updateStatus(a.id,'COMPLETED')}>Done</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Doctors */}
      {tab==='doctors' && (
        <div>
          <div style={{position:'relative',marginBottom:18}}>
            <span style={{position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',fontSize:16,color:'#94a3b8'}}>🔍</span>
            <input className="form-input" style={{paddingLeft:42,width:'100%'}} placeholder="Search doctors…" value={docSearch} onChange={e=>setDocSearch(e.target.value)} />
          </div>
          <div style={{fontSize:12,color:'#94a3b8',marginBottom:16}}>{filteredDocs.length} of {doctors.length} doctors</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(268px,1fr))',gap:14}}>
            {filteredDocs.map(d=>(
              <div key={d.id} className="card card-hover" style={{padding:20}}>
                <div style={{display:'flex',gap:12,alignItems:'center'}}>
                  <div style={{width:44,height:44,borderRadius:13,background:'linear-gradient(135deg,#6366f1,#4f46e5)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,fontWeight:800,color:'#fff',flexShrink:0}}>
                    {d.firstName?.[0]}{d.lastName?.[0]}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:700,fontSize:13,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>Dr. {d.firstName} {d.lastName}</div>
                    <div style={{fontSize:12,color:'#0369a1'}}>{d.specialization}</div>
                  </div>
                </div>
                <div style={{marginTop:12,display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:12,color:'#64748b'}}>
                  <span>⭐ {d.rating?.toFixed(1)||'—'} ({d.totalReviews||0})</span>
                  <span style={{background:d.available?'#d1fae5':'#fee2e2',color:d.available?'#065f46':'#991b1b',padding:'2px 8px',borderRadius:999,fontWeight:700,fontSize:11}}>{d.available?'Active':'Inactive'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @media(max-width:900px){.admin-stats{grid-template-columns:repeat(3,1fr)!important;}.overview-grid{grid-template-columns:1fr!important;}}
        @media(max-width:600px){.admin-stats{grid-template-columns:repeat(2,1fr)!important;}}
      `}</style>
    </div>
  );
}
