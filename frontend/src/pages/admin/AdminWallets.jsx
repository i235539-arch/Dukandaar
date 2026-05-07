import { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { formatPKR, formatDate } from '../../utils/format';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import { Loading, EmptyState } from '../../components/common/Loading';

const AdminWallets = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.listWallets().then((r) => setItems(r.data.data.items)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  return (
    <>
      <PageHeader title="Wallets" subtitle={`${items.length} wallets in system`} />
      {items.length === 0 ? <EmptyState title="No wallets" message="" /> : (
        <div className="table-wrap">
          <table className="table">
            <thead><tr>
              <th>User</th><th>Email</th><th>Status</th><th>Balance</th>
              <th>Deposits</th><th>Withdrawals</th><th>Invested</th><th>Updated</th>
            </tr></thead>
            <tbody>
              {items.map((w) => (
                <tr key={w._id}>
                  <td>{w.userId?.name || '—'}</td>
                  <td>{w.userId?.email}</td>
                  <td><StatusBadge status={w.status} /></td>
                  <td><strong>{formatPKR(w.balance)}</strong></td>
                  <td>{formatPKR(w.totalDeposits)}</td>
                  <td>{formatPKR(w.totalWithdrawals)}</td>
                  <td>{formatPKR(w.totalInvested || 0)}</td>
                  <td>{formatDate(w.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};

export default AdminWallets;
