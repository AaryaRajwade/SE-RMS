import React, { useState, useEffect, useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Register from './components/Register';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import './App.css';

function AppContent() {
  const { token, logout } = useContext(AuthContext);
  const [currentPage, setCurrentPage] = useState('login');
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    if (token) {
      // Decode token to get role (simple JWT parsing)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserRole(payload.role);
        setCurrentPage(payload.role === 'admin' ? 'admin' : 'user-dashboard');
      } catch (err) {
        console.error('Error decoding token', err);
      }
    }
  }, [token]);

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  const handleLoginSuccess = (userData) => {
    setUserRole(userData.role);
    setCurrentPage(userData.role === 'admin' ? 'admin' : 'user-dashboard');
  };

  const handleLogout = () => {
    logout();
    setUserRole(null);
    setCurrentPage('login');
  };

  if (token && userRole === 'admin') {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  if (token && userRole === 'user') {
    return <UserDashboard onLogout={handleLogout} />;
  }

  return (
    <div className="app-container">
      {currentPage === 'login' && (
        <Login onNavigate={handleNavigate} onLoginSuccess={handleLoginSuccess} />
      )}
      {currentPage === 'register' && (
        <Register onNavigate={handleNavigate} />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
