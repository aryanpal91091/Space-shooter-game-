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
      // If user is currently in Guest Mode, don't ping /auth/me
      if (user?.isGuest) {
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
        console.warn('Auth token verification notice:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, [token]);

  const login = async (email, password, rememberMe = true) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: newToken, user: newUser } = res.data;
    const finalUser = { ...newUser, isGuest: false };

    localStorage.setItem('odyssey_token', newToken);
    localStorage.setItem('odyssey_user', JSON.stringify(finalUser));
    if (rememberMe) {
      localStorage.setItem('odyssey_remember_email', email);
    } else {
      localStorage.removeItem('odyssey_remember_email');
    }

    setToken(newToken);
    setUser(finalUser);
    return finalUser;
  };

  const loginAsGuest = () => {
    const guestUser = {
      id: 'guest_' + Math.random().toString(36).substring(2, 9),
      username: 'Guest Commander',
      email: 'guest@odyssey.arcade',
      role: 'pilot',
      isGuest: true,
    };
    const guestToken = 'guest_token_' + Date.now();

    localStorage.setItem('odyssey_token', guestToken);
    localStorage.setItem('odyssey_user', JSON.stringify(guestUser));
    setToken(guestToken);
    setUser(guestUser);
    return guestUser;
  };

  const register = async (username, email, password, guestData = null) => {
    const payload = {
      username,
      email,
      password,
      ...(guestData || {}),
    };

    const res = await api.post('/auth/register', payload);
    const { token: newToken, user: newUser } = res.data;
    const finalUser = { ...newUser, isGuest: false };

    localStorage.setItem('odyssey_token', newToken);
    localStorage.setItem('odyssey_user', JSON.stringify(finalUser));
    localStorage.setItem('odyssey_remember_email', email);

    setToken(newToken);
    setUser(finalUser);
    return finalUser;
  };

  const forgotPassword = async (email) => {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  };

  const resetPassword = async (email, code, newPassword) => {
    const res = await api.post('/auth/reset-password', { email, code, newPassword });
    return res.data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (_) {}
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
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        loginAsGuest,
        register,
        forgotPassword,
        resetPassword,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
