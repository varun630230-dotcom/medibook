import React, { useEffect, useState, useMemo } from 'react';
import { appointmentAPI, doctorAPI } from '../services/api';
import toast from 'react-hot-toast';

/* ─── tiny SVG mini-chart helpers (no external libs) ─── */
const COLORS = ['#6366f1','#0ea5e9','#f59e0b','#10b981','#ef4444','#8b5cf6','#ec4899','#14b8a6','#f97316','#64748b'];

function MiniDonut({ data, size = 160 }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (!total) return <div style={{width:size,height:size,display:'flex',alignItems:'center',justifyContent:'center',color:'#94a3b8',fontSize:13}}>No data</div>;
  let cum = 0;
  const segs = data.map((d, i) => {
    const pct = (d.value / total) * 100;
    const start = cum;
    cum += pct;
    return { ...d, pct, start, color: d.color || COLORS[i % COLORS.length] };
  });
  const r = size / 2; const cx = r; const cy = r; const strokeW = 28; const ir = r - strokeW;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {segs.map((s, i) => {
        const circ = 2 * Math.PI * ir;
        const dashLen = (s.pct / 100) * circ;
        const dashOff = -((s.start / 100) * circ);
        return <circle key={i} cx={cx} cy={cy} r={ir} fill="none" stroke={s.color} strokeWidth={strokeW}
          strokeDasharray={`${dashLen} ${circ - dashLen}`} strokeDashoffset={dashOff}
          style={{transform:'rotate(-90deg)',transformOrigin:'center',transition:'all .6s ease'}} />;
      })}
      <text x={cx} y={cy-6} textAnchor="middle" style={{fontSize:22,fontWeight:800,fill:'#1e293b'}}>{total}</text>
      <text x={cx} y={cy+12} textAnchor="middle" style={{fontSize:10,fill:'#94a3b8',fontWeight:600}}>TOTAL</text>
    </svg>
  );
}

