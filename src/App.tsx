import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AIConcierge from './components/AIConcierge';
import FeedbackWidget from './components/FeedbackWidget';
import api from './utils/api';
import Home from './pages/Home';
import EventListing from './pages/EventListing';
import EventDetails from './pages/EventDetails';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Booking from './pages/Booking';
import Payment from './pages/Payment';
import MyBookings from './pages/MyBookings';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import PlaceAd from './pages/PlaceAd';
import OrganizerDashboard from './pages/Organizer/Dashboard';
import CreateEvent from './pages/Organizer/CreateEvent';
import AttendeeList from './pages/Organizer/AttendeeList';
import AdminDashboard from './pages/Admin/Dashboard';
import FeedbackManagement from './pages/Admin/FeedbackManagement';
import GiveFeedback from './pages/GiveFeedback';
import TicketScanner from './pages/Organizer/TicketScanner';

const getStoredAuthState = () => localStorage.getItem('isLoggedIn') === 'true' && !!localStorage.getItem('token');
const getStoredUserRole = () => localStorage.getItem('userRole') || 'user';
const getStoredUserProfile = () => {
  try {
    return JSON.parse(localStorage.getItem('userProfile')) || {
      name: 'Guest User',
      email: 'guest@eventsphere.com',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=1200'
    };
  } catch (_error) {
    return {
      name: 'Guest User',
      email: 'guest@eventsphere.com',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=1200'
    };
  }
};

// AUTH GUARD COMPONENT
const PrivateRoute = ({ children, isAuthenticated }) => {
  return isAuthenticated || getStoredAuthState() ? children : <Navigate to="/login" replace />;
};

const RoleRoute = ({ children, isAuthenticated, userRole, allowedRoles }) => {
  const resolvedAuth = isAuthenticated || getStoredAuthState();
  const resolvedRole = userRole || getStoredUserRole();

  if (!resolvedAuth) {
    return <Navigate to="/login" replace />;
  }

  return allowedRoles.includes(resolvedRole) ? children : <Navigate to="/" replace />;
};

// Admin Placeholder Pages
const AdminPlaceholder = ({ title }) => (
  <div className="container" style={{paddingTop: '120px'}}>
    <h1>{title.split(' ')[0]} <span className="gradient-text">{title.split(' ').slice(1).join(' ')}</span></h1>
    <p style={{marginTop: '2rem', color: 'var(--text-dim)'}}>Management interface for {title.toLowerCase()}.</p>
    <div style={{marginTop: '2rem', height: '400px'}} className="glass-panel"></div>
  </div>
);



