import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Đang tải thông tin tài khoản...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Bắt buộc đổi mật khẩu ở lần đăng nhập đầu tiên
  if (user.requirePasswordChange && location.pathname !== '/change-password-force') {
    return <Navigate to="/change-password-force" replace />;
  }

  return children;
};

export default ProtectedRoute;
