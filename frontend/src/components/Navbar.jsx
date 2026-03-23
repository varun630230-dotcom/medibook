import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationAPI } from '../services/api';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [dropOpen, setDropOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropRef = useRef();
  const notifRef = useRef();

  useEffect(() => {
    const fn = e => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  useEffect(() => {
    if (user?.id) {
      notificationAPI.getUnreadCount(user.id)
        .then(r => setUnreadCount(r.data.count || 0))
        .catch(() => {});
    }
  }, [user?.id, location.pathname]);

  const openNotifications = async () => {
    setNotifOpen(!notifOpen);
    if (!notifOpen && user?.id) {
      try {
        const r = await notificationAPI.getAll(user.id);
        setNotifications(r.data || []);
        setUnreadCount(0);
        // Mark all as read
        notificationAPI.markAllAsRead(user.id).catch(() => {});
      } catch { setNotifications([]); }
    }
  };

  const isActive = path => location.pathname === path || location.pathname.startsWith(path + '/');
  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`;

  const patientLinks = [
    { to: '/dashboard',    label: '🏠', text: 'Dashboard' },
    { to: '/doctors',      label: '🩺', text: 'Find Doctors' },
    { to: '/appointments', label: '📋', text: 'Appointments' },
  ];
  const doctorLinks = [
    { to: '/doctor-dashboard', label: '🏠', text: 'Dashboard' },
  ];
  const adminLinks = [
    { to: '/admin',   label: '🛡️', text: 'Admin' },
    { to: '/doctors', label: '👨‍⚕️', text: 'Doctors' },
  ];

  const links = user?.role === 'DOCTOR' ? doctorLinks : user?.role === 'ADMIN' ? adminLinks : patientLinks;

  return (
    <nav className="navbar">
      <Link to={user ? (user.role === 'PATIENT' ? '/dashboard' : user.role === 'DOCTOR' ? '/doctor-dashboard' : '/admin') : '/'} className="navbar-brand">
        <div className="navbar-logo">🏥</div>
        <span className="navbar-title">Medi<span>Book</span></span>
      </Link>

      <div className="navbar-links">
        {links.map(l => (
          <Link key={l.to} to={l.to} className={`nav-link ${isActive(l.to) ? 'active' : ''}`}>
            {l.label} {l.text}
          </Link>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Notification Bell */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button onClick={openNotifications} style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#64748b', transition: 'background .15s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}>
            🔔
            {unreadCount > 0 && (
              <span style={{ position: 'absolute', top: 2, right: 2, background: '#ef4444', color: '#fff', borderRadius: '50%', width: 16, height: 16, fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div style={{ position: 'absolute', top: 44, right: 0, background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 16, width: 320, maxHeight: 400, overflowY: 'auto', boxShadow: '0 12px 36px rgba(0,0,0,.14)', zIndex: 200, animation: 'slideUp .18s ease' }}>
              <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid #f1f5f9', fontWeight: 700, fontSize: 14, color: '#0f172a' }}>
                Notifications
              </div>
              {notifications.length === 0 ? (
                <div style={{ padding: '28px 16px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                  <div style={{ fontSize: 28, marginBottom: 6 }}>🔔</div>
                  No notifications yet
                </div>
              ) : notifications.slice(0, 10).map(n => (
                <div key={n.id} style={{ padding: '12px 16px', borderBottom: '1px solid #f8fafc', background: n.read ? '#fff' : '#f0f9ff', transition: 'background .15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = n.read ? '#fff' : '#f0f9ff'}>
                  <div style={{ fontWeight: n.read ? 500 : 700, fontSize: 13, color: '#0f172a', marginBottom: 3 }}>{n.title}</div>
                  <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>{n.message}</div>
                  <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>
                    {n.createdAt ? new Date(n.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="navbar-user" ref={dropRef} style={{ position: 'relative' }}>
          <div className="user-avatar" onClick={() => setDropOpen(!dropOpen)} title={`${user?.firstName} ${user?.lastName}`}>
            {initials}
          </div>

          {dropOpen && (
            <div style={{ position: 'absolute', top: 46, right: 0, background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 16, padding: 8, minWidth: 210, boxShadow: '0 12px 36px rgba(0,0,0,.14)', zIndex: 200, animation: 'slideUp .18s ease' }}>
              <div style={{ padding: '10px 14px 12px', borderBottom: '1px solid #f1f5f9', marginBottom: 6 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{user?.firstName} {user?.lastName}</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 1 }}>{user?.email}</div>
                <span style={{ display: 'inline-block', marginTop: 6, fontSize: 11, fontWeight: 700, background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: 6 }}>{user?.role}</span>
              </div>
              <Link to="/profile" onClick={() => setDropOpen(false)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', borderRadius: 10, textDecoration: 'none', color: '#334155', fontSize: 13.5, fontWeight: 500, transition: 'background .15s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                👤 My Profile
              </Link>
              <button onClick={() => { logout(); navigate('/'); setDropOpen(false); }}
                style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 8, padding: '9px 14px', borderRadius: 10, border: 'none', background: 'transparent', color: '#dc2626', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', transition: 'background .15s', fontFamily: 'DM Sans, sans-serif' }}
                onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                🚪 Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
