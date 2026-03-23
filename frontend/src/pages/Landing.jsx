import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const specialties = [
  { icon: '🧠', name: 'Neurology',    color: '#8b5cf6', bg: '#ede9fe' },
  { icon: '❤️', name: 'Cardiology',   color: '#ef4444', bg: '#fee2e2' },
  { icon: '🦷', name: 'Dentistry',    color: '#3b82f6', bg: '#dbeafe' },
  { icon: '👁️', name: 'Ophthalmology',color: '#0ea5e9', bg: '#e0f2fe' },
  { icon: '🦴', name: 'Orthopedics',  color: '#f59e0b', bg: '#fef3c7' },
  { icon: '🧒', name: 'Pediatrics',   color: '#10b981', bg: '#d1fae5' },
  { icon: '🩺', name: 'General',      color: '#6366f1', bg: '#ede9fe' },
  { icon: '🧬', name: 'Dermatology',  color: '#ec4899', bg: '#fce7f3' },
];

const steps = [
  { icon: '🔍', step: '01', title: 'Find a Doctor', desc: 'Search by specialty, name, or hospital. View ratings and real-time availability.' },
  { icon: '📅', step: '02', title: 'Book a Slot',   desc: 'Choose your preferred date, time, and consultation type — Video, In-Person, or Phone.' },
  { icon: '✅', step: '03', title: 'Get Care',      desc: 'Attend your appointment and receive expert medical guidance with ease.' },
];

function AnimatedNumber({ target }) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = 0; const step = target / 60;
    const t = setInterval(() => { start += step; if (start >= target) { setValue(target); clearInterval(t); } else setValue(Math.floor(start)); }, 16);
    return () => clearInterval(t);
  }, [target]);
  return value.toLocaleString();
}

