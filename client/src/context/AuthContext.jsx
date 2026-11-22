import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('odyssey_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('odyssey_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        if (res.data?.user) {
          setUser(res.data.user);
          localStorage.setItem('odyssey_user', JSON.stringify(res.data.user));
        }
      } catch (err) {
        console.warn('Auth token verification error:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem('odyssey_token', newToken);
    localStorage.setItem('odyssey_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    return newUser;
  };

  const register = async (username, email, password) => {
    const res = await api.post('/auth/register', { username, email, password });
    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem('odyssey_token', newToken);
    localStorage.setItem('odyssey_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    return newUser;
  };

  const logout = () => {
    localStorage.removeItem('odyssey_token');
    localStorage.removeItem('odyssey_user');
    setToken(null);
    setUser(null);
  };

  const updateProfile = (updatedFields) => {
    const nextUser = { ...user, ...updatedFields };
    setUser(nextUser);
    localStorage.setItem('odyssey_user', JSON.stringify(nextUser));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
