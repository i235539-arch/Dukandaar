import { Routes, Route, Navigate } from 'react-router-dom';

import PublicLayout from './components/layout/PublicLayout';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './routes/ProtectedRoute';

import Landing from './pages/public/Landing';
import About from './pages/public/About';
import NotFound from './pages/public/NotFound';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

import PropertiesPage from './pages/user/Properties';
import PropertyDetail from './pages/user/PropertyDetail';
import UserDashboard from './pages/user/UserDashboard';
import Wallet from './pages/user/Wallet';
import Transfer from './pages/user/Transfer';
import Transactions from './pages/user/Transactions';
import TransactionReceipt from './pages/user/TransactionReceipt';
import MyInvestments from './pages/user/MyInvestments';
import Expenses from './pages/user/Expenses';
import Budgets from './pages/user/Budgets';
import Notifications from './pages/user/Notifications';
import Profile from './pages/user/Profile';
import Reports from './pages/user/Reports';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminWallets from './pages/admin/AdminWallets';
import AdminTransactions from './pages/admin/AdminTransactions';
import AdminFlagged from './pages/admin/AdminFlagged';
import AdminProperties from './pages/admin/AdminProperties';
import AdminCategories from './pages/admin/AdminCategories';
import AdminReports from './pages/admin/AdminReports';
import AdminAudit from './pages/admin/AdminAudit';

const App = () => (
  <Routes>
    {/* Public */}
    <Route element={<PublicLayout />}>
      <Route index element={<Landing />} />
      <Route path="/about" element={<About />} />
      <Route path="/properties" element={<PropertiesPage />} />
      <Route path="/properties/:id" element={<PropertyDetail />} />
    </Route>

    {/* Auth (no sidebar) */}
    <Route element={<PublicLayout />}>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Route>

    {/* User app */}
    <Route
      path="/app"
      element={
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<UserDashboard />} />
      <Route path="wallet" element={<Wallet />} />
      <Route path="transfer" element={<Transfer />} />
      <Route path="transactions" element={<Transactions />} />
      <Route path="transactions/:id" element={<TransactionReceipt />} />
      <Route path="investments" element={<MyInvestments />} />
      <Route path="expenses" element={<Expenses />} />
      <Route path="budgets" element={<Budgets />} />
      <Route path="reports" element={<Reports />} />
      <Route path="notifications" element={<Notifications />} />
      <Route path="profile" element={<Profile />} />
    </Route>

    {/* Admin */}
    <Route
      path="/admin"
      element={
        <ProtectedRoute role="admin">
          <AppLayout role="admin" />
        </ProtectedRoute>
      }
    >
      <Route index element={<AdminDashboard />} />
      <Route path="users" element={<AdminUsers />} />
      <Route path="wallets" element={<AdminWallets />} />
      <Route path="transactions" element={<AdminTransactions />} />
      <Route path="flagged" element={<AdminFlagged />} />
      <Route path="properties" element={<AdminProperties />} />
      <Route path="categories" element={<AdminCategories />} />
      <Route path="reports" element={<AdminReports />} />
      <Route path="audit" element={<AdminAudit />} />
    </Route>

    <Route path="*" element={<PublicLayout />}>
      <Route path="*" element={<NotFound />} />
    </Route>
    <Route path="/404" element={<Navigate to="/" replace />} />
  </Routes>
);

export default App;
