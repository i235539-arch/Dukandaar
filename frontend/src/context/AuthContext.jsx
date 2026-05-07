import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('dd_user') || 'null'); } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem('dd_token'));
  const [loading, setLoading] = useState(true);

  const persist = (u, t) => {
    setUser(u);
    setToken(t);
    if (u) localStorage.setItem('dd_user', JSON.stringify(u));
    else localStorage.removeItem('dd_user');
    if (t) localStorage.setItem('dd_token', t);
    else localStorage.removeItem('dd_token');
  };

  const refreshMe = useCallback(async () => {
    if (!localStorage.getItem('dd_token')) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await authService.me();
      persist(data.data.user, localStorage.getItem('dd_token'));
    } catch {
      persist(null, null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refreshMe(); }, [refreshMe]);

  const login = async (email, password) => {
    const { data } = await authService.login({ email, password });
    persist(data.data.user, data.data.token);
    return data.data.user;
  };

  const register = async (form) => {
    const { data } = await authService.register(form);
    persist(data.data.user, data.data.token);
    return data.data.user;
  };

  const logout = async () => {
    try { await authService.logout(); } catch { /* ignore */ }
    persist(null, null);
  };

  const updateLocalUser = (updates) => {
    if (!user) return;
    const merged = { ...user, ...updates };
    persist(merged, token);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshMe, updateLocalUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
