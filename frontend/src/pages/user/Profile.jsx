import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { userService } from '../../services/userService';
import { authService } from '../../services/authService';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import { Loading } from '../../components/common/Loading';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/format';
import { apiError, apiErrorList } from '../../services/api';

const Profile = () => {
  const { updateLocalUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState([]);
  const [pwd, setPwd] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwdErrors, setPwdErrors] = useState([]);
  const [pwdSaving, setPwdSaving] = useState(false);

  const reload = async () => {
    setLoading(true);
    try {
      const r = await userService.getProfile();
      setUser(r.data.data.user);
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { reload(); }, []);

  const set = (k) => (e) => setUser((u) => ({ ...u, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setSaving(true);
    try {
      const r = await userService.updateProfile({
        name: user.name,
        phone: user.phone,
        cnic: user.cnic,
        occupation: user.occupation,
        city: user.city,
        riskProfile: user.riskProfile,
      });
      const updated = r.data.data.user;
      setUser(updated);
      updateLocalUser({ name: updated.name });
      toast.success('Profile updated');
    } catch (err) {
      const list = apiErrorList(err);
      setErrors(list || [apiError(err)]);
    } finally {
      setSaving(false);
    }
  };

  const submitPwd = async (e) => {
    e.preventDefault();
    setPwdErrors([]);
    if (pwd.newPassword !== pwd.confirm) { setPwdErrors(['Passwords do not match']); return; }
    if (pwd.newPassword.length < 6) { setPwdErrors(['New password must be at least 6 characters']); return; }
    setPwdSaving(true);
    try {
      await authService.changePassword({ currentPassword: pwd.currentPassword, newPassword: pwd.newPassword });
      toast.success('Password changed');
      setPwd({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      const list = apiErrorList(err);
      setPwdErrors(list || [apiError(err)]);
    } finally {
      setPwdSaving(false);
    }
  };

  if (loading) return <Loading size="lg" />;
  if (!user) return null;

  return (
    <>
      <PageHeader title="Profile" />

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 18 }} className="dash-grid">
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Personal information</h3>
          {errors.length > 0 && (
            <div className="alert alert-error">
              <ul style={{ margin: 0, paddingLeft: 18 }}>{errors.map((e, i) => <li key={i}>{e}</li>)}</ul>
            </div>
          )}
          <form onSubmit={submit}>
            <div className="row">
              <div className="form-group"><label>Name</label><input className="input" value={user.name || ''} onChange={set('name')} /></div>
              <div className="form-group"><label>Email</label><input className="input" value={user.email || ''} disabled /></div>
            </div>
            <div className="row">
              <div className="form-group"><label>Phone</label><input className="input" value={user.phone || ''} onChange={set('phone')} /></div>
              <div className="form-group"><label>CNIC</label><input className="input" value={user.cnic || ''} onChange={set('cnic')} /></div>
            </div>
            <div className="row">
              <div className="form-group"><label>Occupation</label><input className="input" value={user.occupation || ''} onChange={set('occupation')} /></div>
              <div className="form-group"><label>City</label><input className="input" value={user.city || ''} onChange={set('city')} /></div>
              <div className="form-group">
                <label>Risk Profile</label>
                <select className="select" value={user.riskProfile || 'balanced'} onChange={set('riskProfile')}>
                  <option value="conservative">Conservative</option>
                  <option value="balanced">Balanced</option>
                  <option value="aggressive">Aggressive</option>
                </select>
              </div>
            </div>
            <button className="btn btn-primary" disabled={saving}>{saving ? <span className="spinner" /> : 'Save changes'}</button>
          </form>
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>Account</h3>
          <div className="kvp"><span className="k">Role</span><span style={{ textTransform: 'capitalize' }}>{user.role}</span></div>
          <div className="kvp"><span className="k">Status</span><StatusBadge status={user.status} /></div>
          <div className="kvp"><span className="k">Joined</span><span>{formatDate(user.createdAt)}</span></div>
          <div className="kvp"><span className="k">Last login</span><span>{formatDate(user.lastLogin)}</span></div>

          <h4 className="mt-24">Change password</h4>
          {pwdErrors.length > 0 && (
            <div className="alert alert-error">
              <ul style={{ margin: 0, paddingLeft: 18 }}>{pwdErrors.map((e, i) => <li key={i}>{e}</li>)}</ul>
            </div>
          )}
          <form onSubmit={submitPwd}>
            <div className="form-group"><label>Current password</label>
              <input className="input" type="password" value={pwd.currentPassword} onChange={(e) => setPwd({ ...pwd, currentPassword: e.target.value })} required />
            </div>
            <div className="form-group"><label>New password</label>
              <input className="input" type="password" value={pwd.newPassword} onChange={(e) => setPwd({ ...pwd, newPassword: e.target.value })} required />
            </div>
            <div className="form-group"><label>Confirm new password</label>
              <input className="input" type="password" value={pwd.confirm} onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })} required />
            </div>
            <button className="btn btn-ghost" disabled={pwdSaving}>{pwdSaving ? <span className="spinner" /> : 'Update password'}</button>
          </form>
        </div>
      </div>

      <style>{`@media (max-width: 900px) { .dash-grid { grid-template-columns: 1fr !important; } }`}</style>
    </>
  );
};

export default Profile;
