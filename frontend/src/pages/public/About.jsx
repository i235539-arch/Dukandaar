const About = () => (
  <section className="container" style={{ padding: '40px 0 60px' }}>
    <h1>About Dukandaar DAO</h1>
    <p className="text-muted" style={{ maxWidth: 760 }}>
      Dukandaar DAO is a fractional commercial real estate investment platform built for salaried Pakistanis who want
      stable, rent-generating exposure to property without locking up crores of capital. Each property is held in a
      dedicated Special Purpose Vehicle (SPV) and split into investment units priced from PKR 5,000.
    </p>

    <div className="property-grid mt-24">
      <div className="card-flat">
        <h3>The Problem</h3>
        <p className="text-muted">
          Commercial property in Pakistan is one of the most reliable ways to beat inflation, but the entry ticket
          (often crores) keeps middle-income families out. Real-estate scams and opaque ownership structures further
          erode trust.
        </p>
      </div>
      <div className="card-flat">
        <h3>Our Approach</h3>
        <p className="text-muted">
          We tokenise verified, income-producing properties into transparent shares. Investors can build a portfolio
          across multiple cities and asset types with a single wallet — and the platform handles dividend distribution
          automatically.
        </p>
      </div>
      <div className="card-flat">
        <h3>Tech Stack</h3>
        <p className="text-muted">
          MERN: MongoDB Atlas, Express.js, React, Node.js. Backend-controlled financial logic with JWT auth, role-based
          authorization, rule-based suspicious-transaction monitoring and Mongoose-validated schemas.
        </p>
      </div>
    </div>
  </section>
);

export default About;
