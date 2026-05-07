import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { apiError, apiErrorList } from '../../services/api';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirm: '',
    phone: '', city: '', occupation: '',
  });
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setErrors([]);
    const errs = [];
    if (!form.name || form.name.length < 2) errs.push('Name is required');
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.push('Valid email is required');
    if (!form.password || form.password.length < 6) errs.push('Password must be at least 6 characters');
    if (form.password !== form.confirm) errs.push('Passwords do not match');
    if (errs.length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const user = await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone,
        city: form.city,
        occupation: form.occupation,
      });
      toast.success('Account created. Wallet ready to fund.');
      navigate(user.role === 'admin' ? '/admin' : '/app', { replace: true });
    } catch (err) {
      const list = apiErrorList(err);
      setErrors(list || [apiError(err)]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 600, padding: '40px 20px' }}>
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Create your account</h2>
        <p className="text-muted" style={{ marginTop: 0 }}>Get started with fractional real-estate investing.</p>

        {errors.length > 0 && (
          <div className="alert alert-error">
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {errors.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          </div>
        )}

        <form onSubmit={submit}>
          <div className="row">
            <div className="form-group">
              <label>Full Name *</label>
              <input className="input" value={form.name} onChange={set('name')} required />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input className="input" type="email" value={form.email} onChange={set('email')} required />
            </div>
          </div>
          <div className="row">
            <div className="form-group">
              <label>Password *</label>
              <input className="input" type="password" value={form.password} onChange={set('password')} required minLength={6} />
            </div>
            <div className="form-group">
              <label>Confirm Password *</label>
              <input className="input" type="password" value={form.confirm} onChange={set('confirm')} required minLength={6} />
            </div>
          </div>
          <div className="row">
            <div className="form-group">
              <label>Phone</label>
              <input className="input" value={form.phone} onChange={set('phone')} placeholder="03XX-XXXXXXX" />
            </div>
            <div className="form-group">
              <label>City</label>
              <input className="input" value={form.city} onChange={set('city')} placeholder="Karachi / Lahore / Islamabad" />
            </div>
            <div className="form-group">
              <label>Occupation</label>
              <input className="input" value={form.occupation} onChange={set('occupation')} placeholder="Software Engineer" />
            </div>
          </div>
          <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? <span className="spinner" /> : 'Register'}
          </button>
        </form>
        <p className="text-muted mt-16" style={{ textAlign: 'center' }}>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
