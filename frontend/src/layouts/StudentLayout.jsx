import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Map, User, LogOut, CheckSquare, Home as HomeIcon, GraduationCap, Bell, Menu, Calendar } from 'lucide-react';
import '../educampus.css';
import NotificationBell from '../components/NotificationBell';

const StudentLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

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
          {navItems.map(item => (
            <span 
              key={item.path}
              className={location.pathname === item.path ? 'active' : ''} 
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </span>
          ))}
        </div>

        <div className="edu-nav-actions" style={{ position: 'relative' }}>
          <NotificationBell />
          
          {/* Khu vực trang cá nhân góc trên bên phải */}
          <div 
            className="stu-topbar-user" 
            style={{ marginLeft: '12px', cursor: 'pointer', padding: '6px 12px', borderRadius: '20px', transition: 'background 0.2s', background: showUserMenu ? '#f1f5f9' : 'transparent', display: 'flex', alignItems: 'center', gap: '8px' }}
            onMouseEnter={() => setShowUserMenu(true)}
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <img 
              src={user?.avatarUrl || 'https://ui-avatars.com/api/?name=' + (user?.fullName || 'STU') + '&background=10b981&color=fff'} 
              alt="Avatar" 
              className="stu-avatar-small"
              style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: '2px solid #10b981' }}
            />
            <span style={{ color: 'var(--edu-text)', fontWeight: 700, fontSize: '14px' }}>{user?.fullName || 'Sinh viên'}</span>
          </div>

          {/* Màn hình nhỏ (Dropdown Card) hiện ra khi sờ vào */}
          {showUserMenu && (
            <div 
              style={{
                position: 'absolute', top: '100%', right: 0, marginTop: '8px', width: '280px',
                background: '#fff', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                border: '1px solid var(--edu-border)', zIndex: 1000, overflow: 'hidden'
              }}
              onMouseEnter={() => setShowUserMenu(true)}
              onMouseLeave={() => setShowUserMenu(false)}
            >
              <div style={{ padding: '16px', background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', borderBottom: '1px solid #a7f3d0', textAlign: 'center' }}>
                <img 
                  src={user?.avatarUrl || 'https://ui-avatars.com/api/?name=' + (user?.fullName || 'STU') + '&background=10b981&color=fff'} 
                  alt="Avatar" 
                  style={{ width: 64, height: 64, borderRadius: '50%', margin: '0 auto 8px', border: '3px solid #fff', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                />
                <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 800, color: '#065f46' }}>{user?.fullName || 'Sinh viên'}</h4>
                <p style={{ margin: 0, fontSize: '12px', color: '#047857', fontWeight: 600 }}>Mã SV: {user?.username || user?.studentCode || 'B23DCCN001'}</p>
                <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#059669' }}>Khoa Công nghệ thông tin &bull; Khóa {user?.batch || '2023'}</p>
              </div>

              <div style={{ padding: '8px' }}>
                <div 
                  onClick={() => { setShowUserMenu(false); navigate('/profile'); }}
                  style={{ padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', color: '#334155', fontSize: '13.5px', fontWeight: 600, transition: 'background 0.15s' }}
                  onMouseOver={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                >
                  <User size={18} color="#10b981" /> Hồ sơ cá nhân
                </div>
                <div 
                  onClick={() => { setShowUserMenu(false); navigate('/dashboard'); }}
                  style={{ padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', color: '#334155', fontSize: '13.5px', fontWeight: 600, transition: 'background 0.15s' }}
                  onMouseOver={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                >
                  <CheckSquare size={18} color="#3b82f6" /> Quản lý Đăng ký & Vé
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--edu-border)', padding: '8px' }}>
                <div 
                  onClick={() => { setShowUserMenu(false); logout(); }}
                  style={{ padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', color: '#ef4444', fontSize: '13.5px', fontWeight: 700, transition: 'background 0.15s' }}
                  onMouseOver={e => e.currentTarget.style.background = '#fef2f2'}
                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                >
                  <LogOut size={18} /> Đăng xuất hệ thống
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="stu-container">
        {/* Sidebar tinh gọn */}
        <aside className={`stu-sidebar ${isSidebarOpen ? '' : 'hidden'}`}>
          <nav className="stu-nav" style={{ paddingTop: '24px' }}>
            <p className="stu-nav-title">MENU CHÍNH</p>
            {navItems.map(item => (
              <div 
                key={item.path} 
                className={`stu-nav-item ${location.pathname === item.path ? 'active' : ''}`}
                onClick={() => { navigate(item.path); setIsSidebarOpen(false); }}
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
