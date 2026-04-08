import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useSearchParams } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Shield, 
  LogOut, 
  Camera, 
  Globe, 
  Bell, 
  Settings, 
  CreditCard, 
  LayoutGrid, 
  CheckCircle,
  MapPin,
  Phone,
  ChevronRight,
  ShieldCheck,
  Smartphone,
  CreditCard as PaymentIcon
  ,
  Eye,
  EyeOff,
  Ticket,
  Calendar,
  ArrowRight,
  Clock3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import { uploadImage } from '../utils/upload';
import { useNotifications } from '../context/NotificationContext';
import PageLoader from '../components/PageLoader';
import './Profile.css';

const Profile = ({ updateProfile }) => {
  const [searchParams] = useSearchParams();
  const { showNotification, pushNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState({ name: '', email: '', avatar: '', phone: '', bio: '' });
  const [recentBookings, setRecentBookings] = useState([]);
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const fileInputRef = useRef(null);
  const userRole = user?.role || localStorage.getItem('userRole') || 'user';

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (searchParams.get('setup') === '1') {
      setActiveTab('personal');
      setIsEditing(true);
    }
  }, [searchParams]);

  const fetchUserData = async () => {
    try {
      const [profileResponse, bookingsResponse] = await Promise.all([
        api.get('/auth/me'),
        api.get('/bookings/my-bookings').catch(() => ({ data: { success: false, data: [] } }))
      ]);

      if (profileResponse.data.success) {
        setUser(profileResponse.data.data);
        if (updateProfile) updateProfile(profileResponse.data.data);
      }

      if (bookingsResponse.data?.success) {
        setRecentBookings(bookingsResponse.data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'personal', name: 'Personal Information', icon: <User size={20}/>, desc: 'Manage your name, email and details' },
    { id: 'security', name: 'Security & Privacy', icon: <Shield size={20}/>, desc: 'Login details, MFA, and access' },
    { id: 'payments', name: 'Payment Methods', icon: <CreditCard size={20}/>, desc: 'Cards, UPI and transaction history' },
    { id: 'settings', name: 'Global Settings', icon: <Settings size={20}/>, desc: 'Notifications and site preferences' },
  ];

  const upcomingBookings = recentBookings.filter((booking) => booking.event && new Date(booking.event.date) >= new Date());
  const confirmedBookings = recentBookings.filter((booking) => booking.status === 'confirmed');
  const totalSpend = recentBookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
  const attendeeHighlights = [
    { label: 'Total Bookings', value: String(user.bookingsCount || recentBookings.length || 0), icon: <Ticket size={18}/> },
    { label: 'Upcoming Events', value: String(upcomingBookings.length), icon: <Calendar size={18}/> },
    { label: 'Confirmed Tickets', value: String(confirmedBookings.length), icon: <Clock3 size={18}/> },
  ];

  const handleSave = async () => {
    try {
      setSavingProfile(true);
      const { data } = await api.put('/auth/updatedetails', {
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        phone: user.phone,
        bio: user.bio
      });
      if (data.success) {
        setUser(data.data);
        if (updateProfile) updateProfile(data.data);
        setIsEditing(false);
        showNotification('Profile updated successfully', 'success');
        pushNotification('Profile updated', 'Your account details were saved successfully.', 'profile');
      }
    } catch (e) {
      alert(e.response?.data?.message || 'Update failed');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      (async () => {
        try {
          setUploadingAvatar(true);
          const uploaded = await uploadImage(file, 'eventsphere/avatars');
          const nextUser = { ...user, avatar: uploaded.secureUrl };
          setUser(nextUser);
          const { data } = await api.put('/auth/updatedetails', {
            name: nextUser.name,
            email: nextUser.email,
            avatar: nextUser.avatar,
            phone: nextUser.phone,
            bio: nextUser.bio
          });
          if (data.success) {
            setUser(data.data);
            if (updateProfile) updateProfile(data.data);
            showNotification('Profile photo updated', 'success');
            pushNotification('Profile photo updated', 'Your profile photo is now live across your account.', 'profile');
          }
        } catch (error) {
          alert(error.response?.data?.message || error.message || 'Avatar upload failed');
        } finally {
          setUploadingAvatar(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      })();
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  const handlePasswordUpdate = async () => {
    if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
      alert('Please fill current password, new password, and confirm password');
      return;
    }

    if (passwords.newPassword.length < 6) {
      alert('New password must be at least 6 characters');
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      alert('New password and confirm password do not match');
      return;
    }

    try {
      setSavingPassword(true);
      const { data } = await api.put('/auth/updatepassword', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });
      if (data?.token) {
        localStorage.setItem('token', data.token);
      }
      if (data?.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      if (data?.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('userProfile', JSON.stringify(data.user));
        if (updateProfile) updateProfile(data.user);
      }
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showNotification('Password updated successfully', 'success');
      pushNotification('Password changed', 'Your account password was updated successfully.', 'profile');
    } catch (error) {
      alert(error.response?.data?.message || 'Password update failed');
    } finally {
      setSavingPassword(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleLogout = async () => {
    try {
      await api.get('/auth/logout');
    } catch (_error) {
      // Clear local state even if the network request fails.
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('userProfile');
      localStorage.removeItem('userRole');
      localStorage.removeItem('isLoggedIn');
      window.location.href = '/login';
    }
  };

  if (loading) return <PageLoader title="Loading your profile..." />;

  return (
    <div className="profile-page container">
      <div className="profile-header-section">
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="p-header-left">
          <h1 className="gradient-text">Account <br />Hub</h1>
          <p>
            {userRole === 'organizer'
              ? 'Personalize your workspace and manage organizer settings from one central place.'
              : 'Track bookings, keep your profile fresh, and stay ready for every upcoming event.'}
          </p>
        </motion.div>
        
        <div className="profile-badge-group">
          {userRole === 'organizer' ? (
            <div className="p-stat-badge glass-panel"><strong>{user.bookingsCount || 0}</strong><span>Bookings</span></div>
          ) : (
            <>
              <div className="p-stat-badge glass-panel"><strong>{user.bookingsCount || recentBookings.length || 0}</strong><span>Bookings</span></div>
              <div className="p-stat-badge glass-panel"><strong>{upcomingBookings.length}</strong><span>Upcoming</span></div>
            </>
          )}
        </div>
      </div>

      <div className="profile-grid">
        <aside className="profile-sidebar">
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="p-sidebar-card glass-panel">
            <div className="p-user-avatar">
              <div className="avatar-img-wrap">
                <img src={user.avatar} alt={user.name} onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2070&auto=format&fit=crop'; }} />
                <button className="avatar-edit-btn" onClick={triggerFileSelect}><Camera size={14}/></button>
                <input type="file" ref={fileInputRef} onChange={handleAvatarChange} style={{ display: 'none' }} accept="image/*" />
              </div>
              <h3>{user.name}</h3>
              {uploadingAvatar && <span className="p-user-label">Uploading avatar...</span>}
              <span className="p-user-label">
                {userRole === 'organizer' ? 'Organizer Workspace' : userRole === 'admin' ? 'Admin Access' : 'Elite Attendee'}
              </span>
              <p className="p-user-email">{user.email}</p>
            </div>
            
            <nav className="p-side-nav">
              {tabs.map(tab => (
                <button key={tab.id} className={`p-nav-link ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
                  <div className="p-nav-icon">{tab.icon}</div>
                  <div className="p-nav-text"><strong>{tab.name}</strong><span>{tab.desc}</span></div>
                  <ChevronRight size={16} className="p-nav-arrow" />
                  {activeTab === tab.id && <motion.div layoutId="p-nav-glow" className="p-nav-glow" />}
                </button>
              ))}
              <div className="p-nav-divider"></div>
              <button className="p-nav-link logout-option" onClick={handleLogout}>
                <div className="p-nav-icon"><LogOut size={20}/></div>
                <div className="p-nav-text"><strong>Sign Out</strong><span>Securely exit account</span></div>
              </button>
            </nav>
          </motion.div>
        </aside>

        <main className="profile-main-content">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }} className="p-content-card glass-panel">
              {activeTab === 'personal' && (
                <div className="p-tab-view">
                   <div className="p-tab-header">
                     <div>
                       <h2>{userRole === 'organizer' ? 'Profile ' : 'Attendee '}<span className="gradient-text">Details</span></h2>
                       <p>{userRole === 'organizer' ? 'Keep your contact details up to date.' : 'Keep your attendee profile, ticket access, and booking identity up to date.'}</p>
                     </div>
                     {!isEditing ? (
                       <button className="btn btn-secondary btn-sm" onClick={() => setIsEditing(true)}>Edit Profile</button>
                     ) : (
                       <div style={{ display: 'flex', gap: '0.5rem'}}>
                         <button className="btn btn-secondary btn-sm" onClick={() => setIsEditing(false)}>Cancel</button>
                         <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={savingProfile}><CheckCircle size={16}/> {savingProfile ? 'Saving...' : 'Save'}</button>
                       </div>
                     )}
                   </div>

                    {searchParams.get('setup') === '1' && (
                      <div style={{ marginBottom: '1rem', padding: '1rem 1.25rem', borderRadius: '1rem', background: 'rgba(99,102,241,0.12)', color: 'var(--text-light)' }}>
                        {userRole === 'organizer'
                          ? 'Complete your organizer profile so your workspace and future events feel ready from day one.'
                          : 'Complete your attendee profile by uploading a personal photo and checking your basic details.'}
                      </div>
                    )}

                    {userRole !== 'organizer' && (
                      <>
                        <div className="attendee-summary-grid">
                          {attendeeHighlights.map((item) => (
                            <div key={item.label} className="attendee-summary-card glass-panel">
                              <div className="attendee-summary-icon">{item.icon}</div>
                              <strong>{item.value}</strong>
                              <span>{item.label}</span>
                            </div>
                          ))}
                        </div>

                        <div className="attendee-booking-panel glass-panel">
                          <div className="attendee-booking-head">
                            <div>
                              <h3>Booking Snapshot</h3>
                              <p>Your latest attendee activity, upcoming plans, and ticket readiness in one place.</p>
                            </div>
                            <div className="attendee-booking-spend">
                              <span>Total Spend</span>
                              <strong>₹{totalSpend.toLocaleString('en-IN')}</strong>
                            </div>
                          </div>

                          {recentBookings.length > 0 ? (
                            <div className="attendee-booking-list">
                              {recentBookings.slice(0, 3).map((booking) => (
                                <div key={booking._id} className="attendee-booking-item">
                                  <div>
                                    <strong>{booking.event?.title || 'Event booking'}</strong>
                                    <span>{booking.event?.location || 'Location coming soon'}</span>
                                  </div>
                                  <div className="attendee-booking-meta">
                                    <em>{booking.status}</em>
                                    <label>{booking.event?.date || 'TBA'}</label>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="attendee-empty-state">
                              <p>No bookings yet. Explore events and your attendee journey will start showing up here.</p>
                            </div>
                          )}

                          <NavLink to="/my-bookings" className="attendee-booking-link">
                            Open My Bookings <ArrowRight size={16}/>
                          </NavLink>
                        </div>
                      </>
                    )}

                    <div className="p-form-grid">
                      <div className="p-form-group">
                        <label><User size={14}/> Full Name</label>
                        <input type="text" value={user.name} onChange={(e) => setUser({ ...user, name: e.target.value })} disabled={!isEditing} />
                      </div>
                      <div className="p-form-group">
                        <label><Mail size={14}/> Email</label>
                        <input type="email" value={user.email} onChange={(e) => setUser({ ...user, email: e.target.value })} disabled={!isEditing} />
                      </div>
                      <div className="p-form-group">
                        <label><Phone size={14}/> Phone</label>
                        <input type="text" value={user.phone || ''} onChange={(e) => setUser({ ...user, phone: e.target.value })} disabled={!isEditing} placeholder="Enter phone number" />
                      </div>
                      <div className="p-form-group">
                        <label><MapPin size={14}/> Bio</label>
                        <input type="text" value={user.bio || ''} onChange={(e) => setUser({ ...user, bio: e.target.value })} disabled={!isEditing} placeholder="Tell us a little about yourself" />
                      </div>
                   </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="p-tab-view">
                   <div className="p-tab-header">
                     <div><h2>Security <span className="gradient-text">Privacy</span></h2><p>Manage your account password.</p></div>
                   </div>
                   <div className="security-stacked-list">
                      <div className="sec-item glass-panel">
                        <div className="sec-icon-wrap"><ShieldCheck size={24}/></div>
                        <div className="sec-info"><strong>Change Password</strong><p>Update your account access</p></div>
                        <span style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Enter details below</span>
                      </div>
                      <div className="p-form-grid" style={{ marginTop: '1rem' }}>
                        <div className="p-form-group">
                          <label>Current Password</label>
                          <div className="profile-password-wrap">
                            <input type={showPasswords.currentPassword ? 'text' : 'password'} value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} />
                            <button type="button" className="profile-password-toggle" onClick={() => togglePasswordVisibility('currentPassword')} aria-label={showPasswords.currentPassword ? 'Hide password' : 'Show password'}>
                              {showPasswords.currentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                        </div>
                        <div className="p-form-group">
                          <label>New Password</label>
                          <div className="profile-password-wrap">
                            <input type={showPasswords.newPassword ? 'text' : 'password'} value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} />
                            <button type="button" className="profile-password-toggle" onClick={() => togglePasswordVisibility('newPassword')} aria-label={showPasswords.newPassword ? 'Hide password' : 'Show password'}>
                              {showPasswords.newPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                        </div>
                        <div className="p-form-group">
                          <label>Confirm Password</label>
                          <div className="profile-password-wrap">
                            <input type={showPasswords.confirmPassword ? 'text' : 'password'} value={passwords.confirmPassword} onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })} />
                            <button type="button" className="profile-password-toggle" onClick={() => togglePasswordVisibility('confirmPassword')} aria-label={showPasswords.confirmPassword ? 'Hide password' : 'Show password'}>
                              {showPasswords.confirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                        </div>
                      </div>
                      <div style={{ marginTop: '1rem' }}>
                        <button className="btn btn-primary btn-sm" onClick={handlePasswordUpdate} disabled={savingPassword}>
                          {savingPassword ? 'Updating...' : 'Update Password'}
                        </button>
                      </div>
                   </div>
                </div>
              )}

              {activeTab === 'payments' && (
                <div className="p-tab-view">
                   <div className="p-tab-header">
                     <div><h2>Payment <span className="gradient-text">Methods</span></h2><p>Your secure payment profiles.</p></div>
                   </div>
                   <div className="card-mock-stack">
                      <div className="profile-payment-card glass-panel gold">
                         <div className="card-header"><PaymentIcon size={24}/> <span>Elite Member</span></div>
                         <div className="card-number">•••• •••• •••• 9012</div>
                         <div className="card-footer"><span>{user.name}</span><span>Virtual</span></div>
                      </div>
                   </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="p-tab-view">
                  <div className="p-tab-header"><h2>Site <span className="gradient-text">Preferences</span></h2><p>Control display settings.</p></div>
                  <div className="pref-list">
                    <div className="pref-item">
                      <div className="pref-text"><strong>Email Notifications</strong><span>Get weekly event updates.</span></div>
                      <div className="toggle-pill active">ON</div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default Profile;

