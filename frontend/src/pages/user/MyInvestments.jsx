import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { propertyService } from '../../services/propertyService';
import { formatPKR, formatDate } from '../../utils/format';
import { Loading, EmptyState } from '../../components/common/Loading';
import PageHeader from '../../components/common/PageHeader';
import { apiError } from '../../services/api';

const MyInvestments = () => {
  const [data, setData] = useState({ items: [], totalInvested: 0, totalDividends: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    propertyService.myInvestments()
      .then((r) => setData(r.data.data))
      .catch((err) => setError(apiError(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading size="lg" />;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <>
      <PageHeader title="My Investments" subtitle="Properties you co-own through Dukandaar DAO." />
      <div className="stat-grid">
        <div className="stat-tile">
          <div className="label">Total Invested</div>
          <div className="value">{formatPKR(data.totalInvested)}</div>
        </div>
        <div className="stat-tile">
          <div className="label">Dividends Earned</div>
          <div className="value">{formatPKR(data.totalDividends)}</div>
        </div>
        <div className="stat-tile">
          <div className="label">Active positions</div>
          <div className="value">{data.items.length}</div>
        </div>
      </div>

      {data.items.length === 0 ? (
        <EmptyState
          title="No investments yet"
          message="Browse properties to make your first investment."
          action={<Link to="/properties" className="btn btn-primary">Browse Properties</Link>}
        />
      ) : (
        <div className="property-grid mt-24">
          {data.items.map((inv) => {
            const p = inv.propertyId;
            return (
              <Link key={inv._id} to={p ? `/properties/${p._id}` : '#'} className="property-card">
                <img className="property-img" src={p?.coverImage || 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200'} alt={p?.title || 'Property'} />
                <div className="property-body">
                  <h4 className="property-title">{p?.title || 'Property'}</h4>
                  <div className="property-meta">{p?.city} · {p?.propertyType}</div>
                  <div className="kvp"><span className="k">Shares</span><span>{inv.shares}</span></div>
                  <div className="kvp"><span className="k">Invested</span><span>{formatPKR(inv.amountInvested)}</span></div>
                  <div className="kvp"><span className="k">Ownership</span><span>{inv.ownershipPercent.toFixed(3)}%</span></div>
                  <div className="kvp"><span className="k">Dividends</span><span>{formatPKR(inv.totalDividendsReceived)}</span></div>
                  <div className="kvp"><span className="k">Bought</span><span>{formatDate(inv.createdAt)}</span></div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
};

export default MyInvestments;
