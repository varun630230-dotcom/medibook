import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { appointmentAPI, doctorAPI } from '../services/api';
import toast from 'react-hot-toast';

const STATUS_CFG = {
  PENDING:   { bg:'#fef3c7', color:'#92400e', dot:'#f59e0b', icon:'⏳' },
  CONFIRMED: { bg:'#d1fae5', color:'#065f46', dot:'#10b981', icon:'✅' },
  CANCELLED: { bg:'#fee2e2', color:'#991b1b', dot:'#ef4444', icon:'❌' },
  COMPLETED: { bg:'#e0f2fe', color:'#075985', dot:'#0ea5e9', icon:'🎉' },
};

function ReviewModal({ appt, onClose, onSubmit }) {
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const labels = ['','Poor','Fair','Good','Very Good','Excellent'];
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <h2 style={{fontFamily:'Fraunces, serif', fontWeight:900, fontSize:24, marginBottom:4}}>Leave a Review</h2>
        <p style={{color:'#64748b', fontSize:14, marginBottom:24}}>Rate your experience with Dr. {appt.doctorName}</p>
        <div style={{display:'flex', gap:6, marginBottom:6, justifyContent:'center'}}>
          {[1,2,3,4,5].map(s => (
            <span key={s} onMouseEnter={()=>setHover(s)} onMouseLeave={()=>setHover(0)} onClick={()=>setRating(s)}
              style={{fontSize:38, cursor:'pointer', color: s<=(hover||rating)?'#f59e0b':'#e2e8f0', transition:'all .15s', transform:s<=(hover||rating)?'scale(1.15)':'scale(1)'}}>★</span>
          ))}
        </div>
        <div style={{textAlign:'center', fontSize:14, fontWeight:700, color:'#f59e0b', marginBottom:20, minHeight:20}}>{labels[hover||rating]}</div>
        <textarea value={comment} onChange={e=>setComment(e.target.value)} placeholder="Tell others about your experience…" className="form-input" rows={4} style={{marginBottom:20, resize:'none'}} />
        <div style={{display:'flex', gap:10}}>
          <button className="btn btn-secondary" style={{flex:1}} onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" style={{flex:1}} onClick={()=>onSubmit(rating,comment)}>Submit Review ⭐</button>
        </div>
      </div>
    </div>
  );
}

