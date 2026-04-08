import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation as useRouterLocation, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  User, 
  Search, 
  Menu, 
  X, 
  LayoutDashboard, 
  Ticket, 
  LogOut, 
  Settings,
  Info,
  Mail,
  CalendarDays,
  UserCircle,
  MapPin,
  ChevronDown,
  RefreshCcw,
  Bell,
  ChevronRight,
  CheckCheck
} from 'lucide-react';
import { useLocation as useGeoLocation } from '../context/LocationContext';
import { useNotifications } from '../context/NotificationContext';
import './Navbar.css';

const Navbar = ({ isAuthenticated, onLogout, userRole, userProfile }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const { city, fullLocation, changeLocation, refreshLocation, loading: locLoading } = useGeoLocation();
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll, deleteNotification } = useNotifications();
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();
  const calendarInputRef = useRef(null);
  const profileMenuRef = useRef(null);
  const notifMenuRef = useRef(null);

  const majorCities = ['Mumbai', 'Bangalore', 'Pune', 'Goa', 'Jaipur', 'Hyderabad', 'Delhi', 'Rishikesh', 'Kolkata', 'Chennai', 'Ahmedabad'];

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(event.target)) {
        setShowNotifMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    if (onLogout) onLogout();
    navigate('/login');
  };

  const formatTime = (isoString) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  const calendarSearchParams = new URLSearchParams(routerLocation.search);
  const selectedCalendarDate = calendarSearchParams.get('date') || '';
  const calendarBadgeLabel = selectedCalendarDate
    ? String(Number(selectedCalendarDate.split('-')[2] || new Date().getDate()))
    : String(new Date().getDate());

  const handleCalendarOpen = () => {
    if (calendarInputRef.current) {
      calendarInputRef.current.value = selectedCalendarDate;
    }
    if (calendarInputRef.current?.showPicker) {
      calendarInputRef.current.showPicker();
      return;
    }
    calendarInputRef.current?.click();
  };

  const handleCalendarChange = (event) => {
    const selectedDate = event.target.value;
    if (!selectedDate) return;

    const nextParams = new URLSearchParams();
    nextParams.set('date', selectedDate);

    navigate(`/events?${nextParams.toString()}`);
  };

  return (
    <nav className="navbar-v2">
      <div className="nav-blur-layer"></div>
      <div className="container nav-container-v2">
        
        {/* LEFT: LOGO & LOCATION */}
        <div className="nav-group-left">
          <div className="logo-section">
            <button type="button" className="logo-icon-link calendar-trigger-btn" aria-label="Select a date to view events" onClick={handleCalendarOpen}>
              <div className="logo-icon-container">
                <div className="logo-circle-glow"></div>
                <Calendar className="logo-icon-svg" size={28} />
                <span className="logo-date-indicator">{calendarBadgeLabel}</span>
              </div>
            </button>
            <input
              ref={calendarInputRef}
              type="date"
              defaultValue={selectedCalendarDate}
              className="navbar-date-input"
              onChange={handleCalendarChange}
              aria-hidden="true"
              tabIndex={-1}
            />
            <NavLink to="/" className="logo-brand-link" aria-label="Go to EventSphere home">
              <span className="logo-brand">
                Event<span className="logo-accent">Sphere</span>
              </span>
            </NavLink>
          </div>
          
          <div className="location-trigger-wrap">
            <button 
              className={`location-pill-v2 ${locLoading ? 'is-loading' : ''}`}
              title="Change Location"
            >
              <div className="loc-icon-box">
                <MapPin size={16} />
              </div>
              <div className="loc-text-content">
                <span className="loc-label">{locLoading ? 'Locating...' : city}</span>
                <span className="loc-subtext">{fullLocation.split(',')[0]}</span>
              </div>
              <ChevronDown size={14} className="loc-arrow" />
            </button>
            
            <div className="location-dropdown-v2">
              <div className="loc-dropdown-header">
                <span>Select City</span>
                <button onClick={refreshLocation} className={locLoading ? 'spin' : ''}>
                  <RefreshCcw size={12} />
                </button>
              </div>
              <div className="city-grid">
                {majorCities.map(c => (
                  <button 
                    key={c} 
                    className={city === c ? 'active' : ''}
                    onClick={() => changeLocation(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CENTER: PRIMARY NAVIGATION */}
        <div className={`nav-links-center ${isOpen ? 'mobile-active' : ''}`}>
          <NavLink to="/" end className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>Home</NavLink>
          <NavLink to="/events" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>Events</NavLink>
          {['organizer', 'admin'].includes(userRole) && (
            <NavLink to="/organizer/dashboard" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>Organizer</NavLink>
          )}
          {userRole === 'admin' && (
            <NavLink to="/admin/dashboard" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>Admin</NavLink>
          )}
          {['organizer', 'admin'].includes(userRole) && (
            <NavLink to="/place-ad" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>Advertise</NavLink>
          )}
          <NavLink to="/about" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>About</NavLink>
          <NavLink to="/contact" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>Contact</NavLink>
        </div>

        {/* RIGHT: ACTIONS & PROFILE */}
        <div className="nav-group-right">
          {isAuthenticated && <div className="notif-wrapper-v2" ref={notifMenuRef}>
            <button 
              className={`nav-icon-btn notification-btn ${showNotifMenu ? 'active' : ''}`}
              onClick={() => setShowNotifMenu(!showNotifMenu)}
            >
              <Bell size={20} />
              {unreadCount > 0 && <span className="notification-dot">{unreadCount}</span>}
            </button>

            {showNotifMenu && (
              <div className="notif-dropdown-v2 glass-panel-v2">
                <div className="notif-dropdown-header">
                  <div className="header-top">
                    <h3>Notifications</h3>
                    <div className="header-actions">
                      <button onClick={markAllAsRead} title="Mark all as read">
                        <CheckCheck size={14} /> Read All
                      </button>
                    </div>
                  </div>
                  <div className="header-stats">
                    <span>{unreadCount} Unread</span>
                    <button className="clear-all-btn" onClick={clearAll}>Clear All</button>
                  </div>
                </div>

                <div className="notif-list">
                  {notifications.length === 0 ? (
                    <div className="notif-empty">
                      <Mail size={32} />
                      <p>No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map(notif => (
                      <div 
                        key={notif.id} 
                        className={`notif-item-v2 ${notif.read ? 'read' : 'unread'}`}
                        onClick={() => markAsRead(notif.id)}
                      >
                        <div className="notif-item-icon">
                          {notif.type === 'info' ? <Info size={16} /> : <Bell size={16} />}
                        </div>
                        <div className="notif-item-content">
                          <p className="notif-item-title">{notif.title}</p>
                          <p className="notif-item-desc">{notif.message}</p>
                          <span className="notif-item-time">{formatTime(notif.time)}</span>
                        </div>
                        {!notif.read && <div className="unread-indicator"></div>}
                        <button 
                          className="notif-delete-btn" 
                          onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id); }}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {notifications.length > 0 && (
                  <div className="notif-dropdown-footer">
                    <button onClick={() => { setShowNotifMenu(false); navigate('/notifications'); }}>
                      View All Notifications <ChevronRight size={14} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>}

          {isAuthenticated ? <div className="profile-wrapper-v2" ref={profileMenuRef}>
            <button 
              className={`profile-trigger ${showProfileMenu ? 'active' : ''}`}
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <div className="avatar-box">
                {userProfile?.avatar ? (
                  <img src={userProfile.avatar} alt={userProfile.name} className="nav-avatar" />
                ) : (
                  <User size={20} />
                )}
              </div>
              <div className="profile-info-compact">
                <span className="username">My Account</span>
                <span className="user-status">{userRole}</span>
              </div>
              <ChevronDown size={14} />
            </button>

            {showProfileMenu && (
              <div className="profile-dropdown-v2 glass-panel-v2">
                <div className="dropdown-section user-card">
                  <div className="avatar-large">
                    {userProfile?.avatar ? (
                      <img src={userProfile.avatar} alt={userProfile.name} className="drop-avatar" />
                    ) : (
                      <UserCircle size={40} />
                    )}
                  </div>
                  <div className="user-details">
                    <span className="full-name">{userProfile?.name || 'Guest User'}</span>
                    <span className="user-email">{userProfile?.email || 'guest@eventsphere.com'}</span>
                  </div>
                </div>

                <div className="dropdown-divider"></div>

                <div className="dropdown-section">
                  <NavLink to="/profile" onClick={() => setShowProfileMenu(false)}>
                    <User size={16} /> Profile Settings
                  </NavLink>
                  <NavLink to="/my-bookings" onClick={() => setShowProfileMenu(false)}>
                    <Ticket size={16} /> My Bookings
                  </NavLink>
                  {['organizer', 'admin'].includes(userRole) && (
                    <NavLink to="/organizer/dashboard" onClick={() => setShowProfileMenu(false)}>
                      <LayoutDashboard size={16} /> Organizer Dashboard
                    </NavLink>
                  )}
                  {userRole === 'admin' && (
                    <NavLink to="/admin/dashboard" onClick={() => setShowProfileMenu(false)}>
                      <LayoutDashboard size={16} /> Admin Dashboard
                    </NavLink>
                  )}
                  <button type="button" className="dropdown-action-link logout-inline" onClick={handleLogout}>
                    <LogOut size={16} /> Logout
                  </button>
                </div>

                <div className="dropdown-divider"></div>

                <div className="dropdown-section role-selection">
                  <span className="section-label">Account Type</span>
                  <div className="role-buttons">
                    <button className="active" type="button">
                      {userRole === 'organizer' ? 'Organizer' : userRole === 'admin' ? 'Admin' : 'Attendee'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div> : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <NavLink to="/login" className="btn btn-secondary">Log In</NavLink>
              <NavLink to="/signup" className="btn btn-primary">Get Started</NavLink>
            </div>
          )}

          <button className="mobile-menu-v2" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;



