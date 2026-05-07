import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="app-header">
      <div className="container app-header-inner">
        <Link to="/" className="brand">
          <span className="brand-mark">D</span>
          <span>Dukandaar DAO</span>
        </Link>

        <nav className={`nav-links ${open ? 'open' : ''}`} onClick={() => setOpen(false)}>
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/properties">Properties</NavLink>
          <NavLink to="/about">About</NavLink>
          {user && <NavLink to={user.role === 'admin' ? '/admin' : '/app'}>Dashboard</NavLink>}
        </nav>

        <div className="nav-cta">
          {user ? (
            <>
              <span className="text-muted" style={{ fontSize: '0.85rem' }}>Hi, {user.name?.split(' ')[0]}</span>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link className="btn btn-ghost btn-sm" to="/login">Login</Link>
              <Link className="btn btn-primary btn-sm" to="/register">Get Started</Link>
            </>
          )}
          <button className="hamburger" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu">☰</button>
        </div>
      </div>
    </header>
  );
};

export default Header;