function BarChart({ data, height = 180 }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{display:'flex',alignItems:'flex-end',gap:6,height,padding:'0 4px'}}>
      {data.map((d, i) => {
        const h = Math.max((d.value / max) * (height - 30), 3);
        return (
          <div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
            <span style={{fontSize:10,fontWeight:700,color:'#475569'}}>{d.value || ''}</span>
            <div style={{width:'100%',maxWidth:36,height:h,borderRadius:'6px 6px 2px 2px',
              background:`linear-gradient(180deg,${d.color || COLORS[i%COLORS.length]},${d.color || COLORS[i%COLORS.length]}cc)`,
              transition:'height .5s ease',boxShadow:`0 2px 8px ${(d.color||COLORS[i%COLORS.length])}33`}} />
            <span style={{fontSize:9,color:'#94a3b8',fontWeight:600,textAlign:'center',lineHeight:1.1,maxWidth:42,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function HorizontalBar({ label, value, max, color, suffix = '' }) {
  const pct = max ? (value / max) * 100 : 0;
  return (
    <div style={{marginBottom:10}}>
      <div style={{display:'flex',justifyContent:'space-between',fontSize:12,marginBottom:4}}>
        <span style={{fontWeight:600,color:'#334155'}}>{label}</span>
        <span style={{fontWeight:700,color}}>{value}{suffix}</span>
      </div>
      <div style={{height:8,borderRadius:99,background:'#f1f5f9',overflow:'hidden'}}>
        <div style={{height:'100%',width:`${pct}%`,borderRadius:99,background:color,transition:'width .6s ease'}} />
      </div>
    </div>
  );
}

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
  const [docStatusFilter, setDocStatusFilter] = useState('All');
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctorDetailsLoading, setDoctorDetailsLoading] = useState(false);
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const load = async () => {
    try {
      const [ar, dr, sr] = await Promise.all([appointmentAPI.getAllAppointments(), doctorAPI.getAllAdmin(), appointmentAPI.getStats()]);
      setAppointments(ar.data); setDoctors(dr.data); setStats(sr.data);
    } catch { toast.error('Failed to load data'); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!selectedDoctorId) {
      setSelectedDoctor(null);
      return;
    }

    let active = true;
    setSelectedDoctor(null);
    setDoctorDetailsLoading(true);
    doctorAPI.getById(selectedDoctorId)
      .then(({ data }) => { if (active) setSelectedDoctor(data); })
      .catch(() => {
        if (active) {
          toast.error('Failed to load doctor details');
          setSelectedDoctorId(null);
        }
      })
      .finally(() => { if (active) setDoctorDetailsLoading(false); });

    return () => { active = false; };
  }, [selectedDoctorId]);

  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    try { await appointmentAPI.updateStatus(id,{status}); toast.success(`Updated to ${status.toLowerCase()}`); load(); }
    catch { toast.error('Update failed'); } finally { setUpdatingId(null); }
  };

  const approveDoctor = async (id) => {
    setUpdatingId(id);
    try { await doctorAPI.approve(id); toast.success('Doctor approved'); setSelectedDoctorId(null); setRejectMode(false); setRejectReason(''); load(); }
    catch(e) { toast.error(e?.response?.data?.error || e?.response?.data?.message || 'Approval failed'); } finally { setUpdatingId(null); }
  };

  const rejectDoctor = async (id) => {
    if (!rejectReason.trim()) { toast.error('Please provide a rejection reason'); return; }
    setUpdatingId(id);
    try { await doctorAPI.reject(id, rejectReason.trim()); toast.success('Doctor rejected'); setSelectedDoctorId(null); setRejectMode(false); setRejectReason(''); load(); }
    catch { toast.error('Rejection failed'); } finally { setUpdatingId(null); }
  };

  const removeDoctor = async (id) => {
    if(!window.confirm('Remove this doctor?')) return;
    setUpdatingId(id);
    try { await doctorAPI.deleteDoctor(id); toast.success('Doctor removed'); load(); }
    catch { toast.error('Removal failed'); } finally { setUpdatingId(null); }
  };

  const filteredAppts = useMemo(() => {
    let r = appointments;
    if (statusFilter !== 'All') r = r.filter(a=>a.status===statusFilter);
    if (apptSearch.trim()) { const s=apptSearch.toLowerCase(); r=r.filter(a=>a.patientName?.toLowerCase().includes(s)||a.doctorName?.toLowerCase().includes(s)||a.patientEmail?.toLowerCase().includes(s)); }
    return r;
  }, [appointments, statusFilter, apptSearch]);

  const filteredDocs = useMemo(() => {
    let list = doctors;
    // Status filter
    if (docStatusFilter === 'Approved') list = list.filter(d => d.approved);
    else if (docStatusFilter === 'Pending') list = list.filter(d => !d.approved && !d.rejected);
    else if (docStatusFilter === 'Rejected') list = list.filter(d => d.rejected);
    // Text search
    if (docSearch.trim()) {
      const s = docSearch.toLowerCase();
      list = list.filter(d => `${d.firstName} ${d.lastName}`.toLowerCase().includes(s) || d.email?.toLowerCase().includes(s) || d.specialization?.toLowerCase().includes(s) || d.hospital?.toLowerCase().includes(s));
    }
    return list;
  }, [doctors, docSearch, docStatusFilter]);

  const docCounts = useMemo(() => ({
    all: doctors.length,
    approved: doctors.filter(d => d.approved).length,
    pending: doctors.filter(d => !d.approved && !d.rejected).length,
    rejected: doctors.filter(d => d.rejected).length,
  }), [doctors]);

  /* ─── Analytics computed data ─── */
  const analytics = useMemo(() => {
    if (!appointments.length && !doctors.length) return null;

    // Status breakdown
    const statusMap = {};
    const typeMap = {};
    const specMap = {};
    const doctorApptCount = {};
    const dayOfWeekMap = { Sun:0, Mon:0, Tue:0, Wed:0, Thu:0, Fri:0, Sat:0 };
    const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const hourMap = {};
    let totalRevenue = 0;
    let paidCount = 0;
    const monthMap = {};

    appointments.forEach(a => {
      // Status
      statusMap[a.status] = (statusMap[a.status]||0) + 1;

      // Type
      const typeName = a.type?.replace('_',' ') || 'In Person';
      typeMap[typeName] = (typeMap[typeName]||0) + 1;

      // Specialization
      const spec = a.doctorSpecialization || 'General';
      specMap[spec] = (specMap[spec]||0) + 1;

      // Doctor appointment count
      const dName = a.doctorName || 'Unknown';
      doctorApptCount[dName] = (doctorApptCount[dName]||0) + 1;

      // Day of week
      if (a.appointmentDate) {
        try {
          const d = new Date(a.appointmentDate);
          if (!isNaN(d)) dayOfWeekMap[dayNames[d.getDay()]]++;
        } catch {}
      }

      // Hour distribution
      if (a.appointmentTime) {
        const h = parseInt(a.appointmentTime.split(':')[0]);
        if (!isNaN(h)) {
          const label = h < 12 ? `${h || 12} AM` : h === 12 ? '12 PM' : `${h-12} PM`;
          hourMap[label] = (hourMap[label]||0) + 1;
        }
      }

      // Revenue
      if (a.consultationFee) {
        totalRevenue += a.consultationFee;
        if (a.isPaid) paidCount++;
      }

      // Monthly trend
      if (a.appointmentDate) {
        const mm = a.appointmentDate.substring(0, 7); // yyyy-MM
        monthMap[mm] = (monthMap[mm]||0) + 1;
      }
    });

    // Top doctors
    const topDoctors = Object.entries(doctorApptCount)
      .sort((a,b) => b[1]-a[1])
      .slice(0, 6)
      .map(([name, count]) => ({ name, count }));

    // Top specializations
    const topSpecs = Object.entries(specMap)
      .sort((a,b) => b[1]-a[1])
      .slice(0, 6);

    // Weekly pattern
    const weekData = dayNames.map(d => ({ label: d, value: dayOfWeekMap[d], color: '#6366f1' }));

    // Hour sorted
    const hourOrder = ['6 AM','7 AM','8 AM','9 AM','10 AM','11 AM','12 PM','1 PM','2 PM','3 PM','4 PM','5 PM','6 PM','7 PM','8 PM','9 PM'];
    const hourData = hourOrder.filter(h => hourMap[h]).map((h,i) => ({ label: h, value: hourMap[h], color: COLORS[i%COLORS.length] }));

    // Monthly trend (last 6 months)
    const months = Object.keys(monthMap).sort().slice(-6);
    const monthData = months.map((m,i) => ({
      label: new Date(m+'-01').toLocaleString('en',{month:'short'}),
      value: monthMap[m],
      color: '#0ea5e9'
    }));

    // Type distribution
    const typeData = Object.entries(typeMap).map(([k,v],i) => ({
      label: k, value: v, color: COLORS[i%COLORS.length]
    }));

    // Status donut data
    const statusColors = { PENDING:'#d97706', CONFIRMED:'#059669', COMPLETED:'#0369a1', CANCELLED:'#dc2626', RESCHEDULED:'#8b5cf6' };
    const statusData = Object.entries(statusMap).map(([k,v]) => ({
      label: k, value: v, color: statusColors[k] || '#64748b'
    }));

    // Doctor stats
    const activeDoctors = doctors.filter(d => d.available).length;
    const pendingApproval = doctors.filter(d => !d.approved).length;
    const avgRating = doctors.length ? (doctors.reduce((s,d) => s + (d.rating||0), 0) / doctors.length).toFixed(1) : '0';
    const avgFee = doctors.length ? Math.round(doctors.reduce((s,d) => s + (d.consultationFee||0), 0) / doctors.length) : 0;

    // Completion rate
    const completedCount = statusMap['COMPLETED'] || 0;
    const nonCancelled = appointments.filter(a => a.status !== 'CANCELLED').length;
    const completionRate = nonCancelled ? Math.round((completedCount / nonCancelled) * 100) : 0;
    const cancelRate = appointments.length ? Math.round(((statusMap['CANCELLED']||0) / appointments.length) * 100) : 0;

    return {
      statusData, typeData, topDoctors, topSpecs, weekData, hourData, monthData,
      totalRevenue, paidCount, activeDoctors, pendingApproval, avgRating, avgFee,
      completionRate, cancelRate
    };
  }, [appointments, doctors]);

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
        {[{k:'overview',l:'📊 Overview'},{k:'analytics',l:'📈 Analytics'},{k:'appointments',l:`📋 Appointments (${appointments.length})`},{k:'doctors',l:`👨‍⚕️ Doctors (${doctors.length})`}].map(t=>(
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

      {/* ═══════════ ANALYTICS TAB ═══════════ */}
      {tab==='analytics' && analytics && (
        <div className="fade-in">
          {/* KPI Row */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:20}} className="stagger">
            {[
              {icon:'💰', label:'Total Revenue', value:`₹${analytics.totalRevenue.toLocaleString()}`, sub:`${analytics.paidCount} paid`, color:'#059669', bg:'linear-gradient(135deg,#ecfdf5,#d1fae5)'},
              {icon:'✅', label:'Completion Rate', value:`${analytics.completionRate}%`, sub:'of non-cancelled', color:'#0369a1', bg:'linear-gradient(135deg,#e0f2fe,#bae6fd)'},
              {icon:'❌', label:'Cancellation Rate', value:`${analytics.cancelRate}%`, sub:'of total', color:'#dc2626', bg:'linear-gradient(135deg,#fff1f2,#fee2e2)'},
              {icon:'⭐', label:'Avg Doctor Rating', value:analytics.avgRating, sub:`${doctors.length} doctors`, color:'#d97706', bg:'linear-gradient(135deg,#fffbeb,#fef3c7)'},
            ].map((kpi,i) => (
              <div key={i} className="card fade-in-up" style={{padding:20,background:kpi.bg,animationDelay:`${i*60}ms`,border:'1.5px solid rgba(0,0,0,.04)'}}>
                <div style={{fontSize:20,marginBottom:6}}>{kpi.icon}</div>
                <div style={{fontSize:22,fontWeight:800,color:kpi.color}}>{kpi.value}</div>
                <div style={{fontSize:12,fontWeight:600,color:'#475569',marginTop:2}}>{kpi.label}</div>
                <div style={{fontSize:10,color:'#94a3b8',marginTop:2}}>{kpi.sub}</div>
              </div>
            ))}
          </div>

          {/* Row 1: Status Donut + Weekly Pattern */}
          <div style={{display:'grid',gridTemplateColumns:'340px 1fr',gap:18,marginBottom:18}}>
            {/* Status Donut */}
            <div className="card" style={{padding:24}}>
              <div style={{fontWeight:700,fontSize:14,marginBottom:16,color:'#1e293b'}}>📊 Appointment Status</div>
              <div style={{display:'flex',justifyContent:'center',marginBottom:16}}>
                <MiniDonut data={analytics.statusData} size={160} />
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:6}}>
                {analytics.statusData.map((s,i) => (
                  <div key={i} style={{display:'flex',alignItems:'center',gap:8,fontSize:12}}>
                    <div style={{width:10,height:10,borderRadius:3,background:s.color,flexShrink:0}} />
                    <span style={{flex:1,fontWeight:500,color:'#475569',textTransform:'capitalize'}}>{s.label.toLowerCase()}</span>
                    <span style={{fontWeight:700,color:'#1e293b'}}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly Pattern + Monthly Trend stacked */}
            <div style={{display:'flex',flexDirection:'column',gap:18}}>
              <div className="card" style={{padding:24,flex:1}}>
                <div style={{fontWeight:700,fontSize:14,marginBottom:16,color:'#1e293b'}}>📅 Weekly Appointment Pattern</div>
                <BarChart data={analytics.weekData} height={130} />
              </div>
              {analytics.monthData.length > 1 && (
                <div className="card" style={{padding:24,flex:1}}>
                  <div style={{fontWeight:700,fontSize:14,marginBottom:16,color:'#1e293b'}}>📈 Monthly Trend</div>
                  <BarChart data={analytics.monthData} height={130} />
                </div>
              )}
            </div>
          </div>

          {/* Row 2: Specialization + Top Doctors */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18,marginBottom:18}}>
            {/* Specialization */}
            <div className="card" style={{padding:24}}>
              <div style={{fontWeight:700,fontSize:14,marginBottom:16,color:'#1e293b'}}>🏥 Top Specializations</div>
              {analytics.topSpecs.map(([spec, count], i) => (
                <HorizontalBar key={i} label={spec} value={count} max={analytics.topSpecs[0][1]} color={COLORS[i%COLORS.length]} />
              ))}
              {!analytics.topSpecs.length && <div style={{color:'#94a3b8',fontSize:13,padding:20,textAlign:'center'}}>No specialization data</div>}
            </div>

            {/* Top Doctors */}
            <div className="card" style={{padding:24}}>
              <div style={{fontWeight:700,fontSize:14,marginBottom:16,color:'#1e293b'}}>🏆 Top Doctors by Appointments</div>
              {analytics.topDoctors.map((d, i) => (
                <div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'8px 0',borderBottom:i<analytics.topDoctors.length-1?'1px solid #f1f5f9':'none'}}>
                  <div style={{width:28,height:28,borderRadius:8,background:`linear-gradient(135deg,${COLORS[i%COLORS.length]},${COLORS[i%COLORS.length]}bb)`,
                    display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800,color:'#fff',flexShrink:0}}>
                    {i+1}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:600,fontSize:13,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>Dr. {d.name}</div>
                  </div>
                  <div style={{fontSize:13,fontWeight:800,color:COLORS[i%COLORS.length]}}>{d.count}</div>
                </div>
              ))}
              {!analytics.topDoctors.length && <div style={{color:'#94a3b8',fontSize:13,padding:20,textAlign:'center'}}>No data yet</div>}
            </div>
          </div>

          {/* Row 3: Type Distribution + Time Heatmap + Doctor Quick Stats */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:18, marginBottom:18}}>
            {/* Type Distribution */}
            <div className="card" style={{padding:24}}>
              <div style={{fontWeight:700,fontSize:14,marginBottom:16,color:'#1e293b'}}>🩺 Appointment Types</div>
              {analytics.typeData.length ? (
                <>
                  <div style={{display:'flex',justifyContent:'center',marginBottom:14}}>
                    <MiniDonut data={analytics.typeData} size={120} />
                  </div>
                  <div style={{display:'flex',flexDirection:'column',gap:5}}>
                    {analytics.typeData.map((t,i) => (
                      <div key={i} style={{display:'flex',alignItems:'center',gap:8,fontSize:12}}>
                        <div style={{width:8,height:8,borderRadius:2,background:t.color,flexShrink:0}}/>
                        <span style={{flex:1,color:'#475569',fontWeight:500,textTransform:'capitalize'}}>{t.label.toLowerCase()}</span>
                        <span style={{fontWeight:700,color:'#1e293b'}}>{t.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : <div style={{color:'#94a3b8',fontSize:13,textAlign:'center'}}>No data</div>}
            </div>

            {/* Peak Hours */}
            <div className="card" style={{padding:24}}>
              <div style={{fontWeight:700,fontSize:14,marginBottom:16,color:'#1e293b'}}>🕐 Peak Appointment Hours</div>
              {analytics.hourData.length ? (
                <BarChart data={analytics.hourData} height={160} />
              ) : <div style={{color:'#94a3b8',fontSize:13,textAlign:'center',padding:20}}>No time data</div>}
            </div>

            {/* Doctor Quick Stats */}
            <div className="card" style={{padding:24}}>
              <div style={{fontWeight:700,fontSize:14,marginBottom:16,color:'#1e293b'}}>👨‍⚕️ Doctor Statistics</div>
              <div style={{display:'flex',flexDirection:'column',gap:12}}>
                {[
                  {icon:'🟢', label:'Active Doctors', value: analytics.activeDoctors, color:'#059669'},
                  {icon:'⏳', label:'Pending Approval', value: analytics.pendingApproval, color:'#d97706'},
                  {icon:'👥', label:'Total Doctors', value: doctors.length, color:'#6366f1'},
                  {icon:'💵', label:'Avg Consultation Fee', value: `₹${analytics.avgFee}`, color:'#0369a1'},
                ].map((s,i) => (
                  <div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 14px',borderRadius:12,background:'#f8fafc',transition:'background .15s'}}
                    onMouseEnter={e=>e.currentTarget.style.background='#f1f5f9'}
                    onMouseLeave={e=>e.currentTarget.style.background='#f8fafc'}>
                    <span style={{fontSize:18}}>{s.icon}</span>
                    <div style={{flex:1}}>
                      <div style={{fontSize:12,color:'#64748b',fontWeight:500}}>{s.label}</div>
                    </div>
                    <div style={{fontSize:16,fontWeight:800,color:s.color}}>{s.value}</div>
                  </div>
                ))}
              </div>
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
          {/* Status filter tabs */}
          <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap'}}>
            {[
              {k:'All',       label:'All Doctors',    count:docCounts.all,      color:'#6366f1', bg:'#ede9fe'},
              {k:'Approved',  label:'✓ Approved',     count:docCounts.approved, color:'#059669', bg:'#d1fae5'},
              {k:'Pending',   label:'⏳ Pending',     count:docCounts.pending,  color:'#d97706', bg:'#fef3c7'},
              {k:'Rejected',  label:'✗ Rejected',     count:docCounts.rejected, color:'#dc2626', bg:'#fee2e2'},
            ].map(f => (
              <button key={f.k} onClick={() => setDocStatusFilter(f.k)} style={{
                padding:'8px 16px', borderRadius:12, border: docStatusFilter===f.k ? `2px solid ${f.color}` : '2px solid transparent',
                background: docStatusFilter===f.k ? f.bg : '#f8fafc', color: docStatusFilter===f.k ? f.color : '#64748b',
                fontWeight:700, fontSize:13, cursor:'pointer', transition:'all .2s', fontFamily:'Plus Jakarta Sans, sans-serif',
                display:'flex', alignItems:'center', gap:8,
              }}>
                {f.label}
                <span style={{background: docStatusFilter===f.k ? f.color : '#cbd5e1', color:'#fff', padding:'1px 7px', borderRadius:99, fontSize:11, fontWeight:800}}>{f.count}</span>
              </button>
            ))}
          </div>

          <div style={{position:'relative',marginBottom:18}}>
            <span style={{position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',fontSize:16,color:'#94a3b8'}}>🔍</span>
            <input className="form-input" style={{paddingLeft:42,width:'100%'}} placeholder="Search by name, email, or specialization…" value={docSearch} onChange={e=>setDocSearch(e.target.value)} />
          </div>
          <div style={{fontSize:12,color:'#94a3b8',marginBottom:16}}>{filteredDocs.length} of {doctors.length} doctors</div>

          {filteredDocs.length === 0 ? (
            <div className="card" style={{padding:'40px 20px',textAlign:'center'}}>
              <div style={{fontSize:40,marginBottom:12}}>{docStatusFilter==='Rejected'?'🚫':'📭'}</div>
              <h3 style={{fontSize:16,fontWeight:700,color:'#334155',marginBottom:6}}>No {docStatusFilter !== 'All' ? docStatusFilter.toLowerCase() : ''} doctors found</h3>
              <p style={{fontSize:13,color:'#94a3b8'}}>{docStatusFilter==='Rejected'?'No doctors have been rejected yet.':'Try adjusting your search or filter.'}</p>
            </div>
          ) : (
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:14}}>
            {filteredDocs.map(d=>{
              const statusColor = d.approved ? '#059669' : d.rejected ? '#dc2626' : '#d97706';
              const statusBg = d.approved ? '#d1fae5' : d.rejected ? '#fee2e2' : '#fef3c7';
              const statusLabel = d.approved ? '✓ Approved' : d.rejected ? '✗ Rejected' : '⏳ Pending';
              return (
              <div key={d.id} className="card card-hover" style={{padding:20, borderLeft:`4px solid ${statusColor}`}}>
                <div style={{display:'flex',gap:12,alignItems:'center'}}>
                  <div style={{width:44,height:44,borderRadius:13,background:`linear-gradient(135deg,${statusColor},${statusColor}cc)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,fontWeight:800,color:'#fff',flexShrink:0}}>
                    {d.firstName?.[0]}{d.lastName?.[0]}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:700,fontSize:13,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                      Dr. {d.firstName} {d.lastName}
                    </div>
                    <div style={{fontSize:12,color:'#0369a1'}}>{d.specialization || 'Not set'}</div>
                    <div style={{fontSize:11,color:'#94a3b8',marginTop:1}}>{d.email}</div>
                  </div>
                  <span style={{background:statusBg, color:statusColor, padding:'3px 10px', borderRadius:999, fontWeight:700, fontSize:10, whiteSpace:'nowrap', flexShrink:0}}>{statusLabel}</span>
                </div>
                {d.rejected && d.rejectionReason && (
                  <div style={{marginTop:10,padding:'8px 12px',background:'#fef2f2',borderRadius:8,fontSize:12,color:'#991b1b',lineHeight:1.4}}>
                    <strong>Reason:</strong> {d.rejectionReason}
                  </div>
                )}
                <div style={{marginTop:12,display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:12,color:'#64748b'}}>
                  <div style={{display:'flex', gap:6, flexWrap:'wrap', flex:1}}>
                    {!d.approved ? (
                      <button onClick={() => { setSelectedDoctorId(d.id); setRejectMode(false); setRejectReason(''); }} className="btn btn-sm btn-primary" style={{padding:'4px 10px', fontSize:11}}>Review & Verify</button>
                    ) : (
                      <button onClick={() => setSelectedDoctorId(d.id)} className="btn btn-sm btn-outline" style={{padding:'4px 10px', fontSize:11}}>View profile</button>
                    )}
                    <button onClick={() => removeDoctor(d.id)} className="btn btn-sm btn-danger" disabled={updatingId===d.id} style={{padding:'4px 10px', fontSize:11}}>Remove</button>
                  </div>
                  <span style={{background:d.available?'#d1fae5':'#fee2e2',color:d.available?'#065f46':'#991b1b',padding:'2px 8px',borderRadius:999,fontWeight:700,fontSize:11}}>{d.available?'Active':'Inactive'}</span>
                </div>
              </div>
            );})}
          </div>
          )}
        </div>
      )}

      <style>{`
        @media(max-width:900px){.admin-stats{grid-template-columns:repeat(3,1fr)!important;}.overview-grid{grid-template-columns:1fr!important;}}
        @media(max-width:600px){.admin-stats{grid-template-columns:repeat(2,1fr)!important;}}
      `}</style>

      {selectedDoctorId && doctorDetailsLoading && (
        <div style={{ position:'fixed', inset:0, background:'rgba(15,23,42,0.8)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff' }}>
          <div className="spinner" />
        </div>
      )}

      {/* Verification Modal */}
      {selectedDoctor && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="card fade-in-up" style={{ width: '100%', maxWidth: 700, maxHeight: '90vh', overflowY: 'auto', padding: 32, borderRadius: 24, position: 'relative' }}>
            <button onClick={() => setSelectedDoctorId(null)} style={{ position:'absolute', top:24, right:24, background:'#f1f5f9', border:'none', width:36, height:36, borderRadius:12, cursor:'pointer', fontWeight:800, color:'#64748b' }}>✕</button>
            
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Doctor Profile Review</h2>
            <p style={{ color: '#64748b', marginBottom: 24 }}>Review qualifications and proofs before granting active platform access.</p>
            
            <div style={{ background: '#f8fafc', padding: 20, borderRadius: 16, marginBottom: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Personal Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div><div style={{ fontSize: 12, color: '#94a3b8' }}>Full Name</div><div style={{ fontWeight: 600 }}>Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}</div></div>
                <div><div style={{ fontSize: 12, color: '#94a3b8' }}>Specialization</div><div style={{ fontWeight: 600 }}>{selectedDoctor.specialization || 'Not Set'}</div></div>
                <div><div style={{ fontSize: 12, color: '#94a3b8' }}>Email Address</div><div style={{ fontWeight: 600 }}>{selectedDoctor.email}</div></div>
                <div><div style={{ fontSize: 12, color: '#94a3b8' }}>Phone Number</div><div style={{ fontWeight: 600 }}>{selectedDoctor.phone || 'Not Set'}</div></div>
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Experience</h3>
              {!selectedDoctor.workExperience?.length ? <p style={{ color: '#94a3b8' }}>No work experience added.</p> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {selectedDoctor.workExperience.map((exp, i) => (
                    <div key={i} style={{ borderLeft: '3px solid #0ea5e9', paddingLeft: 14 }}>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{exp.role} <span style={{ color: '#0369a1', fontWeight: 600, fontSize: 13 }}>@ {exp.hospital}</span></div>
                      <div style={{ fontSize: 13, color: '#64748b' }}>{exp.from} - {exp.to}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ marginBottom: 32 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Uploaded Proofs & Documents</h3>
              {!selectedDoctor.documents?.length ? <p style={{ color: '#94a3b8' }}>No documents uploaded.</p> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {selectedDoctor.documents.map((doc, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', border: '1px solid #e2e8f0', padding: 14, borderRadius: 12 }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{doc.name || 'Unnamed Document'}</div>
                        <div style={{ fontSize: 12, color: '#64748b', textTransform: 'capitalize' }}>{doc.type} • {doc.year}</div>
                      </div>
                      {doc.fileData ? (
                        <a href={doc.fileData} download={`Dr_${selectedDoctor.lastName}_${doc.name}.pdf`} className="btn btn-sm btn-outline" style={{ background: '#f8fafc' }}>
                          📥 Download / View
                        </a>
                      ) : (
                        <span style={{ fontSize: 12, color: '#64748b', background: '#f1f5f9', padding: '4px 8px', borderRadius: 6, fontWeight: 600 }}>No file attached</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedDoctor.rejected && (
              <div style={{ background: '#fee2e2', color: '#991b1b', padding: 14, borderRadius: 12, marginBottom: 16, fontSize: 13 }}>
                <strong>❌ Previously Rejected:</strong> {selectedDoctor.rejectionReason || 'No reason provided.'}
              </div>
            )}

            {!selectedDoctor.approved && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {rejectMode ? (
                  <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 14, padding: 16 }}>
                    <label style={{ fontWeight: 700, fontSize: 13, color: '#9a3412', marginBottom: 8, display: 'block' }}>Rejection Reason *</label>
                    <textarea className="form-input" rows={3} placeholder="Explain why this doctor's application is being rejected…" value={rejectReason} onChange={e => setRejectReason(e.target.value)} style={{ resize: 'none', marginBottom: 12 }} />
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button onClick={() => rejectDoctor(selectedDoctor.id)} disabled={updatingId === selectedDoctor.id} className="btn btn-danger" style={{ flex: 1, padding: 12, fontSize: 14 }}>
                        {updatingId === selectedDoctor.id ? 'Rejecting...' : '✗ Confirm Rejection'}
                      </button>
                      <button onClick={() => { setRejectMode(false); setRejectReason(''); }} className="btn btn-outline" style={{ flex: 1, padding: 12, fontSize: 14 }}>Back</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button onClick={() => approveDoctor(selectedDoctor.id)} disabled={updatingId === selectedDoctor.id} className="btn btn-success" style={{ flex: 1, padding: 16, fontSize: 15 }}>
                      {updatingId === selectedDoctor.id ? 'Approving...' : '✅ Approve Doctor Access'}
                    </button>
                    <button onClick={() => setRejectMode(true)} className="btn btn-danger" style={{ flex: 1, padding: 16, fontSize: 15 }}>❌ Reject</button>
                  </div>
                )}
              </div>
            )}
            
            {selectedDoctor.approved && (
              <div style={{ textAlign: 'center', background: '#d1fae5', color: '#065f46', padding: 16, borderRadius: 14, fontWeight: 700 }}>
                This doctor is already verified and active.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
