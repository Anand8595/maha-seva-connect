import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('yojanadut_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Clear any previously saved dummy user
        if (
          parsed?.id === 'usr_agent_rahul' ||
          parsed?.id === 'usr_citizen' ||
          parsed?.phone === '9822012345' ||
          parsed?.referralCode === 'YD-RAHUL100'
        ) {
          localStorage.removeItem('yojanadut_user');
          localStorage.removeItem('yojanadut_token');
          return null;
        }
        return parsed;
      } catch {
        return null;
      }
    }
    return null;
  });

  const [token, setToken] = useState(() => {
    const savedToken = localStorage.getItem('yojanadut_token');
    if (
      savedToken === 'demo_token' ||
      savedToken === 'mock_jwt_token_123' ||
      savedToken === 'demo_agent_token' ||
      savedToken === 'demo_user_token'
    ) {
      localStorage.removeItem('yojanadut_token');
      return null;
    }
    return savedToken || null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('yojanadut_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('yojanadut_user');
    }
  }, [user]);

  const login = async (phone, password, role) => {
    const res = await api.login({ phone, password, role });
    if (res.success && res.user) {
      setUser(res.user);
      setToken(res.token);
      return { success: true, user: res.user, message: res.message };
    }
    return { success: false, message: res.message || 'लॉगिन अयशस्वी.' };
  };

  const register = async (userData) => {
    const res = await api.register(userData);
    if (res.success && res.user) {
      setUser(res.user);
      setToken(res.token);
      return { success: true, user: res.user, message: res.message };
    }
    return { success: false, message: res.message || 'नोंदणी अयशस्वी झाली.' };
  };

  const sendOtp = async (phone, role = 'user') => {
    return await api.sendOtp(phone, role);
  };

  const verifyOtp = async (phone, otp, role = 'user', name = '') => {
    const res = await api.verifyOtp(phone, otp, role, name);
    if (res.success && res.user) {
      setUser(res.user);
      setToken(res.token);
      return { success: true, user: res.user };
    }
    return { success: false, message: res.message || 'OTP पडताळणी अयशस्वी.' };
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('yojanadut_token');
    localStorage.removeItem('yojanadut_user');
  };

  const updateUser = (updates) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        login,
        register,
        sendOtp,
        verifyOtp,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
