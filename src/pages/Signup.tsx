import React, { useMemo, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Lock,
  UserPlus,
  ArrowRight,
  ShieldCheck,
  Ticket,
  CalendarPlus,
  Eye,
  EyeOff,
  Building2,
  Phone,
  MapPin,
  Globe,
  Sparkles,
  Users
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../utils/api';
import './Auth.css';

const organizerDefaults = {
  brandName: '',
  organizationType: 'Event Agency',
  phone: '',
  city: '',
  website: '',
  eventFocus: '',
  teamSize: '1-5'
};

const Signup = ({ onSignup }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('user');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [organizerProfile, setOrganizerProfile] = useState(organizerDefaults);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const roleOptions = [
    {
      value: 'user',
      title: 'Attendee',
      subtitle: 'Book events and manage your tickets',
      icon: <Ticket size={18} />,
      badge: 'Smooth booking flow'
    },
    {
      value: 'organizer',
      title: 'Organizer',
      subtitle: 'Launch events, track guests, and grow your brand',
      icon: <CalendarPlus size={18} />,
      badge: 'Dashboard + event tools'
    }
  ];

  const attendeeHighlights = useMemo(
    () => [
      'Discover events that match your vibe and city',
      'Book tickets fast and keep all bookings in one place',
      'Manage your profile, payments, and event history stress-free'
    ],
    []
  );

  const organizerHighlights = useMemo(
    () => [
      'Organizer dashboard opens right after signup',
      'Create, publish, and manage events from one place',
      'Track attendees, bookings, and revenue performance'
    ],
    []
  );

  const handleOrganizerChange = (field, value) => {
    setOrganizerProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleRoleChange = (nextRole) => {
    setRole(nextRole);
    if (nextRole === 'user') {
      setOrganizerProfile(organizerDefaults);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();
    const trimmedName = `${trimmedFirst} ${trimmedLast}`.trim();

    const formData = {
      name: trimmedName,
      email: email.trim(),
      password,
      role,
      phone: role === 'organizer' ? organizerProfile.phone.trim() : '',
      organizerProfile:
        role === 'organizer'
          ? {
              brandName: organizerProfile.brandName.trim(),
              organizationType: organizerProfile.organizationType.trim(),
              phone: organizerProfile.phone.trim(),
              city: organizerProfile.city.trim(),
              website: organizerProfile.website.trim(),
              eventFocus: organizerProfile.eventFocus.trim(),
              teamSize: organizerProfile.teamSize.trim(),
            }
          : undefined
    };

    try {
      const { data } = await api.post('/auth/register', formData);
      if (data.success) {
        localStorage.setItem('token', data.token);
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken);
        }
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('userProfile', JSON.stringify(data.user));
        localStorage.setItem('userRole', data.user.role || role);
        localStorage.setItem('isLoggedIn', 'true');
        if (onSignup) onSignup(data.user);

        navigate(data.user.role === 'organizer' ? '/organizer/dashboard' : '/profile?setup=1');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page container">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="auth-card glass-panel wide-card">
        <div className="auth-header">
          <h1 className="gradient-text">Create Account</h1>
          <p>
            {role === 'organizer'
              ? 'Set up your organizer account once and land straight inside your event workspace.'
              : 'Create your attendee account to discover events, book smoothly, and manage everything from one place.'}
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group-row">
            <div className="form-group">
              <label><User size={16} /> First Name</label>
              <input type="text" placeholder="John" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label><User size={16} /> Last Name</label>
              <input type="text" placeholder="Doe" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            </div>
          </div>

          <div className="form-group">
            <label><Mail size={16} /> Email Address</label>
            <input type="email" placeholder="john@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className="form-group">
            <label><Lock size={16} /> Password</label>
            <div className="password-input-wrap">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <button type="button" className="password-toggle-btn" onClick={() => setShowPassword((prev) => !prev)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label><UserPlus size={16} /> Account Type</label>
            <div className="account-type-grid">
              {roleOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`account-type-card ${role === option.value ? 'active' : ''}`}
                  onClick={() => handleRoleChange(option.value)}
                >
                  <div className="account-type-icon">{option.icon}</div>
                  <div className="account-type-copy">
                    <strong>{option.title}</strong>
                    <span>{option.subtitle}</span>
                    <small className="account-type-badge">{option.badge}</small>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {role === 'user' && (
            <div className="organizer-setup-panel attendee-setup-panel compact-setup-panel">
              <div className="organizer-panel-copy compact-copy">
                <span className="organizer-panel-kicker">Attendee Setup</span>
                <h3>Quick booking profile. No extra complexity.</h3>
              </div>
              <div className="organizer-benefits compact-benefits">
                {attendeeHighlights.map((item) => (
                  <div key={item} className="organizer-benefit-item">
                    <Ticket size={14} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {role === 'organizer' && (
            <div className="organizer-setup-panel compact-setup-panel">
              <div className="organizer-panel-copy compact-copy">
                <span className="organizer-panel-kicker">Organizer Setup</span>
                <h3>Brand details + organizer workspace unlock after signup.</h3>
              </div>
              <div className="organizer-benefits compact-benefits">
                {organizerHighlights.map((item) => (
                  <div key={item} className="organizer-benefit-item">
                    <Sparkles size={14} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {role === 'organizer' && (
            <>
              <div className="auth-section-title">Organizer Details</div>
              <div className="form-group-row">
                <div className="form-group">
                  <label><Building2 size={16} /> Brand / Company Name</label>
                  <input
                    type="text"
                    placeholder="EventSphere Live"
                    value={organizerProfile.brandName}
                    onChange={(e) => handleOrganizerChange('brandName', e.target.value)}
                    required={role === 'organizer'}
                  />
                </div>
                <div className="form-group">
                  <label><CalendarPlus size={16} /> Organization Type</label>
                  <select
                    value={organizerProfile.organizationType}
                    onChange={(e) => handleOrganizerChange('organizationType', e.target.value)}
                    required={role === 'organizer'}
                  >
                    <option>Event Agency</option>
                    <option>Independent Host</option>
                    <option>Venue Team</option>
                    <option>College Club</option>
                    <option>Corporate Team</option>
                    <option>Wedding Planner</option>
                  </select>
                </div>
              </div>

              <div className="form-group-row">
                <div className="form-group">
                  <label><Phone size={16} /> Business Phone</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={organizerProfile.phone}
                    onChange={(e) => handleOrganizerChange('phone', e.target.value)}
                    required={role === 'organizer'}
                  />
                </div>
                <div className="form-group">
                  <label><MapPin size={16} /> City</label>
                  <input
                    type="text"
                    placeholder="New Delhi"
                    value={organizerProfile.city}
                    onChange={(e) => handleOrganizerChange('city', e.target.value)}
                    required={role === 'organizer'}
                  />
                </div>
              </div>

              <div className="form-group-row">
                <div className="form-group">
                  <label><Globe size={16} /> Website (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://yourbrand.com"
                    value={organizerProfile.website}
                    onChange={(e) => handleOrganizerChange('website', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label><Users size={16} /> Team Size</label>
                  <select
                    value={organizerProfile.teamSize}
                    onChange={(e) => handleOrganizerChange('teamSize', e.target.value)}
                    required={role === 'organizer'}
                  >
                    <option>1-5</option>
                    <option>6-15</option>
                    <option>16-50</option>
                    <option>50+</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label><Sparkles size={16} /> Primary Event Focus</label>
                <input
                  type="text"
                  placeholder="Concerts, weddings, brand launches, workshops..."
                  value={organizerProfile.eventFocus}
                  onChange={(e) => handleOrganizerChange('eventFocus', e.target.value)}
                  required={role === 'organizer'}
                />
              </div>
            </>
          )}

          <div className="terms remember-me" style={{ alignItems: 'center' }}>
            <input type="checkbox" id="terms" required style={{ width: '1.1rem', height: '1.1rem', cursor: 'pointer' }} />
            <label htmlFor="terms" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={16} /> 
              <span>I agree to the <NavLink to="/terms" onClick={(e) => e.stopPropagation()}>Terms of Service</NavLink> and <NavLink to="/privacy" onClick={(e) => e.stopPropagation()}>Privacy Policy</NavLink></span>
            </label>
          </div>
          <button type="submit" className="btn btn-primary auth-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Creating Account...' : role === 'organizer' ? 'Create Organizer Account' : 'Create Attendee Account'} <ArrowRight size={18} />
          </button>
        </form>

        <p className="auth-redirect">Already have an account? <NavLink to="/login">Log In</NavLink></p>
      </motion.div>
    </div>
  );
};

export default Signup;

