import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { adminService } from '../../services/adminService';
import { formatDate } from '../../utils/format';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import { Loading, EmptyState } from '../../components/common/Loading';
import { apiError } from '../../services/api';

const AdminUsers = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', status: '', role: '' });

  const load = async () => {
    setLoading(true);
    const params = {};
    Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
    try {
      const r = await adminService.listUsers(params);
      setItems(r.data.data.items);
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const block = async (u) => {
    const reason = window.prompt(`Reason for blocking ${u.email}?`, 'Suspicious activity');
    if (reason === null) return;
    try { await adminService.blockUser(u._id, reason); toast.success('User blocked'); load(); }
    catch (err) { toast.error(apiError(err)); }
  };
  const unblock = async (u) => {
    if (!window.confirm(`Unblock ${u.email}?`)) return;
    try { await adminService.unblockUser(u._id); toast.success('User unblocked'); load(); }
    catch (err) { toast.error(apiError(err)); }
  };

  return (
    <>
      <PageHeader title="Users" subtitle="View, search, and moderate platform users." />

      <div className="card-flat mb-12" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
        <input className="input" placeholder="Search name or email" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
        <select className="select" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option value="">All statuses</option><option value="active">Active</option><option value="blocked">Blocked</option>
        </select>
        <select className="select" value={filters.role} onChange={(e) => setFilters({ ...filters, role: e.target.value })}>
          <option value="">All roles</option><option value="user">User</option><option value="admin">Admin</option>
        </select>
        <button className="btn btn-primary" onClick={load}>Apply</button>
      </div>

      {loading ? <Loading /> : items.length === 0 ? <EmptyState title="No users" message="No users matched the filters." /> : (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th>Last login</th><th></th></tr></thead>
            <tbody>
              {items.map((u) => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td style={{ textTransform: 'capitalize' }}>{u.role}</td>
                  <td><StatusBadge status={u.status} /></td>
                  <td>{formatDate(u.createdAt)}</td>
                  <td>{formatDate(u.lastLogin)}</td>
                  <td>
                    {u.role !== 'admin' && (
                      u.status === 'active'
                        ? <button className="btn btn-danger btn-sm" onClick={() => block(u)}>Block</button>
                        : <button className="btn btn-success btn-sm" onClick={() => unblock(u)}>Unblock</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};

export default AdminUsers;
