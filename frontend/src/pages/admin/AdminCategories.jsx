import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { categoryService } from '../../services/categoryService';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { Loading, EmptyState } from '../../components/common/Loading';
import { apiError, apiErrorList } from '../../services/api';

const AdminCategories = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'expense', description: '' });
  const [errors, setErrors] = useState([]);

  const reload = async () => {
    setLoading(true);
    try { const r = await categoryService.adminList(); setItems(r.data.data.items); }
    catch (err) { toast.error(apiError(err)); }
    finally { setLoading(false); }
  };

  useEffect(() => { reload(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setErrors([]);
    try {
      await categoryService.adminCreate(form);
      toast.success('Created');
      setModal(false);
      setForm({ name: '', type: 'expense', description: '' });
      reload();
    } catch (err) {
      const list = apiErrorList(err);
      setErrors(list || [apiError(err)]);
    }
  };

  const disable = async (id) => {
    if (!window.confirm('Disable this category?')) return;
    try { await categoryService.adminDisable(id); toast.success('Disabled'); reload(); }
    catch (err) { toast.error(apiError(err)); }
  };

  return (
    <>
      <PageHeader title="Categories" actions={<button className="btn btn-primary" onClick={() => setModal(true)}>+ Add</button>} />

      {loading ? <Loading /> : items.length === 0 ? <EmptyState title="No categories" message="" /> : (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Name</th><th>Type</th><th>Description</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {items.map((c) => (
                <tr key={c._id}>
                  <td>{c.name}</td>
                  <td style={{ textTransform: 'capitalize' }}>{c.type}</td>
                  <td>{c.description || '—'}</td>
                  <td><StatusBadge status={c.isActive ? 'active' : 'closed'} /></td>
                  <td>{c.isActive && <button className="btn btn-warn btn-sm" onClick={() => disable(c._id)}>Disable</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="New category">
        {errors.length > 0 && (
          <div className="alert alert-error"><ul style={{ margin: 0, paddingLeft: 18 }}>{errors.map((e, i) => <li key={i}>{e}</li>)}</ul></div>
        )}
        <form onSubmit={submit}>
          <div className="form-group"><label>Name *</label><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
          <div className="form-group">
            <label>Type *</label>
            <select className="select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="expense">Expense</option>
              <option value="transaction">Transaction</option>
              <option value="budget">Budget</option>
              <option value="property">Property</option>
            </select>
          </div>
          <div className="form-group"><label>Description</label><input className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="flex gap-12" style={{ justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Create</button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default AdminCategories;
