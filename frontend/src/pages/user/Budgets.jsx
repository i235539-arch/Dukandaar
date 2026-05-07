import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { budgetService } from '../../services/budgetService';
import { categoryService } from '../../services/categoryService';
import { formatPKR, monthString } from '../../utils/format';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { Loading, EmptyState } from '../../components/common/Loading';
import { apiError, apiErrorList } from '../../services/api';

const blank = (defaults = {}) => ({
  month: monthString(),
  totalLimit: '',
  warningThreshold: 80,
  categoryLimits: [],
  ...defaults,
});

const Budgets = () => {
  const [list, setList] = useState([]);
  const [current, setCurrent] = useState(null);
  const [perCategory, setPerCategory] = useState({});
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // 'create' | id
  const [form, setForm] = useState(blank());
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const reload = async () => {
    setLoading(true);
    try {
      const [a, b, c] = await Promise.all([
        budgetService.list(),
        budgetService.current(),
        categoryService.list('expense'),
      ]);
      setList(a.data.data.items);
      setCurrent(b.data.data.budget);
      setPerCategory(b.data.data.perCategory || {});
      setCategories(c.data.data.items);
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { reload(); }, []);

  const set = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.value }));

  const addCatLimit = () => setForm((s) => ({ ...s, categoryLimits: [...s.categoryLimits, { category: categories[0]?.name || 'Food', limit: '' }] }));
  const updateCatLimit = (i, k, v) => setForm((s) => {
    const cl = [...s.categoryLimits];
    cl[i] = { ...cl[i], [k]: v };
    return { ...s, categoryLimits: cl };
  });
  const removeCatLimit = (i) => setForm((s) => ({ ...s, categoryLimits: s.categoryLimits.filter((_, idx) => idx !== i) }));

  const openCreate = () => { setForm(blank()); setModal('create'); setErrors([]); };
  const openEdit = (b) => {
    setForm({
      month: b.month,
      totalLimit: b.totalLimit,
      warningThreshold: b.warningThreshold,
      categoryLimits: b.categoryLimits || [],
    });
    setModal(b._id);
    setErrors([]);
  };

  const submit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setSubmitting(true);
    try {
      const payload = {
        month: form.month,
        totalLimit: Number(form.totalLimit),
        warningThreshold: Number(form.warningThreshold) || 80,
        categoryLimits: form.categoryLimits
          .filter((c) => c.category && c.limit)
          .map((c) => ({ category: c.category, limit: Number(c.limit) })),
      };
      if (modal === 'create') await budgetService.create(payload);
      else await budgetService.update(modal, payload);
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
    if (!window.confirm('Delete this budget?')) return;
    try {
      await budgetService.remove(id);
      toast.success('Deleted');
      reload();
    } catch (err) {
      toast.error(apiError(err));
    }
  };

  if (loading) return <Loading size="lg" />;

  return (
    <>
      <PageHeader
        title="Budgets"
        subtitle="Set monthly limits and watch how close you are to them."
        actions={<button className="btn btn-primary" onClick={openCreate}>+ New budget</button>}
      />

      {current ? (
        <div className="card">
          <div className="flex between">
            <div>
              <h3 style={{ marginTop: 0 }}>Current month — {current.month}</h3>
              <div className="text-muted">
                Spent {formatPKR(current.spentAmount)} of {formatPKR(current.totalLimit)} ({Math.round((current.spentAmount / current.totalLimit) * 100)}%)
              </div>
            </div>
            <StatusBadge status={current.status} />
          </div>
          <div className="progress mt-12">
            <div style={{
              width: `${Math.min(100, (current.spentAmount / current.totalLimit) * 100)}%`,
              background: current.status === 'exceeded' ? 'linear-gradient(90deg,#ef4444,#f59e0b)' :
                          current.status === 'nearLimit' ? 'linear-gradient(90deg,#f59e0b,#fbbf24)' :
                          'linear-gradient(90deg,#22c55e,#0ea5e9)',
            }} />
          </div>

          {(current.categoryLimits?.length || 0) > 0 && (
            <div className="mt-24">
              <h4>Category limits</h4>
              {current.categoryLimits.map((c) => {
                const spent = perCategory[c.category] || 0;
                const ratio = c.limit ? (spent / c.limit) * 100 : 0;
                return (
                  <div key={c.category} className="mt-12">
                    <div className="flex between">
                      <span>{c.category}</span>
                      <span className="text-muted">{formatPKR(spent)} / {formatPKR(c.limit)}</span>
                    </div>
                    <div className="progress mt-12">
                      <div style={{ width: `${Math.min(100, ratio)}%`, background: ratio >= 100 ? '#ef4444' : ratio >= 80 ? '#f59e0b' : 'linear-gradient(90deg,#22c55e,#0ea5e9)' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          title="No budget for this month"
          message="Set a monthly budget to receive warnings when you near your limit."
          action={<button className="btn btn-primary" onClick={openCreate}>Create budget</button>}
        />
      )}

      <h3 className="mt-24">All budgets</h3>
      {list.length === 0 ? (
        <p className="text-muted">No budgets yet.</p>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr><th>Month</th><th>Limit</th><th>Spent</th><th>Status</th><th>Threshold</th><th></th></tr>
            </thead>
            <tbody>
              {list.map((b) => (
                <tr key={b._id}>
                  <td>{b.month}</td>
                  <td>{formatPKR(b.totalLimit)}</td>
                  <td>{formatPKR(b.spentAmount)}</td>
                  <td><StatusBadge status={b.status} /></td>
                  <td>{b.warningThreshold}%</td>
                  <td className="flex gap-8">
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(b)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => remove(b._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={!!modal} onClose={() => !submitting && setModal(null)} title={modal === 'create' ? 'Create budget' : 'Update budget'}>
        {errors.length > 0 && (
          <div className="alert alert-error">
            <ul style={{ margin: 0, paddingLeft: 18 }}>{errors.map((e, i) => <li key={i}>{e}</li>)}</ul>
          </div>
        )}
        <form onSubmit={submit}>
          <div className="row">
            <div className="form-group">
              <label>Month (YYYY-MM) *</label>
              <input className="input" value={form.month} onChange={set('month')} required pattern="\d{4}-\d{2}" disabled={modal !== 'create'} />
            </div>
            <div className="form-group">
              <label>Total Limit (PKR) *</label>
              <input className="input" type="number" min="1" step="0.01" value={form.totalLimit} onChange={set('totalLimit')} required />
            </div>
            <div className="form-group">
              <label>Warn at %</label>
              <input className="input" type="number" min="1" max="100" value={form.warningThreshold} onChange={set('warningThreshold')} />
            </div>
          </div>

          <div className="mt-12">
            <div className="flex between">
              <strong>Category limits (optional)</strong>
              <button type="button" className="btn btn-ghost btn-sm" onClick={addCatLimit}>+ Add</button>
            </div>
            {form.categoryLimits.map((c, i) => (
              <div key={i} className="row mt-12">
                <select className="select" value={c.category} onChange={(e) => updateCatLimit(i, 'category', e.target.value)}>
                  {categories.map((cat) => <option key={cat._id} value={cat.name}>{cat.name}</option>)}
                </select>
                <input className="input" type="number" min="1" step="0.01" placeholder="Limit" value={c.limit} onChange={(e) => updateCatLimit(i, 'limit', e.target.value)} />
                <button type="button" className="btn btn-danger btn-sm" onClick={() => removeCatLimit(i)}>Remove</button>
              </div>
            ))}
          </div>

          <div className="flex gap-12 mt-16" style={{ justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={() => setModal(null)} disabled={submitting}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? <span className="spinner" /> : 'Save'}</button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default Budgets;
