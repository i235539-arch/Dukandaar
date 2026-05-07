import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { walletService } from '../../services/walletService';
import PageHeader from '../../components/common/PageHeader';
import { apiError, apiErrorList } from '../../services/api';
import { formatPKR } from '../../utils/format';

const Transfer = () => {
  const [form, setForm] = useState({ receiverEmail: '', amount: '', description: '' });
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  const set = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setErrors([]);
    const errs = [];
    if (!form.receiverEmail) errs.push('Receiver email required');
    if (!form.amount || Number(form.amount) <= 0) errs.push('Amount must be > 0');
    if (errs.length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const r = await walletService.transfer({
        receiverEmail: form.receiverEmail.trim(),
        amount: Number(form.amount),
        description: form.description || undefined,
      });
      const tx = r.data.data.transaction;
      toast.success(r.data.message || 'Transfer successful');
      setResult(tx);
      setForm({ receiverEmail: '', amount: '', description: '' });
    } catch (err) {
      const list = apiErrorList(err);
      setErrors(list || [apiError(err)]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader title="Send Money" subtitle="Transfer to another Dukandaar DAO investor by email." />

      <div className="card" style={{ maxWidth: 560 }}>
        {errors.length > 0 && (
          <div className="alert alert-error">
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {errors.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          </div>
        )}
        {result && (
          <div className="alert alert-ok">
            <strong>Transfer recorded.</strong> Reference: <code>{result.transactionId}</code>
            {result.suspiciousFlag && (
              <div className="suspicious-banner mt-12">
                Flagged for admin review: {result.suspiciousReasons?.join(', ')}
              </div>
            )}
            <div className="mt-12">
              <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/app/transactions/${result._id}`)}>View receipt</button>
            </div>
          </div>
        )}
        <form onSubmit={submit}>
          <div className="form-group">
            <label>Receiver Email</label>
            <input className="input" type="email" value={form.receiverEmail} onChange={set('receiverEmail')} required />
          </div>
          <div className="form-group">
            <label>Amount (PKR)</label>
            <input className="input" type="number" min="1" step="0.01" value={form.amount} onChange={set('amount')} required />
            <span className="help-text">Self-transfers are blocked.</span>
          </div>
          <div className="form-group">
            <label>Note (optional)</label>
            <input className="input" value={form.description} onChange={set('description')} placeholder="Rent share, lunch, etc." />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <span className="spinner" /> : `Transfer ${form.amount ? formatPKR(form.amount) : ''}`}
          </button>
        </form>
      </div>
    </>
  );
};

export default Transfer;
