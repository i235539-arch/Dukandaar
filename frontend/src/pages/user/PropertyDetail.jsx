import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { propertyService } from '../../services/propertyService';
import { formatPKR } from '../../utils/format';
import { Loading } from '../../components/common/Loading';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { apiError, apiErrorList } from '../../services/api';

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modal, setModal] = useState(false);
  const [shares, setShares] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState([]);

  const load = async () => {
    setLoading(true);
    try {
      const r = await propertyService.get(id);
      setProperty(r.data.data.property);
    } catch (err) {
      setError(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  const submit = async (e) => {
    e.preventDefault();
    setErrors([]);
    const s = Number(shares);
    if (!s || s <= 0) { setErrors(['Shares must be > 0']); return; }
    setSubmitting(true);
    try {
      const r = await propertyService.invest(id, { shares: s });
      const tx = r.data.data.transaction;
      toast.success('Investment recorded');
      setModal(false);
      if (tx?._id) navigate(`/app/transactions/${tx._id}`);
      else load();
    } catch (err) {
      const list = apiErrorList(err);
      setErrors(list || [apiError(err)]);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading size="lg" />;
  if (error) return <div className="container" style={{ padding: 30 }}><div className="alert alert-error">{error}</div></div>;
  if (!property) return null;

  const total = Number(shares) * property.pricePerShare;
  const ownership = property.totalShares ? (Number(shares) / property.totalShares) * 100 : 0;
  const fundingPercent = property.fundingPercent ?? Math.round(((property.totalShares - property.sharesAvailable) / property.totalShares) * 100);

  return (
    <div className="container" style={{ padding: '30px 0 60px' }}>
      <PageHeader
        title={property.title}
        subtitle={`${property.city} · ${property.propertyType}`}
        actions={
          property.status === 'open' && user?.role !== 'admin' ? (
            <button className="btn btn-primary" onClick={() => { setModal(true); setErrors([]); setShares(property.minSharesPerInvestor || 1); }}>
              Invest now
            </button>
          ) : <StatusBadge status={property.status} />
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }} className="dash-grid">
        <div>
          <img src={property.coverImage || 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200'} alt={property.title}
               style={{ width: '100%', borderRadius: 14, maxHeight: 380, objectFit: 'cover' }} />
          <div className="card mt-24">
            <h3 style={{ marginTop: 0 }}>About this property</h3>
            <p className="text-muted">{property.description || 'No description provided.'}</p>
            <div className="kvp"><span className="k">Address</span><span>{property.address}</span></div>
            <div className="kvp"><span className="k">SPV</span><span>{property.spvName || '—'}</span></div>
            <div className="kvp"><span className="k">Verified</span><span>{property.isVerified ? '✅ Yes' : 'Pending'}</span></div>
            <div className="kvp"><span className="k">Occupancy</span><span>{property.occupancyRate}%</span></div>
          </div>
        </div>
        <div>
          <div className="card">
            <h3 style={{ marginTop: 0 }}>Investment details</h3>
            <div className="kvp"><span className="k">Total value</span><span>{formatPKR(property.totalValue)}</span></div>
            <div className="kvp"><span className="k">Total shares</span><span>{property.totalShares}</span></div>
            <div className="kvp"><span className="k">Price / share</span><span>{formatPKR(property.pricePerShare)}</span></div>
            <div className="kvp"><span className="k">Min. shares</span><span>{property.minSharesPerInvestor}</span></div>
            <div className="kvp"><span className="k">Available</span><span>{property.sharesAvailable} shares</span></div>
            <div className="kvp"><span className="k">Annual yield</span><span>{property.expectedAnnualYield}%</span></div>
            <div className="kvp"><span className="k">Monthly rent</span><span>{formatPKR(property.monthlyRent)}</span></div>
            <div className="mt-12">
              <div className="text-muted" style={{ fontSize: '0.8rem' }}>{fundingPercent}% funded</div>
              <div className="progress mt-12"><div style={{ width: `${fundingPercent}%` }} /></div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={modal}
        onClose={() => !submitting && setModal(false)}
        title={`Invest in ${property.title}`}
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
            <label>Number of shares</label>
            <input className="input" type="number" min={property.minSharesPerInvestor || 1} max={property.sharesAvailable}
                   value={shares} onChange={(e) => setShares(e.target.value)} required />
            <span className="help-text">Min {property.minSharesPerInvestor} · Max {property.sharesAvailable}</span>
          </div>
          <div className="kvp"><span className="k">Price / share</span><span>{formatPKR(property.pricePerShare)}</span></div>
          <div className="kvp"><span className="k">Total cost</span><span><strong>{formatPKR(total)}</strong></span></div>
          <div className="kvp"><span className="k">Ownership</span><span>{ownership.toFixed(3)}%</span></div>
          <div className="flex gap-12 mt-16" style={{ justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={() => setModal(false)} disabled={submitting}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? <span className="spinner" /> : 'Confirm Investment'}
            </button>
          </div>
        </form>
      </Modal>

      <style>{`
        @media (max-width: 900px) { .dash-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
};

export default PropertyDetail;
