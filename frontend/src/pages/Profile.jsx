import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI, doctorAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, login } = useAuth();
  const [form, setForm] = useState({
    firstName: user?.firstName || '', lastName: user?.lastName || '',
    phone: user?.phone || '', dateOfBirth: user?.dateOfBirth || '',
    gender: user?.gender || '', bloodGroup: user?.bloodGroup || '', address: user?.address || ''
  });
  const [docForm, setDocForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [docSaving, setDocSaving] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoBase64, setPhotoBase64] = useState(null);
  const fileInputRef = useRef();

  useEffect(() => {
    if (user?.role === 'DOCTOR') {
      doctorAPI.getMyProfile(user.id).then(r => {
        const d = r.data;
        setDocForm({
          id: d.id, specialization: d.specialization || '',
          qualification: d.qualification || '', experienceYears: d.experienceYears || 0,
          bio: d.bio || '', hospital: d.hospital || '', location: d.location || '',
          consultationFee: d.consultationFee || 0,
        });
        if (d.profileImage) setPhotoPreview(d.profileImage);
      }).catch(() => {});
    }
  }, [user]);

  const ch  = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const dch = e => setDocForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handlePhotoChange = e => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { toast.error('Photo must be under 3MB'); return; }
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
    const reader = new FileReader();
    reader.onload = ev => { setPhotoPreview(ev.target.result); setPhotoBase64(ev.target.result); };
    reader.readAsDataURL(file);
  };

  const save = async e => {
    e.preventDefault(); setSaving(true);
    try {
      const r = await authAPI.updateProfile(user.id, form);
      login({ ...user, ...r.data });
      toast.success('Profile updated! ✅');
    } catch { toast.error('Failed to update'); } finally { setSaving(false); }
  };

  const docSave = async e => {
    e.preventDefault(); setDocSaving(true);
    try {
      const payload = {
        ...docForm,
        consultationFee: Number(docForm.consultationFee),
        experienceYears: Number(docForm.experienceYears),
      };
      if (photoBase64) payload.profileImage = photoBase64;
      await doctorAPI.updateProfile(docForm.id, payload);
      toast.success('Professional profile saved! ✅');
    } catch { toast.error('Failed to update'); } finally { setDocSaving(false); }
  };

  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`;

  return (
    <div className="page-container fade-in">
      <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 800, color: '#0f172a', marginBottom: 24 }}>My Profile</h1>

      {/* Profile Header Card */}
      <div className="card" style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 22, flexWrap: 'wrap' }}>
          {/* Avatar with camera overlay for doctors */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{
              width: 88, height: 88, borderRadius: 22,
              background: photoPreview ? 'transparent' : 'linear-gradient(135deg,#0ea5e9,#0369a1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 30, fontWeight: 800, color: '#fff', overflow: 'hidden',
              border: '3px solid #e0f2fe', boxShadow: '0 4px 16px rgba(3,105,161,.18)',
            }}>
              {photoPreview
                ? <img src={photoPreview} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : initials}
            </div>
            {user?.role === 'DOCTOR' && (
              <button onClick={() => fileInputRef.current?.click()} title="Upload photo"
                style={{
                  position: 'absolute', bottom: -4, right: -4, width: 26, height: 26,
                  borderRadius: '50%', background: '#0ea5e9', border: '2px solid #fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', fontSize: 12, boxShadow: '0 2px 8px rgba(14,165,233,.4)',
                }}>📷</button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 20, color: '#0f172a' }}>{user?.firstName} {user?.lastName}</div>
            <div style={{ fontSize: 13.5, color: '#64748b', marginTop: 2 }}>{user?.email}</div>
            <div style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 5, background: '#e0f2fe', color: '#0369a1', padding: '3px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700 }}>
              {user?.role === 'DOCTOR' ? '👨‍⚕️' : user?.role === 'ADMIN' ? '🛡️' : '🤒'} {user?.role}
            </div>
            {user?.role === 'DOCTOR' && (
              <div style={{ marginTop: 6, fontSize: 12, color: '#94a3b8' }}>
                📷 Click the camera icon to upload your professional photo — patients will see this when viewing your profile
              </div>
            )}
          </div>

          {/* Doctor upload button on right */}
          {user?.role === 'DOCTOR' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
              <button onClick={() => fileInputRef.current?.click()} style={{
                display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 10,
                background: 'linear-gradient(135deg,#0ea5e9,#0369a1)', color: '#fff', border: 'none',
                fontFamily: 'DM Sans, sans-serif', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                boxShadow: '0 3px 10px rgba(3,105,161,.3)',
              }}>📷 Upload Professional Photo</button>
              <span style={{ fontSize: 11, color: '#94a3b8', textAlign: 'right' }}>
                JPG / PNG · Max 3MB<br />Clear, front-facing half-photo recommended
              </span>
              {photoPreview && photoBase64 && (
                <button onClick={() => { setPhotoPreview(null); setPhotoBase64(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                  style={{ fontSize: 12, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                  ✕ Remove photo
                </button>
              )}
            </div>
          )}
        </div>

        {/* Photo preview banner when newly uploaded */}
        {photoPreview && photoBase64 && (
          <div style={{ marginTop: 16, padding: '12px 16px', background: '#f0fdf4', borderRadius: 12, border: '1px solid #bbf7d0', display: 'flex', gap: 12, alignItems: 'center' }}>
            <img src={photoPreview} alt="Preview" style={{ width: 52, height: 52, borderRadius: 10, objectFit: 'cover', border: '2px solid #86efac' }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#166534' }}>✅ Photo ready to save</div>
              <div style={{ fontSize: 12, color: '#15803d', marginTop: 2 }}>
                Save your Professional Profile below to make this photo visible to patients.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Personal Info */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header"><div className="section-title">Personal Information</div></div>
        <div style={{ padding: 28 }}>
          <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[{ n: 'firstName', l: 'First Name' }, { n: 'lastName', l: 'Last Name' }].map(f => (
                <div key={f.n} className="form-group">
                  <label className="form-label">{f.l}</label>
                  <input name={f.n} value={form[f.n]} onChange={ch} className="form-input" style={{ background: '#fafafa' }} />
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input name="phone" value={form.phone} onChange={ch} className="form-input" placeholder="+91 98765 43210" style={{ background: '#fafafa' }} />
              </div>
              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={ch} className="form-input" style={{ background: '#fafafa' }} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select name="gender" value={form.gender} onChange={ch} className="form-input" style={{ background: '#fafafa' }}>
                  <option value="">Select</option>
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Blood Group</label>
                <select name="bloodGroup" value={form.bloodGroup} onChange={ch} className="form-input" style={{ background: '#fafafa' }}>
                  <option value="">Select</option>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg}>{bg}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <textarea name="address" value={form.address} onChange={ch} className="form-input" rows={2} style={{ resize: 'vertical', background: '#fafafa' }} />
            </div>
            <div>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <><span className="spinner" style={{ width: 15, height: 15, borderWidth: 2 }} /> Saving…</> : '💾 Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Doctor Professional Profile */}
      {user?.role === 'DOCTOR' && docForm && (
        <div className="card">
          <div className="card-header"><div className="section-title">Professional Profile <span style={{ fontSize: 11, fontWeight: 500, color: '#94a3b8', marginLeft: 6 }}>— visible to patients</span></div></div>
          <div style={{ padding: 28 }}>
            <form onSubmit={docSave} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Specialization</label>
                  <input name="specialization" value={docForm.specialization} onChange={dch} className="form-input" placeholder="e.g. Cardiologist" style={{ background: '#fafafa' }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Qualification</label>
                  <input name="qualification" value={docForm.qualification} onChange={dch} className="form-input" placeholder="e.g. MBBS, MD (Cardiology)" style={{ background: '#fafafa' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                {[
                  { n: 'experienceYears', l: 'Experience (years)', t: 'number' },
                  { n: 'consultationFee', l: 'Consultation Fee (₹)', t: 'number' },
                  { n: 'hospital', l: 'Hospital / Clinic', t: 'text' },
                ].map(f => (
                  <div key={f.n} className="form-group">
                    <label className="form-label">{f.l}</label>
                    <input type={f.t} name={f.n} value={docForm[f.n]} onChange={dch} className="form-input" min={0} style={{ background: '#fafafa' }} />
                  </div>
                ))}
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input name="location" value={docForm.location} onChange={dch} className="form-input" placeholder="City, State" style={{ background: '#fafafa' }} />
              </div>
              <div className="form-group">
                <label className="form-label">Bio <span style={{ color: '#94a3b8', fontWeight: 400, fontSize: 11, textTransform: 'none' }}>(patients read this)</span></label>
                <textarea name="bio" value={docForm.bio} onChange={dch} className="form-input" rows={4}
                  placeholder="Tell patients about your expertise, approach to care, and what they can expect from a consultation with you…"
                  style={{ resize: 'vertical', background: '#fafafa' }} />
              </div>
              <div>
                <button type="submit" className="btn btn-primary" disabled={docSaving}>
                  {docSaving ? <><span className="spinner" style={{ width: 15, height: 15, borderWidth: 2 }} /> Saving…</> : '💾 Save Professional Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
