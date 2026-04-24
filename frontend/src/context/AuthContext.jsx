import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { login as loginApi, me, register as registerApi } from '../api/authApi';
import { TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const initialToken = localStorage.getItem(TOKEN_STORAGE_KEY) || '';
  const [token, setToken] = useState(initialToken);
  const [user, setUser] = useState(() => {
    if (!initialToken) {
      return null;
    }
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  });
  const [booting, setBooting] = useState(Boolean(initialToken));
  const [authWarning, setAuthWarning] = useState('');

  const logout = useCallback(() => {
    setToken('');
    setUser(null);
    setBooting(false);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    setAuthWarning('');
  }, []);

  useEffect(() => {
    if (!token) {
      return;
    }
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
  }, [token, logout]);

  function persistSession(nextToken, nextUser) {
    setToken(nextToken);
    setUser(nextUser);
    setBooting(false);
    setAuthWarning('');
    localStorage.setItem(TOKEN_STORAGE_KEY, nextToken);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
  }

  const login = useCallback(async (payload) => {
    const data = await loginApi(payload);
    persistSession(data.token, data.user);
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const data = await registerApi(payload);
    persistSession(data.token, data.user);
    return data.user;
  }, []);

  const isAuthenticated = Boolean(token);
  const value = useMemo(
    () => ({ token, user, booting, isAuthenticated, authWarning, login, register, logout }),
    [token, user, booting, isAuthenticated, authWarning, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
