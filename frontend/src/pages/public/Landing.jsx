import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { propertyService } from '../../services/propertyService';
import { formatPKR } from '../../utils/format';

const Feature = ({ icon, title, desc }) => (
  <div className="card-flat" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
    <div style={{ fontSize: 28 }}>{icon}</div>
    <h4 style={{ margin: 0 }}>{title}</h4>
    <p className="text-muted" style={{ margin: 0 }}>{desc}</p>
  </div>
);

const Landing = () => {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    propertyService.list({ limit: 3 }).then((r) => setFeatured(r.data.data.items || [])).catch(() => {});
  }, []);

  return (
    <>
      <section className="container hero">
        <div>
          <h1>Own a slice of Pakistan's commercial real estate.</h1>
          <p>
            Dukandaar DAO lets salaried investors buy fractional shares in verified shops, offices, and warehouses —
            starting from PKR 5,000 — and earn rental dividends every month.
          </p>
          <div className="cta">
            <Link to="/register" className="btn btn-primary">Start Investing</Link>
            <Link to="/properties" className="btn btn-ghost">View Properties</Link>
          </div>
          <div className="stat-grid mt-24" style={{ maxWidth: 600 }}>
            <div className="stat-tile"><div className="label">Min. ticket</div><div className="value">PKR 5,000</div></div>
            <div className="stat-tile"><div className="label">Avg. yield</div><div className="value">~9–11%</div></div>
            <div className="stat-tile"><div className="label">Asset types</div><div className="value">6+</div></div>
          </div>
        </div>
        <div className="hero-card">
          <h3>Why fractional?</h3>
          <p className="text-muted">Buying a whole shop in Karachi takes crores. With Dukandaar DAO, your PKR 5,000 buys a verified share — and your wallet earns its proportional rent.</p>
          <ul style={{ paddingLeft: 18 }}>
            <li>Verified properties held in dedicated SPVs</li>
            <li>Backend-controlled wallet & transaction logic</li>
            <li>Rule-based suspicious transaction monitoring</li>
            <li>Live dashboards, charts and budgets</li>
          </ul>
        </div>
      </section>

      <section className="container" style={{ marginTop: 30 }}>
        <div className="section-title"><h2>How it works</h2></div>
        <div className="property-grid">
          <Feature icon="📝" title="1. Register" desc="Create your account and a wallet is auto-created in PKR." />
          <Feature icon="💳" title="2. Add funds" desc="Top up your demo wallet — ready for investments." />
          <Feature icon="🏢" title="3. Invest" desc="Browse properties and buy as many shares as you want." />
          <Feature icon="💰" title="4. Earn" desc="Receive rental dividends straight to your wallet." />
        </div>
      </section>

      <section className="container" style={{ marginTop: 40 }}>
        <div className="section-title">
          <h2>Featured Properties</h2>
          <Link to="/properties" className="btn btn-ghost btn-sm">See all →</Link>
        </div>
        <div className="property-grid">
          {featured.map((p) => (
            <Link key={p._id} to={`/properties/${p._id}`} className="property-card">
              <img className="property-img" src={p.coverImage || 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200'} alt={p.title} />
              <div className="property-body">
                <h4 className="property-title">{p.title}</h4>
                <div className="property-meta">{p.city} · {p.propertyType}</div>
                <div className="property-meta">From {formatPKR(p.pricePerShare)}/share · {p.expectedAnnualYield}% yield</div>
                <div className="progress mt-12"><div style={{ width: `${p.fundingPercent || 0}%` }} /></div>
                <div className="text-muted" style={{ fontSize: '0.8rem', marginTop: 4 }}>
                  {p.fundingPercent || 0}% funded
                </div>
              </div>
            </Link>
          ))}
          {featured.length === 0 && (
            <div className="card-flat tac" style={{ gridColumn: '1 / -1' }}>
              <p className="text-muted">No properties listed yet.</p>
            </div>
          )}
        </div>
      </section>

      <section className="container" style={{ marginTop: 60, marginBottom: 60 }}>
        <div className="card tac">
          <h2 style={{ marginTop: 0 }}>Ready to build your real-estate portfolio?</h2>
          <p className="text-muted">Start with as little as PKR 5,000.</p>
          <Link to="/register" className="btn btn-primary">Create your account</Link>
        </div>
      </section>
    </>
  );
};

export default Landing;
