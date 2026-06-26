import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, Clock, Star, MapPin, QrCode, XCircle, Loader2, Award } from 'lucide-react';
import { publicEventService } from '../../services/publicEventService';
import { Link } from 'react-router-dom';

const StudentDashboard = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeQR, setActiveQR] = useState(null); // registration ID showing QR
  const [actionLoading, setActionLoading] = useState(null);

  const fetchMyRegistrations = async () => {
    try {
      setLoading(true);
      const data = await publicEventService.getMyRegistrations();
      setRegistrations(data || []);
    } catch (err) {
      console.error('Lỗi khi tải danh sách đăng ký:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRegistrations();
  }, []);

  const handleCancel = async (eventId, regId) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đăng ký sự kiện này?')) return;
    try {
      setActionLoading(regId);
      await publicEventService.cancelRegistration(eventId);
      alert('Đã hủy vé sự kiện.');
      fetchMyRegistrations();
    } catch (err) {
      alert(err?.response?.data?.message || err?.message || 'Lỗi khi hủy vé');
    } finally {
      setActionLoading(null);
    }
  };

  const upcomingRegs = registrations.filter(r => r.checkedInAt == null);
  const checkedInRegs = registrations.filter(r => r.checkedInAt != null);

  const totalPoints = checkedInRegs.reduce((sum, r) => sum + (r.trainingPoints || 0), 0);
  const progressPercent = Math.min(100, Math.round((totalPoints / 100) * 100));

  const formatDay = (iso) => iso ? new Date(iso).getDate() : '--';
  const formatMonth = (iso) => iso ? `Tháng ${new Date(iso).getMonth() + 1}` : '--';
  const formatTime = (start, end) => {
    if (!start) return '08:00 - 11:30';
    const s = new Date(start).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const e = end ? new Date(end).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '';
    return e ? `${s} - ${e}` : s;
  };

  return (
    <div className="stu-page">
      <div className="stu-card-header" style={{ padding: 0, border: 'none', marginBottom: '24px', background: 'transparent' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>Quản lý Đăng ký & Hoạt động</h2>
          <p className="stu-text-muted">Theo dõi các sự kiện bạn đã đăng ký và tiến độ điểm rèn luyện của học kỳ này.</p>
        </div>
      </div>

      {/* Thống kê tổng quan */}
      <div className="stu-stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '32px' }}>
        <div className="stu-stat-box">
          <h2 style={{ color: 'var(--edu-primary)' }}>{loading ? '-' : upcomingRegs.length}</h2>
          <p>Sự kiện sắp tới</p>
        </div>
        <div className="stu-stat-box">
          <h2 style={{ color: 'var(--edu-green)' }}>{loading ? '-' : checkedInRegs.length}</h2>
          <p>Đã tham gia</p>
        </div>
        <div className="stu-stat-box">
          <h2 style={{ color: '#f59e0b' }}>{loading ? '-' : totalPoints}</h2>
          <p>Tổng điểm rèn luyện</p>
        </div>
        <div className="stu-stat-box">
          <h2 style={{ color: '#8b5cf6' }}>{totalPoints >= 80 ? 'Xuất sắc' : totalPoints >= 65 ? 'Khá' : 'Đạt'}</h2>
          <p>Xếp loại dự kiến</p>
        </div>
      </div>

      <div className="stu-grid-top">
        {/* Cột trái: Sự kiện đã đăng ký (Sắp diễn ra) */}
        <div className="stu-col-left">
          <div className="stu-card">
            <div className="stu-card-header">
              <h3><Calendar size={18} /> Vé sự kiện của bạn</h3>
              <Link to="/explore" className="stu-btn-outline-sm" style={{ textDecoration: 'none' }}>+ Đăng ký thêm</Link>
            </div>
            <div className="stu-card-body">
              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <Loader2 size={32} style={{ color: 'var(--edu-primary)', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
                  <p style={{ marginTop: '8px', color: 'var(--edu-text-muted)' }}>Đang tải vé sự kiện...</p>
                </div>
              ) : upcomingRegs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '36px 16px', background: '#f8fafc', borderRadius: '12px', border: '1px dashed var(--edu-border)' }}>
                  <Award size={36} style={{ color: 'var(--edu-text-muted)', margin: '0 auto 12px' }} />
                  <h4 style={{ color: 'var(--edu-text)', marginBottom: '6px' }}>Bạn chưa có vé sự kiện nào</h4>
                  <p className="stu-text-muted" style={{ marginBottom: '16px' }}>Khám phá các sự kiện hấp dẫn đang mở đăng ký ngay hôm nay.</p>
                  <Link to="/explore" className="edu-btn-primary btn-sm" style={{ textDecoration: 'none', display: 'inline-flex' }}>Xem danh sách sự kiện</Link>
                </div>
              ) : (
                upcomingRegs.map(reg => {
                  const isQR = activeQR === reg.id;
                  return (
                    <div className="registered-event-card" key={reg.id} style={{ border: '1px solid var(--edu-border)', borderRadius: '12px', padding: '16px', marginBottom: '16px', display: 'flex', gap: '16px' }}>
                      <div className="stu-time blue" style={{ width: '70px', height: '70px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <strong style={{ fontSize: '20px' }}>{formatDay(reg.startTime)}</strong>
                        <span style={{ fontSize: '12px' }}>{formatMonth(reg.startTime)}</span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>{reg.eventTitle}</h4>
                          <span className="badge-status green" style={{ fontSize: '11px', padding: '2px 8px' }}>Hợp lệ</span>
                        </div>
                        <p style={{ fontSize: '13px', color: 'var(--edu-text-muted)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Clock size={14}/> {formatTime(reg.startTime, reg.endTime)}
                        </p>
                        <p style={{ fontSize: '13px', color: 'var(--edu-text-muted)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <MapPin size={14}/> {reg.location || 'PTIT Campus'}
                        </p>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button className="edu-btn-primary btn-sm" onClick={() => setActiveQR(isQR ? null : reg.id)}>
                            <QrCode size={14}/> {isQR ? 'Đóng vé QR' : 'Xem Vé QR'}
                          </button>
                          <button 
                            className="edu-btn-outline btn-sm" 
                            style={{ color: '#ef4444', borderColor: '#fca5a5' }}
                            onClick={() => handleCancel(reg.eventId, reg.id)}
                            disabled={actionLoading === reg.id}
                          >
                            {actionLoading === reg.id ? '...' : 'Hủy đăng ký'}
                          </button>
                        </div>

                        {/* QR Code Demo */}
                        {isQR && (
                          <div style={{ marginTop: '16px', padding: '16px', background: '#f8fafc', borderRadius: '8px', textAlign: 'center', border: '1px dashed #cbd5e1' }}>
                            <img 
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(reg.id)}`} 
                              alt="QR Code Check-in" 
                              style={{ width: '130px', height: '130px', borderRadius: '8px', marginBottom: '8px' }} 
                            />
                            <p style={{ fontSize: '12px', color: 'var(--edu-text)', fontWeight: 700, fontFamily: 'monospace' }}>Mã vé: {reg.id.slice(0, 8).toUpperCase()}</p>
                            <p style={{ fontSize: '11px', color: '#ef4444', marginTop: '4px' }}>Vui lòng xuất trình mã QR này tại quầy Check-in</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Cột phải: Tiến độ & Lịch sử */}
        <div className="stu-col-right">
          <div className="stu-card">
            <div className="stu-card-header">
              <h3><Star size={18} /> Tiến độ Điểm rèn luyện</h3>
            </div>
            <div className="stu-card-body">
              <div className="stu-progress-info">
                <span>Mục tiêu chuẩn: 100 điểm</span>
                <span className="blue">Đạt {progressPercent}%</span>
              </div>
              <div className="stu-progress-bar" style={{ marginBottom: '24px' }}>
                <div className="stu-progress-fill blue" style={{ width: `${progressPercent}%` }}></div>
              </div>
              
              <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '12px', color: 'var(--edu-text-muted)', textTransform: 'uppercase' }}>Ghi nhận tích lũy</h4>
              <p style={{ fontSize: '14px', color: 'var(--edu-text)', lineHeight: 1.6 }}>
                Bạn đã tích lũy được <strong>{totalPoints} điểm</strong> từ việc tham gia các hoạt động ngoại khóa. Tiếp tục đăng ký và tham dự đầy đủ để nâng cao mức xếp loại rèn luyện nhé!
              </p>
            </div>
          </div>

          <div className="stu-card">
            <div className="stu-card-header">
              <h3><CheckCircle size={18} /> Lịch sử hoạt động</h3>
            </div>
            <div className="stu-card-body">
              <div className="stu-tasks">
                {checkedInRegs.length === 0 ? (
                  <p className="stu-text-muted" style={{ textAlign: 'center', padding: '16px 0' }}>Chưa có lịch sử điểm danh sự kiện nào.</p>
                ) : (
                  checkedInRegs.map(reg => (
                    <div className="stu-task-item" key={reg.id}>
                      <div className="stu-task-dot" style={{ background: '#10b981', boxShadow: '0 0 0 3px #d1fae5' }}></div>
                      <div className="stu-task-info">
                        <h4>{reg.eventTitle}</h4>
                        <p>Đã Check-in &bull; {reg.checkedInAt ? new Date(reg.checkedInAt).toLocaleDateString('vi-VN') : 'Gần đây'}</p>
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: '#10b981' }}>+{reg.trainingPoints || 0} ĐRL</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
