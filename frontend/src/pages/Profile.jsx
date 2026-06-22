import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../config/axios';

const Profile = () => {
  const { user, logout, changePassword } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');
  const [modalLoading, setModalLoading] = useState(false);

  // Dùng để test tính năng Auto-Refresh token bằng cách cố tình gửi request với token cũ/hết hạn
  const [apiTestResponse, setApiTestResponse] = useState('');
  const [apiTestLoading, setApiTestLoading] = useState(false);

  const handleOpenModal = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setModalError('');
    setModalSuccess('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setModalError('');
    setModalSuccess('');

    if (newPassword !== confirmPassword) {
      setModalError('Mật khẩu mới xác nhận không khớp');
      return;
    }

    if (newPassword === currentPassword) {
      setModalError('Mật khẩu mới không được trùng mật khẩu cũ');
      return;
    }

    setModalLoading(true);
    const result = await changePassword(currentPassword, newPassword);
    setModalLoading(false);

    if (result.success) {
      setModalSuccess(result.message);
      // Chờ 2 giây rồi đóng modal và tự động logout
      setTimeout(() => {
        handleCloseModal();
      }, 2000);
    } else {
      setModalError(result.message);
    }
  };

  // Test gửi một request an toàn đến Backend để xem API trả về tốt không
  const handleTestApi = async () => {
    setApiTestLoading(true);
    setApiTestResponse('');
    try {
      const response = await axiosInstance.get('/api/auth/me');
      setApiTestResponse(JSON.stringify(response.data, null, 2));
    } catch (error) {
      setApiTestResponse(`Lỗi: ${error.response?.data?.message || error.message}`);
    } finally {
      setApiTestLoading(false);
    }
  };

  // Test tự động gia hạn token (Tải access token giả để kích hoạt lỗi 401 xem Axios có cứu được không)
  const handleCorruptTokenTest = () => {
    alert("Hệ thống sẽ thay thế Access Token hiện tại bằng một Token lỗi. Vui lòng nhấn nút 'Gọi API Kiểm tra' ngay sau đây để xem Axios có tự động dùng Refresh Token lấy lại Token mới hay không.");
    localStorage.setItem('accessToken', 'invalid-jwt-token-to-simulate-401');
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <img
            src={user?.avatarUrl || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'}
            alt="Avatar"
            className="header-avatar"
            onClick={() => navigate('/')}
            style={{ cursor: 'pointer', width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary-color)' }}
          />
          <h1 onClick={() => navigate('/')} style={{ cursor: 'pointer', fontSize: '20px', fontWeight: '700', background: 'linear-gradient(to right, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            HVCS Events
          </h1>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={() => navigate('/')}>
            Trang chủ
          </button>
          <button className="btn btn-danger" onClick={logout}>
            Đăng xuất
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        <div className="welcome-banner">
          <h2>Trang cá nhân của bạn 👤</h2>
          <p>Quản lý thông tin tài khoản và cấu hình bảo mật.</p>
        </div>

        <div className="grid">
          {/* Cột 1: Thông tin cá nhân */}
          <div className="card profile-card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>Thông tin tài khoản</h3>
              <button className="btn btn-secondary btn-sm" onClick={handleOpenModal}>
                Đổi mật khẩu
              </button>
            </div>
            <div className="card-body">
              <div className="profile-info-header">
                <img
                  src={user?.avatarUrl || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'}
                  alt="Avatar"
                  className="profile-avatar"
                />
                <div>
                  <h4>{user?.fullName}</h4>
                  <span className="badge-role">{user?.role}</span>
                </div>
              </div>

              <div className="info-list">
                <div className="info-item">
                  <span className="info-label">Mã sinh viên:</span>
                  <span className="info-value">{user?.studentCode || 'N/A (Cán bộ)'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Email đăng ký:</span>
                  <span className="info-value">{user?.email}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Lớp:</span>
                  <span className="info-value">{user?.classCode || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Ngành học:</span>
                  <span className="info-value">{user?.major || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Khóa:</span>
                  <span className="info-value">{user?.batch || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cột 2: Bảng Điều khiển Kiểm thử */}
          <div className="card console-card">
            <div className="card-header">
              <h3>Bảng điều khiển kiểm thử (Auth Console)</h3>
            </div>
            <div className="card-body">
              <p className="card-desc">Sử dụng các công cụ dưới đây để kiểm nghiệm luồng hoạt động của Backend API:</p>
              
              <div className="button-group-row" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button className="btn btn-primary" onClick={handleTestApi} disabled={apiTestLoading}>
                  {apiTestLoading ? 'Đang gọi...' : 'Gọi API Kiểm tra (/me)'}
                </button>
                <button className="btn btn-warning" onClick={handleCorruptTokenTest}>
                  Mô phỏng Hết hạn Access Token (401)
                </button>
              </div>

              {apiTestResponse && (
                <div className="console-output" style={{ marginTop: '20px', background: 'rgba(15, 23, 42, 0.6)', padding: '15px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="console-title" style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    Kết quả phản hồi từ API:
                  </div>
                  <pre style={{ overflowX: 'auto', fontSize: '13px', color: '#c7d2fe', fontFamily: 'monospace' }}>{apiTestResponse}</pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modal Đổi mật khẩu */}
      {showModal && (
        <div className="modal-backdrop" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.75)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div className="modal-content" style={{ background: 'var(--panel-bg)', border: '1px solid var(--panel-border)', borderRadius: '20px', padding: '30px', width: '90%', maxWidth: '500px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', animation: 'fadeInUp 0.3s ease-out' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '600' }}>Đổi mật khẩu tài khoản</h3>
              <button className="modal-close" onClick={handleCloseModal} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '24px', cursor: 'pointer' }}>&times;</button>
            </div>
            <form onSubmit={handleChangePassword}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
                {modalError && <div className="alert alert-danger">{modalError}</div>}
                {modalSuccess && <div className="alert alert-success">{modalSuccess}</div>}

                <div className="form-group">
                  <label htmlFor="modalCurrentPwd">Mật khẩu hiện tại</label>
                  <input
                    type="password"
                    id="modalCurrentPwd"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', color: 'var(--text-primary)', padding: '12px', fontSize: '15px' }}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="modalNewPwd">Mật khẩu mới</label>
                  <input
                    type="password"
                    id="modalNewPwd"
                    placeholder="Tối thiểu 8 ký tự"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', color: 'var(--text-primary)', padding: '12px', fontSize: '15px' }}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="modalConfirmPwd">Xác nhận mật khẩu mới</label>
                  <input
                    type="password"
                    id="modalConfirmPwd"
                    placeholder="Nhập lại mật khẩu mới"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', color: 'var(--text-primary)', padding: '12px', fontSize: '15px' }}
                  />
                </div>
              </div>
              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal} disabled={modalLoading}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary" disabled={modalLoading}>
                  {modalLoading ? 'Đang cập nhật...' : 'Xác nhận đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
