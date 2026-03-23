import React, { useState } from 'react';
import { doctorAPI } from '../services/api';
import toast from 'react-hot-toast';

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

export default function DoctorSettings({ doctor, onUpdate }) {
  const [saving, setSaving] = useState(false);
  const [availableDays, setAvailableDays] = useState(doctor.availableDays || []);
  const [timeSlots, setTimeSlots] = useState(doctor.timeSlots || []);
  const [leaveDates, setLeaveDates] = useState(doctor.leaveDates || []);
  const [newLeaveDate, setNewLeaveDate] = useState('');
  const [tab, setTab] = useState('schedule');

  // Career fields
  const [photoPreview, setPhotoPreview] = useState(doctor.profileImage || null);
  const [photoBase64, setPhotoBase64] = useState(null);
  const [workExp, setWorkExp] = useState(doctor.workExperience || []);
  const [documents, setDocuments] = useState(doctor.documents || []);
  const [availableTypes, setAvailableTypes] = useState(doctor.availableTypes || ['In-Person']);

  const handlePhotoChange = e => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('Photo must be under 2MB'); return; }
    const reader = new FileReader();
    reader.onload = ev => { setPhotoPreview(ev.target.result); setPhotoBase64(ev.target.result); };
    reader.readAsDataURL(file);
  };

  const addWorkExp = () => setWorkExp([...workExp, { role: '', hospital: '', from: '', to: '', description: '' }]);
  const updateExp = (i, field, val) => { const n = [...workExp]; n[i][field] = val; setWorkExp(n); };
  const removeExp = i => setWorkExp(workExp.filter((_,idx)=>idx!==i));

  const addDocument = () => setDocuments([...documents, { name: '', type: 'certificate', year: '' }]);
  const updateDoc = (i, field, val) => { const n = [...documents]; n[i][field] = val; setDocuments(n); };
  const removeDoc = i => setDocuments(documents.filter((_,idx)=>idx!==i));

  const toggleType = t => setAvailableTypes(prev => prev.includes(t) ? prev.filter(x=>x!==t) : [...prev, t]);

  const addTimeSlot = () => setTimeSlots([...timeSlots, { startTime: '09:00', endTime: '10:00' }]);
  const updateSlot = (i, field, val) => { const n = [...timeSlots]; n[i][field] = val; setTimeSlots(n); };
  const removeSlot = i => setTimeSlots(timeSlots.filter((_,idx)=>idx!==i));

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...doctor,
        availableDays,
        timeSlots,
        leaveDates,
        availableTypes,
        workExperience: workExp,
        documents,
      };
      if (photoBase64) payload.profileImage = photoBase64;
      await doctorAPI.updateProfile(doctor.id, payload);
      toast.success('Profile updated successfully! ✅');
      if (onUpdate) onUpdate();
    } catch { toast.error('Failed to save changes'); }
    finally { setSaving(false); }
  };

  const tabStyle = active => ({
    padding: '7px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
    background: active ? '#0ea5e9' : 'transparent', color: active ? '#fff' : '#64748b',
    fontWeight: active ? 700 : 500, fontSize: 13, fontFamily: 'DM Sans, sans-serif', transition: 'all .15s',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: 6, background: '#f1f5f9', padding: 5, borderRadius: 12, width: 'fit-content' }}>
        {[{k:'schedule',l:'📅 Schedule'},{k:'career',l:'💼 Career & Photo'},{k:'documents',l:'📄 Documents'}].map(t=>(
          <button key={t.k} onClick={()=>setTab(t.k)} style={tabStyle(tab===t.k)}>{t.l}</button>
        ))}
      </div>

      {/* SCHEDULE TAB */}
      {tab === 'schedule' && (
        <>
          {/* Consult Types */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 14, fontSize: 15 }}>Consultation Types Available</h3>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {['In-Person','Video','Phone'].map(t => (
                <button key={t} onClick={()=>toggleType(t)} style={{
                  padding: '8px 18px', borderRadius: 100, border: `2px solid ${availableTypes.includes(t)?'#0ea5e9':'#e2e8f0'}`,
                  background: availableTypes.includes(t) ? '#e0f2fe' : '#f8fafc',
                  color: availableTypes.includes(t) ? '#0369a1' : '#64748b',
                  fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all .2s',
                  fontFamily: 'DM Sans, sans-serif',
                }}>
                  {t==='Video'?'📹 ':t==='In-Person'?'🏥 ':'📞 '}{t}
                </button>
              ))}
            </div>
          </div>

          {/* Available Days */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 14, fontSize: 15 }}>Available Days</h3>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {DAYS.map(day => (
                <button key={day} onClick={() => setAvailableDays(prev => prev.includes(day) ? prev.filter(d=>d!==day) : [...prev,day])} style={{
                  padding: '8px 16px', borderRadius: 100, border: 'none', cursor: 'pointer',
                  background: availableDays.includes(day) ? '#0ea5e9' : '#f1f5f9',
                  color: availableDays.includes(day) ? 'white' : '#64748b',
                  fontWeight: 600, fontSize: 13, transition: 'all 0.2s', fontFamily: 'DM Sans, sans-serif',
                }}>{day}</button>
              ))}
            </div>
          </div>

          {/* Time Slots */}
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontWeight: 700, fontSize: 15 }}>Time Slots</h3>
              <button onClick={addTimeSlot} className="btn btn-primary btn-sm">+ Add Slot</button>
            </div>
            {timeSlots.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: 13 }}>No time slots added. Patients won't be able to book.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {timeSlots.map((slot, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <input type="time" className="form-input" style={{ width: 140 }} value={slot.startTime} onChange={e=>updateSlot(i,'startTime',e.target.value)} />
                    <span style={{ color: '#64748b' }}>to</span>
                    <input type="time" className="form-input" style={{ width: 140 }} value={slot.endTime} onChange={e=>updateSlot(i,'endTime',e.target.value)} />
                    <button onClick={()=>removeSlot(i)} className="btn btn-danger btn-sm">🗑</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Leave Dates */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 14, fontSize: 15 }}>Leave / Holidays</h3>
            <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
              <input type="date" className="form-input" value={newLeaveDate} onChange={e=>setNewLeaveDate(e.target.value)} style={{ flex: 1 }} min={new Date().toISOString().split('T')[0]} />
              <button onClick={()=>{ if(newLeaveDate && !leaveDates.includes(newLeaveDate)){setLeaveDates([...leaveDates,newLeaveDate].sort()); setNewLeaveDate('');} }} className="btn btn-primary btn-sm">Add</button>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {leaveDates.map(d => (
                <span key={d} style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#fee2e2', color: '#dc2626', padding: '4px 10px', borderRadius: 20, fontSize: 12.5, fontWeight: 600 }}>
                  {d}
                  <button onClick={()=>setLeaveDates(leaveDates.filter(x=>x!==d))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', padding: 0, lineHeight: 1 }}>✕</button>
                </span>
              ))}
            </div>
          </div>
        </>
      )}

      {/* CAREER TAB */}
      {tab === 'career' && (
        <>
          {/* Profile Photo */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 14, fontSize: 15 }}>Profile Photo</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ width: 90, height: 90, borderRadius: 20, background: 'linear-gradient(135deg,#e0f2fe,#bae6fd)', border: '3px solid #bae6fd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, overflow: 'hidden', flexShrink: 0 }}>
                {photoPreview ? <img src={photoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👨‍⚕️'}
              </div>
              <div>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 18px', borderRadius: 10, background: '#0ea5e9', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                  📷 Upload Photo
                  <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
                </label>
                <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 6 }}>JPG, PNG. Max 2MB. Square photo recommended.</p>
              </div>
            </div>
          </div>

          {/* Work Experience */}
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontWeight: 700, fontSize: 15 }}>🏥 Work Experience</h3>
              <button onClick={addWorkExp} className="btn btn-primary btn-sm">+ Add Experience</button>
            </div>
            {workExp.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: 13 }}>No work experience added yet. Add your previous hospitals and roles.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {workExp.map((exp, i) => (
                  <div key={i} style={{ background: '#f8fafc', borderRadius: 14, padding: 16, border: '1px solid #e2e8f0', position: 'relative' }}>
                    <button onClick={()=>removeExp(i)} style={{ position: 'absolute', top: 12, right: 12, background: '#fee2e2', border: 'none', borderRadius: 6, width: 26, height: 26, cursor: 'pointer', color: '#dc2626', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 10 }}>
                      <div className="form-group">
                        <label className="form-label">Role / Designation *</label>
                        <input className="form-input" placeholder="e.g. Senior Cardiologist" value={exp.role} onChange={e=>updateExp(i,'role',e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Hospital / Clinic *</label>
                        <input className="form-input" placeholder="e.g. Apollo Hospitals" value={exp.hospital} onChange={e=>updateExp(i,'hospital',e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">From (Year)</label>
                        <input className="form-input" placeholder="e.g. 2018" value={exp.from} onChange={e=>updateExp(i,'from',e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">To (Year or "Present")</label>
                        <input className="form-input" placeholder="e.g. 2022 or Present" value={exp.to} onChange={e=>updateExp(i,'to',e.target.value)} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Description (optional)</label>
                      <textarea className="form-input" rows={2} placeholder="Brief description of your work..." value={exp.description} onChange={e=>updateExp(i,'description',e.target.value)} style={{ resize: 'none' }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* DOCUMENTS TAB */}
      {tab === 'documents' && (
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontWeight: 700, fontSize: 15 }}>📄 Certifications & Degrees</h3>
            <button onClick={addDocument} className="btn btn-primary btn-sm">+ Add Document</button>
          </div>
          <p style={{ color: '#64748b', fontSize: 13, marginBottom: 16 }}>Add your degrees, certifications, and other credentials that patients can see on your profile.</p>
          {documents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#94a3b8' }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>📄</div>
              <p style={{ fontSize: 13 }}>No documents added. Click "Add Document" to get started.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {documents.map((doc, i) => (
                <div key={i} style={{ background: '#f8fafc', borderRadius: 12, padding: 14, border: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: '1fr 140px 90px 36px', gap: 10, alignItems: 'center' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <input className="form-input" placeholder="e.g. MBBS - AIIMS Delhi" value={doc.name} onChange={e=>updateDoc(i,'name',e.target.value)} />
                  </div>
                  <select className="form-input" value={doc.type} onChange={e=>updateDoc(i,'type',e.target.value)}>
                    <option value="degree">Degree</option>
                    <option value="certificate">Certificate</option>
                    <option value="fellowship">Fellowship</option>
                    <option value="other">Other</option>
                  </select>
                  <input className="form-input" placeholder="Year" value={doc.year} onChange={e=>updateDoc(i,'year',e.target.value)} />
                  <button onClick={()=>removeDoc(i)} style={{ background: '#fee2e2', border: 'none', borderRadius: 8, width: 36, height: 36, cursor: 'pointer', color: '#dc2626', fontSize: 14 }}>🗑</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Save Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={handleSave} className="btn btn-primary" disabled={saving} style={{ padding: '12px 32px', fontSize: 14 }}>
          {saving ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Saving...</> : '💾 Save All Changes'}
        </button>
      </div>
    </div>
  );
}
