import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { propertyService } from '../../services/propertyService';
import { formatPKR } from '../../utils/format';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { Loading, EmptyState } from '../../components/common/Loading';
import { apiError, apiErrorList } from '../../services/api';

const blankForm = () => ({
  title: '', propertyType: 'shop', city: '', address: '', description: '',
  coverImage: '', totalValue: '', totalShares: '', pricePerShare: '',
  minSharesPerInvestor: 1, expectedAnnualYield: 0, monthlyRent: 0,
  occupancyRate: 100, spvName: '', isVerified: false, status: 'open',
});

const AdminProperties = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'create' | id
  const [form, setForm] = useState(blankForm());
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const [divModal, setDivModal] = useState(null);
  const [divAmount, setDivAmount] = useState('');

  const reload = async () => {
    setLoading(true);
    try {
      // Admin can list with no status filter to see everything
      const r = await propertyService.list({ status: '', limit: 50 });
      setItems(r.data.data.items);
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { reload(); }, []);

  const set = (k) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((s) => ({ ...s, [k]: val }));
  };

  const openCreate = () => { setForm(blankForm()); setModal('create'); setErrors([]); };
  const openEdit = (p) => {
    setForm({
      title: p.title, propertyType: p.propertyType, city: p.city, address: p.address,
      description: p.description, coverImage: p.coverImage,
      totalValue: p.totalValue, totalShares: p.totalShares, pricePerShare: p.pricePerShare,
      minSharesPerInvestor: p.minSharesPerInvestor, expectedAnnualYield: p.expectedAnnualYield,
      monthlyRent: p.monthlyRent, occupancyRate: p.occupancyRate, spvName: p.spvName,
      isVerified: p.isVerified, status: p.status, sharesAvailable: p.sharesAvailable,
    });
    setModal(p._id);
    setErrors([]);
  };

  const submit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        totalValue: Number(form.totalValue),
        totalShares: Number(form.totalShares),
        pricePerShare: Number(form.pricePerShare),
        minSharesPerInvestor: Number(form.minSharesPerInvestor),
        expectedAnnualYield: Number(form.expectedAnnualYield),
        monthlyRent: Number(form.monthlyRent),
        occupancyRate: Number(form.occupancyRate),
      };
      if (modal === 'create') await propertyService.create(payload);
      else await propertyService.update(modal, payload);
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
    if (!window.confirm('Delete this property? Existing investments will remain in records.')) return;
    try { await propertyService.remove(id); toast.success('Deleted'); reload(); }
    catch (err) { toast.error(apiError(err)); }
  };

  const verify = async (id) => {
    try { await propertyService.verify(id); toast.success('Verified'); reload(); }
    catch (err) { toast.error(apiError(err)); }
  };

  const submitDividend = async () => {
    const amt = Number(divAmount);
    if (!amt || amt <= 0) return toast.error('Amount must be > 0');
    try {
      const r = await propertyService.payDividend(divModal, { totalDividend: amt });
      toast.success(`Distributed to ${r.data.data.distributedTo} investors`);
      setDivModal(null); setDivAmount('');
    } catch (err) { toast.error(apiError(err)); }
  };

  return (
    <>
      <PageHeader
        title="Properties"
        subtitle={`${items.length} listed`}
        actions={<button className="btn btn-primary" onClick={openCreate}>+ Add property</button>}
      />

      {loading ? <Loading /> : items.length === 0 ? <EmptyState title="No properties" message="" /> : (
        <div className="table-wrap">
          <table className="table">
            <thead><tr>
              <th>Title</th><th>City</th><th>Type</th><th>Status</th>
              <th>Total</th><th>Shares (avail / total)</th><th>Yield</th><th></th>
            </tr></thead>
            <tbody>
              {items.map((p) => (
                <tr key={p._id}>
                  <td>{p.title}{p.isVerified ? ' ✅' : ''}</td>
                  <td>{p.city}</td>
                  <td style={{ textTransform: 'capitalize' }}>{p.propertyType}</td>
                  <td><StatusBadge status={p.status} /></td>
                  <td>{formatPKR(p.totalValue)}</td>
                  <td>{p.sharesAvailable} / {p.totalShares}</td>
                  <td>{p.expectedAnnualYield}%</td>
                  <td className="flex gap-8">
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}>Edit</button>
                    {!p.isVerified && <button className="btn btn-success btn-sm" onClick={() => verify(p._id)}>Verify</button>}
                    <button className="btn btn-warn btn-sm" onClick={() => { setDivModal(p._id); setDivAmount(''); }}>Pay Dividend</button>
                    <button className="btn btn-danger btn-sm" onClick={() => remove(p._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={!!modal} onClose={() => !submitting && setModal(null)} title={modal === 'create' ? 'New property' : 'Edit property'}>
        {errors.length > 0 && (
          <div className="alert alert-error">
            <ul style={{ margin: 0, paddingLeft: 18 }}>{errors.map((e, i) => <li key={i}>{e}</li>)}</ul>
          </div>
        )}
        <form onSubmit={submit}>
          <div className="form-group"><label>Title *</label><input className="input" value={form.title} onChange={set('title')} required /></div>
          <div className="row">
            <div className="form-group">
              <label>Type *</label>
              <select className="select" value={form.propertyType} onChange={set('propertyType')}>
                <option value="shop">Shop</option><option value="office">Office</option><option value="plaza">Plaza</option>
                <option value="mall">Mall</option><option value="warehouse">Warehouse</option><option value="apartment">Apartment</option>
              </select>
            </div>
            <div className="form-group"><label>City *</label><input className="input" value={form.city} onChange={set('city')} required /></div>
            <div className="form-group">
              <label>Status</label>
              <select className="select" value={form.status} onChange={set('status')}>
                <option value="draft">Draft</option><option value="open">Open</option><option value="funded">Funded</option><option value="closed">Closed</option>
              </select>
            </div>
          </div>
          <div className="form-group"><label>Address *</label><input className="input" value={form.address} onChange={set('address')} required /></div>
          <div className="form-group"><label>Cover image URL</label><input className="input" value={form.coverImage} onChange={set('coverImage')} /></div>
          <div className="row">
            <div className="form-group"><label>Total value (PKR) *</label><input className="input" type="number" min="1" value={form.totalValue} onChange={set('totalValue')} required /></div>
            <div className="form-group"><label>Total shares *</label><input className="input" type="number" min="1" value={form.totalShares} onChange={set('totalShares')} required /></div>
            <div className="form-group"><label>Price / share *</label><input className="input" type="number" min="1" step="0.01" value={form.pricePerShare} onChange={set('pricePerShare')} required /></div>
            <div className="form-group"><label>Min shares</label><input className="input" type="number" min="1" value={form.minSharesPerInvestor} onChange={set('minSharesPerInvestor')} /></div>
          </div>
          <div className="row">
            <div className="form-group"><label>Annual yield %</label><input className="input" type="number" step="0.1" value={form.expectedAnnualYield} onChange={set('expectedAnnualYield')} /></div>
            <div className="form-group"><label>Monthly rent</label><input className="input" type="number" value={form.monthlyRent} onChange={set('monthlyRent')} /></div>
            <div className="form-group"><label>Occupancy %</label><input className="input" type="number" min="0" max="100" value={form.occupancyRate} onChange={set('occupancyRate')} /></div>
            <div className="form-group"><label>SPV Name</label><input className="input" value={form.spvName} onChange={set('spvName')} /></div>
          </div>
          <div className="form-group"><label>Description</label><textarea className="textarea" rows={3} value={form.description} onChange={set('description')} /></div>
          <div className="form-group">
            <label className="flex gap-8" style={{ alignItems: 'center' }}>
              <input type="checkbox" checked={!!form.isVerified} onChange={set('isVerified')} /> Verified
            </label>
          </div>
          <div className="flex gap-12" style={{ justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={() => setModal(null)} disabled={submitting}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? <span className="spinner" /> : 'Save'}</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!divModal} onClose={() => setDivModal(null)} title="Pay dividend">
        <p className="text-muted">Distribute the entered amount to all active investors of this property, pro-rata to their shares.</p>
        <div className="form-group">
          <label>Total dividend (PKR)</label>
          <input className="input" type="number" min="1" step="0.01" value={divAmount} onChange={(e) => setDivAmount(e.target.value)} />
        </div>
        <div className="flex gap-12" style={{ justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost" onClick={() => setDivModal(null)}>Cancel</button>
          <button className="btn btn-primary" onClick={submitDividend}>Distribute</button>
        </div>
      </Modal>
    </>
  );
};

export default AdminProperties;
