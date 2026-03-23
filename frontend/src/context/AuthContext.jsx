import React, { createContext, useContext, useState, useEffect } from 'react';
import { connectWebSocket, disconnectWebSocket } from '../services/websocket';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.id && parsed.role) {
          return parsed;
        }
      } catch (e) { }
    }
    return null;
  });
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      connectWebSocket(user.id, (notification) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
        toast.custom(() => (
          <div style={{
            background: '#fff',
            borderLeft: '4px solid #0ea5e9',
            padding: '12px 16px',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
            maxWidth: '320px'
          }}>
            <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '14px' }}>
              🔔 {notification.title}
            </div>
            <div style={{ color: '#64748b', fontSize: '13px', marginTop: '4px' }}>
              {notification.message}
            </div>
          </div>
        ), { duration: 5000 });
      });
    }
    return () => disconnectWebSocket();
  }, [user]);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userData.token);
  };

  const logout = () => {
    disconnectWebSocket();
    setUser(null);
    setNotifications([]);
    setUnreadCount(0);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const addNotification = (n) => {
    setNotifications(prev => [n, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  return (
    <AuthContext.Provider value={{
      user, login, logout,
      notifications, setNotifications,
      unreadCount, setUnreadCount
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
