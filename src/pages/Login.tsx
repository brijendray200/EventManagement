import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../utils/api';
import './Auth.css';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

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
        if (data.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (data.user.role === 'organizer') {
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
          <h1 className="gradient-text">Welcome Back</h1>
          <p>Log in to your account to continue.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label><Mail size={16} /> Email Address</label>
            <input 
              type="email" 
              placeholder="user@eventsphere.com" 
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

        <p className="auth-redirect">Don't have an account? <NavLink to="/signup">Sign Up</NavLink></p>
      </motion.div>
    </div>
  );
};

export default Login;

