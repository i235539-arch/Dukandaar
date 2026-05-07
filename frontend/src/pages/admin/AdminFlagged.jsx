import { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { formatPKR, formatDate } from '../../utils/format';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import { Loading, EmptyState } from '../../components/common/Loading';

const AdminFlagged = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.flagged().then((r) => setItems(r.data.data.items)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  return (
    <>
      <PageHeader title="Flagged Transactions 🚩" subtitle={`${items.length} entries flagged by suspicious-rule engine`} />
      {items.length === 0 ? <EmptyState title="No flagged transactions" message="The platform looks clean." /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.map((t) => (
            <div key={t._id} className="card-flat" style={{ borderLeft: '3px solid #ef4444' }}>
              <div className="flex between">
                <div>
                  <div style={{ fontWeight: 700, textTransform: 'capitalize' }}>{t.type} · {formatPKR(t.amount)}</div>
                  <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                    {t.senderId?.email || 'system'} → {t.receiverId?.email || (t.propertyId?.title || 'system')}
                  </div>
                  <div className="text-muted" style={{ fontSize: '0.78rem' }}>{formatDate(t.createdAt)} · {t.transactionId}</div>
                </div>
                <StatusBadge status={t.status} />
              </div>
              <div className="suspicious-banner mt-12">
                <strong>Reasons:</strong>
                <ul style={{ margin: '4px 0 0', paddingLeft: 18 }}>
                  {t.suspiciousReasons?.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default AdminFlagged;