function CancelModal({ onClose, onConfirm }) {
  const [reason, setReason] = useState('');
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div style={{width:48,height:48,borderRadius:14,background:'#fee2e2',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,marginBottom:16}}>❌</div>
        <h2 style={{fontFamily:'Fraunces, serif', fontWeight:900, fontSize:22, color:'#dc2626', marginBottom:6}}>Cancel Appointment</h2>
        <p style={{color:'#64748b', fontSize:14, marginBottom:18}}>This cannot be undone. Would you like to provide a reason?</p>
        <textarea value={reason} onChange={e=>setReason(e.target.value)} placeholder="Reason (optional)…" className="form-input" rows={3} style={{marginBottom:20, resize:'none'}} />
        <div style={{display:'flex', gap:10}}>
          <button className="btn btn-secondary" style={{flex:1}} onClick={onClose}>Keep Appointment</button>
          <button className="btn btn-sm" style={{flex:1, background:'#dc2626', color:'#fff', border:'none', borderRadius:10, padding:'10px', cursor:'pointer', fontWeight:700, fontFamily:'Plus Jakarta Sans, sans-serif'}} onClick={()=>onConfirm(reason)}>Yes, Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default function MyAppointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('All');
  const [reviewModal, setReviewModal] = useState(null);
  const [cancelModal, setCancelModal] = useState(null);
  const [sortDesc, setSortDesc] = useState(true);

  const load = async () => {
    try { const r = await appointmentAPI.getPatientAppointments(user.id); setAppointments(r.data); }
    catch { toast.error('Failed to load appointments'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [user.id]);

  const handleCancel = async (id, reason) => {
    try { await appointmentAPI.updateStatus(id, {status:'CANCELLED',cancelReason:reason}); toast.success('Appointment cancelled'); setCancelModal(null); load(); }
    catch { toast.error('Failed to cancel'); }
  };

  const handleReview = async (appt, rating, comment) => {
    try {
      await doctorAPI.addReview(appt.doctorId, { patientId:user.id, patientName:`${user.firstName} ${user.lastName}`, appointmentId:appt.id, rating, comment });
      toast.success('Review submitted! 🌟'); setReviewModal(null);
    } catch { toast.error('Failed to submit review'); }
  };

  const tabs = ['All','PENDING','CONFIRMED','COMPLETED','CANCELLED'];
  const cnt = t => t==='All' ? appointments.length : appointments.filter(a=>a.status===t).length;

  const sorted = [...appointments].sort((a,b) => {
    const da = new Date(`${a.appointmentDate} ${a.appointmentTime}`);
    const db = new Date(`${b.appointmentDate} ${b.appointmentTime}`);
    return sortDesc ? db-da : da-db;
  });
  const filtered = tab==='All' ? sorted : sorted.filter(a=>a.status===tab);

  return (
    <div className="page-container fade-in">
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:28, flexWrap:'wrap', gap:12}}>
        <div>
          <h1 style={{fontFamily:'Fraunces, serif', fontSize:30, fontWeight:900, color:'#0f172a', marginBottom:4, letterSpacing:'-.02em'}}>My Appointments</h1>
          <p style={{color:'#64748b', fontSize:14}}>{appointments.length} total appointments</p>
        </div>
        <div style={{display:'flex', gap:8, alignItems:'center'}}>
          <button onClick={()=>setSortDesc(!sortDesc)} style={{
            padding:'8px 14px', borderRadius:10, border:'1.5px solid #e2e8f0',
            background:'#fff', color:'#64748b', fontWeight:600, fontSize:13,
            cursor:'pointer', fontFamily:'Plus Jakarta Sans, sans-serif', display:'flex', gap:5, alignItems:'center',
          }}>
            {sortDesc?'↓':'↑'} {sortDesc?'Newest':'Oldest'}
          </button>
          <Link to="/doctors" className="btn btn-primary btn-sm" style={{height:38}}>+ New</Link>
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:'flex', gap:6, marginBottom:24, flexWrap:'wrap', background:'#f8fafc', padding:5, borderRadius:14, width:'fit-content'}}>
        {tabs.map(t => (
          <button key={t} onClick={()=>setTab(t)} className={`pill-tab ${tab===t?'active':''}`} style={{display:'flex', gap:5, alignItems:'center'}}>
            {t}
            <span style={{background:tab===t?'rgba(255,255,255,.3)':'#e2e8f0',color:tab===t?'#fff':'#94a3b8',fontSize:11,padding:'0 7px',borderRadius:999,fontWeight:700}}>{cnt(t)}</span>
          </button>
        ))}
      </div>

      {loading ? <div className="loading-center"><div className="spinner"/></div>
      : filtered.length === 0 ? (
        <div className="empty-state">
          <div style={{fontSize:52}}>📋</div>
          <h3>{tab==='All' ? 'No appointments yet' : `No ${tab.toLowerCase()} appointments`}</h3>
          <p>Your appointments will appear here</p>
          <Link to="/doctors" className="btn btn-primary btn-sm" style={{marginTop:16}}>Find a Doctor</Link>
        </div>
      ) : (
        <div style={{display:'flex', flexDirection:'column', gap:12}}>
          {filtered.map((appt, i) => {
            const sc = STATUS_CFG[appt.status] || STATUS_CFG.PENDING;
            return (
              <div key={appt.id} className="card" style={{padding:22, animation:`fadeInUp .35s ease ${i*40}ms both`}}>
                <div style={{display:'flex', gap:16, alignItems:'flex-start'}}>
                  <div style={{width:48, height:48, borderRadius:14, background:'linear-gradient(135deg,#e0f2fe,#bae6fd)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0}}>👨‍⚕️</div>
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:8}}>
                      <div>
                        <div style={{fontWeight:700, fontSize:15, color:'#0f172a'}}>Dr. {appt.doctorName}</div>
                        <div style={{fontSize:13, color:'#0369a1', fontWeight:600}}>{appt.doctorSpecialization}</div>
                      </div>
                      <span style={{display:'inline-flex',alignItems:'center',gap:5,padding:'4px 11px',borderRadius:999,background:sc.bg,color:sc.color,fontSize:12,fontWeight:700,flexShrink:0}}>
                        <span style={{width:6,height:6,borderRadius:'50%',background:sc.dot}} />{sc.icon} {appt.status}
                      </span>
                    </div>

                    <div style={{display:'flex', gap:16, marginTop:10, flexWrap:'wrap', fontSize:13, color:'#64748b', alignItems:'center'}}>
                      <span style={{display:'flex',alignItems:'center',gap:4}}>📅 {appt.appointmentDate}</span>
                      <span style={{display:'flex',alignItems:'center',gap:4}}>⏰ {appt.appointmentTime}</span>
                      <span style={{background:'#f1f5f9',padding:'2px 9px',borderRadius:6,fontWeight:600,color:'#334155',fontSize:12}}>{appt.type?.replace('_',' ')}</span>
                      {appt.consultationFee > 0 && <span style={{fontWeight:600,color:'#0f172a'}}>₹{appt.consultationFee}</span>}
                    </div>

                    {appt.symptoms && (
                      <div style={{marginTop:10, fontSize:13, color:'#334155', background:'#f8fafc', padding:'9px 13px', borderRadius:10, border:'1px solid #e2e8f0'}}>
                        <strong>Symptoms:</strong> {appt.symptoms}
                      </div>
                    )}
                    {appt.cancelReason && (
                      <div style={{marginTop:8, fontSize:13, color:'#991b1b', background:'#fef2f2', padding:'8px 12px', borderRadius:9}}>
                        <strong>Cancellation:</strong> {appt.cancelReason}
                      </div>
                    )}

                    <div style={{display:'flex', gap:8, marginTop:14, flexWrap:'wrap'}}>
                      {['PENDING','CONFIRMED'].includes(appt.status) && (
                        <button className="btn btn-danger btn-sm" onClick={()=>setCancelModal(appt)}>Cancel</button>
                      )}
                      {appt.status==='COMPLETED' && (
                        <button className="btn btn-success btn-sm" onClick={()=>setReviewModal(appt)}>⭐ Review</button>
                      )}
                      <Link to={`/doctors/${appt.doctorId}`} className="btn btn-outline btn-sm">View Doctor</Link>
                      {appt.status==='CANCELLED' && (
                        <Link to={`/book/${appt.doctorId}`} className="btn btn-primary btn-sm">🔄 Rebook</Link>
                      )}
                      {appt.meetingLink && appt.status==='CONFIRMED' && (
                        <a href={appt.meetingLink} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm">💻 Join</a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {reviewModal && <ReviewModal appt={reviewModal} onClose={()=>setReviewModal(null)} onSubmit={(r,c)=>handleReview(reviewModal,r,c)} />}
      {cancelModal && <CancelModal onClose={()=>setCancelModal(null)} onConfirm={reason=>handleCancel(cancelModal.id,reason)} />}
    </div>
  );
}
