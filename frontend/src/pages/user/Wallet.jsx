import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { walletService } from '../../services/walletService';
import { formatPKR, formatDate } from '../../utils/format';
import { Loading } from '../../components/common/Loading';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import PageHeader from '../../components/common/PageHeader';
import { apiError, apiErrorList } from '../../services/api';

const Wallet = () => {
  const [wallet, setWallet] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState(null); // 'deposit' | 'withdraw'
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState([]);

  const load = async () => {
    setLoading(true);
    try {
      const r = await walletService.summary();
      setWallet(r.data.data.wallet);
      setRecent(r.data.data.recent || []);
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setErrors([]);
    const a = Number(amount);
    if (!a || a <= 0) { setErrors(['Amount must be > 0']); return; }
    setSubmitting(true);
    try {
      const fn = mode === 'deposit' ? walletService.deposit : walletService.withdraw;
      const r = await fn({ amount: a, description: description || undefined });
      toast.success(r.data.message || 'Done');
      setWallet(r.data.data.wallet);
      setMode(null); setAmount(''); setDescription('');
      await load();
    } catch (err) {
      const list = apiErrorList(err);
      setErrors(list || [apiError(err)]);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading size="lg" />;
  if (!wallet) return <div className="alert alert-error">Wallet not found</div>;

  return (
    <>
      <PageHeader
        title="Wallet"
        subtitle="Top up, withdraw, or send money."
        actions={
          <>
            <button className="btn btn-success" onClick={() => { setMode('deposit'); setErrors([]); }}>+ Deposit</button>
            <button className="btn btn-warn" onClick={() => { setMode('withdraw'); setErrors([]); }}>− Withdraw</button>
          </>
        }
      />

      <div className="stat-grid">
        <div className="stat-tile">
          <div className="label">Available Balance</div>
          <div className="value">{formatPKR(wallet.balance)}</div>
          <div className="meta">
            Status: <StatusBadge status={wallet.status} />
            {wallet.balance < 1000 && <span className="badge badge-warn" style={{ marginLeft: 8 }}>Low balance</span>}
          </div>
        </div>
        <div className="stat-tile">
          <div className="label">Total Deposits</div>
          <div className="value">{formatPKR(wallet.totalDeposits)}</div>
        </div>
        <div className="stat-tile">
          <div className="label">Total Withdrawals</div>
          <div className="value">{formatPKR(wallet.totalWithdrawals)}</div>
        </div>
        <div className="stat-tile">
          <div className="label">Invested</div>
          <div className="value">{formatPKR(wallet.totalInvested || 0)}</div>
          <div className="meta">Dividends earned: {formatPKR(wallet.totalDividendsEarned || 0)}</div>
        </div>
      </div>

      <div className="card mt-24">
        <h3 style={{ marginTop: 0 }}>Recent Wallet Activity</h3>
        {recent.length === 0 ? (
          <p className="text-muted">No recent transactions.</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Type</th><th>Amount</th><th>Status</th><th>Description</th><th>When</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((t) => (
                  <tr key={t._id}>
                    <td style={{ textTransform: 'capitalize' }}>{t.type}</td>
                    <td><strong>{formatPKR(t.amount)}</strong></td>
                    <td><StatusBadge status={t.status} /></td>
                    <td>{t.description || '—'}</td>
                    <td>{formatDate(t.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={!!mode}
        onClose={() => !submitting && setMode(null)}
        title={mode === 'deposit' ? 'Deposit funds' : 'Withdraw funds'}
      >
        {errors.length > 0 && (
          <div className="alert alert-error">
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {errors.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          </div>
        )}
        <form onSubmit={submit}>
          <div className="form-group">
            <label>Amount (PKR)</label>
            <input className="input" type="number" min="1" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
            <span className="help-text">
              {mode === 'withdraw' ? `Available: ${formatPKR(wallet.balance)}` : 'Demo top-up — no real money transfer.'}
            </span>
          </div>
          <div className="form-group">
            <label>Description (optional)</label>
            <input className="input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Salary top-up, ATM, etc." />
          </div>
          <div className="flex gap-12" style={{ justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={() => setMode(null)} disabled={submitting}>Cancel</button>
            <button type="submit" className={`btn ${mode === 'deposit' ? 'btn-success' : 'btn-warn'}`} disabled={submitting}>
              {submitting ? <span className="spinner" /> : mode === 'deposit' ? 'Confirm Deposit' : 'Confirm Withdrawal'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default Wallet;
