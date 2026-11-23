import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { doctorAPI } from "../services/api";
import toast from "react-hot-toast";

const specialties = [
  { icon:"🩺", name:"General Physician", color:"#6366f1" },
  { icon:"❤️", name:"Cardiologist",      color:"#ef4444" },
  { icon:"🧬", name:"Dermatologist",     color:"#ec4899" },
  { icon:"🦴", name:"Orthopedic",        color:"#f59e0b" },
  { icon:"🧒", name:"Pediatrician",      color:"#10b981" },
  { icon:"🧠", name:"Neurologist",       color:"#8b5cf6" },
  { icon:"🧘", name:"Psychiatrist",      color:"#7c3aed" },
  { icon:"👁️", name:"Ophthalmologist",   color:"#0ea5e9" },
];

const typeColor = { "Video":"#0ea5e9", "In-Person":"#10b981", "Phone":"#f59e0b" };
const sortOptions = ["Relevance","Rating","Experience","Fee: Low to High","Fee: High to Low"];
const slots = ["09:00","10:30","11:00","12:00","14:00","15:30","17:00","18:30"];
const feeRanges = { "All":[0,99999], "Under ₹300":[0,299], "₹300–₹600":[300,600], "₹600–₹1000":[601,1000], "Above ₹1000":[1001,99999] };