export default function Landing() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn); return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <div style={{ fontFamily: 'DM Sans, sans-serif', background: '#fff', overflowX: 'hidden' }}>
      {/* NAV */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: scrolled ? 'rgba(255,255,255,.97)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1.5px solid #e2e8f0' : '1.5px solid transparent',
        padding: '0 48px', height: 68,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        transition: 'all .3s',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 38, height: 38, background: 'linear-gradient(135deg,#0ea5e9,#0369a1)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, boxShadow: '0 3px 10px rgba(3,105,161,.3)' }}>🏥</div>
          <span style={{ fontFamily: 'Playfair Display, serif', fontWeight: 800, fontSize: 21, color: '#0f172a' }}>Medi<span style={{ color: '#0ea5e9' }}>Book</span></span>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Link to="/login" style={{ padding: '9px 20px', borderRadius: 10, fontWeight: 600, fontSize: 14, textDecoration: 'none', color: '#334155', transition: 'all .2s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            Sign In
          </Link>
          <Link to="/register" style={{ padding: '9px 22px', borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: 'none', color: '#fff', background: 'linear-gradient(135deg,#0ea5e9,#0369a1)', boxShadow: '0 3px 12px rgba(3,105,161,.35)', transition: 'all .2s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(3,105,161,.45)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 3px 12px rgba(3,105,161,.35)'; }}>
            Get Started →
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '80px 24px 60px', background: 'linear-gradient(160deg,#f0f9ff 0%,#ffffff 40%,#f0fdf4 100%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '8%', left: '4%', width: 520, height: 520, background: 'radial-gradient(circle,rgba(14,165,233,.08) 0%,transparent 70%)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', bottom: '4%', right: '4%', width: 400, height: 400, background: 'radial-gradient(circle,rgba(16,185,129,.07) 0%,transparent 70%)', borderRadius: '50%' }} />
        </div>
        <div style={{ position: 'relative', maxWidth: 740, margin: '0 auto', animation: 'fadeInUp .7s ease both' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#e0f2fe', color: '#0369a1', padding: '6px 16px', borderRadius: 9999, fontSize: 13, fontWeight: 700, marginBottom: 28, border: '1px solid #bae6fd' }}>
            🩺 Trusted by 10,000+ patients across India
          </div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 800, lineHeight: 1.1, fontSize: 'clamp(42px, 6.5vw, 76px)', color: '#0f172a', marginBottom: 22, letterSpacing: '-.02em' }}>
            Book Doctors<br />
            <span style={{ background: 'linear-gradient(135deg,#0ea5e9,#0369a1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>with Confidence</span>
          </h1>
          <p style={{ fontSize: 17, color: '#64748b', lineHeight: 1.75, marginBottom: 44, maxWidth: 520, margin: '0 auto 44px' }}>
            Find and book appointments with top-rated specialists. Fast confirmation, zero hassle — from home.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" style={{ padding: '14px 36px', borderRadius: 14, fontWeight: 700, fontSize: 15, textDecoration: 'none', color: '#fff', background: 'linear-gradient(135deg,#0ea5e9,#0369a1)', boxShadow: '0 6px 24px rgba(3,105,161,.4)', transition: 'all .2s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(3,105,161,.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(3,105,161,.4)'; }}>
              Book Appointment →
            </Link>
            <Link to="/login" style={{ padding: '14px 32px', borderRadius: 14, fontWeight: 600, fontSize: 15, textDecoration: 'none', color: '#334155', background: '#fff', border: '1.5px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,.05)', transition: 'all .2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#0ea5e9'; e.currentTarget.style.color = '#0369a1'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#334155'; }}>
              Sign In
            </Link>
          </div>
          <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 48, flexWrap: 'wrap' }}>
            {['✅ Verified Doctors', '🔒 Secure & Private', '⚡ Instant Confirmation'].map(t => (
              <div key={t} style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>{t}</div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ padding: '52px 48px', background: 'linear-gradient(135deg,#0369a1,#0ea5e9)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 32 }}>
          {[{n:500,s:'+',l:'Expert Doctors'},{n:10000,s:'+',l:'Patients Served'},{n:50,s:'+',l:'Specialties'},{n:98,s:'%',l:'Satisfaction'}].map(s => (
            <div key={s.l} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 44, fontWeight: 800, color: '#fff', lineHeight: 1 }}><AnimatedNumber target={s.n} />{s.s}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,.75)', marginTop: 6, fontWeight: 500 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* SPECIALTIES */}
      <section style={{ padding: '80px 48px', background: '#f8fafc' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#0ea5e9', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 10 }}>SPECIALTIES</div>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 38, fontWeight: 800, color: '#0f172a', letterSpacing: '-.02em' }}>Browse by Specialty</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 14 }}>
            {specialties.map((s, i) => (
              <Link to="/register" key={s.name} style={{ background: '#fff', borderRadius: 18, padding: '22px 12px', textAlign: 'center', textDecoration: 'none', border: '1.5px solid #e2e8f0', transition: 'all .2s', animation: `fadeInUp .5s ease ${i*50}ms both` }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = s.color; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,.09)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, margin: '0 auto 12px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>{s.icon}</div>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: '#334155' }}>{s.name}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: '80px 48px', background: '#fff' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#0ea5e9', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 10 }}>HOW IT WORKS</div>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 38, fontWeight: 800, color: '#0f172a', letterSpacing: '-.02em' }}>3 Steps to Your Appointment</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 40, position: 'relative' }}>
            <div style={{ position: 'absolute', top: 34, left: '18%', right: '18%', height: 2, background: 'linear-gradient(90deg,#bae6fd,#7dd3fc,#bae6fd)', zIndex: 0 }} />
            {steps.map((s, i) => (
              <div key={s.step} style={{ textAlign: 'center', position: 'relative', zIndex: 1, animation: `fadeInUp .6s ease ${i*100}ms both` }}>
                <div style={{ width: 70, height: 70, borderRadius: '50%', margin: '0 auto 18px', background: 'linear-gradient(135deg,#e0f2fe,#bae6fd)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, boxShadow: '0 4px 16px rgba(14,165,233,.18)', border: '3px solid #fff' }}>{s.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#0ea5e9', letterSpacing: 2, marginBottom: 10 }}>STEP {s.step}</div>
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 10 }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.75 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section style={{ padding: '80px 48px', background: '#f0f9ff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 36, fontWeight: 800, color: '#0f172a' }}>Why Choose MediBook?</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 16 }}>
            {[
              { icon: '✅', t: 'Verified Doctors', d: 'All doctors are background-checked and licensed.' },
              { icon: '⚡', t: 'Instant Connect',  d: 'Consult in under 5 minutes from anywhere.' },
              { icon: '🔒', t: '100% Private',     d: 'Your health data is fully encrypted and confidential.' },
              { icon: '💳', t: 'Easy Payments',    d: 'Pay with UPI, cards, wallets — seamless checkout.' },
            ].map(f => (
              <div key={f.t} style={{ background: '#fff', borderRadius: 18, padding: '22px 20px', display: 'flex', gap: 14, alignItems: 'flex-start', border: '1.5px solid #e0f2fe', boxShadow: '0 2px 8px rgba(3,105,161,.06)' }}>
                <span style={{ fontSize: 26 }}>{f.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', marginBottom: 4 }}>{f.t}</div>
                  <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.55 }}>{f.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 48px', textAlign: 'center', background: 'linear-gradient(135deg,#0f172a 0%,#0369a1 100%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%,rgba(14,165,233,.2),transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative' }}>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 42, fontWeight: 800, color: '#fff', marginBottom: 14, letterSpacing: '-.02em' }}>Your health can't wait.</h2>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,.75)', marginBottom: 36 }}>Join thousands of patients who trust MediBook for their healthcare.</p>
          <Link to="/register" style={{ padding: '15px 44px', borderRadius: 14, fontWeight: 700, fontSize: 16, textDecoration: 'none', color: '#0369a1', background: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,.2)', display: 'inline-block', transition: 'all .2s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,.2)'; }}>
            Get Started Free →
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#0f172a', padding: '24px 48px', textAlign: 'center', fontSize: 13, color: '#475569' }}>
        <span style={{ fontFamily: 'Playfair Display, serif', color: '#fff', fontWeight: 800 }}>MediBook</span>
        {' '}© {new Date().getFullYear()} · Smart Healthcare Platform · All rights reserved.
      </footer>
    </div>
  );
}
