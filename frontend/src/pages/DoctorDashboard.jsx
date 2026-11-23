import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { appointmentAPI, doctorAPI } from '../services/api';
import toast from 'react-hot-toast';
import DoctorSettings from '../components/DoctorSettings';

const SC = {
  PENDING:   { bg:'#fef3c7', color:'#92400e', dot:'#f59e0b', label:'Pending' },
  CONFIRMED: { bg:'#d1fae5', color:'#065f46', dot:'#10b981', label:'Confirmed' },
  CANCELLED: { bg:'#fee2e2', color:'#991b1b', dot:'#ef4444', label:'Cancelled' },
  COMPLETED: { bg:'#e0f2fe', color:'#075985', dot:'#0ea5e9', label:'Completed' },
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
  const [pendingVisitSettings, setPendingVisitSettings] = useState(false);
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
    { label:"Total Patients", value: appointments.length, icon:'👥', color:'#0369a1', bg:'#e0f2fe' },
    { label:"Today's Appts",  value: todayAppts.length,   icon:'📅', color:'#059669', bg:'#d1fae5' },
    { label:"Pending",        value: pendingAppts.length, icon:'⏳', color:'#d97706', bg:'#fef3c7' },
    { label:"Completed",      value: appointments.filter(a=>a.status==='COMPLETED').length, icon:'✅', color:'#6366f1', bg:'#ede9fe' },
  ];

  if (loading) return <div className="loading-center" style={{minHeight:'60vh'}}><div className="spinner"/></div>;

  if (doctor && doctor.rejected && !pendingVisitSettings) {
    return (
      <div style={{ background: '#f8fafc', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div className="card" style={{ padding: 40, textAlign: 'center', maxWidth: 520, borderRadius: 24, boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>❌</div>
          <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 900, color: '#dc2626', marginBottom: 12 }}>Application Rejected</h2>
          <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.5, marginBottom: 8 }}>
            Unfortunately, your doctor verification was not approved.
          </p>
          {doctor.rejectionReason && (
            <div style={{ background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: 14, padding: '16px 20px', marginBottom: 20, textAlign: 'left' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#991b1b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Reason for Rejection</div>
              <div style={{ fontSize: 14, color: '#7f1d1d', lineHeight: 1.5 }}>{doctor.rejectionReason}</div>
            </div>
          )}
          <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.5, marginBottom: 24 }}>
            You can update your profile and documents, then resubmit for review.
          </p>
          <button className="btn btn-primary" onClick={() => setPendingVisitSettings(true)} style={{ width: '100%', marginBottom: 12 }}>Update Profile & Resubmit</button>
          <button className="btn btn-outline" onClick={load} style={{ width: '100%' }}>Refresh Status</button>
        </div>
      </div>
    );
  }

  if (doctor && !doctor.approved && !doctor.rejected && !pendingVisitSettings) {
    return (
      <div style={{ background: '#f8fafc', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div className="card" style={{ padding: 40, textAlign: 'center', maxWidth: 500, borderRadius: 24, boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>⏳</div>
          <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 900, color: '#0f172a', marginBottom: 12 }}>Pending Approval</h2>
          <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.5, marginBottom: 20 }}>
            To complete verification, please upload your qualification details, work experience, and supporting proof documents in the settings section.
          </p>
          <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.5, marginBottom: 24 }}>
            Wait for the admin can approve your request. You will gain full access to your dashboard once approved.
          </p>
          <button className="btn btn-primary" onClick={() => setPendingVisitSettings(true)} style={{ width: '100%', marginBottom: 12 }}>Go to Settings to Upload Documents</button>
          <button className="btn btn-outline" onClick={load} style={{ width: '100%' }}>Refresh Status</button>
        </div>
      </div>
    );
  }

  if (doctor && (!doctor.approved || doctor.rejected) && pendingVisitSettings) {
    return (
      <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '32px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 28, fontWeight: 900, color: '#0f172a' }}>Complete Your Doctor Verification</h1>
              <p style={{ color: '#64748b' }}>Add your details and documents, then notify the admin to approve.</p>
            </div>
            <button className="btn btn-outline" onClick={() => setPendingVisitSettings(false)} style={{ minHeight: 40 }}>Back to Pending</button>
          </div>
          <div className="card" style={{ padding: 32 }}><DoctorSettings doctor={doctor || { id: null, availableDays: [], timeSlots: [], leaveDates: [] }} onUpdate={load} /></div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '32px' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        
        {/* Sub-Navigation mimicking mockup */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 32, borderBottom: '1.5px solid #e2e8f0', paddingBottom: 16 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#0369a1', display: 'flex', alignItems: 'center', gap: 8, marginRight: 24 }}>
            <div style={{width:24,height:24,background:'#0369a1',color:'#fff',borderRadius:6,display:'flex',justifyContent:'center',alignItems:'center'}}>+</div>
            Doctor Dashboard
          </div>
          {[
            {k:'today', l:'Dashboard'},
            {k:'pending', l:'Requests'},
            {k:'all', l:'Patients'},
            {k:'settings', l:'Settings'}
          ].map(t => (
            <button key={t.k} onClick={()=>setTab(t.k)} style={{
              background: 'none', border: 'none', fontSize: 14, fontWeight: tab===t.k ? 700 : 500,
              color: tab===t.k ? '#0f172a' : '#64748b', cursor: 'pointer', position: 'relative'
            }}>
              {t.l}
              {tab===t.k && <div style={{position:'absolute', bottom:-18, left:0, right:0, height:3, background:'#0369a1', borderRadius:'3px 3px 0 0'}} />}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          {tab !== 'settings' && (
            <div className="search-input-wrapper" style={{ height: 40, width: 240, background: '#fff' }}>
              <span>🔍</span>
              <input placeholder="Search patients..." value={search} onChange={e=>setSearch(e.target.value)} />
            </div>
          )}
        </div>

        {tab === 'settings' ? (
          <div className="card" style={{ padding: 32 }}><DoctorSettings doctor={doctor||{id:null,availableDays:[],timeSlots:[],leaveDates:[]}} onUpdate={load} /></div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: 24 }}>
            
            {/* Left Sidebar Profile Card */}
            <div className="card" style={{ padding: 32, textAlign: 'center', alignSelf: 'start', borderRadius: 24 }}>
              <div style={{ width: 120, height: 120, borderRadius: '50%', background: 'linear-gradient(135deg, #e0f2fe, #bae6fd)', color: '#0369a1', fontSize: 40, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', textTransform: 'uppercase' }}>
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#10b981', background: '#d1fae5', padding: '4px 10px', borderRadius: 999, display: 'inline-block', marginBottom: 12 }}>VERIFIED DOCTOR</div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>Dr. {user.firstName} {user.lastName}</h2>
              <div style={{ fontSize: 14, color: '#64748b', marginBottom: 24 }}>{doctor?.specialization || 'General Practice'} • {doctor?.experienceYears || 0} Yrs Exp.</div>
              
              <div style={{ background: '#f8fafc', borderRadius: 16, padding: 16, textAlign: 'left' }}>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Hospital Context</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>{doctor?.hospital || 'MediBook Network'}</div>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Consultation Fee</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#0369a1' }}>₹{doctor?.consultationFee || 0}</div>
              </div>

              {!doctor && (
                <div style={{ marginTop: 24, padding: 16, background: '#fef3c7', borderRadius: 16, fontSize: 13, color: '#92400e', textAlign: 'left' }}>
                  ⚠️ Your profile is incomplete. Patients cannot book appointments until you configure your settings.
                  <button onClick={()=>setTab('settings')} className="btn btn-outline btn-sm btn-full" style={{marginTop: 10, borderColor: '#d97706', color: '#d97706'}}>Go to Settings</button>
                </div>
              )}
            </div>

            {/* Right Main Content */}
            <div>
              {/* Welcome Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
                <div>
                  <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 28, fontWeight: 900, color: '#0f172a', marginBottom: 6 }}>Good Morning, Dr. {user.firstName} 👋</h1>
                  <p style={{ fontSize: 15, color: '#64748b' }}>Here is your routine summary for {new Date().toLocaleDateString('en-US', {weekday:'long', month:'long', day:'numeric'})}</p>
                </div>
              </div>

              {/* Stats Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
                {stats.map((s, i) => (
                  <div key={i} className="card doc-card-h" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                     <div style={{ width: 44, height: 44, borderRadius: 14, background: s.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize: 20 }}>{s.icon}</div>
                     <div>
                       <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', lineHeight: 1, marginBottom: 4 }}>{s.value}</div>
                       <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>{s.label}</div>
                     </div>
                  </div>
                ))}
              </div>

              {/* Appointments List */}
              <div className="card" style={{ borderRadius: 24, padding: 32 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>Recent Appointments</h2>
                  <button className="btn btn-ghost btn-sm" style={{ color: '#0369a1' }}>View All →</button>
                </div>

                {displayed.length === 0 ? (
                  <div className="empty-state" style={{ padding: '40px 20px' }}>
                    <div style={{fontSize:40, opacity:0.5}}>📆</div>
                    <h3 style={{margin:'10px 0'}}>No appointments found</h3>
                    <p>There are no appointments matching this view.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {displayed.map(appt => {
                      const sc = SC[appt.status];
                      return (
                        <div key={appt.id} style={{ display: 'flex', alignItems: 'center', gap: 20, padding: 20, border: '1px solid #e2e8f0', borderRadius: 16 }}>
                          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)', color: '#0f172a', fontSize: 18, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', textTransform: 'uppercase' }}>
                            {appt.patientName?.[0]}
                          </div>
                          
                          <div style={{ flex: 1.5 }}>
                            <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>{appt.patientName}</div>
                            <div style={{ fontSize: 13, color: '#64748b' }}>{appt.type?.replace('_',' ')} • {appt.patientEmail}</div>
                          </div>

                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>{appt.appointmentDate}</div>
                            <div style={{ fontSize: 13, color: '#64748b' }}>{appt.appointmentTime}</div>
                          </div>

                          <div style={{ flex: 1 }}>
                            <span style={{ display:'inline-block', padding: '4px 12px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: sc.bg, color: sc.color }}>
                              {sc.label}
                            </span>
                          </div>

                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', flex: 1, justifyContent: 'flex-end' }}>
                            {appt.status==='PENDING' && (
                              <>
                                <button className="btn btn-success btn-sm" disabled={updatingId===appt.id} onClick={()=>updateStatus(appt.id,'CONFIRMED')}>✓ Accept</button>
                                <button className="btn btn-danger btn-sm" disabled={updatingId===appt.id} onClick={()=>setDeclineId(appt.id)}>✗ Decline</button>
                              </>
                            )}
                            {appt.status==='CONFIRMED' && (
                              <button className="btn btn-primary btn-sm" disabled={updatingId===appt.id} onClick={()=>updateStatus(appt.id,'COMPLETED')}>✓ Mark Done</button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

      </div>
      {declineId && <DeclineModal onClose={()=>setDeclineId(null)} onConfirm={reason=>{updateStatus(declineId,'CANCELLED',{cancelReason:reason||'Doctor unavailable'});setDeclineId(null);}} />}
    </div>
  );
}
