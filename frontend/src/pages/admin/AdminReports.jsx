import { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { formatPKR } from '../../utils/format';
import PageHeader from '../../components/common/PageHeader';
import { Loading } from '../../components/common/Loading';
import TransactionVolumeChart from '../../components/charts/TransactionVolumeChart';

const AdminReports = () => {
  const [sys, setSys] = useState(null);

  useEffect(() => {
    adminService.systemBalance().then((r) => setSys(r.data.data));
  }, []);

  if (!sys) return <Loading />;

  return (
    <>
      <PageHeader title="Analytics" subtitle="System-level financial reports." />
      <div className="stat-grid">
        <div className="stat-tile"><div className="label">Total Demo Balance</div><div className="value">{formatPKR(sys.totalDemoBalance)}</div></div>
        <div className="stat-tile"><div className="label">Total Invested</div><div className="value">{formatPKR(sys.totalInvested)}</div></div>
        <div className="stat-tile"><div className="label">Total Dividends Paid</div><div className="value">{formatPKR(sys.totalDividendsPaid)}</div></div>
      </div>

      <div className="card mt-24">
        <h3 style={{ marginTop: 0 }}>Transaction Volume</h3>
        <TransactionVolumeChart />
      </div>
    </>
  );
};

export default AdminReports;
