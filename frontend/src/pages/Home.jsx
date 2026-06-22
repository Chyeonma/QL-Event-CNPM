import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <img
            src={user?.avatarUrl || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'}
            alt="Avatar"
            className="header-avatar"
            onClick={() => navigate('/profile')}
            style={{ 
              cursor: 'pointer', 
              width: '40px', 
              height: '40px', 
              borderRadius: '50%', 
              objectFit: 'cover', 
              border: '2px solid var(--primary-color)',
              transition: 'var(--transition-smooth)'
            }}
          />
          <h1 onClick={() => navigate('/')} style={{ cursor: 'pointer', fontSize: '20px', fontWeight: '700', background: 'linear-gradient(to right, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            HVCS Events
          </h1>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={() => navigate('/profile')}>
            Trang cá nhân
          </button>
          <button className="btn btn-danger" onClick={logout}>
            Đăng xuất
          </button>
        </div>
      </header>

      <main className="dashboard-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center', padding: '40px 60px', background: 'var(--panel-bg)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid var(--panel-border)', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)' }}>
          <h2 style={{ fontSize: '48px', fontWeight: '800', background: 'linear-gradient(to right, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '10px', letterSpacing: '-0.5px' }}>
            Trang chủ
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>Chào mừng bạn đến với Hệ thống Quản lý Sự kiện HVCS</p>
        </div>
      </main>
    </div>
  );
};

export default Home;
