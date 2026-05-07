import { NavLink } from 'react-router-dom';

const userLinks = [
  { to: '/app', label: 'Dashboard', end: true, icon: '🏠' },
  { to: '/app/wallet', label: 'Wallet', icon: '💳' },
  { to: '/app/transfer', label: 'Send Money', icon: '↗️' },
  { to: '/app/transactions', label: 'Transactions', icon: '📜' },
  { to: '/properties', label: 'Browse Properties', icon: '🏢' },
  { to: '/app/investments', label: 'My Investments', icon: '📈' },
  { to: '/app/expenses', label: 'Expenses', icon: '🧾' },
  { to: '/app/budgets', label: 'Budgets', icon: '🎯' },
  { to: '/app/reports', label: 'Reports', icon: '📊' },
  { to: '/app/notifications', label: 'Notifications', icon: '🔔' },
  { to: '/app/profile', label: 'Profile', icon: '👤' },
];

const adminLinks = [
  { to: '/admin', label: 'Dashboard', end: true, icon: '🏛️' },
  { to: '/admin/users', label: 'Users', icon: '👥' },
  { to: '/admin/wallets', label: 'Wallets', icon: '💰' },
  { to: '/admin/transactions', label: 'Transactions', icon: '📒' },
  { to: '/admin/flagged', label: 'Flagged', icon: '🚩' },
  { to: '/admin/properties', label: 'Properties', icon: '🏢' },
  { to: '/admin/categories', label: 'Categories', icon: '🗂️' },
  { to: '/admin/reports', label: 'Analytics', icon: '📈' },
  { to: '/admin/audit', label: 'Audit Logs', icon: '🛡️' },
];

const Sidebar = ({ role }) => {
  const links = role === 'admin' ? adminLinks : userLinks;
  return (
    <aside className="sidebar">
      <span className="role-tag">{role === 'admin' ? 'ADMIN PANEL' : 'INVESTOR PORTAL'}</span>
      <h4>Navigation</h4>
      {links.map((l) => (
        <NavLink key={l.to} to={l.to} end={l.end}>
          <span>{l.icon}</span>
          <span>{l.label}</span>
        </NavLink>
      ))}
    </aside>
  );
};

export default Sidebar;
