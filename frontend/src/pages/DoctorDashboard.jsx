import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { appointmentAPI, doctorAPI } from '../services/api';
import toast from 'react-hot-toast';
import DoctorSettings from '../components/DoctorSettings';

const SC = {
  PENDING:   { bg:'#fef3c7', color:'#92400e', dot:'#f59e0b' },
  CONFIRMED: { bg:'#d1fae5', color:'#065f46', dot:'#10b981' },
  CANCELLED: { bg:'#fee2e2', color:'#991b1b', dot:'#ef4444' },
  COMPLETED: { bg:'#e0f2fe', color:'#075985', dot:'#0ea5e9' },
};

function DeclineModal({ onClose, onConfirm }) {
  const [reason, setReason] = useState('');
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div style={{width:48,height:48,borderRadius:14,background:'#fee2e2',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,marginBottom:16}}>🚫</div>
        <h2 style={{fontFamily:'Fraunces, serif', fontWeight:900, fontSize:22, color:'#dc2626', marginBottom:6}}>Decline Appointment</h2>
        <p style={{color:'#64748b', fontSize:14, marginBottom:16}}>Provide a reason so the patient can rebook.</p>
        <textarea value={reason} onChange={e=>setReason(e.target.value)} placeholder="e.g. Not available, please choose another slot…" className="form-input" rows={3} style={{marginBottom:20,resize:'none'}} />
        <div style={{display:'flex', gap:10}}>
          <button className="btn btn-secondary" style={{flex:1}} onClick={onClose}>Cancel</button>
          <button className="btn btn-sm" style={{flex:1,background:'#dc2626',color:'#fff',border:'none',borderRadius:10,padding:'10px',cursor:'pointer',fontWeight:700,fontFamily:'Plus Jakarta Sans, sans-serif'}} onClick={()=>onConfirm(reason)}>Decline</button>
        </div>
      </div>
    </div>
  );
}

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('today');
  const [updatingId, setUpdatingId] = useState(null);
  const [declineId, setDeclineId] = useState(null);
  const [search, setSearch] = useState('');
  const today = new Date().toISOString().split('T')[0];

  const load = async () => {
    try {
      const dr = await doctorAPI.getMyProfile(user.id);
      setDoctor(dr.data);
      const ar = await appointmentAPI.getDoctorAppointments(dr.data.id);
      setAppointments(ar.data);
    } catch (e) {
      if (e.response?.status !== 404) toast.error('Failed to load');
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [user.id]);

  const updateStatus = async (id, status, extra={}) => {
    setUpdatingId(id);
    try { await appointmentAPI.updateStatus(id, {status,...extra}); toast.success(`Marked as ${status.toLowerCase()}`); load(); }
    catch { toast.error('Update failed'); }
    finally { setUpdatingId(null); }
  };

  const todayAppts   = appointments.filter(a=>a.appointmentDate===today);
  const pendingAppts = appointments.filter(a=>a.status==='PENDING');

  const applySearch = list => {
    if (!search.trim()) return list;
    const s = search.toLowerCase();
    return list.filter(a => a.patientName?.toLowerCase().includes(s) || a.symptoms?.toLowerCase().includes(s));
  };

  const displayed = applySearch(tab==='today'?todayAppts : tab==='pending'?pendingAppts : appointments);

  const stats = [
    {label:"Today",      value:todayAppts.length,    icon:'📅', color:'#0369a1', bg:'#e0f2fe'},
    {label:"Pending",    value:pendingAppts.length,  icon:'⏳', color:'#d97706', bg:'#fef3c7'},
    {label:"Confirmed",  value:appointments.filter(a=>a.status==='CONFIRMED').length,  icon:'✅', color:'#059669', bg:'#d1fae5'},
    {label:"Completed",  value:appointments.filter(a=>a.status==='COMPLETED').length,  icon:'🎉', color:'#6366f1', bg:'#ede9fe'},
  ];

  if (loading) return <div className="loading-center" style={{minHeight:'60vh'}}><div className="spinner"/></div>;

  return (
    <div className="page-container fade-in">
      {/* Header */}
      <div style={{background:'linear-gradient(135deg,#0f172a 0%,#1e293b 100%)', borderRadius:22, padding:'26px 30px', color:'#fff', marginBottom:24, position:'relative', overflow:'hidden'}}>
        <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse at 90% 0%,rgba(14,165,233,.15),transparent 60%)',pointerEvents:'none'}} />
        <div style={{position:'absolute',bottom:-40,right:-40,width:160,height:160,borderRadius:'50%',background:'rgba(255,255,255,.04)'}} />
        <div style={{position:'relative'}}>
          <div style={{fontSize:12,opacity:.5,marginBottom:5}}>{new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'})}</div>
          <h1 style={{fontFamily:'Fraunces, serif',fontSize:25,fontWeight:900,marginBottom:4,letterSpacing:'-.02em'}}>Welcome, Dr. {user.firstName}! 👨‍⚕️</h1>
          {doctor && <div style={{opacity:.65,fontSize:13}}>{doctor.specialization} · {doctor.hospital||'MediBook Clinic'}</div>}
          {!doctor && (
            <div style={{marginTop:10,padding:'8px 14px',background:'rgba(245,158,11,.2)',borderRadius:10,fontSize:13,color:'#fcd34d',border:'1px solid rgba(245,158,11,.25)'}}>
              ⚠️ Complete your profile in <strong>Settings</strong> so patients can book appointments.
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:24}} className="stats-grid stagger">
        {stats.map((s,i)=>(
          <div key={s.label} className="stat-card fade-in-up" style={{animationDelay:`${i*50}ms`}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
              <div style={{width:40,height:40,borderRadius:11,background:s.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:19}}>{s.icon}</div>
              <span style={{fontSize:26,fontWeight:800,color:s.color}}>{s.value}</span>
            </div>
            <div style={{fontSize:12,color:'#64748b'}}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div style={{display:'flex',gap:6,marginBottom:18,flexWrap:'wrap',alignItems:'center'}}>
        <div style={{display:'flex',gap:5,background:'#f8fafc',padding:4,borderRadius:12,flex:'none'}}>
          {[
            {k:'today',l:`Today ${todayAppts.length>0?`(${todayAppts.length})`:''}`},
            {k:'pending',l:`Pending${pendingAppts.length>0?` (${pendingAppts.length})`:''}`},
            {k:'all',l:'All'},
            {k:'settings',l:'⚙️ Settings'},
          ].map(t=>(
            <button key={t.k} onClick={()=>setTab(t.k)} className={`pill-tab ${tab===t.k?'active':''}`}>{t.l}</button>
          ))}
        </div>
        {tab!=='settings' && (
          <input className="form-input" style={{marginLeft:'auto',width:210,fontSize:13,height:38}} placeholder="Search patient…" value={search} onChange={e=>setSearch(e.target.value)} />
        )}
      </div>

      {/* Content */}
      {tab==='settings' ? (
        <DoctorSettings doctor={doctor||{id:null,availableDays:[],timeSlots:[],leaveDates:[]}} onUpdate={load} />
      ) : displayed.length===0 ? (
        <div className="empty-state">
          <div style={{fontSize:52}}>📋</div>
          <h3>{search?'No matching results':'No appointments'}</h3>
          <p>{search?'Try a different search term':'Appointments will appear here'}</p>
          {search && <button className="btn btn-outline btn-sm" style={{marginTop:12}} onClick={()=>setSearch('')}>Clear</button>}
        </div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          {displayed.map((appt,i)=>{
            const sc = SC[appt.status]||SC.PENDING;
            return (
              <div key={appt.id} className="card" style={{padding:20, animation:`fadeInUp .35s ease ${i*40}ms both`}}>
                <div style={{display:'flex',gap:14,alignItems:'flex-start',flexWrap:'wrap'}}>
                  <div style={{width:44,height:44,borderRadius:13,background:'linear-gradient(135deg,#e0f2fe,#bae6fd)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>👤</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:700,fontSize:14,color:'#0f172a'}}>{appt.patientName}</div>
                    <div style={{fontSize:12,color:'#64748b',marginTop:2}}>{appt.patientEmail}{appt.patientPhone?` · ${appt.patientPhone}`:''}</div>
                    {appt.symptoms && (
                      <div style={{marginTop:8,fontSize:12,color:'#334155',background:'#f8fafc',padding:'7px 11px',borderRadius:9,border:'1px solid #e2e8f0'}}>
                        💊 <strong>Symptoms:</strong> {appt.symptoms}
                      </div>
                    )}
                  </div>
                  <div style={{textAlign:'right',flexShrink:0}}>
                    <div style={{fontSize:13,fontWeight:700,color:'#0f172a'}}>{appt.appointmentDate}</div>
                    <div style={{fontSize:12,color:'#64748b'}}>{appt.appointmentTime}</div>
                    <div style={{fontSize:11,color:'#94a3b8',marginTop:2}}>{appt.type?.replace('_',' ')}</div>
                    <span style={{display:'inline-flex',alignItems:'center',gap:4,marginTop:6,background:sc.bg,color:sc.color,fontSize:11,fontWeight:700,padding:'3px 9px',borderRadius:999}}>
                      <span style={{width:5,height:5,borderRadius:'50%',background:sc.dot}} />{appt.status}
                    </span>
                  </div>
                </div>
                <div style={{display:'flex',gap:8,marginTop:14,flexWrap:'wrap'}}>
                  {appt.status==='PENDING' && (
                    <>
                      <button className="btn btn-success btn-sm" disabled={updatingId===appt.id} onClick={()=>updateStatus(appt.id,'CONFIRMED')}>✓ Confirm</button>
                      <button className="btn btn-danger btn-sm" disabled={updatingId===appt.id} onClick={()=>setDeclineId(appt.id)}>✗ Decline</button>
                    </>
                  )}
                  {appt.status==='CONFIRMED' && (
                    <button className="btn btn-primary btn-sm" disabled={updatingId===appt.id} onClick={()=>updateStatus(appt.id,'COMPLETED')}>✓ Mark Completed</button>
                  )}
                  {appt.type==='VIDEO_CALL' && appt.status==='CONFIRMED' && (
                    <button className="btn btn-outline btn-sm">💻 Add Meeting Link</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {declineId && <DeclineModal onClose={()=>setDeclineId(null)} onConfirm={reason=>{updateStatus(declineId,'CANCELLED',{cancelReason:reason||'Doctor unavailable'});setDeclineId(null);}} />}

      <style>{`@media(max-width:768px){.stats-grid{grid-template-columns:repeat(2,1fr)!important;}}`}</style>
    </div>
  );
}
