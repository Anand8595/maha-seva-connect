import React, { useState, useEffect } from 'react';
import { AdminLogin } from './components/auth/AdminLogin';
import { AdminDashboard } from './components/dashboard/AdminDashboard';
import { adminApi } from './services/api';
import './App.css';

function App() {
  const [adminUser, setAdminUser] = useState(() => adminApi.getCurrentAdmin());

  useEffect(() => {
    // Check local storage on mount
    const current = adminApi.getCurrentAdmin();
    if (current) {
      setAdminUser(current);
    }
  }, []);

  const handleLoginSuccess = (user) => {
    setAdminUser(user);
  };

  const handleLogout = () => {
    adminApi.logout();
    setAdminUser(null);
  };

  if (!adminUser) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  return <AdminDashboard adminUser={adminUser} onLogout={handleLogout} />;
}

export default App;
