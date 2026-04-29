import React, {createContext, useContext, useEffect, useState, useCallback} from 'react';
import {api, tokenStorage} from './api';

const AuthCtx = createContext(null);

export function AuthProvider({children}) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const t = await tokenStorage.get();
    if (!t) {
      setUser(null);
      return;
    }
    try {
      const me = await api.me();
      setUser(me);
    } catch {
      await tokenStorage.clear();
      setUser(null);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await refresh();
      setLoading(false);
    })();
  }, [refresh]);

  const login = async (email, password) => {
    const r = await api.login(email, password);
    await tokenStorage.set(r.token);
    setUser(r.user);
  };
  const register = async (email, password, name) => {
    const r = await api.register(email, password, name);
    await tokenStorage.set(r.token);
    setUser(r.user);
  };
  const logout = async () => {
    await tokenStorage.clear();
    setUser(null);
  };

  return (
    <AuthCtx.Provider value={{user, loading, login, register, logout, refresh}}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  return useContext(AuthCtx);
}
