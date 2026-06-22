import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Dang tai thong tin quan tri...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.requirePasswordChange && location.pathname !== '/change-password-force') {
    return <Navigate to="/change-password-force" replace />;
  }

  const canAccessAdmin = user.role === 'ADMIN' || user.role === 'MANAGER';

  if (!canAccessAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
