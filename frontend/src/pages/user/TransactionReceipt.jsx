import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { transactionService } from '../../services/transactionService';
import { formatPKR, formatDate } from '../../utils/format';
import { Loading } from '../../components/common/Loading';
import StatusBadge from '../../components/common/StatusBadge';
import PageHeader from '../../components/common/PageHeader';
import { apiError } from '../../services/api';

const TransactionReceipt = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    transactionService.receipt(id)
      .then((r) => setData(r.data.data.receipt))
      .catch((err) => setError(apiError(err)))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loading size="lg" />;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!data) return null;

  return (
    <>
      <PageHeader
        title="Transaction Receipt"
        actions={<button className="btn btn-ghost btn-sm" onClick={() => window.print()}>🖨️ Print</button>}
      />
      <div className="card" style={{ maxWidth: 640 }}>
        <div className="flex between mb-12">
          <div>
            <div className="text-muted" style={{ fontSize: '0.8rem' }}>Reference</div>
            <div className="font-mono" style={{ fontWeight: 700 }}>{data.transactionId}</div>
          </div>
          <StatusBadge status={data.status} />
        </div>

        {data.suspiciousFlag && (
          <div className="suspicious-banner">
            <strong>Flagged for review:</strong>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {data.suspiciousReasons?.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </div>
        )}

        <div className="kvp"><span className="k">Type</span><span style={{ textTransform: 'capitalize' }}>{data.type}</span></div>
        <div className="kvp"><span className="k">Amount</span><span><strong>{formatPKR(data.amount)}</strong></span></div>
        {data.sender && <div className="kvp"><span className="k">From</span><span>{data.sender.name} ({data.sender.email})</span></div>}
        {data.receiver && <div className="kvp"><span className="k">To</span><span>{data.receiver.name} ({data.receiver.email})</span></div>}
        {data.property && <div className="kvp"><span className="k">Property</span><span>{data.property.title} — {data.property.city}</span></div>}
        <div className="kvp"><span className="k">Description</span><span>{data.description || '—'}</span></div>
        <div className="kvp"><span className="k">Created</span><span>{formatDate(data.createdAt)}</span></div>

        <div className="mt-24 flex gap-12">
          <Link to="/app/transactions" className="btn btn-ghost">← Back to history</Link>
        </div>
      </div>
    </>
  );
};

export default TransactionReceipt;
