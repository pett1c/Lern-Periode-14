import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { login as loginApi, me, register as registerApi } from '../api/authApi';
import { TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_STORAGE_KEY) || '');
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  });
  const [booting, setBooting] = useState(true);
  const [authWarning, setAuthWarning] = useState('');

  useEffect(() => {
    if (!token) {
      setUser(null);
      setBooting(false);
      return;
    }
    setBooting(true);
    me()
      .then((currentUser) => {
        setUser(currentUser);
        setAuthWarning('');
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(currentUser));
      })
      .catch((error) => {
        if (error?.status === 401 || error?.status === 403) {
          logout();
          return;
        }
        setAuthWarning('Backend temporarily unreachable. Existing session is kept.');
      })
      .finally(() => setBooting(false));
  }, [token]);

  function persistSession(nextToken, nextUser) {
    setToken(nextToken);
    setUser(nextUser);
    setBooting(false);
    setAuthWarning('');
    localStorage.setItem(TOKEN_STORAGE_KEY, nextToken);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
  }

  async function login(payload) {
    const data = await loginApi(payload);
    persistSession(data.token, data.user);
    return data.user;
  }

  async function register(payload) {
    const data = await registerApi(payload);
    persistSession(data.token, data.user);
    return data.user;
  }

  function logout() {
    setToken('');
    setUser(null);
    setBooting(false);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    setAuthWarning('');
  }

  const isAuthenticated = Boolean(token);
  const value = useMemo(
    () => ({ token, user, booting, isAuthenticated, authWarning, login, register, logout }),
    [token, user, booting, isAuthenticated, authWarning]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
