import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { transactionService } from '../../services/transactionService';
import { formatPKR, formatDate } from '../../utils/format';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import { Loading, EmptyState } from '../../components/common/Loading';
import { apiError } from '../../services/api';

const Transactions = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ type: '', status: '', search: '' });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit };
      if (filters.type) params.type = filters.type;
      if (filters.status) params.status = filters.status;
      if (filters.search) params.search = filters.search;
      const r = await transactionService.list(params);
      setItems(r.data.data.items);
      setTotal(r.data.data.total);
    } catch (err) {
      setError(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [page]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <>
      <PageHeader title="Transactions" subtitle="All your wallet activity." />

      <div className="card-flat mb-12" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
        <select className="select" value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
          <option value="">All types</option>
          <option value="deposit">Deposit</option>
          <option value="withdrawal">Withdrawal</option>
          <option value="transfer">Transfer</option>
          <option value="investment">Investment</option>
          <option value="dividend">Dividend</option>
        </select>
        <select className="select" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option value="">All statuses</option>
          <option value="successful">Successful</option>
          <option value="failed">Failed</option>
          <option value="flagged">Flagged</option>
          <option value="pending">Pending</option>
        </select>
        <input className="input" placeholder="Search ID or description" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
        <button className="btn btn-primary" onClick={() => { setPage(1); load(); }}>Apply</button>
      </div>

      {loading ? <Loading /> : error ? <div className="alert alert-error">{error}</div> :
        items.length === 0 ? (
          <EmptyState title="No transactions" message="Filters returned no transactions." />
        ) : (
          <>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Transaction ID</th><th>Type</th><th>Amount</th><th>Status</th>
                    <th>Counterparty / Property</th><th>When</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((t) => {
                    const counterparty =
                      t.propertyId?.title ||
                      (t.senderId?.email && t.receiverId?.email
                        ? `${t.senderId.email} → ${t.receiverId.email}`
                        : t.senderId?.email || t.receiverId?.email || '—');
                    return (
                      <tr key={t._id}>
                        <td className="font-mono" style={{ fontSize: '0.8rem' }}>{t.transactionId}</td>
                        <td style={{ textTransform: 'capitalize' }}>
                          {t.type} {t.suspiciousFlag && <span className="badge badge-flag" style={{ marginLeft: 6 }}>🚩</span>}
                        </td>
                        <td><strong>{formatPKR(t.amount)}</strong></td>
                        <td><StatusBadge status={t.status} /></td>
                        <td>{counterparty}</td>
                        <td>{formatDate(t.createdAt)}</td>
                        <td><Link to={`/app/transactions/${t._id}`} className="btn btn-ghost btn-sm">View</Link></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex between mt-12">
              <span className="text-muted">Showing {items.length} of {total}</span>
              <div className="flex gap-8">
                <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</button>
                <span className="text-muted" style={{ alignSelf: 'center' }}>{page}/{totalPages}</span>
                <button className="btn btn-ghost btn-sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
              </div>
            </div>
          </>
        )}
    </>
  );
};

export default Transactions;
