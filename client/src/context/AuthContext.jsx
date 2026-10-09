import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Default demo agent logged in for instant testing matching screenshot (राहुल शिंदे)
  const defaultAgent = {
    id: 'usr_agent_rahul',
    name: 'राहुल शिंदे',
    englishName: 'Rahul Shinde',
    phone: '9822012345',
    email: 'rahul.shinde@yojanadut.in',
    role: 'agent',
    referralCode: 'YD-RAHUL100',
    walletBalance: 455,
    pendingBalance: 50,
    totalEarned: 1240,
  };

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('yojanadut_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return defaultAgent;
      }
    }
    return defaultAgent;
  });

  const [token, setToken] = useState(() => localStorage.getItem('yojanadut_token') || 'demo_token');

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
      return { success: true };
    }
    return { success: false, message: res.message || 'लॉगिन अयशस्वी.' };
  };

  const quickDemoLogin = (role = 'agent') => {
    if (role === 'admin') {
      const admin = {
        id: 'usr_admin',
        name: 'प्रशासक (Admin)',
        englishName: 'YojanaDut Admin',
        phone: '9876543210',
        email: 'admin@yojanadut.in',
        role: 'admin',
        referralCode: 'YD-ADMIN01',
        walletBalance: 0,
        pendingBalance: 0,
        totalEarned: 0,
      };
      setUser(admin);
      setToken('demo_admin_token');
    } else if (role === 'agent') {
      setUser(defaultAgent);
      setToken('demo_agent_token');
    } else {
      const citizen = {
        id: 'usr_citizen',
        name: 'सुनीता पाटील',
        englishName: 'Sunita Patil',
        phone: '9850123456',
        email: 'sunita.patil@gmail.com',
        role: 'user',
        referralCode: '',
        walletBalance: 0,
        pendingBalance: 0,
        totalEarned: 0,
      };
      setUser(citizen);
      setToken('demo_user_token');
    }
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
    setUser((prev) => ({ ...prev, ...updates }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        login,
        sendOtp,
        verifyOtp,
        logout,
        quickDemoLogin,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
