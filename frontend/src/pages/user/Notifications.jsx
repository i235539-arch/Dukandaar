import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { notificationService } from '../../services/notificationService';
import { formatDate } from '../../utils/format';
import PageHeader from '../../components/common/PageHeader';
import { Loading, EmptyState } from '../../components/common/Loading';
import { apiError } from '../../services/api';

const Notifications = () => {
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    setLoading(true);
    try {
      const r = await notificationService.list();
      setItems(r.data.data.items);
      setUnread(r.data.data.unread);
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { reload(); }, []);

  const markRead = async (id) => {
    try { await notificationService.markRead(id); reload(); }
    catch (err) { toast.error(apiError(err)); }
  };

  const markAll = async () => {
    try { await notificationService.markAllRead(); toast.success('All marked read'); reload(); }
    catch (err) { toast.error(apiError(err)); }
  };

  if (loading) return <Loading size="lg" />;

  return (
    <>
      <PageHeader
        title="Notifications"
        subtitle={`${unread} unread`}
        actions={unread > 0 && <button className="btn btn-ghost" onClick={markAll}>Mark all read</button>}
      />
      {items.length === 0 ? <EmptyState title="No notifications" message="You're all caught up." /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map((n) => (
            <div key={n._id} className="card-flat" style={{ borderLeft: `3px solid ${n.readStatus ? '#1e2c4a' : '#0ea5e9'}` }}>
              <div className="flex between">
                <div>
                  <div style={{ fontWeight: 600 }}>{n.title} <span className="badge badge-muted" style={{ marginLeft: 6, textTransform: 'capitalize' }}>{n.type}</span></div>
                  <div className="text-muted" style={{ fontSize: '0.9rem' }}>{n.message}</div>
                  <div className="text-muted" style={{ fontSize: '0.75rem', marginTop: 4 }}>{formatDate(n.createdAt)}</div>
                </div>
                {!n.readStatus && <button className="btn btn-ghost btn-sm" onClick={() => markRead(n._id)}>Mark read</button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default Notifications;
