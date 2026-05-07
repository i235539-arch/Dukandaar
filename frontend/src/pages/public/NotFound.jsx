import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
    <h1 style={{ fontSize: '5rem', margin: 0 }}>404</h1>
    <p className="text-muted">The page you're looking for doesn't exist or has moved.</p>
    <Link to="/" className="btn btn-primary mt-12">Go home</Link>
  </div>
);

export default NotFound;
