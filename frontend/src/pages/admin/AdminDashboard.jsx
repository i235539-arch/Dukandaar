import { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { formatPKR } from '../../utils/format';
import PageHeader from '../../components/common/PageHeader';
import { Loading } from '../../components/common/Loading';
import TransactionVolumeChart from '../../components/charts/TransactionVolumeChart';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.dashboard().then((r) => setData(r.data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading size="lg" />;
  if (!data) return null;

  return (
    <>
      <PageHeader title="Admin Dashboard" subtitle="System-wide analytics and platform health." />

      <div className="stat-grid">
        <div className="stat-tile"><div className="label">Total Users</div><div className="value">{data.totalUsers}</div><div className="meta">Active: {data.activeUsers} · Blocked: {data.blockedUsers}</div></div>
        <div className="stat-tile"><div className="label">Properties</div><div className="value">{data.totalProperties}</div><div className="meta">Open: {data.openProperties} · Funded: {data.fundedProperties}</div></div>
        <div className="stat-tile"><div className="label">Transactions</div><div className="value">{data.totalTransactions}</div><div className="meta">Flagged: {data.flaggedTransactions}</div></div>
        <div className="stat-tile"><div className="label">Total Volume</div><div className="value">{formatPKR(data.totalVolume)}</div></div>
        <div className="stat-tile"><div className="label">Demo Balance in System</div><div className="value">{formatPKR(data.totalDemoBalance)}</div></div>
        <div className="stat-tile"><div className="label">Total Invested</div><div className="value">{formatPKR(data.totalInvested)}</div></div>
      </div>

      <div className="card mt-24">
        <h3 style={{ marginTop: 0 }}>Transaction volume (last 6 months)</h3>
        <TransactionVolumeChart />
      </div>
    </>
  );
};

export default AdminDashboard;
