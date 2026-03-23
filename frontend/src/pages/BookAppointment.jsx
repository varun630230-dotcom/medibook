import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doctorAPI, appointmentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

function UploadRecords({ files, setFiles }) {
  const dropRef = useRef();
  const inputRef = useRef();

  const ALLOWED = ['image/jpeg','image/png','image/jpg','application/pdf'];
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB per file
  const MAX_FILES = 5;

  const processFiles = newFiles => {
    const valid = [];
    for (const f of newFiles) {
      if (!ALLOWED.includes(f.type)) { toast.error(`${f.name}: only JPG, PNG, PDF allowed`); continue; }
      if (f.size > MAX_SIZE) { toast.error(`${f.name}: must be under 5MB`); continue; }
      if (files.length + valid.length >= MAX_FILES) { toast.error(`Max ${MAX_FILES} files allowed`); break; }
      const reader = new FileReader();
      reader.onload = ev => {
        setFiles(prev => [...prev, { name: f.name, type: f.type, size: f.size, base64: ev.target.result, id: Date.now() + Math.random() }]);
      };
      reader.readAsDataURL(f);
    }
  };

  const onDrop = e => {
    e.preventDefault();
    dropRef.current.style.borderColor = '#e2e8f0';
    processFiles([...e.dataTransfer.files]);
  };

  const formatSize = bytes => bytes < 1024*1024 ? `${(bytes/1024).toFixed(0)} KB` : `${(bytes/(1024*1024)).toFixed(1)} MB`;

  return (
    <div className="card" style={{padding:22}}>
      <div style={{marginBottom:14}}>
        <div style={{fontWeight:700,fontSize:14,color:'#0f172a',marginBottom:3}}>
          📎 Previous Records <span style={{fontWeight:500,fontSize:12,color:'#94a3b8'}}>(optional)</span>
        </div>
        <div style={{fontSize:12.5,color:'#64748b'}}>
          Upload previous prescriptions, test reports, diagnoses, or X-rays to help the doctor prepare
        </div>
      </div>

      {/* Drop zone */}
      <div
        ref={dropRef}
        onDragOver={e=>{e.preventDefault(); dropRef.current.style.borderColor='#0ea5e9'; dropRef.current.style.background='#f0f9ff';}}
        onDragLeave={e=>{dropRef.current.style.borderColor='#e2e8f0'; dropRef.current.style.background='#f8fafc';}}
        onDrop={onDrop}
        onClick={() => files.length < MAX_FILES && inputRef.current?.click()}
        style={{
          border: '2px dashed #e2e8f0', borderRadius: 12, padding: '24px 16px',
          textAlign: 'center', background: '#f8fafc', cursor: files.length < MAX_FILES ? 'pointer' : 'default',
          transition: 'all .2s', marginBottom: files.length > 0 ? 14 : 0,
        }}
        onMouseEnter={e => { if(files.length < MAX_FILES){ e.currentTarget.style.borderColor='#0ea5e9'; e.currentTarget.style.background='#f0f9ff'; }}}
        onMouseLeave={e => { e.currentTarget.style.borderColor='#e2e8f0'; e.currentTarget.style.background='#f8fafc'; }}
      >
        <div style={{fontSize:28,marginBottom:8}}>📄</div>
        <div style={{fontWeight:600,fontSize:13.5,color:'#374151',marginBottom:4}}>
          {files.length < MAX_FILES ? 'Drag & drop files here, or click to browse' : `Maximum ${MAX_FILES} files reached`}
        </div>
        <div style={{fontSize:12,color:'#94a3b8'}}>JPG, PNG, PDF · Max 5MB per file · Up to {MAX_FILES} files</div>
        <input ref={inputRef} type="file" multiple accept=".jpg,.jpeg,.png,.pdf" style={{display:'none'}}
          onChange={e => { processFiles([...e.target.files]); e.target.value=''; }} />
      </div>

      {/* Uploaded files list */}
      {files.length > 0 && (
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {files.map(f => (
            <div key={f.id} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 12px',background:'#f8fafc',borderRadius:10,border:'1px solid #e2e8f0'}}>
              <span style={{fontSize:20,flexShrink:0}}>{f.type==='application/pdf' ? '📄' : '🖼️'}</span>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:600,color:'#0f172a',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{f.name}</div>
                <div style={{fontSize:11,color:'#94a3b8',marginTop:1}}>{formatSize(f.size)}</div>
              </div>
              {f.type.startsWith('image/') && (
                <img src={f.base64} alt={f.name} style={{width:36,height:36,borderRadius:6,objectFit:'cover',border:'1px solid #e2e8f0',flexShrink:0}} />
              )}
              <span style={{fontSize:11,fontWeight:700,background:'#dcfce7',color:'#16a34a',padding:'2px 8px',borderRadius:20,flexShrink:0}}>✓ Ready</span>
              <button onClick={()=>setFiles(prev=>prev.filter(x=>x.id!==f.id))}
                style={{background:'#fee2e2',border:'none',borderRadius:6,width:26,height:26,cursor:'pointer',color:'#dc2626',fontSize:13,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                ✕
              </button>
            </div>
          ))}
          <div style={{fontSize:12,color:'#64748b',textAlign:'right'}}>{files.length}/{MAX_FILES} files uploaded</div>
        </div>
      )}
    </div>
  );
}

const TYPES = [
  { value:'In-Person', label:'In-Person', icon:'🏥', desc:'Visit clinic' },
  { value:'Video', label:'Video Call', icon:'💻', desc:'Online' },
  { value:'Phone', label:'Phone',     icon:'📞', desc:'Call' },
];

const TODAY = new Date().toISOString().split('T')[0];

function fmt(d) {
  if (!d) return '';
  return new Date(d + 'T00:00:00').toLocaleDateString('en-IN', {weekday:'long',day:'numeric',month:'long',year:'numeric'});
}

export default function BookAppointment() {
  const { doctorId } = useParams();
  const { user } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [booked, setBooked] = useState([]);
  const [confirmed, setConfirmed] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [form, setForm] = useState({ appointmentDate:'', appointmentTime:'', symptoms:'', notes:'', type:'IN_PERSON' });

  useEffect(() => {
    doctorAPI.getById(doctorId).then(r=>setDoctor(r.data)).catch(()=>toast.error('Doctor not found')).finally(()=>setLoading(false));
  }, [doctorId]);

  useEffect(() => {
    if (form.appointmentDate && doctorId) {
      doctorAPI.getBookedSlots(doctorId,form.appointmentDate).then(r=>setBooked(r.data)).catch(()=>setBooked([]));
      setForm(p=>({...p,appointmentTime:''}));
    }
  }, [form.appointmentDate, doctorId]);

  const ch = e => setForm(p=>({...p,[e.target.name]:e.target.value}));

  const isLeave = d => doctor?.leaveDates?.includes(d);
  const isDayOk = d => {
    if (!d || !doctor?.availableDays?.length) return true;
    return doctor.availableDays.includes(new Date(d + 'T00:00:00').toLocaleDateString('en-US',{weekday:'long'}));
  };

  const warn = form.appointmentDate && (
    isLeave(form.appointmentDate) ? '⚠️ Doctor is on leave. Please choose another date.'
    : !isDayOk(form.appointmentDate) ? `⚠️ Not available on ${new Date(form.appointmentDate+'T00:00:00').toLocaleDateString('en-US',{weekday:'long'})}s. Available: ${doctor?.availableDays?.join(', ')}`
    : null
  );

  const submit = async e => {
    e.preventDefault();
    if (!form.appointmentDate) { toast.error('Select a date'); return; }
    if (warn) { toast.error('Please choose a valid date'); return; }
    if (!form.appointmentTime) { toast.error('Select a time slot'); return; }
    if (!form.symptoms.trim()) { toast.error('Describe your symptoms'); return; }
    setSubmitting(true);
    try {
      const r = await appointmentAPI.book(user.id, {...form, doctorId});
      toast.success('Appointment booked!');
      setConfirmed(r.data || form);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Booking failed');
    } finally { setSubmitting(false); }
  };

  if (loading) return <div className="loading-center" style={{minHeight:'60vh'}}><div className="spinner"/></div>;
  if (!doctor) return (
    <div className="page-container">
      <div className="empty-state">
        <div style={{fontSize:52}}>😕</div><h3>Doctor not found</h3>
        <Link to="/doctors" className="btn btn-primary btn-sm" style={{marginTop:16}}>Browse Doctors</Link>
      </div>
    </div>
  );

  const initials = `${doctor.firstName?.[0]||''}${doctor.lastName?.[0]||''}`;

  // Confirmation
  if (confirmed) return (
    <div className="page-container fade-in">
      <div style={{maxWidth:580, margin:'40px auto', textAlign:'center'}}>
        <div style={{width:80,height:80,borderRadius:'50%',background:'linear-gradient(135deg,#d1fae5,#a7f3d0)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:38,margin:'0 auto 24px',boxShadow:'0 8px 24px rgba(16,185,129,.2)'}}>🎉</div>
        <h1 style={{fontFamily:'Fraunces, serif',fontSize:30,fontWeight:900,color:'#0f172a',marginBottom:10,letterSpacing:'-.02em'}}>Appointment Confirmed!</h1>
        <p style={{color:'#059669',fontSize:15,fontWeight:600,marginBottom:32}}>✉️ Confirmation sent to your email</p>
        <div className="card" style={{padding:28,textAlign:'left',marginBottom:28,borderRadius:20}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18}}>
            {[
              {l:'Doctor',         v:`Dr. ${doctor.firstName} ${doctor.lastName}`},
              {l:'Specialization', v:doctor.specialization},
              {l:'Date',           v:fmt(form.appointmentDate)},
              {l:'Time',           v:form.appointmentTime},
              {l:'Type',           v:form.type.replace(/_/g,' ')},
              {l:'Location',       v:doctor.hospital||'Online'},
            ].map(({l,v})=>(
              <div key={l}>
                <div style={{fontSize:11,color:'#94a3b8',fontWeight:600,textTransform:'uppercase',letterSpacing:.5,marginBottom:4}}>{l}</div>
                <div style={{fontSize:14,fontWeight:600,color:'#0f172a'}}>{v}</div>
              </div>
            ))}
          </div>
          {uploadedFiles.length > 0 && (
            <div style={{marginTop:18,paddingTop:18,borderTop:'1px solid #f1f5f9'}}>
              <div style={{fontSize:11,color:'#94a3b8',fontWeight:600,textTransform:'uppercase',letterSpacing:.5,marginBottom:10}}>📎 Attached Records</div>
              <div style={{display:'flex',flexDirection:'column',gap:6}}>
                {uploadedFiles.map(f=>(
                  <div key={f.id} style={{display:'flex',alignItems:'center',gap:8,padding:'7px 10px',background:'#f8fafc',borderRadius:8,border:'1px solid #e2e8f0'}}>
                    <span>{f.type==='application/pdf'?'📄':'🖼️'}</span>
                    <span style={{fontSize:12.5,color:'#334155',flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{f.name}</span>
                    <span style={{fontSize:11,fontWeight:700,background:'#dcfce7',color:'#16a34a',padding:'1px 7px',borderRadius:20,flexShrink:0}}>✓ Shared</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div style={{display:'flex',gap:14,justifyContent:'center',flexWrap:'wrap'}}>
          <Link to="/appointments" className="btn btn-primary">View Appointments</Link>
          <Link to="/dashboard" className="btn btn-secondary">Back to Dashboard</Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="page-container fade-in">
      <Link to={`/doctors/${doctorId}`} style={{color:'#64748b',textDecoration:'none',fontSize:14,display:'inline-flex',alignItems:'center',gap:6,marginBottom:24,fontWeight:500}}>
        ← Back to Doctor
      </Link>

      <div style={{display:'grid', gridTemplateColumns:'1fr 320px', gap:24, alignItems:'start'}} className="book-grid">
        <div>
          <h1 style={{fontFamily:'Fraunces, serif',fontSize:26,fontWeight:900,color:'#0f172a',marginBottom:4,letterSpacing:'-.02em'}}>Book Appointment</h1>
          <p style={{color:'#64748b',marginBottom:28,fontSize:14}}>With Dr. {doctor.firstName} {doctor.lastName}</p>

          <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:16}}>
            {/* Type */}
            <div className="card" style={{padding:22}}>
              <div style={{fontWeight:700,fontSize:13,color:'#0f172a',marginBottom:14}}>Consultation Type</div>
              <div style={{display:'flex',gap:10}}>
                {TYPES.map(opt=>(
                  <button key={opt.value} type="button" onClick={()=>setForm(p=>({...p,type:opt.value}))} style={{
                    flex:1, padding:'12px 8px', borderRadius:12,
                    border:`2px solid ${form.type===opt.value?'#0369a1':'#e2e8f0'}`,
                    background:form.type===opt.value?'#e0f2fe':'#fafafa',
                    cursor:'pointer', transition:'all .18s', fontFamily:'Plus Jakarta Sans, sans-serif',
                    display:'flex', flexDirection:'column', alignItems:'center', gap:5,
                  }}>
                    <span style={{fontSize:22}}>{opt.icon}</span>
                    <span style={{fontSize:12,fontWeight:700,color:form.type===opt.value?'#0369a1':'#64748b'}}>{opt.label}</span>
                    <span style={{fontSize:10,color:'#94a3b8'}}>{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Date */}
            <div className="card" style={{padding:22}}>
              <div style={{fontWeight:700,fontSize:13,color:'#0f172a',marginBottom:12}}>Select Date</div>
              <input type="date" name="appointmentDate" value={form.appointmentDate} onChange={ch} min={TODAY} className="form-input" required style={{background:'#fafafa'}} />
              {warn && <div style={{marginTop:10,padding:'10px 12px',background:'#fef3c7',borderRadius:10,fontSize:13,color:'#92400e',border:'1px solid #fde68a'}}>{warn}</div>}
              {form.appointmentDate && !warn && <div style={{marginTop:8,fontSize:12,color:'#059669',fontWeight:600}}>✓ Available date</div>}
              {doctor.availableDays?.length > 0 && <div style={{marginTop:6,fontSize:11,color:'#94a3b8'}}>📅 Available: {doctor.availableDays.join(', ')}</div>}
            </div>

            {/* Slots */}
            {form.appointmentDate && !warn && (
              <div className="card" style={{padding:22}}>
                <div style={{fontWeight:700,fontSize:13,color:'#0f172a',marginBottom:12}}>Select Time Slot</div>
                {doctor.timeSlots?.length === 0 ? (
                  <p style={{color:'#64748b',fontSize:13}}>No slots available. Contact the clinic.</p>
                ) : (
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(120px,1fr))',gap:8}}>
                    {doctor.timeSlots?.map((slot,i) => {
                      const isBooked = booked.includes(slot.startTime);
                      const isSelected = form.appointmentTime === slot.startTime;
                      return (
                        <button key={i} type="button" disabled={isBooked}
                          onClick={()=>setForm(p=>({...p,appointmentTime:slot.startTime}))}
                          style={{
                            padding:'10px 8px', borderRadius:11, fontSize:12, fontWeight:600,
                            border:`2px solid ${isSelected?'#0369a1':isBooked?'#fee2e2':'#e2e8f0'}`,
                            background:isSelected?'#e0f2fe':isBooked?'#fef2f2':'#fafafa',
                            color:isSelected?'#0369a1':isBooked?'#ef4444':'#334155',
                            cursor:isBooked?'not-allowed':'pointer', transition:'all .15s',
                            fontFamily:'Plus Jakarta Sans, sans-serif', opacity:isBooked?.65:1,
                          }}>
                          {slot.startTime}<br/>
                          <span style={{fontSize:9,opacity:.7}}>{isBooked?'✗ Booked':'✓ Free'}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Symptoms */}
            <div className="card" style={{padding:22}}>
              <div className="form-group" style={{marginBottom:14}}>
                <label className="form-label">Symptoms / Reason for Visit *</label>
                <textarea name="symptoms" value={form.symptoms} onChange={ch} rows={3} placeholder="Describe your symptoms or reason for the visit…" className="form-input" style={{resize:'vertical',background:'#fafafa'}} required />
              </div>
              <div className="form-group">
                <label className="form-label">Additional Notes <span style={{color:'#94a3b8',fontWeight:400}}>(optional)</span></label>
                <textarea name="notes" value={form.notes} onChange={ch} rows={2} placeholder="Any other information for the doctor…" className="form-input" style={{resize:'vertical',background:'#fafafa'}} />
              </div>
            </div>

            {/* Upload Previous Records */}
            <UploadRecords files={uploadedFiles} setFiles={setUploadedFiles} />

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={submitting||!!warn}>
              {submitting ? <><span className="spinner" style={{width:16,height:16,borderWidth:2}}/> Booking…</> : '📅 Confirm Appointment'}
            </button>
          </form>
        </div>

        {/* Sidebar */}
        <div style={{position:'sticky',top:80}}>
          <div className="card" style={{padding:22,borderRadius:20}}>
            <div style={{fontSize:11,fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:1,marginBottom:14}}>Booking With</div>
            <div style={{display:'flex',gap:12,alignItems:'center',marginBottom:18}}>
              <div style={{width:52,height:52,borderRadius:14,background:'linear-gradient(135deg,#0ea5e9,#0369a1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:17,fontWeight:800,color:'#fff',flexShrink:0,overflow:'hidden'}}>
                {doctor.profileImage ? <img src={doctor.profileImage} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} /> : initials}
              </div>
              <div>
                <div style={{fontWeight:700,color:'#0f172a',fontSize:14}}>Dr. {doctor.firstName} {doctor.lastName}</div>
                <div style={{color:'#0369a1',fontSize:12,fontWeight:600}}>{doctor.specialization}</div>
              </div>
            </div>
            {form.appointmentDate && (
              <div style={{padding:'11px 13px',background:'#f0f9ff',borderRadius:11,marginBottom:9}}>
                <div style={{fontSize:10,color:'#0369a1',fontWeight:700,textTransform:'uppercase',letterSpacing:.5,marginBottom:2}}>📅 Date</div>
                <div style={{fontWeight:600,color:'#0f172a',fontSize:13}}>{fmt(form.appointmentDate)}</div>
              </div>
            )}
            {form.appointmentTime && (
              <div style={{padding:'11px 13px',background:'#f0fdf4',borderRadius:11,marginBottom:9}}>
                <div style={{fontSize:10,color:'#059669',fontWeight:700,textTransform:'uppercase',letterSpacing:.5,marginBottom:2}}>⏰ Time</div>
                <div style={{fontWeight:700,color:'#0f172a'}}>{form.appointmentTime}</div>
              </div>
            )}
            {doctor.consultationFee > 0 && (
              <div style={{padding:'11px 13px',background:'#fff7ed',borderRadius:11}}>
                <div style={{fontSize:10,color:'#d97706',fontWeight:700,textTransform:'uppercase',letterSpacing:.5,marginBottom:2}}>💰 Fee</div>
                <div style={{fontWeight:800,fontSize:20,color:'#0f172a'}}>₹{doctor.consultationFee}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media(max-width:768px){ .book-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
