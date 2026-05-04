import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, Eye, EyeOff, Ticket, CalendarPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../utils/api';
import './Auth.css';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null); // null, 'user', 'organizer'
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = {
      email,
      password
    };

    try {
      const { data } = await api.post('/auth/login', formData);
      if (data.success) {
        localStorage.setItem('token', data.token);
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken);
        }
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('userProfile', JSON.stringify(data.user));
        localStorage.setItem('userRole', data.user.role || 'user');
        localStorage.setItem('isLoggedIn', 'true');
        if (onLogin) onLogin(data.user);
        
        // Check if the logged in user's role matches the selected role (optional validation)
        const userRole = data.user.role || 'user';
        
        if (userRole === 'admin') {
          navigate('/admin/dashboard');
        } else if (userRole === 'organizer') {
          navigate('/organizer/dashboard');
        } else {
          navigate('/');
        }
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="auth-page container">
      <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} className="auth-card glass-panel">
        <div className="auth-header">
          <h1 className="gradient-text">
            {selectedRole === 'organizer' ? 'Organizer Login' : selectedRole === 'user' ? 'Attendee Login' : 'Welcome Back'}
          </h1>
          <p>
            {selectedRole === null 
              ? 'Please select your account type to continue.' 
              : `Log in to your ${selectedRole} account.`}
          </p>
        </div>

        {selectedRole === null ? (
          <div className="account-type-grid" style={{ marginTop: '2rem', marginBottom: '2rem' }}>
            <button
              type="button"
              className="account-type-card"
              onClick={() => handleRoleSelect('user')}
              style={{ padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1rem' }}
            >
              <div className="account-type-icon" style={{ width: '4rem', height: '4rem', borderRadius: '1rem' }}>
                <Ticket size={32} />
              </div>
              <div className="account-type-copy">
                <strong style={{ fontSize: '1.2rem' }}>Attendee</strong>
                <span style={{ fontSize: '0.9rem' }}>Discover and book events</span>
              </div>
            </button>
            <button
              type="button"
              className="account-type-card"
              onClick={() => handleRoleSelect('organizer')}
              style={{ padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1rem' }}
            >
              <div className="account-type-icon" style={{ width: '4rem', height: '4rem', borderRadius: '1rem' }}>
                <CalendarPlus size={32} />
              </div>
              <div className="account-type-copy">
                <strong style={{ fontSize: '1.2rem' }}>Organizer</strong>
                <span style={{ fontSize: '0.9rem' }}>Manage events and track guests</span>
              </div>
            </button>
          </div>
        ) : (
          <>
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label><Mail size={16} /> Email Address</label>
                <input 
                  type="email" 
                  placeholder={selectedRole === 'organizer' ? 'organizer@eventsphere.com' : 'user@eventsphere.com'} 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
              <div className="form-group">
                <label><Lock size={16} /> Password</label>
                <div className="password-input-wrap">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button type="button" className="password-toggle-btn" onClick={() => setShowPassword((prev) => !prev)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="form-footer">
                <label className="remember-me"><input type="checkbox" /> Remember me</label>
                <NavLink to="/forgot-password">Forgot Password?</NavLink>
              </div>
              <button type="submit" className="btn btn-primary auth-btn">Log In <LogIn size={18} /></button>
            </form>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => setSelectedRole(null)}
              style={{ width: '100%', marginTop: '1rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              Back to Selection
            </button>
          </>
        )}

        <p className="auth-redirect">Don't have an account? <NavLink to="/signup">Sign Up</NavLink></p>
      </motion.div>
    </div>
  );
};

export default Login;

