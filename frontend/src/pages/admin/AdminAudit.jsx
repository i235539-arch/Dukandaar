import { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { formatDate } from '../../utils/format';
import PageHeader from '../../components/common/PageHeader';
import { Loading, EmptyState } from '../../components/common/Loading';

const AdminAudit = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.auditLogs().then((r) => setItems(r.data.data.items)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  return (
    <>
      <PageHeader title="Audit Logs" subtitle="Privileged admin actions." />
      {items.length === 0 ? <EmptyState title="No audit entries" message="" /> : (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>When</th><th>Actor</th><th>Action</th><th>Target</th><th>Details</th></tr></thead>
            <tbody>
              {items.map((a) => (
                <tr key={a._id}>
                  <td>{formatDate(a.createdAt)}</td>
                  <td>{a.actorId?.email || '—'}</td>
                  <td><span className="badge badge-info">{a.action}</span></td>
                  <td>{a.targetType} / {String(a.targetId).slice(-6)}</td>
                  <td className="font-mono" style={{ fontSize: '0.78rem' }}>{JSON.stringify(a.details || {})}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};

export default AdminAudit;
