import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginApi, registerApi, getMeApi } from '../services/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('circuleak_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('circuleak_token') || null);
  const [loading, setLoading] = useState(true);

  // Sync token to localStorage
  const saveSession = (authToken, authUser) => {
    setToken(authToken);
    setUser(authUser);
    if (authToken) {
      localStorage.setItem('circuleak_token', authToken);
    } else {
      localStorage.removeItem('circuleak_token');
    }
    if (authUser) {
      localStorage.setItem('circuleak_user', JSON.stringify(authUser));
    } else {
      localStorage.removeItem('circuleak_user');
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('circuleak_token');
      if (storedToken) {
        try {
          const res = await getMeApi();
          if (res.data) {
            setUser(res.data);
            localStorage.setItem('circuleak_user', JSON.stringify(res.data));
          } else {
            saveSession(null, null);
          }
        } catch {
          // Token expired or invalid: evict immediately
          console.warn('Authentication token expired or rejected by server. Resetting session.');
          saveSession(null, null);
        }
      } else {
        saveSession(null, null);
      }
      setLoading(false);
    };
    initAuth();

    const handleUnauthorized = () => {
      saveSession(null, null);
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login?expired=1';
      }
    };

    window.addEventListener('circuleak:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('circuleak:unauthorized', handleUnauthorized);
  }, []);

  const login = async (email, password) => {
    const res = await loginApi(email, password);
    const { access_token, user: loggedUser } = res.data;
    saveSession(access_token, loggedUser);
    return loggedUser;
  };

  const register = async (userData) => {
    const res = await registerApi(userData);
    const { access_token, user: newUser } = res.data;
    saveSession(access_token, newUser);
    return newUser;
  };

  const logout = () => {
    saveSession(null, null);
    window.location.href = '/login';
  };

  const isAuthenticated = !!token && !!user;
  const role = user?.role || 'facility_manager';
  const isAdmin = role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        role,
        isAdmin,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