// Static Utility
const StaticPage = ({ title }) => (
  <div className="container" style={{paddingTop: '150px', minHeight: '80vh', textAlign: 'center'}}>
    <h1 style={{fontSize: '3rem', marginBottom: '3rem'}}>{title.split(' ')[0]} <span className="gradient-text">{title.split(' ').slice(1).join(' ')}</span></h1>
    <div style={{color: 'var(--text-dim)', lineHeight: '2', fontSize: '1.1rem'}}>
      <p style={{marginBottom: '2rem'}}>Welcome to our {title.toLowerCase()} page. At EventSphere, we are committed to providing transparency.</p>
    </div>
  </div>
);

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(getStoredAuthState());
  const [userRole, setUserRole] = useState(getStoredUserRole());
  const [userProfile, setUserProfile] = useState(getStoredUserProfile());

  useEffect(() => {
    const bootstrapSession = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const { data } = await api.get('/auth/me');
        if (data.success) {
          setAuth(true, data.data);
        }
      } catch (_error) {
        try {
          const refresh = await api.get('/auth/refresh');
          if (refresh.data?.success) {
            localStorage.setItem('token', refresh.data.token);
            if (refresh.data.refreshToken) {
              localStorage.setItem('refreshToken', refresh.data.refreshToken);
            }
            const me = await api.get('/auth/me');
            if (me.data?.success) {
              setAuth(true, me.data.data);
              return;
            }
          }
        } catch (_refreshError) {
          setAuth(false);
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
        }
      }
    };

    bootstrapSession();
  }, []);

  useEffect(() => {
    document.body.classList.toggle('auth-route', !isAuthenticated);
    return () => {
      document.body.classList.remove('auth-route');
    };
  }, [isAuthenticated]);

  const setAuth = (status, userData = null) => {
    setIsAuthenticated(status);
    localStorage.setItem('isLoggedIn', status);
    if (!status) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userProfile');
      setUserRole('user');
      setUserProfile({ 
        name: 'Guest User', 
        email: 'guest@eventsphere.com',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=1200'
      });
    } else if (userData) {
      const merged = { ...userProfile, ...userData };
      setUserProfile(merged);
      setUserRole(userData.role || 'user');
      localStorage.setItem('user', JSON.stringify(merged));
      localStorage.setItem('userRole', userData.role || 'user');
      localStorage.setItem('userProfile', JSON.stringify(merged));
    }
  };

  const updateProfile = (newData) => {
    const updated = { ...userProfile, ...newData };
    setUserProfile(updated);
    localStorage.setItem('userProfile', JSON.stringify(updated));
  };

  const handleLogout = async () => {
    try {
      await api.get('/auth/logout');
    } catch (_error) {
      // Ignore logout network issues and clear client state anyway.
    }
    setAuth(false);
  };

  return (
    <Router>
      <div className="app-wrapper">
        {isAuthenticated && (
          <Navbar 
            isAuthenticated={isAuthenticated} 
            onLogout={handleLogout} 
            userRole={userRole} 
            userProfile={userProfile} 
          />
        )}
        
        <div className={`content ${!isAuthenticated ? 'content-auth' : ''}`}>
          <Routes>
            {/* PUBLIC AUTH ROUTES */}
            <Route path="/login" element={!isAuthenticated ? <Login onLogin={(data) => setAuth(true, data)} /> : <Navigate to="/" />} />
            <Route path="/signup" element={!isAuthenticated ? <Signup onSignup={(data) => setAuth(true, data)} /> : <Navigate to="/" />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* PROTECTED ROUTES (Redirect to login if not authenticated) */}
            <Route path="/" element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <Home />
              </PrivateRoute>
            } />
            <Route path="/events" element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <EventListing />
              </PrivateRoute>
            } />
            <Route path="/events/:id" element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <EventDetails />
              </PrivateRoute>
            } />
            <Route path="/booking/:eventId" element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <Booking />
              </PrivateRoute>
            } />
            <Route path="/payment/:bookingId" element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <Payment />
              </PrivateRoute>
            } />
            <Route path="/my-bookings" element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <MyBookings />
              </PrivateRoute>
            } />
            <Route path="/notifications" element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <Notifications />
              </PrivateRoute>
            } />
            <Route path="/profile" element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <Profile userProfile={userProfile} updateProfile={updateProfile} />
              </PrivateRoute>
            } />
            <Route path="/place-ad" element={
              <RoleRoute isAuthenticated={isAuthenticated} userRole={userRole} allowedRoles={['organizer', 'admin']}>
                <PlaceAd />
              </RoleRoute>
            } />
            <Route path="/about" element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <About />
              </PrivateRoute>
            } />
            <Route path="/contact" element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <Contact />
              </PrivateRoute>
            } />
            <Route path="/give-feedback" element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <GiveFeedback userProfile={userProfile} userRole={userRole} />
              </PrivateRoute>
            } />

            {/* ORGANIZER PROTECTED ROUTES */}
            <Route path="/organizer/dashboard" element={
              <RoleRoute isAuthenticated={isAuthenticated} userRole={userRole} allowedRoles={['organizer', 'admin']}>
                <OrganizerDashboard />
              </RoleRoute>
            } />
            <Route path="/organizer/create-event" element={
              <RoleRoute isAuthenticated={isAuthenticated} userRole={userRole} allowedRoles={['organizer', 'admin']}>
                <CreateEvent />
              </RoleRoute>
            } />
            <Route path="/organizer/attendees" element={
              <RoleRoute isAuthenticated={isAuthenticated} userRole={userRole} allowedRoles={['organizer', 'admin']}>
                <AttendeeList />
              </RoleRoute>
            } />
            <Route path="/organizer/attendees/:eventId" element={
              <RoleRoute isAuthenticated={isAuthenticated} userRole={userRole} allowedRoles={['organizer', 'admin']}>
                <AttendeeList />
              </RoleRoute>
            } />
            <Route path="/organizer/scanner" element={
              <RoleRoute isAuthenticated={isAuthenticated} userRole={userRole} allowedRoles={['organizer', 'admin']}>
                <TicketScanner />
              </RoleRoute>
            } />
            <Route path="/admin/dashboard" element={
              <RoleRoute isAuthenticated={isAuthenticated} userRole={userRole} allowedRoles={['admin']}>
                <AdminDashboard />
              </RoleRoute>
            } />
            <Route path="/admin/feedback" element={
              <RoleRoute isAuthenticated={isAuthenticated} userRole={userRole} allowedRoles={['admin']}>
                <FeedbackManagement />
              </RoleRoute>
            } />
            
            <Route path="/privacy" element={<StaticPage title="Privacy Policy" />} />
            <Route path="/terms" element={<StaticPage title="Terms & Conditions" />} />

            <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} />} />
          </Routes>
        </div>

        {isAuthenticated && <Footer />}
        {isAuthenticated && <AIConcierge userRole={userRole} />}
      </div>
    </Router>
  );
}

export default App;

