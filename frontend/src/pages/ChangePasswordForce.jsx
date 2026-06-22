import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ChangePasswordForce = () => {
  const { user, changePassword, logout } = useAuth();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Nếu không đăng nhập hoặc không có yêu cầu đổi mật khẩu, về trang chủ
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (!user.requirePasswordChange) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu mới xác nhận không khớp');
      return;
    }

    if (newPassword === currentPassword) {
      setError('Mật khẩu mới không được trùng mật khẩu cũ');
      return;
    }

    setLoading(true);
    const result = await changePassword(currentPassword, newPassword);
    setLoading(false);

    if (result.success) {
      alert(result.message);
      navigate('/login');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Đổi Mật Khẩu Bắt Buộc</h2>
          <p>Tài khoản của bạn đang dùng mật khẩu tạm thời. Hãy đổi mật khẩu để bảo vệ tài khoản.</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="currentPassword">Mật khẩu hiện tại (Mật khẩu tạm thời)</label>
            <input
              type="password"
              id="currentPassword"
              placeholder="Nhập mật khẩu tạm thời"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="newPassword">Mật khẩu mới</label>
            <input
              type="password"
              id="newPassword"
              placeholder="Ít nhất 8 ký tự"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Xác nhận mật khẩu mới</label>
            <input
              type="password"
              id="confirmPassword"
              placeholder="Nhập lại mật khẩu mới"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Đang thực hiện...' : 'Cập nhật mật khẩu'}
          </button>
        </form>

        <div className="auth-footer text-center">
          <button type="button" className="btn btn-link" onClick={logout}>
            Hủy và Đăng xuất
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordForce;
