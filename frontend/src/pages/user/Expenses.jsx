import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { expenseService } from '../../services/expenseService';
import { categoryService } from '../../services/categoryService';
import { formatPKR, formatDateOnly } from '../../utils/format';
import PageHeader from '../../components/common/PageHeader';
import Modal from '../../components/common/Modal';
import { Loading, EmptyState } from '../../components/common/Loading';
import CategoryPieChart from '../../components/charts/CategoryPieChart';
import { apiError, apiErrorList } from '../../services/api';

const blank = () => ({ title: '', amount: '', category: 'Food', paymentMethod: 'Wallet', date: new Date().toISOString().slice(0, 10), notes: '' });

const Expenses = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [summary, setSummary] = useState({ total: 0 });
  const [catSummary, setCatSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'create' | id
  const [form, setForm] = useState(blank());
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const reload = async () => {
    setLoading(true);
    try {
      const [list, sum, cs, cat] = await Promise.all([
        expenseService.list({ limit: 100 }),
        expenseService.monthlySummary(),
        expenseService.categorySummary(),
        categoryService.list('expense'),
      ]);
      setItems(list.data.data.items);
      setSummary(sum.data.data);
      setCatSummary(cs.data.data.categories);
      setCategories(cat.data.data.items);
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { reload(); }, []);

  const set = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.value }));

  const openCreate = () => {
    setModal('create');
    setForm({ ...blank(), category: categories[0]?.name || 'Food' });
    setErrors([]);
  };

  const openEdit = (e) => {
    setModal(e._id);
    setForm({
      title: e.title,
      amount: e.amount,
      category: e.category,
      paymentMethod: e.paymentMethod,
      date: new Date(e.date).toISOString().slice(0, 10),
      notes: e.notes || '',
    });
    setErrors([]);
  };

  const submit = async (ev) => {
    ev.preventDefault();
    setErrors([]);
    setSubmitting(true);
    try {
      const payload = { ...form, amount: Number(form.amount) };
      if (modal === 'create') await expenseService.create(payload);
      else await expenseService.update(modal, payload);
      toast.success('Saved');
      setModal(null);
      reload();
    } catch (err) {
      const list = apiErrorList(err);
      setErrors(list || [apiError(err)]);
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await expenseService.remove(id);
      toast.success('Deleted');
      reload();
    } catch (err) {
      toast.error(apiError(err));
    }
  };

  return (
    <>
      <PageHeader
        title="Expenses"
        subtitle="Track your monthly spending and stay on budget."
        actions={<button className="btn btn-primary" onClick={openCreate}>+ Add expense</button>}
      />

      <div className="stat-grid">
        <div className="stat-tile">
          <div className="label">This month</div>
          <div className="value">{formatPKR(summary.total || 0)}</div>
          <div className="meta">{summary.count || 0} entries</div>
        </div>
        <div className="stat-tile">
          <div className="label">Top category</div>
          <div className="value" style={{ fontSize: '1.2rem' }}>{catSummary[0]?._id || '—'}</div>
          <div className="meta">{catSummary[0] ? formatPKR(catSummary[0].total) : ''}</div>
        </div>
      </div>

      <div className="card mt-24">
        <h3 style={{ marginTop: 0 }}>Spending by category (this month)</h3>
        <CategoryPieChart data={catSummary} />
      </div>

      <div className="card mt-24">
        <h3 style={{ marginTop: 0 }}>All expenses</h3>
        {loading ? <Loading /> : items.length === 0 ? (
          <EmptyState title="No expenses yet" message="Add your first expense to get started." />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>Title</th><th>Amount</th><th>Category</th><th>Method</th><th>Date</th><th></th></tr>
              </thead>
              <tbody>
                {items.map((e) => (
                  <tr key={e._id}>
                    <td>{e.title}</td>
                    <td><strong>{formatPKR(e.amount)}</strong></td>
                    <td><span className="badge badge-info">{e.category}</span></td>
                    <td>{e.paymentMethod}</td>
                    <td>{formatDateOnly(e.date)}</td>
                    <td className="flex gap-8">
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(e)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => remove(e._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={!!modal}
        onClose={() => !submitting && setModal(null)}
        title={modal === 'create' ? 'Add expense' : 'Edit expense'}
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
            <label>Title *</label>
            <input className="input" value={form.title} onChange={set('title')} required />
          </div>
          <div className="row">
            <div className="form-group">
              <label>Amount (PKR) *</label>
              <input className="input" type="number" min="0.01" step="0.01" value={form.amount} onChange={set('amount')} required />
            </div>
            <div className="form-group">
              <label>Category *</label>
              <select className="select" value={form.category} onChange={set('category')} required>
                {categories.map((c) => <option key={c._id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div className="row">
            <div className="form-group">
              <label>Payment Method</label>
              <select className="select" value={form.paymentMethod} onChange={set('paymentMethod')}>
                <option>Wallet</option><option>Cash</option><option>Card</option><option>Bank Transfer</option><option>Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Date *</label>
              <input className="input" type="date" value={form.date} onChange={set('date')} required />
            </div>
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea className="textarea" rows={2} value={form.notes} onChange={set('notes')} />
          </div>
          <div className="flex gap-12" style={{ justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={() => setModal(null)} disabled={submitting}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? <span className="spinner" /> : 'Save'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default Expenses;
