import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Bell,
  CalendarDays,
  ChartNoAxesCombined,
  ChevronDown,
  ClipboardCheck,
  FileText,
  LayoutDashboard,
  LogOut,
  Mail,
  MessageSquare,
  Moon,
  Sun,
  Search,
  Settings,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const menuSections = [
  {
    title: 'MENU',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, to: '/admin' },
      { label: 'Sự kiện', icon: CalendarDays, to: '/admin/events' },
      { label: 'Đăng ký', icon: ClipboardCheck },
      { 
        label: 'Người dùng', 
        icon: Users, 
        children: [
          { label: 'Sinh viên', to: '/admin/users/student' },
          { label: 'Manager', to: '/admin/users/manager' },
          { label: 'Admin', to: '/admin/users/admin' },
        ]
      },
      { label: 'Báo cáo', icon: ChartNoAxesCombined },
    ],
  },
  {
    title: 'VẬN HÀNH',
    items: [
      { label: 'Tin nhắn', icon: MessageSquare, badge: '5' },
      { label: 'Thông báo', icon: Bell, badge: 'Mới' },
      { label: 'Tài liệu', icon: FileText },
    ],
  },
  {
    title: 'TÀI KHOẢN',
    items: [
      { label: 'Hồ sơ', icon: ShieldCheck, to: '/profile' },
      { label: 'Cài đặt', icon: Settings },
    ],
  },
];

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('adminTheme') === 'dark';
  });
  
  // Trạng thái mở/đóng của menu thả xuống
  const [openMenus, setOpenMenus] = useState({ 'Người dùng': true });
  const toggleMenu = (label) => setOpenMenus(prev => ({ ...prev, [label]: !prev[label] }));

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('adminTheme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('adminTheme', 'light');
    }
  }, [isDarkMode]);

  const avatarUrl =
    user?.avatarUrl ||
    'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand" onClick={() => navigate('/admin')}>
          <div className="admin-brand-mark">
            <ChartNoAxesCombined size={22} strokeWidth={2.4} />
          </div>
          <span>HVCS Admin</span>
        </div>

        <nav className="admin-sidebar-nav">
          {menuSections.map((section) => (
            <div className="admin-sidebar-section" key={section.title}>
              <p>{section.title}</p>
              <div className="admin-sidebar-list">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const content = (
                    <>
                      <span className="admin-sidebar-link-main">
                        <Icon size={19} />
                        <span>{item.label}</span>
                      </span>
                      {item.badge && <span className="admin-sidebar-badge">{item.badge}</span>}
                      {!item.to && !item.badge && <ChevronDown size={17} />}
                    </>
                  );

                  if (item.children) {
                    const isOpen = openMenus[item.label];
                    return (
                      <div key={item.label}>
                        <button 
                          className={`admin-sidebar-link ${isOpen ? 'active-parent' : ''}`} 
                          type="button" 
                          onClick={() => toggleMenu(item.label)}
                          style={{ background: isOpen ? 'var(--bg-secondary)' : 'transparent' }}
                        >
                          <span className="admin-sidebar-link-main">
                            <Icon size={19} />
                            <span>{item.label}</span>
                          </span>
                          <ChevronDown size={17} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
                        </button>
                        {isOpen && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                            {item.children.map(child => (
                              <NavLink 
                                key={child.label} 
                                to={child.to}
                                className={({ isActive }) => `admin-sidebar-link${isActive ? ' active' : ''}`}
                                style={{ padding: '8px 12px', paddingLeft: '44px', fontSize: '14px', minHeight: '36px' }}
                              >
                                <span className="admin-sidebar-link-main" style={{ gap: '12px' }}>
                                  <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'currentColor', opacity: 0.5 }} />
                                  <span>{child.label}</span>
                                </span>
                              </NavLink>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  }

                  if (item.to) {
                    return (
                      <NavLink
                        className={({ isActive }) =>
                          `admin-sidebar-link${isActive ? ' active' : ''}`
                        }
                        end={item.to === '/admin'}
                        key={item.label}
                        to={item.to}
                      >
                        {content}
                      </NavLink>
                    );
                  }

                  return (
                    <button className="admin-sidebar-link" key={item.label} type="button">
                      {content}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <button className="admin-sidebar-logout" type="button" onClick={handleLogout}>
          <LogOut size={18} />
          <span>Đăng xuất</span>
        </button>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <label className="admin-search">
            <Search size={21} />
            <input placeholder="Tìm kiếm sự kiện, sinh viên..." type="search" />
          </label>

          <div className="admin-topbar-actions">
            <button 
              className="admin-icon-button admin-theme-toggle" 
              type="button" 
              title="Chuyển giao diện"
              onClick={() => setIsDarkMode(!isDarkMode)}
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button className="admin-icon-button" type="button" title="Thông báo">
              <Bell size={19} />
              <span className="admin-notification-dot"></span>
            </button>
            <button className="admin-icon-button" type="button" title="Tin nhắn">
              <Mail size={19} />
              <span className="admin-notification-dot"></span>
            </button>

            <button className="admin-user-menu" type="button" onClick={() => navigate('/profile')}>
              <span className="admin-user-copy">
                <strong>{user?.fullName || 'Admin User'}</strong>
                <small>{user?.role || 'ADMIN'}</small>
              </span>
              <img alt="Avatar" src={avatarUrl} />
              <ChevronDown size={18} />
            </button>
          </div>
        </header>

        <main className="admin-page">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
