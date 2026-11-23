import React, { useState } from "react";
import { Search, MapPin, Star, Zap, ShieldCheck, Video, Bell, Clock, Users, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const doctors = [
  {
    name: "Dr. Rajesh Sharma",
    specialty: "Cardiologist",
    rating: 4.9,
    reviews: 128,
    experience: "15+ years exp.",
    hospital: "Apollo Hospitals, Hyderabad",
    available: "Available Today • 10:00 AM",
    availableColor: "#16a34a",
    avatarBg: "linear-gradient(135deg, #e0e7ff, #c7d2fe)",
    avatarText: "#4f46e5",
  },
  {
    name: "Dr. Priya Patel",
    specialty: "Dermatologist",
    rating: 4.8,
    reviews: 95,
    experience: "8+ years exp.",
    hospital: "Care Skin Clinic, Banjara Hills",
    available: "Available Today • 2:30 PM",
    availableColor: "#16a34a",
    avatarBg: "linear-gradient(135deg, #fce7f3, #fbcfe8)",
    avatarText: "#db2777",
  },
  {
    name: "Dr. Amit Kumar",
    specialty: "Orthopedic Surgeon..",
    rating: 4.9,
    reviews: 156,
    experience: "12+ years exp.",
    hospital: "Yashoda Hospitals, Somajiguda",
    available: "Available Tomorrow • 11:00 AM",
    availableColor: "#16a34a",
    avatarBg: "linear-gradient(135deg, #ecfdf5, #d1fae5)",
    avatarText: "#059669",
  },
  {
    name: "Dr. Sneha Reddy",
    specialty: "Gynecologist",
    rating: 4.7,
    reviews: 89,
    experience: "10+ years exp.",
    hospital: "Rainbow Children's Hospital",
    available: "Available Today • 4:00 PM",
    availableColor: "#16a34a",
    avatarBg: "linear-gradient(135deg, #fef3c7, #fde68a)",
    avatarText: "#d97706",
  },
];

const popularTags = ["Cardiologist", "Dermatologist", "Pediatrician", "Gynecologist", "Orthopedic"];

export default function LandingPage() {
  const navigate = useNavigate();
  const [searchDoctor, setSearchDoctor] = useState("");
  const [searchSpec, setSearchSpec] = useState("");
  const [searchLocation, setSearchLocation] = useState("");

  const handleFindDoctors = () => {
    sessionStorage.setItem('searchRedirect', `/doctors?q=${searchDoctor}&specialty=${searchSpec}`);
    navigate("/login");
  };

  return (
    <div className="landing-page">
      {/* ═══ NAVBAR ═══ */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <div className="landing-nav-brand" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
            <div className="landing-logo-icon">
              <span style={{ color: "#fff", fontWeight: 800, fontSize: 18 }}>+</span>
            </div>
            <span className="landing-logo-text">MediCare<span className="landing-logo-plus">+</span></span>
          </div>

          <div className="landing-nav-links">
            <a href="#hero" className="landing-nav-link active">Home</a>
            <a href="#doctors" className="landing-nav-link" onClick={(e) => { e.preventDefault(); navigate("/login"); }}>Find Doctors</a>
            <a href="#features" className="landing-nav-link">Specializations</a>
            <a href="#features" className="landing-nav-link">How it Works</a>
            <a href="#cta" className="landing-nav-link">Contact</a>
          </div>

          <div className="landing-nav-actions">
            <button className="landing-btn-login" onClick={() => navigate("/login")}>Login</button>
            <button className="landing-btn-create" onClick={() => navigate("/register")}>Create Account</button>
          </div>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section id="hero" className="landing-hero">
        <div className="landing-hero-bg">
          <img src="/hero-bg.png" alt="Doctors" className="landing-hero-bg-img" />
          <div className="landing-hero-overlay"></div>
        </div>
        <div className="landing-hero-content">
          <div className="landing-trust-badge">
            <Star size={14} style={{ color: "#2563eb", fill: "#2563eb" }} />
            <span>Trusted by 50,000+ Patients Across India</span>
          </div>
          <h1 className="landing-hero-title">Book Doctor Appointments</h1>
          <h2 className="landing-hero-subtitle">Fast & Hassle-Free</h2>
          <p className="landing-hero-desc">
            Consult with verified doctors online or in-clinic.<br />
            Available 24/7 • All Specializations • Instant Booking
          </p>

          {/* Search Bar */}
          <div className="landing-search-bar">
            <div className="landing-search-field">
              <Search size={16} style={{ color: "#94a3b8" }} />
              <input
                type="text"
                placeholder="Search doctors, specialties..."
                value={searchDoctor}
                onChange={(e) => setSearchDoctor(e.target.value)}
              />
            </div>
            <div className="landing-search-divider"></div>
            <div className="landing-search-field">
              <select
                value={searchSpec}
                onChange={(e) => setSearchSpec(e.target.value)}
                className="landing-search-select"
              >
                <option value="">All Specializations</option>
                <option value="cardiologist">Cardiologist</option>
                <option value="dermatologist">Dermatologist</option>
                <option value="pediatrician">Pediatrician</option>
                <option value="gynecologist">Gynecologist</option>
                <option value="orthopedic">Orthopedic</option>
              </select>
            </div>
            <button className="landing-search-btn" onClick={handleFindDoctors}>
              <Search size={16} /> Find Doctors Now
            </button>
          </div>

          {/* Popular Tags */}
          <div className="landing-popular-tags">
            <span className="landing-popular-label">Popular:</span>
            {popularTags.map((tag) => (
              <span key={tag} className="landing-tag" onClick={() => {
                sessionStorage.setItem('searchRedirect', `/doctors?specialty=${tag.toLowerCase()}`);
                navigate("/login");
              }}>{tag}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ STATS ═══ */}
      <section className="landing-stats-section">
        <div className="landing-stats-bar">
          <div className="landing-stat">
            <div className="landing-stat-icon" style={{ background: "#dbeafe" }}>
              <Users size={20} style={{ color: "#2563eb" }} />
            </div>
            <div>
              <h3 className="landing-stat-value">50,000+</h3>
              <p className="landing-stat-label">Happy Patients</p>
            </div>
          </div>
          <div className="landing-stat">
            <div className="landing-stat-icon" style={{ background: "#dbeafe" }}>
              <ShieldCheck size={20} style={{ color: "#2563eb" }} />
            </div>
            <div>
              <h3 className="landing-stat-value">1,200+</h3>
              <p className="landing-stat-label">Verified Doctors</p>
            </div>
          </div>
          <div className="landing-stat">
            <div className="landing-stat-icon" style={{ background: "#dbeafe" }}>
              <Clock size={20} style={{ color: "#2563eb" }} />
            </div>
            <div>
              <h3 className="landing-stat-value">24/7</h3>
              <p className="landing-stat-label">Available Support</p>
            </div>
          </div>
          <div className="landing-stat">
            <div className="landing-stat-icon" style={{ background: "#fef3c7" }}>
              <Star size={20} style={{ color: "#f59e0b", fill: "#f59e0b" }} />
            </div>
            <div>
              <h3 className="landing-stat-value">4.8/5</h3>
              <p className="landing-stat-label">Patient Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ WHY CHOOSE ═══ */}
      <section id="features" className="landing-features-section">
        <h2 className="landing-section-title">Why Choose MediCare+?</h2>
        <p className="landing-section-subtitle">Experience healthcare the modern way</p>
        <div className="landing-features-grid">
          <div className="landing-feature-card">
            <div className="landing-feature-icon" style={{ background: "#eff6ff" }}>
              <Zap size={24} style={{ color: "#2563eb" }} />
            </div>
            <h3>Instant Booking</h3>
            <p>Book appointments in under 2 minutes. No calls, no waiting.</p>
          </div>
          <div className="landing-feature-card">
            <div className="landing-feature-icon" style={{ background: "#ecfdf5" }}>
              <ShieldCheck size={24} style={{ color: "#16a34a" }} />
            </div>
            <h3>Verified Doctors</h3>
            <p>All doctors are MBBS certified with 5+ years experience minimum.</p>
          </div>
          <div className="landing-feature-card">
            <div className="landing-feature-icon" style={{ background: "#eff6ff" }}>
              <Video size={24} style={{ color: "#2563eb" }} />
            </div>
            <h3>Video Consultation</h3>
            <p>Consult from home via secure HD video call at your convenience.</p>
          </div>
          <div className="landing-feature-card">
            <div className="landing-feature-icon" style={{ background: "#fef3c7" }}>
              <Bell size={24} style={{ color: "#f59e0b" }} />
            </div>
            <h3>Smart Reminders</h3>
            <p>Never miss an appointment with SMS & WhatsApp notifications.</p>
          </div>
        </div>
      </section>

      {/* ═══ TOP DOCTORS ═══ */}
      <section id="doctors" className="landing-doctors-section">
        <div className="landing-doctors-header">
          <span style={{ fontSize: 22 }}>🏆</span>
          <h2 className="landing-section-title" style={{ marginBottom: 0 }}>Top Doctors This Week</h2>
        </div>
        <p className="landing-section-subtitle">Highly rated doctors available for consultation</p>

        <div className="landing-doctors-grid">
          {doctors.map((doc, i) => (
            <div key={i} className="landing-doctor-card">
              <div className="landing-doctor-card-top">
                <div 
                  style={{
                    width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                    background: doc.avatarBg, color: doc.avatarText,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, fontWeight: 800, textTransform: 'uppercase'
                  }}
                >
                  {doc.name.split(" ")[1]?.[0]}{doc.name.split(" ")[2]?.[0] || ""}
                </div>
                <div className="landing-doctor-info">
                  <div className="landing-doctor-name-row">
                    <h4>{doc.name}</h4>
                    <ShieldCheck size={14} style={{ color: "#2563eb" }} />
                  </div>
                  <p className="landing-doctor-spec">{doc.specialty}</p>
                  <div className="landing-doctor-rating">
                    <Star size={13} style={{ color: "#f59e0b", fill: "#f59e0b" }} />
                    <span className="landing-rating-value">{doc.rating}</span>
                    <span className="landing-rating-count">({doc.reviews} reviews)</span>
                  </div>
                </div>
              </div>
              <div className="landing-doctor-card-bottom">
                <div className="landing-doctor-detail">
                  <Star size={13} style={{ color: "#f59e0b" }} />
                  <span>{doc.experience}</span>
                </div>
                <div className="landing-doctor-detail">
                  <MapPin size={13} style={{ color: "#94a3b8" }} />
                  <span>{doc.hospital}</span>
                </div>
                <div className="landing-doctor-available" style={{ color: doc.availableColor }}>
                  <span className="landing-avail-dot" style={{ background: doc.availableColor }}></span>
                  {doc.available}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 24 }}>
          <button className="landing-btn-outline" onClick={() => {
            sessionStorage.setItem('searchRedirect', '/doctors');
            navigate("/login");
          }}>
            View All Doctors <ChevronRight size={16} />
          </button>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section id="cta" className="landing-cta-section">
        <div className="landing-cta-box">
          <div className="landing-cta-plus">+</div>
          <h2>Ready to Book Your Appointment?</h2>
          <p>Join 50,000+ patients who trust MediCare+ for their healthcare needs</p>
          <div className="landing-cta-buttons">
            <button className="landing-cta-btn-white" onClick={() => navigate("/register")}>Create Free Account</button>
            <button className="landing-cta-btn-outline" onClick={() => navigate("/login")}>Browse All Specializations</button>
          </div>
          <div className="landing-cta-trust">
            <span>✓ Free to use</span>
            <span>✓ No credit card required</span>
            <span>✓ 100% Secure booking</span>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="landing-footer-left">
            © 2024 MediCare+. All rights reserved. | <a href="#privacy">Privacy Policy</a> | <a href="#terms">Terms of Service</a> | Made with <span style={{ color: "#ef4444" }}>❤️</span> for better healthcare
          </div>
          <div className="landing-footer-social">
            <a href="#" aria-label="Facebook">Fb</a>
            <a href="#" aria-label="Twitter">Tw</a>
            <a href="#" aria-label="Instagram">Ig</a>
            <a href="#" aria-label="LinkedIn">In</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
