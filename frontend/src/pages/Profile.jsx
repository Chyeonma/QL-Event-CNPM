import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, BookOpen, GraduationCap, Award, ShieldCheck, Key, Lock, CheckCircle2, Calendar, X } from 'lucide-react';

const Profile = () => {
  const { user, changePassword } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');
  const [modalLoading, setModalLoading] = useState(false);

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
      setModalError('Mật khẩu xác nhận không khớp!');
      return;
    }

    if (newPassword === currentPassword) {
      setModalError('Mật khẩu mới không được trùng mật khẩu cũ!');
      return;
    }

    setModalLoading(true);
    const result = await changePassword(currentPassword, newPassword);
    setModalLoading(false);

    if (result.success) {
      setModalSuccess(result.message);
      setTimeout(() => {
        handleCloseModal();
      }, 2000);
    } else {
      setModalError(result.message);
    }
  };

  return (
    <div className="stu-page" style={{ padding: '10px 0' }}>
      {/* Tiêu đề trang */}
      <div className="stu-card-header" style={{ padding: 0, border: 'none', marginBottom: '28px', background: 'transparent' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px', color: 'var(--edu-text)' }}>
            Hồ sơ Cá nhân
          </h2>
          <p className="stu-text-muted">
            Quản lý thông tin định danh sinh viên và cấu hình bảo mật tài khoản.
          </p>
        </div>
      </div>

      {/* Bố cục 2 cột đồng bộ chuẩn theme EduCampus */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '28px', alignItems: 'start' }}>
        {/* Cột trái: Card Tóm tắt Sinh viên */}
        <div className="stu-card" style={{ textAlign: 'center', padding: '36px 24px' }}>
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: '16px' }}>
            <img
              src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'User')}&background=10b981&color=fff&size=140`}
              alt="Avatar"
              style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #f1f5f9', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
            />
            <span 
              style={{ position: 'absolute', bottom: '4px', right: '4px', background: '#10b981', color: '#fff', borderRadius: '50%', padding: '4px', display: 'flex', border: '3px solid #fff', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }} 
              title="Tài khoản đã xác thực"
            >
              <CheckCircle2 size={16} />
            </span>
          </div>

          <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--edu-text)', marginBottom: '8px' }}>
            {user?.fullName}
          </h3>
          <span style={{ display: 'inline-block', background: '#eff6ff', color: 'var(--edu-primary)', fontSize: '12px', fontWeight: 700, padding: '4px 14px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '24px' }}>
            {user?.role || 'STUDENT'}
          </span>

          <div style={{ borderTop: '1px solid var(--edu-border)', paddingTop: '20px', marginBottom: '28px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span style={{ color: 'var(--edu-text-muted)' }}>Trạng thái tài khoản:</span>
              <span style={{ color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span>
                Hoạt động tốt
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span style={{ color: 'var(--edu-text-muted)' }}>Cấp độ truy cập:</span>
              <span style={{ fontWeight: 700, color: 'var(--edu-text)' }}>{user?.role}</span>
            </div>
          </div>

          <button
            onClick={handleOpenModal}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justify: 'center', gap: '8px', background: 'var(--edu-primary)', color: '#fff', border: 'none', padding: '13px', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)' }}
            onMouseOver={(e) => e.currentTarget.style.opacity = '0.92'}
            onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
          >
            <Key size={16} /> Đổi mật khẩu
          </button>
        </div>

        {/* Cột phải: Thông tin Chi tiết */}
        <div className="stu-card">
          <div className="stu-card-header">
            <h3><User size={20} /> Thông tin Định danh</h3>
          </div>
          <div className="stu-card-body" style={{ padding: '28px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
              <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '14px', border: '1px solid var(--edu-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--edu-text-muted)', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                  <Award size={16} style={{ color: 'var(--edu-primary)' }} /> Mã sinh viên / Cán bộ
                </div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--edu-text)', fontFamily: 'monospace' }}>
                  {user?.studentCode || 'Không áp dụng (Cán bộ)'}
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '14px', border: '1px solid var(--edu-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--edu-text-muted)', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                  <Mail size={16} style={{ color: '#8b5cf6' }} /> Email tài khoản
                </div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--edu-text)', wordBreak: 'break-all' }}>
                  {user?.email}
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '14px', border: '1px solid var(--edu-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--edu-text-muted)', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                  <BookOpen size={16} style={{ color: '#ec4899' }} /> Lớp sinh hoạt
                </div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--edu-text)' }}>
                  {user?.classCode || 'Không có'}
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '14px', border: '1px solid var(--edu-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--edu-text-muted)', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                  <GraduationCap size={16} style={{ color: '#10b981' }} /> Chuyên ngành đào tạo
                </div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--edu-text)' }}>
                  {user?.major || 'Đại trà'}
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '14px', border: '1px solid var(--edu-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--edu-text-muted)', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                  <Calendar size={16} style={{ color: '#f59e0b' }} /> Niên khóa
                </div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--edu-text)' }}>
                  {user?.batch || 'N/A'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Đổi mật khẩu chuẩn theme sáng */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="stu-card" style={{ width: '90%', maxWidth: '460px', borderRadius: '20px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', animation: 'fadeIn 0.2s ease-out' }}>
            <div className="stu-card-header" style={{ padding: '20px 24px' }}>
              <h3 style={{ fontSize: '18px' }}><Lock size={18} /> Đổi mật khẩu tài khoản</h3>
              <button onClick={handleCloseModal} style={{ background: 'none', border: 'none', color: 'var(--edu-text-muted)', cursor: 'pointer', padding: '4px' }}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleChangePassword}>
              <div className="stu-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '24px' }}>
                {modalError && <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '10px', color: '#dc2626', fontSize: '14px', fontWeight: 500 }}>{modalError}</div>}
                {modalSuccess && <div style={{ padding: '12px 16px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '10px', color: '#16a34a', fontSize: '14px', fontWeight: 500 }}>{modalSuccess}</div>}

                <div>
                  <label htmlFor="modalCurrentPwd" style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--edu-text)', marginBottom: '6px' }}>Mật khẩu hiện tại</label>
                  <input
                    type="password"
                    id="modalCurrentPwd"
                    placeholder="Nhập mật khẩu đang sử dụng"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    style={{ width: '100%', boxSizing: 'border-box', padding: '12px 14px', border: '1px solid var(--edu-border)', borderRadius: '10px', fontSize: '14px', color: 'var(--edu-text)', outline: 'none' }}
                  />
                </div>

                <div>
                  <label htmlFor="modalNewPwd" style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--edu-text)', marginBottom: '6px' }}>Mật khẩu mới</label>
                  <input
                    type="password"
                    id="modalNewPwd"
                    placeholder="Tối thiểu 8 ký tự"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    style={{ width: '100%', boxSizing: 'border-box', padding: '12px 14px', border: '1px solid var(--edu-border)', borderRadius: '10px', fontSize: '14px', color: 'var(--edu-text)', outline: 'none' }}
                  />
                </div>

                <div>
                  <label htmlFor="modalConfirmPwd" style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--edu-text)', marginBottom: '6px' }}>Xác nhận mật khẩu mới</label>
                  <input
                    type="password"
                    id="modalConfirmPwd"
                    placeholder="Nhập lại chính xác mật khẩu mới"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    style={{ width: '100%', boxSizing: 'border-box', padding: '12px 14px', border: '1px solid var(--edu-border)', borderRadius: '10px', fontSize: '14px', color: 'var(--edu-text)', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ padding: '16px 24px', background: '#f8fafc', borderTop: '1px solid var(--edu-border)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={handleCloseModal} disabled={modalLoading} style={{ padding: '10px 18px', background: '#fff', border: '1px solid var(--edu-border)', borderRadius: '10px', fontSize: '14px', fontWeight: 600, color: 'var(--edu-text)', cursor: 'pointer' }}>
                  Hủy
                </button>
                <button type="submit" disabled={modalLoading} style={{ padding: '10px 20px', background: 'var(--edu-primary)', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 700, color: '#fff', cursor: 'pointer' }}>
                  {modalLoading ? 'Đang lưu...' : 'Xác nhận đổi'}
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
