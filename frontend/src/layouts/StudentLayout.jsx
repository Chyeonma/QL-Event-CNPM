import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Map, User, LogOut, CheckSquare, Home as HomeIcon, GraduationCap, Bell, Menu } from 'lucide-react';
import '../educampus.css';

const StudentLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navItems = [
    { path: '/', label: 'Trang chủ', icon: <HomeIcon size={20} /> },
    { path: '/explore', label: 'Khám phá', icon: <Map size={20} /> },
    { path: '/dashboard', label: 'Đăng ký', icon: <CheckSquare size={20} /> },
    { path: '/profile', label: 'Trang cá nhân', icon: <User size={20} /> },
  ];

  return (
    <div className="stu-layout">
      {/* Top Bar - Dùng chung style navbar của trang chủ */}
      <header className="edu-navbar" style={{ position: 'sticky', top: 0, zIndex: 100, width: '100%', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--edu-text)' }}
          >
            <Menu size={24} />
          </button>
          <div className="edu-brand" onClick={() => navigate('/')}>
            <div className="edu-logo">
              <GraduationCap size={24} />
            </div>
            <span className="edu-brand-text">PTIT Events</span>
          </div>
        </div>
        
        <div className="edu-nav-links">
          <span className={location.pathname === '/' ? 'active' : ''} onClick={() => navigate('/')}>Trang chủ</span>
          <span className={location.pathname === '/dashboard' ? 'active' : ''} onClick={() => navigate('/dashboard')}>Sinh viên</span>
          <span>Ban tổ chức</span>
          <span onClick={() => navigate('/admin')}>Quản trị</span>
          <span className={location.pathname === '/explore' ? 'active' : ''} onClick={() => navigate('/explore')}>Sự kiện</span>
        </div>

        <div className="edu-nav-actions">
          <button className="edu-btn-icon"><Bell size={18} /></button>
          <div className="stu-topbar-user" style={{ marginLeft: '12px' }}>
            <img 
              src={user?.avatarUrl || 'https://ui-avatars.com/api/?name=' + (user?.fullName || 'STU') + '&background=10b981&color=fff'} 
              alt="Avatar" 
              className="stu-avatar-small"
            />
            <span style={{ color: 'var(--edu-text)', fontWeight: 600 }}>{user?.fullName || 'Sinh viên'}</span>
          </div>
        </div>
      </header>

      <div className="stu-container">
        {/* Sidebar */}
        <aside className={`stu-sidebar ${isSidebarOpen ? '' : 'hidden'}`}>
          <div className="stu-user-profile">
            <img 
              src={user?.avatarUrl || 'https://ui-avatars.com/api/?name=' + (user?.fullName || 'STU') + '&background=10b981&color=fff'} 
              alt="Avatar" 
              className="stu-avatar"
            />
            <div className="stu-user-info">
              <h3>Xin chào, {user?.fullName || 'Sinh viên'}</h3>
              <p>Khoa Công nghệ thông tin | Khóa {user?.batch || '2023'}</p>
            </div>
            <div className="stu-actions">
              <button className="stu-btn-outline" onClick={() => navigate('/dashboard')}>1 Yêu cầu</button>
              <button className="stu-btn-primary" onClick={() => navigate('/profile')}>Hồ sơ</button>
            </div>
          </div>

          <nav className="stu-nav">
            <p className="stu-nav-title">MENU CHÍNH</p>
            {navItems.map(item => (
              <div 
                key={item.path} 
                className={`stu-nav-item ${location.pathname === item.path ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
              >
                {item.icon}
                <span>{item.label}</span>
              </div>
            ))}
            <div className="stu-nav-item stu-logout" onClick={logout} style={{ marginTop: 'auto' }}>
              <LogOut size={20} />
              <span>Đăng xuất</span>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="stu-main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
