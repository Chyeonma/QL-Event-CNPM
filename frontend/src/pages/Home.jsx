import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bell, GraduationCap, Users, Shield, Calendar, MapPin, ArrowRight } from 'lucide-react';
import StudentLayout from '../layouts/StudentLayout';
import NotificationBell from '../components/NotificationBell';
import '../educampus.css';

const Home = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return <div style={{ height: '100vh', background: '#fff' }}></div>;
  }

  const content = (
    <div className={`edu-landing ${user ? 'inside-layout' : ''}`}>
      {/* Navbar chỉ hiển thị khi CHƯA đăng nhập. */}
      {!user && (
        <nav className="edu-navbar">
          <div className="edu-brand" onClick={() => navigate('/')}>
            <div className="edu-logo">
              <GraduationCap size={24} />
            </div>
            <span className="edu-brand-text">PTIT Events</span>
          </div>
          <div className="edu-nav-links">
            <span className="active">Trang chủ</span>
            <span onClick={() => navigate('/dashboard')}>Sinh viên</span>
            <span>Ban tổ chức</span>
            <span onClick={() => navigate('/admin')}>Quản trị</span>
            <span onClick={() => navigate('/explore')}>Sự kiện</span>
          </div>
          <div className="edu-nav-actions">
            {user ? <NotificationBell /> : <button className="edu-btn-icon" onClick={() => navigate('/login')}><Bell size={18} /></button>}
            <button className="edu-btn-primary" onClick={() => navigate('/login')}>Đăng nhập</button>
          </div>
        </nav>
      )}

      {/* Hero Section */}
      <header className="edu-hero">
        <div className="edu-hero-overlay"></div>
        <div className="edu-hero-content">
          <div className="edu-badge">Tuyển sinh CLB 2026-2027</div>
          <h1 className="edu-hero-title">Chào mừng đến với <span className="edu-highlight">Cổng Sự Kiện</span></h1>
          <p className="edu-hero-subtitle">Nền tảng số hóa quản lý hoạt động ngoại khóa, giúp sinh viên Học viện khám phá sự kiện, đăng ký tham gia và tự động tích lũy điểm rèn luyện.</p>
          <div className="edu-hero-buttons">
            <button className="edu-btn-primary edu-btn-lg" onClick={() => navigate('/explore')}>Khám phá Sự kiện <ArrowRight size={18} /></button>
            <button className="edu-btn-outline edu-btn-lg" onClick={() => navigate('/dashboard')}>Xem điểm rèn luyện</button>
          </div>
          
          <div className="edu-stats">
            <div className="edu-stat-item">
              <h2>500+</h2>
              <p>Sự kiện mỗi năm</p>
            </div>
            <div className="edu-stat-item">
              <h2>10,000+</h2>
              <p>Lượt tham gia</p>
            </div>
            <div className="edu-stat-item">
              <h2>20+</h2>
              <p>CLB & Đội nhóm</p>
            </div>
            <div className="edu-stat-item">
              <h2>100%</h2>
              <p>Tự động hóa ĐRL</p>
            </div>
          </div>
        </div>
      </header>

      {/* Portals Cards */}
      <div className="edu-portals-wrapper">
        <div className="edu-portal-card" onClick={() => navigate('/dashboard')}>
          <div className="edu-portal-icon blue"><GraduationCap size={24} /></div>
          <h3>Dành cho Sinh viên</h3>
          <p>Tìm kiếm sự kiện, đăng ký tham gia, quản lý vé QR code và theo dõi quỹ điểm rèn luyện cá nhân.</p>
          <span className="edu-portal-link">Truy cập ngay <ArrowRight size={16} /></span>
        </div>
        <div className="edu-portal-card">
          <div className="edu-portal-icon teal"><Users size={24} /></div>
          <h3>Dành cho Ban tổ chức</h3>
          <p>Đăng ký cấp phép sự kiện, quản lý danh sách sinh viên tham gia và thực hiện điểm danh bằng mã QR.</p>
          <span className="edu-portal-link">Truy cập ngay <ArrowRight size={16} /></span>
        </div>
        <div className="edu-portal-card" onClick={() => navigate('/admin')}>
          <div className="edu-portal-icon orange"><Shield size={24} /></div>
          <h3>Dành cho Quản trị viên</h3>
          <p>Hệ thống xét duyệt sự kiện, quản lý người dùng, xuất báo cáo và tổng hợp minh chứng rèn luyện.</p>
          <span className="edu-portal-link">Truy cập ngay <ArrowRight size={16} /></span>
        </div>
      </div>

      {/* Content Section */}
      <section className="edu-section">
        <div className="edu-grid">
          <div className="edu-announcements">
            <div className="edu-section-header">
              <h2>Thông báo mới nhất</h2>
              <span className="edu-link">Xem tất cả <ArrowRight size={14} /></span>
            </div>
            <div className="edu-announcement-list">
              <div className="edu-announcement-item">
                <div className="edu-icon-circle blue"><Bell size={18} /></div>
                <div className="edu-announcement-content">
                  <div className="edu-meta"><span className="edu-tag blue">Học vụ</span> 28 Thg 12, 2025</div>
                  <h4>Cập nhật Quy chế đánh giá Điểm Rèn Luyện mới</h4>
                </div>
                <ArrowRight size={16} className="edu-arrow" />
              </div>
              <div className="edu-announcement-item">
                <div className="edu-icon-circle blue"><Bell size={18} /></div>
                <div className="edu-announcement-content">
                  <div className="edu-meta"><span className="edu-tag outline">Phong trào</span> 15 Thg 1, 2026</div>
                  <h4>Thông báo mở đơn đăng ký Tình nguyện viên Mùa Hè Xanh</h4>
                </div>
                <ArrowRight size={16} className="edu-arrow" />
              </div>
            </div>
          </div>
          
          <div className="edu-campus-life">
            <div className="edu-section-header">
              <h2>Nhịp sống Sinh viên</h2>
              <span className="edu-link" onClick={() => navigate('/explore')}>Khám phá <ArrowRight size={14} /></span>
            </div>
            <div className="edu-campus-card">
              <div className="edu-campus-overlay">
                <h3>Phát triển kỹ năng toàn diện</h3>
                <p>Nơi ươm mầm tài năng và kết nối cộng đồng sinh viên năng động.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="edu-section edu-bg-light">
        <div className="edu-center-header">
          <h2>Sự kiện nổi bật</h2>
          <p>Tham gia ngay vào các chương trình trọng điểm của Học viện trong tháng này</p>
        </div>
        <div className="edu-events-grid">
          <div className="edu-event-card">
            <div className="edu-event-img bg-event1">
              <span className="edu-tag solid-green">Văn nghệ</span>
            </div>
            <div className="edu-event-body">
              <div className="edu-meta-row">
                <Calendar size={14} /> 10-12 Tháng 10
              </div>
              <h3>Đêm nhạc Chào Tân sinh viên</h3>
              <button className="edu-btn-outline edu-btn-block" onClick={() => navigate('/explore')}>Đăng ký ngay</button>
            </div>
          </div>
          <div className="edu-event-card">
            <div className="edu-event-img bg-event2">
              <span className="edu-tag solid-green">Thể thao</span>
            </div>
            <div className="edu-event-body">
              <div className="edu-meta-row">
                <Calendar size={14} /> 20-25 Tháng 11
              </div>
              <h3>Hội thao Sinh viên PTIT HCM</h3>
              <button className="edu-btn-outline edu-btn-block" onClick={() => navigate('/explore')}>Đăng ký ngay</button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="edu-footer">
        <div className="edu-footer-content">
          <div className="edu-brand-footer">
            <GraduationCap size={24} />
            <h2>Cổng Sự Kiện PTIT HCM</h2>
          </div>
          <p>Xây dựng hệ sinh thái số cho hoạt động ngoại khóa của sinh viên.</p>
        </div>
      </footer>
    </div>
  );

  if (user) {
    return <StudentLayout>{content}</StudentLayout>;
  }

  return content;
};

export default Home;