function DoctorProfileModal({ doctor, onClose, onBook }) {
  const [tab, setTab] = useState("about");
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.55)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(4px)"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:24,width:"100%",maxWidth:640,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 24px 64px rgba(0,0,0,.22)",animation:"modalIn .22s ease"}}>
        {/* Header */}
        <div style={{background:"linear-gradient(135deg,#0369a1,#0ea5e9)",padding:"28px 28px 20px",borderRadius:"24px 24px 0 0",position:"relative"}}>
          <button onClick={onClose} style={{position:"absolute",top:16,right:16,background:"rgba(255,255,255,.2)",border:"none",borderRadius:8,width:32,height:32,cursor:"pointer",fontSize:15,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
          <div style={{display:"flex",gap:18,alignItems:"flex-start"}}>
            <div style={{width:80,height:80,borderRadius:20,background:"rgba(255,255,255,.2)",border:"3px solid rgba(255,255,255,.4)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:38,flexShrink:0,overflow:"hidden"}}>
              {doctor.profileImage ? <img src={doctor.profileImage} alt={doctor.firstName} style={{width:"100%",height:"100%",objectFit:"cover"}} /> : "👨‍⚕️"}
            </div>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:800,color:"#fff"}}>Dr. {doctor.firstName} {doctor.lastName}</h2>
                <span style={{background:"rgba(255,255,255,.25)",color:"#fff",fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:20}}>✓ Verified</span>
              </div>
              <div style={{color:"rgba(255,255,255,.9)",fontSize:14,fontWeight:600,marginBottom:4}}>{doctor.specialization || "General Practice"}</div>
              <div style={{color:"rgba(255,255,255,.75)",fontSize:13}}>{doctor.qualification}</div>
              <div style={{display:"flex",gap:16,marginTop:10}}>
                <span style={{color:"rgba(255,255,255,.9)",fontSize:12}}>⭐ {doctor.rating?.toFixed(1) || "New"} ({doctor.totalReviews || 0} reviews)</span>
                {doctor.experienceYears > 0 && <span style={{color:"rgba(255,255,255,.9)",fontSize:12}}>🎓 {doctor.experienceYears} yrs exp</span>}
                <span style={{background:doctor.available?"rgba(74,222,128,.25)":"rgba(239,68,68,.25)",color:doctor.available?"#4ade80":"#f87171",fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:20}}>
                  {doctor.available ? "● Available" : "● Unavailable"}
                </span>
              </div>
            </div>
          </div>
          <div style={{display:"flex",gap:8,marginTop:16}}>
            {[{k:"about",l:"About"},{k:"career",l:"Career & Education"},{k:"schedule",l:"Schedule"}].map(t=>(
              <button key={t.k} onClick={()=>setTab(t.k)} style={{padding:"7px 16px",borderRadius:20,border:"none",background:tab===t.k?"#fff":"rgba(255,255,255,.2)",color:tab===t.k?"#0369a1":"#fff",fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:12.5,cursor:"pointer",transition:"all .15s"}}>
                {t.l}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div style={{padding:24}}>
          {tab==="about" && (
            <div style={{display:"flex",flexDirection:"column",gap:16}}>
              {doctor.bio && (
                <div style={{background:"#f8fafc",borderRadius:14,padding:16,border:"1px solid #e2e8f0"}}>
                  <div style={{fontSize:12,fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:.5,marginBottom:8}}>About</div>
                  <p style={{fontSize:14,color:"#334155",lineHeight:1.75}}>{doctor.bio}</p>
                </div>
              )}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                {[
                  {l:"🏥 Hospital",  v:doctor.hospital},
                  {l:"📍 Location",  v:doctor.location},
                  {l:"📞 Phone",     v:doctor.phone},
                  {l:"✉️ Email",     v:doctor.email},
                  {l:"💰 Fee",       v:doctor.consultationFee > 0 ? `₹${doctor.consultationFee} / consult` : "Not set"},
                  {l:"🗣️ Languages", v:"English, Hindi"},
                ].filter(x=>x.v).map(x=>(
                  <div key={x.l} style={{background:"#f8fafc",borderRadius:10,padding:"10px 14px",border:"1px solid #e2e8f0"}}>
                    <div style={{fontSize:11,color:"#94a3b8",fontWeight:600,marginBottom:3}}>{x.l}</div>
                    <div style={{fontSize:13,fontWeight:600,color:"#0f172a"}}>{x.v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab==="career" && (
            <div style={{display:"flex",flexDirection:"column",gap:16}}>
              {/* Education */}
              {doctor.qualification && (
                <div style={{background:"#f8fafc",borderRadius:14,padding:16,border:"1px solid #e2e8f0"}}>
                  <div style={{fontSize:12,fontWeight:700,color:"#0369a1",textTransform:"uppercase",letterSpacing:.5,marginBottom:12}}>🎓 Education & Qualifications</div>
                  <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                    <div style={{width:36,height:36,borderRadius:10,background:"#e0f2fe",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>🎓</div>
                    <div>
                      <div style={{fontWeight:700,fontSize:14,color:"#0f172a"}}>{doctor.qualification}</div>
                      {doctor.experienceYears > 0 && <div style={{fontSize:12.5,color:"#64748b",marginTop:2}}>{doctor.experienceYears} years of clinical practice</div>}
                    </div>
                  </div>
                </div>
              )}

              {/* Work Experience */}
              {doctor.workExperience && doctor.workExperience.length > 0 ? (
                <div style={{background:"#f8fafc",borderRadius:14,padding:16,border:"1px solid #e2e8f0"}}>
                  <div style={{fontSize:12,fontWeight:700,color:"#059669",textTransform:"uppercase",letterSpacing:.5,marginBottom:12}}>🏥 Work Experience</div>
                  <div style={{display:"flex",flexDirection:"column",gap:12}}>
                    {doctor.workExperience.map((exp,i)=>(
                      <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start",paddingBottom:12,borderBottom:i<doctor.workExperience.length-1?"1px solid #e2e8f0":"none"}}>
                        <div style={{width:36,height:36,borderRadius:10,background:"#d1fae5",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>🏥</div>
                        <div>
                          <div style={{fontWeight:700,fontSize:14,color:"#0f172a"}}>{exp.role}</div>
                          <div style={{fontSize:13,color:"#0369a1",fontWeight:600}}>{exp.hospital}</div>
                          <div style={{fontSize:12,color:"#64748b",marginTop:1}}>{exp.from} – {exp.to || "Present"}</div>
                          {exp.description && <div style={{fontSize:12.5,color:"#475569",marginTop:4,lineHeight:1.5}}>{exp.description}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{background:"#f8fafc",borderRadius:14,padding:16,border:"1px solid #e2e8f0"}}>
                  <div style={{fontSize:12,fontWeight:700,color:"#059669",textTransform:"uppercase",letterSpacing:.5,marginBottom:12}}>🏥 Work Experience</div>
                  {doctor.hospital && (
                    <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                      <div style={{width:36,height:36,borderRadius:10,background:"#d1fae5",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>🏥</div>
                      <div>
                        <div style={{fontWeight:700,fontSize:14,color:"#0f172a"}}>{doctor.specialization || "Doctor"}</div>
                        <div style={{fontSize:13,color:"#0369a1",fontWeight:600}}>{doctor.hospital}</div>
                        {doctor.location && <div style={{fontSize:12,color:"#64748b",marginTop:1}}>{doctor.location}</div>}
                        {doctor.experienceYears > 0 && <div style={{fontSize:12.5,color:"#475569",marginTop:4}}>{doctor.experienceYears} years of experience</div>}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Documents */}
              {doctor.documents && doctor.documents.length > 0 && (
                <div style={{background:"#f8fafc",borderRadius:14,padding:16,border:"1px solid #e2e8f0"}}>
                  <div style={{fontSize:12,fontWeight:700,color:"#7c3aed",textTransform:"uppercase",letterSpacing:.5,marginBottom:12}}>📄 Certifications & Documents</div>
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {doctor.documents.map((doc,i)=>(
                      <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:"#fff",borderRadius:10,border:"1px solid #e2e8f0"}}>
                        <span style={{fontSize:20}}>{doc.type==="certificate"?"🏆":doc.type==="degree"?"🎓":"📄"}</span>
                        <div style={{flex:1}}>
                          <div style={{fontSize:13,fontWeight:600,color:"#0f172a"}}>{doc.name}</div>
                          {doc.year && <div style={{fontSize:11.5,color:"#64748b"}}>{doc.year}</div>}
                        </div>
                        <span style={{fontSize:11,fontWeight:700,background:"#ede9fe",color:"#7c3aed",padding:"2px 8px",borderRadius:6}}>Verified</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {tab==="schedule" && (
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div style={{background:"#f8fafc",borderRadius:14,padding:16,border:"1px solid #e2e8f0"}}>
                <div style={{fontSize:12,fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:.5,marginBottom:12}}>Available Days</div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d=>{
                    const full = {Mon:"Monday",Tue:"Tuesday",Wed:"Wednesday",Thu:"Thursday",Fri:"Friday",Sat:"Saturday",Sun:"Sunday"}[d];
                    const avail = (doctor.availableDays||[]).includes(full);
                    return <span key={d} style={{padding:"6px 14px",borderRadius:20,fontSize:12.5,fontWeight:700,background:avail?"#e0f2fe":"#f1f5f9",color:avail?"#0369a1":"#94a3b8",border:`1px solid ${avail?"#bae6fd":"#e2e8f0"}`}}>{d}</span>;
                  })}
                </div>
              </div>
              {doctor.timeSlots?.length > 0 && (
                <div style={{background:"#f8fafc",borderRadius:14,padding:16,border:"1px solid #e2e8f0"}}>
                  <div style={{fontSize:12,fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:.5,marginBottom:12}}>Time Slots</div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(110px,1fr))",gap:8}}>
                    {doctor.timeSlots.map((s,i)=>(
                      <div key={i} style={{background:"#e0f2fe",borderRadius:8,padding:"8px 10px",textAlign:"center",fontSize:12.5,fontWeight:600,color:"#0369a1",border:"1px solid #bae6fd"}}>
                        {s.startTime}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Book CTA */}
          {doctor.available && (
            <button onClick={()=>onBook(doctor)} style={{width:"100%",marginTop:20,background:"linear-gradient(135deg,#0ea5e9,#0369a1)",color:"#fff",border:"none",borderRadius:14,padding:"15px",fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:15,cursor:"pointer",boxShadow:"0 6px 20px rgba(3,105,161,.3)"}}>
              Book Appointment · ₹{doctor.consultationFee || "—"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function BookingModal({ doctor, onClose, onConfirm }) {
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [consultType, setConsultType] = useState((doctor.availableTypes||["In-Person"])[0]);
  const types = doctor.availableTypes || ["In-Person"];
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:1010,display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(4px)"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:24,padding:28,width:"100%",maxWidth:460,boxShadow:"0 24px 64px rgba(0,0,0,.2)",animation:"modalIn .2s ease",maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18}}>
          <div>
            <h2 style={{fontSize:18,fontWeight:700,color:"#0f172a"}}>Book Appointment</h2>
            <p style={{color:"#64748b",fontSize:12.5,marginTop:2}}>Dr. {doctor.firstName} {doctor.lastName} · {doctor.specialization}</p>
          </div>
          <button onClick={onClose} style={{background:"#f1f5f9",border:"none",borderRadius:8,width:32,height:32,cursor:"pointer",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
        </div>
        <div style={{background:"#f0f9ff",borderRadius:12,padding:14,marginBottom:20,display:"flex",gap:12,alignItems:"center",border:"1px solid #e0f2fe"}}>
          <div style={{width:48,height:48,borderRadius:12,background:"linear-gradient(135deg,#e0f2fe,#bae6fd)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,overflow:"hidden",flexShrink:0}}>
            {doctor.profileImage ? <img src={doctor.profileImage} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} /> : "👨‍⚕️"}
          </div>
          <div style={{flex:1}}>
            <div style={{fontWeight:700,color:"#0f172a",fontSize:14}}>Dr. {doctor.firstName} {doctor.lastName}</div>
            <div style={{color:"#0ea5e9",fontSize:12.5,fontWeight:600}}>{doctor.specialization}</div>
            <div style={{color:"#64748b",fontSize:11.5,marginTop:1}}>{doctor.hospital}</div>
          </div>
          <div style={{fontWeight:800,fontSize:18,color:"#0f172a",flexShrink:0}}>₹{doctor.consultationFee}</div>
        </div>
        <p style={{fontSize:12,fontWeight:700,color:"#374151",marginBottom:10,textTransform:"uppercase",letterSpacing:.5}}>Consultation Type</p>
        <div style={{display:"flex",gap:8,marginBottom:20}}>
          {types.map(t=>(
            <button key={t} onClick={()=>setConsultType(t)} style={{flex:1,padding:"10px 6px",borderRadius:10,border:`2px solid ${consultType===t?typeColor[t]||"#0ea5e9":"#e2e8f0"}`,background:consultType===t?`${typeColor[t]||"#0ea5e9"}18`:"#f8fafc",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:700,color:consultType===t?typeColor[t]||"#0ea5e9":"#64748b",cursor:"pointer",transition:"all .15s",textAlign:"center"}}>
              {t==="Video"?"📹":t==="In-Person"?"🏥":"📞"}<br/><span style={{fontSize:11}}>{t}</span>
            </button>
          ))}
        </div>
        <p style={{fontSize:12,fontWeight:700,color:"#374151",marginBottom:10,textTransform:"uppercase",letterSpacing:.5}}>Select Time Slot</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:20}}>
          {slots.map(s=>(
            <button key={s} onClick={()=>setSelectedSlot(s)} style={{padding:"9px 4px",borderRadius:8,border:`1.5px solid ${selectedSlot===s?"#0ea5e9":"#e2e8f0"}`,background:selectedSlot===s?"#0ea5e9":"#f8fafc",fontFamily:"'DM Sans',sans-serif",fontSize:11.5,fontWeight:600,color:selectedSlot===s?"#fff":"#374151",cursor:"pointer",transition:"all .15s"}}>
              {s}
            </button>
          ))}
        </div>
        <button onClick={()=>selectedSlot&&onConfirm(selectedSlot,consultType)} style={{width:"100%",background:selectedSlot?"linear-gradient(135deg,#0ea5e9,#0369a1)":"#e2e8f0",color:selectedSlot?"#fff":"#94a3b8",border:"none",borderRadius:12,padding:"14px",fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:15,cursor:selectedSlot?"pointer":"not-allowed",transition:"all .2s",boxShadow:selectedSlot?"0 5px 18px rgba(14,165,233,.35)":"none"}}>
          {selectedSlot?`✓ Confirm Booking · ₹${doctor.consultationFee}`:"Select a time slot to continue"}
        </button>
      </div>
    </div>
  );
}

function ConfirmationScreen({ doctor, slot, consultType, onClose }) {
  const bookingId = `MB${Date.now().toString().slice(-8)}`;
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.55)",zIndex:1020,display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(4px)"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:24,padding:32,width:"100%",maxWidth:480,boxShadow:"0 24px 64px rgba(0,0,0,.2)",animation:"modalIn .25s ease"}}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{width:72,height:72,borderRadius:"50%",background:"linear-gradient(135deg,#d1fae5,#a7f3d0)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,margin:"0 auto 14px",boxShadow:"0 6px 20px rgba(16,185,129,.2)"}}>🎉</div>
          <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:800,color:"#0f172a",marginBottom:5}}>Appointment Confirmed!</h2>
          <p style={{fontSize:13,color:"#059669",fontWeight:600}}>✉️ Confirmation sent to your email</p>
        </div>
        <div style={{background:"#f0f9ff",borderRadius:12,padding:"10px 16px",marginBottom:18,textAlign:"center",border:"1px solid #bae6fd"}}>
          <div style={{fontSize:11,color:"#0369a1",fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:2}}>Booking ID</div>
          <div style={{fontSize:16,fontWeight:800,color:"#0f172a",letterSpacing:1}}>{bookingId}</div>
        </div>
        <div style={{background:"#f8fafc",borderRadius:14,padding:16,marginBottom:18,display:"flex",gap:12,alignItems:"center",border:"1px solid #e2e8f0"}}>
          <div style={{width:44,height:44,borderRadius:12,background:"linear-gradient(135deg,#e0f2fe,#bae6fd)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,overflow:"hidden",flexShrink:0}}>
            {doctor.profileImage ? <img src={doctor.profileImage} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} /> : "👨‍⚕️"}
          </div>
          <div>
            <div style={{fontWeight:700,color:"#0f172a",fontSize:15}}>Dr. {doctor.firstName} {doctor.lastName}</div>
            <div style={{color:"#0ea5e9",fontSize:13,fontWeight:600}}>{doctor.specialization}</div>
            <div style={{color:"#64748b",fontSize:12}}>🏥 {doctor.hospital}</div>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:22}}>
          {[
            {label:"📅 Date", value:new Date().toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short",year:"numeric"})},
            {label:"⏰ Time", value:slot},
            {label:"💻 Type", value:consultType},
            {label:"💰 Fee",  value:`₹${doctor.consultationFee}`},
          ].map(({label,value})=>(
            <div key={label} style={{background:"#f8fafc",borderRadius:10,padding:"10px 12px",border:"1px solid #e2e8f0"}}>
              <div style={{fontSize:11,color:"#94a3b8",fontWeight:600,marginBottom:3}}>{label}</div>
              <div style={{fontSize:13,fontWeight:700,color:"#0f172a"}}>{value}</div>
            </div>
          ))}
        </div>
        <button onClick={onClose} style={{width:"100%",padding:"13px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#0ea5e9,#0369a1)",fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:14,color:"#fff",cursor:"pointer",boxShadow:"0 4px 14px rgba(3,105,161,.3)"}}>
          Done ✓
        </button>
      </div>
    </div>
  );
}

export default function DoctorConsultation() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [sortBy, setSortBy] = useState("Relevance");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [availToday, setAvailToday] = useState(false);
  const [feeRange, setFeeRange] = useState("All");
  const [showAll, setShowAll] = useState(false);
  const [profileDoctor, setProfileDoctor] = useState(null);
  const [bookingDoctor, setBookingDoctor] = useState(null);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const searchRef = useRef();

  useEffect(() => {
    doctorAPI.getAll()
      .then(r => setDoctors(r.data || []))
      .catch(() => setDoctors([]))
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = () => setSearchQuery(searchInput.trim());
  const handleKeyDown = e => { if (e.key === "Enter") handleSearch(); };

  const specCount = name => doctors.filter(d => d.specialization === name).length;

  const filtered = doctors
    .filter(d => selectedSpecialty === "All" || d.specialization === selectedSpecialty)
    .filter(d => selectedType === "All" || (d.availableTypes || ["In-Person"]).includes(selectedType))
    .filter(d => !availToday || d.available)
    .filter(d => { const [mn,mx] = feeRanges[feeRange] || [0,99999]; return d.consultationFee >= mn && d.consultationFee <= mx; })
    .filter(d => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return `${d.firstName} ${d.lastName}`.toLowerCase().includes(q)
        || (d.specialization||"").toLowerCase().includes(q)
        || (d.hospital||"").toLowerCase().includes(q)
        || (d.location||"").toLowerCase().includes(q);
    })
    .sort((a,b) => {
      if (sortBy === "Rating") return (b.rating||0) - (a.rating||0);
      if (sortBy === "Experience") return (b.experienceYears||0) - (a.experienceYears||0);
      if (sortBy === "Fee: Low to High") return (a.consultationFee||0) - (b.consultationFee||0);
      if (sortBy === "Fee: High to Low") return (b.consultationFee||0) - (a.consultationFee||0);
      return 0;
    });

  const clearFilters = () => { setSelectedSpecialty("All"); setSelectedType("All"); setSearchInput(""); setSearchQuery(""); setAvailToday(false); setFeeRange("All"); setShowAll(false); };
  const hasFilters = selectedSpecialty !== "All" || selectedType !== "All" || searchQuery || availToday || feeRange !== "All";

  const loadDoctorDetails = async doc => {
    const { data } = await doctorAPI.getById(doc.id);
    return data;
  };

  const openDoctorProfile = async doc => {
    try {
      setProfileDoctor(await loadDoctorDetails(doc));
    } catch {
      toast.error("Failed to load doctor profile");
    }
  };

  const handleBookClick = async doc => {
    if (!user) { navigate("/login"); return; }
    try {
      setProfileDoctor(null);
      setBookingDoctor(doc.timeSlots !== undefined ? doc : await loadDoctorDetails(doc));
    } catch {
      toast.error("Failed to load doctor booking details");
    }
  };

  return (
    <div style={{fontFamily:"'DM Sans',sans-serif",background:"#f0f7ff",minHeight:"100vh"}}>
      <style>{`
        @keyframes fadeIn  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes modalIn { from{opacity:0;transform:scale(.93)} to{opacity:1;transform:scale(1)} }
        .spec-pill:hover { transform:translateY(-3px)!important; box-shadow:0 6px 20px rgba(0,0,0,.1)!important; }
        .doc-card:hover  { transform:translateY(-2px)!important; box-shadow:0 10px 28px rgba(0,0,0,.09)!important; }
        .book-btn:hover  { filter:brightness(1.1); transform:scale(1.02); }
        .doc-card        { animation:fadeIn .3s ease both; }
      `}</style>

      {/* HEADER */}
      <div style={{background:"linear-gradient(135deg,#0369a1 0%,#0ea5e9 55%,#38bdf8 100%)",paddingBottom:36}}>
        <div style={{maxWidth:1200,margin:"0 auto",padding:"0 24px"}}>
          <div style={{display:"flex",alignItems:"center",padding:"16px 0 12px",gap:12}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:34,height:34,background:"rgba(255,255,255,.2)",borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17}}>🏥</div>
              <span style={{color:"#fff",fontWeight:800,fontSize:19,fontFamily:"'Playfair Display',serif"}}>MediBook</span>
            </div>

            <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:10}}>
              {user ? (
                <>
                  <span style={{color:"rgba(255,255,255,.9)",fontSize:13.5,fontWeight:600}}>👋 {user.firstName}</span>
                  <button onClick={()=>navigate("/dashboard")} style={{background:"#fff",color:"#0369a1",border:"none",borderRadius:8,padding:"7px 16px",fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:13,cursor:"pointer"}}>Dashboard</button>
                </>
              ) : (
                <>
                  <button onClick={()=>navigate("/login")} style={{background:"rgba(255,255,255,.15)",color:"#fff",border:"1.5px solid rgba(255,255,255,.5)",borderRadius:8,padding:"7px 16px",fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:13,cursor:"pointer"}}>Login</button>
                  <button onClick={()=>navigate("/register")} style={{background:"#fff",color:"#0369a1",border:"none",borderRadius:8,padding:"7px 16px",fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:13,cursor:"pointer",boxShadow:"0 2px 8px rgba(0,0,0,.15)"}}>Register</button>
                </>
              )}
            </div>
          </div>

          <div style={{textAlign:"center",paddingTop:8}}>
            <p style={{color:"rgba(255,255,255,.8)",fontSize:11.5,fontWeight:600,letterSpacing:2.5,textTransform:"uppercase",marginBottom:8}}>Online • In-Person • Phone</p>
            <h1 style={{color:"#fff",fontSize:34,fontFamily:"'Playfair Display',serif",fontWeight:800,marginBottom:8,lineHeight:1.2}}>Consult Top Doctors</h1>
            <p style={{color:"rgba(255,255,255,.75)",fontSize:14.5,marginBottom:24}}>Connect with verified specialists — anytime, anywhere</p>

            {/* Search bar — FIXED with button triggering search */}
            <div style={{maxWidth:580,margin:"0 auto",background:"#fff",borderRadius:14,display:"flex",alignItems:"center",boxShadow:"0 8px 30px rgba(0,0,0,.18)",overflow:"hidden"}}>
              <span style={{padding:"0 14px",fontSize:17,color:"#94a3b8"}}>🔍</span>
              <input
                ref={searchRef}
                value={searchInput}
                onChange={e=>setSearchInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search doctors, specialties, hospitals..."
                style={{flex:1,padding:"14px 8px",border:"none",outline:"none",fontSize:14,fontFamily:"'DM Sans',sans-serif",color:"#0f172a"}}
              />
              {searchInput && (
                <button onClick={()=>{setSearchInput(""); setSearchQuery("");}} style={{padding:"0 10px",background:"none",border:"none",cursor:"pointer",color:"#94a3b8",fontSize:16}}>✕</button>
              )}
              <button onClick={handleSearch} style={{background:"#0ea5e9",color:"#fff",border:"none",padding:"13px 22px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:14}}>Search</button>
            </div>
          </div>
        </div>
      </div>

      {/* BODY */}
      <div style={{maxWidth:1200,margin:"0 auto",padding:"26px 24px"}}>

        {/* Specialties */}
        <div style={{marginBottom:26}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <h2 style={{fontSize:17,fontWeight:700,color:"#0f172a"}}>Browse by Specialty</h2>
            {selectedSpecialty!=="All" && <button onClick={()=>setSelectedSpecialty("All")} style={{color:"#ef4444",fontSize:12.5,fontWeight:600,background:"none",border:"none",cursor:"pointer"}}>✕ Clear</button>}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(8,1fr)",gap:10}}>
            {specialties.map(s=>{
              const count = specCount(s.name);
              const active = selectedSpecialty === s.name;
              return (
                <div key={s.name} className="spec-pill" onClick={()=>{ setSelectedSpecialty(active?"All":s.name); setShowAll(true); }}
                  style={{background:active?`linear-gradient(135deg,${s.color},${s.color}cc)`:"#fff",border:`2px solid ${active?s.color:"#e2e8f0"}`,borderRadius:14,padding:"12px 6px",textAlign:"center",cursor:"pointer",transition:"all .2s",boxShadow:"0 2px 6px rgba(0,0,0,.04)"}}>
                  <div style={{fontSize:22,marginBottom:5}}>{s.icon}</div>
                  <div style={{fontSize:11,fontWeight:700,color:active?"#fff":"#1e293b",lineHeight:1.3}}>{s.name}</div>
                  <div style={{fontSize:10,color:active?"rgba(255,255,255,.75)":"#94a3b8",marginTop:1}}>{loading ? "..." : `${count} docs`}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Why Us */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:26}}>
          {[{i:"✅",t:"Verified Doctors",d:"Background-verified"},{i:"⚡",t:"Quick Booking",d:"Book in minutes"},{i:"🔒",t:"100% Private",d:"Your data is safe"},{i:"💳",t:"Easy Payments",d:"UPI, cards, wallets"}].map(f=>(
            <div key={f.t} style={{background:"#fff",borderRadius:12,padding:"14px 12px",display:"flex",gap:10,alignItems:"center",boxShadow:"0 2px 6px rgba(0,0,0,.04)",border:"1px solid #f1f5f9"}}>
              <span style={{fontSize:20}}>{f.i}</span>
              <div><div style={{fontWeight:700,fontSize:12,color:"#0f172a"}}>{f.t}</div><div style={{fontSize:11,color:"#64748b"}}>{f.d}</div></div>
            </div>
          ))}
        </div>

        {/* Filters + List */}
        <div style={{display:"flex",gap:18}}>
          {/* Sidebar */}
          <div style={{width:200,flexShrink:0,display:"flex",flexDirection:"column",gap:12}}>
            <div style={{background:"#fff",borderRadius:14,padding:16,border:"1px solid #f1f5f9",boxShadow:"0 2px 6px rgba(0,0,0,.04)"}}>
              <h3 style={{fontSize:13,fontWeight:700,color:"#0f172a",marginBottom:10}}>Consult Type</h3>
              {["All","Video","In-Person","Phone"].map(t=>(
                <button key={t} onClick={()=>setSelectedType(t)} style={{width:"100%",padding:"8px 10px",marginBottom:6,borderRadius:8,border:`1.5px solid ${selectedType===t?"#0ea5e9":"#e2e8f0"}`,background:selectedType===t?"#e0f2fe":"#f8fafc",color:selectedType===t?"#0369a1":"#374151",fontFamily:"'DM Sans',sans-serif",fontWeight:selectedType===t?700:500,fontSize:12.5,cursor:"pointer",textAlign:"left",transition:"all .15s"}}>
                  {t==="Video"?"📹 ":t==="In-Person"?"🏥 ":t==="Phone"?"📞 ":"🔍 "}{t}
                </button>
              ))}
            </div>
            <div style={{background:"#fff",borderRadius:14,padding:16,border:"1px solid #f1f5f9",boxShadow:"0 2px 6px rgba(0,0,0,.04)"}}>
              <h3 style={{fontSize:13,fontWeight:700,color:"#0f172a",marginBottom:10}}>Availability</h3>
              <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}>
                <input type="checkbox" checked={availToday} onChange={e=>setAvailToday(e.target.checked)} style={{accentColor:"#0ea5e9",width:13,height:13}} />
                <span style={{fontSize:12.5,color:"#374151"}}>Available Now</span>
              </label>
            </div>
            <div style={{background:"#fff",borderRadius:14,padding:16,border:"1px solid #f1f5f9",boxShadow:"0 2px 6px rgba(0,0,0,.04)"}}>
              <h3 style={{fontSize:13,fontWeight:700,color:"#0f172a",marginBottom:10}}>Fee Range</h3>
              {Object.keys(feeRanges).map(r=>(
                <label key={r} style={{display:"flex",alignItems:"center",gap:8,marginBottom:8,cursor:"pointer"}}>
                  <input type="radio" name="fee" checked={feeRange===r} onChange={()=>setFeeRange(r)} style={{accentColor:"#0ea5e9",width:13,height:13}} />
                  <span style={{fontSize:12.5,color:"#374151"}}>{r}</span>
                </label>
              ))}
            </div>
            {hasFilters && (
              <button onClick={clearFilters} style={{width:"100%",padding:"10px",borderRadius:10,border:"1.5px solid #fca5a5",background:"#fef2f2",fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:13,color:"#ef4444",cursor:"pointer"}}>
                ✕ Clear All Filters
              </button>
            )}
          </div>

          {/* Doctor List */}
          <div style={{flex:1}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
              <span style={{fontSize:13.5,color:"#64748b"}}>
                {loading ? "Loading doctors..." : <><strong style={{color:"#0f172a"}}>{filtered.length}</strong> doctor{filtered.length!==1?"s":""} found</>}
                {selectedSpecialty!=="All" && <span style={{color:"#0ea5e9",fontWeight:600}}> · {selectedSpecialty}</span>}
                {searchQuery && <span style={{color:"#7c3aed",fontWeight:600}}> · "{searchQuery}"</span>}
              </span>
              <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{padding:"6px 10px",borderRadius:8,border:"1.5px solid #e2e8f0",fontSize:12.5,fontFamily:"'DM Sans',sans-serif",outline:"none",background:"#fff",cursor:"pointer"}}>
                {sortOptions.map(o=><option key={o}>{o}</option>)}
              </select>
            </div>

            {loading ? (
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                {[1,2,3].map(i=>(
                  <div key={i} style={{background:"#fff",borderRadius:16,padding:18,border:"1px solid #f1f5f9",height:120}}>
                    <div style={{display:"flex",gap:14}}>
                      <div style={{width:64,height:64,borderRadius:14,background:"#f1f5f9",animation:"shimmer 1.4s infinite",backgroundSize:"200% 100%"}} />
                      <div style={{flex:1,display:"flex",flexDirection:"column",gap:8}}>
                        <div style={{height:16,background:"#f1f5f9",borderRadius:6,width:"50%"}} />
                        <div style={{height:12,background:"#f1f5f9",borderRadius:6,width:"30%"}} />
                        <div style={{height:12,background:"#f1f5f9",borderRadius:6,width:"70%"}} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div style={{textAlign:"center",padding:"60px 20px",background:"#fff",borderRadius:16,border:"1px solid #f1f5f9"}}>
                <div style={{fontSize:48,marginBottom:12}}>🔍</div>
                <div style={{fontWeight:700,color:"#0f172a",fontSize:15,marginBottom:6}}>No doctors found</div>
                <div style={{color:"#64748b",fontSize:13,marginBottom:16}}>Try adjusting your search or filters</div>
                <button onClick={clearFilters} style={{padding:"9px 20px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#0ea5e9,#0369a1)",color:"#fff",fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:13,cursor:"pointer"}}>Clear All Filters</button>
              </div>
            ) : (
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                {(hasFilters || showAll ? filtered : filtered.slice(0, 5)).map((doc,i)=>{
                  const types = doc.availableTypes || ["In-Person"];
                  return (
                    <div key={doc.id} className="doc-card" style={{background:"#fff",borderRadius:16,padding:18,boxShadow:"0 2px 10px rgba(0,0,0,.05)",border:"1px solid #f1f5f9",display:"flex",gap:14,alignItems:"flex-start",transition:"all .2s",animationDelay:`${i*0.04}s`,cursor:"default"}}>
                      {/* Photo */}
                      <div onClick={()=>openDoctorProfile(doc)} style={{width:72,height:72,borderRadius:16,background:"linear-gradient(135deg,#e0f2fe,#bae6fd)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,border:"2px solid #e0f2fe",flexShrink:0,overflow:"hidden",cursor:"pointer"}}>
                        {doc.profileImage ? <img src={doc.profileImage} alt={doc.firstName} style={{width:"100%",height:"100%",objectFit:"cover"}} /> : "👨‍⚕️"}
                      </div>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between"}}>
                          <div>
                            <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:2}}>
                              <h3 onClick={()=>openDoctorProfile(doc)} style={{fontSize:15,fontWeight:700,color:"#0f172a",cursor:"pointer",textDecoration:"none"}} onMouseEnter={e=>e.currentTarget.style.color="#0ea5e9"} onMouseLeave={e=>e.currentTarget.style.color="#0f172a"}>
                                Dr. {doc.firstName} {doc.lastName}
                              </h3>
                              <span style={{background:"#dcfce7",color:"#16a34a",fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:20}}>✓ Verified</span>
                            </div>
                            <div style={{fontSize:13,color:"#0ea5e9",fontWeight:600}}>{doc.specialization || "General Practice"}</div>
                            <div style={{fontSize:11.5,color:"#64748b",marginTop:1}}>🏥 {doc.hospital}{doc.location ? ` · ${doc.location}` : ""}</div>
                          </div>
                          <div style={{textAlign:"right",flexShrink:0}}>
                            <div style={{fontSize:19,fontWeight:800,color:"#0f172a"}}>₹{doc.consultationFee || "—"}</div>
                            <div style={{fontSize:10.5,color:"#64748b"}}>per consult</div>
                            <span style={{fontSize:10.5,fontWeight:700,padding:"2px 8px",borderRadius:20,background:doc.available?"#dcfce7":"#fee2e2",color:doc.available?"#16a34a":"#dc2626",display:"block",marginTop:4}}>
                              {doc.available?"● Available":"● Unavailable"}
                            </span>
                          </div>
                        </div>
                        <div style={{display:"flex",gap:14,margin:"8px 0",flexWrap:"wrap"}}>
                          {doc.rating > 0 && <span style={{fontSize:12,color:"#475569"}}>⭐ {doc.rating?.toFixed(1)} <span style={{color:"#94a3b8"}}>({doc.totalReviews||0})</span></span>}
                          {doc.experienceYears > 0 && <span style={{fontSize:12,color:"#475569"}}>🎓 {doc.experienceYears} yrs</span>}
                          {doc.qualification && <span style={{fontSize:12,color:"#475569"}}>📋 {doc.qualification}</span>}
                        </div>
                        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
                          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                            {types.map(t=>(
                              <span key={t} style={{fontSize:11,fontWeight:600,padding:"3px 9px",borderRadius:20,background:`${typeColor[t]||"#6366f1"}18`,color:typeColor[t]||"#6366f1",border:`1px solid ${typeColor[t]||"#6366f1"}40`}}>
                                {t==="Video"?"📹":t==="In-Person"?"🏥":"📞"} {t}
                              </span>
                            ))}
                          </div>
                          <div style={{display:"flex",gap:8}}>
                            <button onClick={()=>openDoctorProfile(doc)} style={{padding:"8px 14px",borderRadius:10,border:"1.5px solid #e2e8f0",background:"#f8fafc",fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:12.5,color:"#374151",cursor:"pointer",transition:"all .15s"}}
                              onMouseEnter={e=>{e.currentTarget.style.borderColor="#0ea5e9";e.currentTarget.style.color="#0369a1";}}
                              onMouseLeave={e=>{e.currentTarget.style.borderColor="#e2e8f0";e.currentTarget.style.color="#374151";}}>
                              View Profile
                            </button>
                            {doc.available && (
                              <button className="book-btn" onClick={()=>handleBookClick(doc)}
                                style={{background:"linear-gradient(135deg,#0ea5e9,#0369a1)",color:"#fff",border:"none",borderRadius:10,padding:"9px 18px",fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:13,cursor:"pointer",transition:"all .18s",boxShadow:"0 3px 10px rgba(14,165,233,.3)"}}>
                                Book →
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Show All / Show Less */}
                {!hasFilters && filtered.length > 5 && (
                  <button
                    onClick={() => setShowAll(!showAll)}
                    style={{
                      width: "100%", padding: "14px", borderRadius: 14,
                      border: "2px solid #e0f2fe", background: "#f0f9ff",
                      fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 14,
                      color: "#0369a1", cursor: "pointer", transition: "all .2s",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#e0f2fe"; e.currentTarget.style.borderColor = "#0ea5e9"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "#f0f9ff"; e.currentTarget.style.borderColor = "#e0f2fe"; }}
                  >
                    {showAll
                      ? "▲ Show Less"
                      : `View All ${filtered.length} Doctors →`}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {profileDoctor && <DoctorProfileModal doctor={profileDoctor} onClose={()=>setProfileDoctor(null)} onBook={handleBookClick} />}
      {bookingDoctor && <BookingModal doctor={bookingDoctor} onClose={()=>setBookingDoctor(null)} onConfirm={(slot,type)=>{setConfirmedBooking({doctor:bookingDoctor,slot,consultType:type});setBookingDoctor(null);}} />}
      {confirmedBooking && <ConfirmationScreen doctor={confirmedBooking.doctor} slot={confirmedBooking.slot} consultType={confirmedBooking.consultType} onClose={()=>setConfirmedBooking(null)} />}
    </div>
  );
}