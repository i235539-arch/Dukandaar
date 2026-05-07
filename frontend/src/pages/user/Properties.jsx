import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { propertyService } from '../../services/propertyService';
import { formatPKR } from '../../utils/format';
import PageHeader from '../../components/common/PageHeader';
import { Loading, EmptyState } from '../../components/common/Loading';

const PropertiesPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ city: '', propertyType: '', search: '' });

  const load = async () => {
    setLoading(true);
    const params = {};
    Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
    try {
      const r = await propertyService.list(params);
      setItems(r.data.data.items);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  return (
    <div className="container" style={{ padding: '30px 0 60px' }}>
      <PageHeader title="Browse Properties" subtitle="Verified, income-producing commercial real estate." />

      <div className="card-flat mb-24" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
        <input className="input" placeholder="Search title" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
        <input className="input" placeholder="City (e.g. Lahore)" value={filters.city} onChange={(e) => setFilters({ ...filters, city: e.target.value })} />
        <select className="select" value={filters.propertyType} onChange={(e) => setFilters({ ...filters, propertyType: e.target.value })}>
          <option value="">All types</option>
          <option value="shop">Shop</option>
          <option value="office">Office</option>
          <option value="plaza">Plaza</option>
          <option value="mall">Mall</option>
          <option value="warehouse">Warehouse</option>
          <option value="apartment">Apartment</option>
        </select>
        <button className="btn btn-primary" onClick={load}>Apply</button>
      </div>

      {loading ? <Loading /> : items.length === 0 ? (
        <EmptyState title="No properties match" message="Try a different filter." />
      ) : (
        <div className="property-grid">
          {items.map((p) => (
            <Link key={p._id} to={`/properties/${p._id}`} className="property-card">
              <img className="property-img" src={p.coverImage || 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200'} alt={p.title} />
              <div className="property-body">
                <h4 className="property-title">{p.title}</h4>
                <div className="property-meta">{p.city} · {p.propertyType}</div>
                <div className="property-meta">From {formatPKR(p.pricePerShare)}/share · {p.expectedAnnualYield}% yield</div>
                <div className="progress mt-12"><div style={{ width: `${p.fundingPercent || 0}%` }} /></div>
                <div className="text-muted" style={{ fontSize: '0.8rem', marginTop: 4 }}>
                  {p.fundingPercent || 0}% funded · {p.sharesAvailable} of {p.totalShares} shares left
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default PropertiesPage;
