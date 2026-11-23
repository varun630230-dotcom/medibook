import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from "./pages/Landing";
import Login from './pages/Login';
import Register from './pages/Register';
import PatientDashboard from './pages/PatientDashboard';
import DoctorList from './pages/DoctorList';
import DoctorDetail from './pages/DoctorDetail';
import BookAppointment from './pages/BookAppointment';
import MyAppointments from './pages/MyAppointments';
import DoctorDashboard from './pages/DoctorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import Navbar from './components/Navbar';
import DoctorConsultation from './pages/DoctorConsultation';
import AIAssistant from './components/AIAssistant';

const ProtectedRoute = ({ children, roles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

const HomeRedirect = ({ user }) => {
  if (user.role === 'DOCTOR') return <Navigate to="/doctor-dashboard" replace />;
  if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
  
  if (user.role === 'PATIENT') {
    const redirectUrl = sessionStorage.getItem('searchRedirect');
    if (redirectUrl) {
      sessionStorage.removeItem('searchRedirect');
      return <Navigate to={redirectUrl} replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }
  
  return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <h2>Account Error</h2>
      <p>Your account role is invalid. Please log out and try again.</p>
      <button onClick={() => { localStorage.clear(); window.location.href = '/login'; }} className="btn btn-primary">Log Out</button>
    </div>
  );
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <>
      {user && <Navbar />}
      {user && <AIAssistant />}
      <Routes>
        <Route path="/" element={user ? <HomeRedirect user={user} /> : <LandingPage />} />
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />

        <Route path="/dashboard" element={
          <ProtectedRoute roles={['PATIENT']}>
            <PatientDashboard />
          </ProtectedRoute>
        } />

        <Route path="/doctors" element={
          <ProtectedRoute>
            <DoctorList />
          </ProtectedRoute>
        } />

        <Route path="/doctors/:id" element={
          <ProtectedRoute>
            <DoctorDetail />
          </ProtectedRoute>
        } />

        <Route path="/book/:doctorId" element={
          <ProtectedRoute roles={['PATIENT']}>
            <BookAppointment />
          </ProtectedRoute>
        } />

        <Route path="/appointments" element={
          <ProtectedRoute roles={['PATIENT']}>
            <MyAppointments />
          </ProtectedRoute>
        } />

        <Route path="/doctor-dashboard" element={
          <ProtectedRoute roles={['DOCTOR']}>
            <DoctorDashboard />
          </ProtectedRoute>
        } />

        <Route path="/admin" element={
          <ProtectedRoute roles={['ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              fontFamily: 'DM Sans, sans-serif',
              borderRadius: '10px',
              fontSize: '14px',
            }
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
