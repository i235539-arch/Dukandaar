import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { reportService } from '../../services/reportService';
import { formatPKR, formatDate } from '../../utils/format';
import { Loading, EmptyState } from '../../components/common/Loading';
import StatusBadge from '../../components/common/StatusBadge';
import IncomeExpenseChart from '../../components/charts/IncomeExpenseChart';
import { apiError } from '../../services/api';

const UserDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        setLoading(true);
        const r = await reportService.userDashboard();
        if (!cancel) setData(r.data.data);
      } catch (err) {
        if (!cancel) setError(apiError(err));
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, []);

  if (loading) return <Loading size="lg" />;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <>
      <div className="section-title">
        <div>
          <h2>Welcome back 👋</h2>
          <p className="text-muted" style={{ margin: 0 }}>Here's your investing snapshot.</p>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-tile">
          <div className="label">Wallet Balance</div>
          <div className="value">{formatPKR(data?.wallet?.balance || 0)}</div>
          <Link to="/app/wallet" className="text-muted">Manage wallet →</Link>
        </div>
        <div className="stat-tile">
          <div className="label">Total Invested</div>
          <div className="value">{formatPKR(data?.totalInvested || 0)}</div>
          <div className="meta">{data?.activeInvestmentsCount || 0} active properties</div>
        </div>
        <div className="stat-tile">
          <div className="label">Dividends Earned</div>
          <div className="value">{formatPKR(data?.totalDividends || 0)}</div>
          <div className="meta">all-time</div>
        </div>
        <div className="stat-tile">
          <div className="label">This Month's Expenses</div>
          <div className="value">{formatPKR(data?.monthExpenseTotal || 0)}</div>
          <Link to="/app/expenses" className="text-muted">View expenses →</Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 18, marginTop: 18 }} className="dash-grid">
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Income vs Expense (last 6 months)</h3>
          <IncomeExpenseChart />
        </div>
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Recent Transactions</h3>
          {(data?.recentTransactions?.length || 0) === 0 ? (
            <EmptyState title="No transactions yet" message="Top up your wallet to begin." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {data.recentTransactions.map((t) => (
                <Link key={t._id} to={`/app/transactions/${t._id}`} className="card-flat" style={{ padding: 12 }}>
                  <div className="flex between">
                    <div>
                      <div style={{ fontWeight: 600, textTransform: 'capitalize' }}>
                        {t.type} {t.suspiciousFlag ? '🚩' : ''}
                      </div>
                      <div className="text-muted" style={{ fontSize: '0.8rem' }}>{formatDate(t.createdAt)}</div>
                    </div>
                    <div className="tar">
                      <div style={{ fontWeight: 700 }}>{formatPKR(t.amount)}</div>
                      <StatusBadge status={t.status} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          <div className="mt-12 tar"><Link to="/app/transactions" className="btn btn-ghost btn-sm">View all →</Link></div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) { .dash-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </>
  );
};

export default UserDashboard;
