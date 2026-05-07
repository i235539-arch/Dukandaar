import { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { formatPKR, formatDate } from '../../utils/format';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import { Loading, EmptyState } from '../../components/common/Loading';

const AdminTransactions = () => {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ type: '', status: '', search: '' });
  const [page, setPage] = useState(1);
  const limit = 25;

  const load = async () => {
    setLoading(true);
    const params = { page, limit };
    Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
    const r = await adminService.listAllTransactions(params);
    setItems(r.data.data.items);
    setTotal(r.data.data.total);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [page]);

  return (
    <>
      <PageHeader title="All Transactions" subtitle={`${total} total`} />

      <div className="card-flat mb-12" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
        <select className="select" value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
          <option value="">All types</option><option value="deposit">Deposit</option><option value="withdrawal">Withdrawal</option>
          <option value="transfer">Transfer</option><option value="investment">Investment</option><option value="dividend">Dividend</option>
        </select>
        <select className="select" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option value="">All statuses</option><option value="successful">Successful</option><option value="failed">Failed</option><option value="flagged">Flagged</option>
        </select>
        <input className="input" placeholder="Search ID/desc" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
        <button className="btn btn-primary" onClick={() => { setPage(1); load(); }}>Apply</button>
      </div>

      {loading ? <Loading /> : items.length === 0 ? <EmptyState title="No transactions" message="" /> : (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>ID</th><th>Type</th><th>Amount</th><th>Status</th><th>Sender</th><th>Receiver</th><th>Property</th><th>When</th></tr></thead>
            <tbody>
              {items.map((t) => (
                <tr key={t._id}>
                  <td className="font-mono" style={{ fontSize: '0.78rem' }}>{t.transactionId}</td>
                  <td style={{ textTransform: 'capitalize' }}>{t.type} {t.suspiciousFlag && '🚩'}</td>
                  <td><strong>{formatPKR(t.amount)}</strong></td>
                  <td><StatusBadge status={t.status} /></td>
                  <td>{t.senderId?.email || '—'}</td>
                  <td>{t.receiverId?.email || '—'}</td>
                  <td>{t.propertyId?.title || '—'}</td>
                  <td>{formatDate(t.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex between mt-12">
        <span className="text-muted">Page {page}</span>
        <div className="flex gap-8">
          <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</button>
          <button className="btn btn-ghost btn-sm" disabled={items.length < limit} onClick={() => setPage((p) => p + 1)}>Next</button>
        </div>
      </div>
    </>
  );
};

export default AdminTransactions;
