import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <Link to="/" className="navbar-brand">
        <span className="logo-icon" aria-hidden="true">P</span>
        ProjectFlow
      </Link>

      <div className="navbar-right">
        <div className="navbar-user" aria-label={`Logged in as ${user?.name}`}>
          <div className="navbar-avatar" aria-hidden="true">{initials}</div>
          <span>{user?.name}</span>
          <span className={`navbar-role-badge ${user?.role}`} role="status">
            {user?.role}
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="btn btn-ghost btn-sm"
          aria-label="Sign out"
          style={{ color: 'rgba(255,255,255,0.7)' }}
        >
          Sign out
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
