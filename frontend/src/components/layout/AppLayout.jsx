import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useAuth } from '../../context/AuthContext';

const AppLayout = ({ role }) => {
  const { user } = useAuth();
  if (user?.status === 'blocked') {
    return (
      <>
        <Header />
        <div className="container" style={{ marginTop: 40 }}>
          <div className="alert alert-error">
            <strong>Account blocked.</strong> Please contact support. Financial actions are disabled, but you can still view your data.
          </div>
        </div>
        <div className="container">
          <div className="dash-shell">
            <Sidebar role={role || user.role} />
            <div className="dash-main"><Outlet /></div>
          </div>
        </div>
        <Footer />
      </>
    );
  }
  return (
    <>
      <Header />
      <div className="container">
        <div className="dash-shell">
          <Sidebar role={role || user?.role} />
          <div className="dash-main"><Outlet /></div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AppLayout;
