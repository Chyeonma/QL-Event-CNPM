import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, Clock, Star, MapPin, QrCode, XCircle, Loader2, Award, Building2, Info, AlertTriangle } from 'lucide-react';
import { publicEventService } from '../../services/publicEventService';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { vi } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'vi': vi,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const StudentDashboard = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeQR, setActiveQR] = useState(null); // registration ID showing QR
  const [actionLoading, setActionLoading] = useState(null);
  const [activeTab, setActiveTab] = useState('today'); // 'today', 'active', 'closed', 'calendar'
  const navigate = useNavigate();

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

  const todayStr = new Date().toDateString();
  // Phần 1: Sự kiện trong ngày
  const todayRegs = registrations.filter(r => r.startTime && new Date(r.startTime).toDateString() === todayStr);
  // Phần 2: Sự kiện đã đăng ký (đang mở, chưa điểm danh, không phải hôm nay)
  const activeRegs = registrations.filter(r => (!r.startTime || new Date(r.startTime).toDateString() !== todayStr) && r.checkedInAt == null && r.eventStatus !== 'CLOSED');
  // Phần 3: Sự kiện đã đăng ký và đã đóng trạng thái (hoặc đã điểm danh, không phải hôm nay)
  const closedRegs = registrations.filter(r => (!r.startTime || new Date(r.startTime).toDateString() !== todayStr) && (r.eventStatus === 'CLOSED' || r.checkedInAt != null));

  const calendarEvents = registrations.map(reg => {
    const start = new Date(reg.startTime);
    const end = reg.endTime ? new Date(reg.endTime) : new Date(start.getTime() + 2 * 3600 * 1000);
    let title = reg.eventTitle;
    if (reg.checkedInAt) title = `✅ ${title}`;
    else if (reg.eventStatus === 'CLOSED') title = `🔒 ${title}`;
    return {
      id: reg.eventId,
      title,
      start,
      end,
      resource: reg
    };
  });

  const formatDay = (iso) => iso ? new Date(iso).getDate() : '--';
  const formatMonth = (iso) => iso ? `Tháng ${new Date(iso).getMonth() + 1}` : '--';
  const formatTime = (start, end) => {
    if (!start) return '08:00 - 11:30';
    const s = new Date(start).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const e = end ? new Date(end).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '';
    return e ? `${s} - ${e}` : s;
  };

  const renderTicketCard = (reg) => {
    const isQR = activeQR === reg.id;
    const isClosed = reg.eventStatus === 'CLOSED';
    const isCheckedIn = reg.checkedInAt != null;

    return (
      <div className="registered-event-card" key={reg.id} style={{ border: '1px solid var(--edu-border)', borderRadius: '12px', padding: '16px', marginBottom: '16px', display: 'flex', gap: '16px', background: isClosed ? '#f8fafc' : '#fff', opacity: isClosed ? 0.8 : 1 }}>
        <div className="stu-time blue" style={{ width: '70px', height: '70px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: isClosed ? '#94a3b8' : undefined }}>
          <strong style={{ fontSize: '20px' }}>{formatDay(reg.startTime)}</strong>
          <span style={{ fontSize: '12px' }}>{formatMonth(reg.startTime)}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
            <Link 
              to={`/explore/${reg.eventId}`} 
              style={{ fontSize: '16.5px', fontWeight: 800, color: 'var(--edu-text)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', lineHeight: 1.3 }}
              title="Nhấp để xem trang chi tiết sự kiện này"
            >
              {reg.eventTitle} <span style={{ fontSize: '12px', color: 'var(--edu-primary)' }}>↗</span>
            </Link>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: '12px', fontWeight: 800, background: '#fef3c7', color: '#d97706', padding: '3px 10px', borderRadius: '12px', border: '1px solid #fde68a' }}>
                +{reg.trainingPoints || 0} ĐRL
              </span>
              {isCheckedIn ? (
                <span className="badge-status green" style={{ fontSize: '11px', padding: '3px 8px' }}>Đã điểm danh</span>
              ) : isClosed ? (
                <span style={{ fontSize: '11px', padding: '3px 8px', background: '#e2e8f0', color: '#475569', borderRadius: '4px', fontWeight: 700 }}>Đã đóng</span>
              ) : (
                <span className="badge-status green" style={{ fontSize: '11px', padding: '3px 8px' }}>Hợp lệ</span>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', fontSize: '13px', color: 'var(--edu-text-muted)', marginBottom: '10px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Clock size={14} color="#3b82f6"/> {formatTime(reg.startTime, reg.endTime)}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <MapPin size={14} color="#ef4444"/> {reg.location || 'PTIT Campus'}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Building2 size={14} color="#8b5cf6"/> {reg.organizerName || 'Đoàn Thanh Niên PTIT'}
            </span>
          </div>

          {reg.description && (
            <div style={{ background: 'var(--edu-bg-soft, #f8fafc)', padding: '8px 12px', borderRadius: '8px', fontSize: '12.5px', color: 'var(--edu-text-muted)', marginBottom: '12px', borderLeft: '3px solid #3b82f6', lineHeight: 1.5 }}>
              <strong style={{ color: 'var(--edu-text)' }}>Ghi chú BTC: </strong>
              {reg.description.length > 130 ? reg.description.slice(0, 130) + '...' : reg.description}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', paddingTop: '12px', borderTop: '1px dashed var(--edu-border)' }}>
            <span style={{ fontSize: '12px', color: isClosed ? '#64748b' : '#f59e0b', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}>
              <AlertTriangle size={14}/> {isClosed ? 'Sự kiện đã kết thúc' : isCheckedIn ? 'Đã hoàn tất điểm danh' : 'Mở quầy Check-in trước 30 phút'}
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Link to={`/explore/${reg.eventId}`} className="edu-btn-outline btn-sm" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Info size={14}/> Chi tiết
              </Link>
              {!isClosed && !isCheckedIn && (
                <>
                  <button className="edu-btn-primary btn-sm" onClick={() => setActiveQR(isQR ? null : reg.id)}>
                    <QrCode size={14}/> {isQR ? 'Đóng vé QR' : 'Xuất vé QR'}
                  </button>
                  <button 
                    className="edu-btn-outline btn-sm" 
                    style={{ color: '#ef4444', borderColor: '#fca5a5' }}
                    onClick={() => handleCancel(reg.eventId, reg.id)}
                    disabled={actionLoading === reg.id}
                  >
                    {actionLoading === reg.id ? '...' : 'Hủy vé'}
                  </button>
                </>
              )}
            </div>
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
  };

  return (
    <div className="stu-page">
      {/* 1. Header & Thống kê tổng quan gộp gọn lên cao */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 4px 0', color: '#1e293b' }}>Quản lý Đăng ký & Hoạt động</h2>
          <p style={{ margin: 0, fontSize: '13.5px', color: '#64748b' }}>Theo dõi lịch trình ngoại khóa và tiến độ điểm rèn luyện học kỳ này.</p>
        </div>
        <Link to="/explore" className="edu-btn-primary btn-sm" style={{ textDecoration: 'none', display: 'inline-flex' }}>+ Đăng ký sự kiện mới</Link>
      </div>

      {/* Thống kê nhanh gọn */}
      <div className="stu-stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '24px', gap: '16px' }}>
        <div className="stu-stat-box" style={{ padding: '16px' }}>
          <h2 style={{ color: 'var(--edu-primary)', fontSize: '26px', margin: '0 0 4px 0' }}>{loading ? '-' : upcomingRegs.length}</h2>
          <p style={{ margin: 0, fontSize: '13px' }}>Sự kiện sắp tới</p>
        </div>
        <div className="stu-stat-box" style={{ padding: '16px' }}>
          <h2 style={{ color: 'var(--edu-green)', fontSize: '26px', margin: '0 0 4px 0' }}>{loading ? '-' : checkedInRegs.length}</h2>
          <p style={{ margin: 0, fontSize: '13px' }}>Đã tham gia</p>
        </div>
        <div className="stu-stat-box" style={{ padding: '16px' }}>
          <h2 style={{ color: '#f59e0b', fontSize: '26px', margin: '0 0 4px 0' }}>{loading ? '-' : totalPoints}</h2>
          <p style={{ margin: 0, fontSize: '13px' }}>Tổng điểm rèn luyện</p>
        </div>
        <div className="stu-stat-box" style={{ padding: '16px' }}>
          <h2 style={{ color: '#8b5cf6', fontSize: '24px', margin: '0 0 4px 0' }}>{totalPoints >= 80 ? 'Xuất sắc' : totalPoints >= 65 ? 'Khá' : 'Đạt'}</h2>
          <p style={{ margin: 0, fontSize: '13px' }}>Xếp loại dự kiến</p>
        </div>
      </div>

      {/* 2. KHUNG LỊCH SỰ KIỆN TRẢI RỘNG TOÀN TRANG (FULL WIDTH) */}
      <div className="stu-card" style={{ marginBottom: '24px' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--edu-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b' }}>
              🗓️ Lịch Thời Khóa Biểu Ngoại Khóa
            </h3>
          </div>
          <div style={{ display: 'flex', gap: '14px', fontSize: '12.5px', fontWeight: 600 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ width: 10, height: 10, borderRadius: 2, background: '#2563eb' }}></span> Sắp diễn ra</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ width: 10, height: 10, borderRadius: 2, background: '#10b981' }}></span> Đã điểm danh</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ width: 10, height: 10, borderRadius: 2, background: '#64748b' }}></span> Đã kết thúc</span>
          </div>
        </div>
        <div className="stu-card-body" style={{ padding: '16px 20px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '30px 0' }}><Loader2 size={28} style={{ color: '#2563eb', animation: 'spin 1s linear infinite', margin: '0 auto' }} /></div>
          ) : (
            <div style={{ height: '370px' }}>
              <BigCalendar
                localizer={localizer}
                events={calendarEvents}
                startAccessor="start"
                endAccessor="end"
                culture="vi"
                messages={{
                  next: "Tiếp",
                  previous: "Trước",
                  today: "Hôm nay",
                  month: "Tháng",
                  week: "Tuần",
                  day: "Ngày",
                  agenda: "Lịch trình",
                  noEventsInRange: "Bạn không có sự kiện đăng ký nào trong khoảng thời gian này.",
                }}
                onSelectEvent={(event) => navigate(`/explore/${event.id}`)}
                eventPropGetter={(event) => {
                  let backgroundColor = '#2563eb';
                  if (event.resource.checkedInAt) backgroundColor = '#10b981';
                  else if (event.resource.eventStatus === 'CLOSED') backgroundColor = '#64748b';
                  return { style: { backgroundColor, borderRadius: '5px', border: 'none', opacity: 0.95, fontSize: '12px', fontWeight: '600', color: '#fff', cursor: 'pointer', padding: '1px 6px' } };
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* 3. KHUNG 2 CỘT SONG SONG: DANH SÁCH VÉ (TRÁI) & TIẾN ĐỘ + LỊCH SỬ (PHẢI) */}
      <div className="stu-grid-top" style={{ alignItems: 'flex-start' }}>
        
        {/* Cột trái: Khung vé 3 tab lọc */}
        <div className="stu-col-left">
          <div className="stu-card" style={{ marginBottom: '24px' }}>
            
            {/* Tiêu đề & Thanh Tab tiêu chí tìm kiếm */}
            <div style={{ padding: '20px 20px 0', borderBottom: '1px solid var(--edu-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b' }}>
                  <Calendar size={20} color="#2563eb" /> Danh sách Vé & Sự kiện đã đăng ký
                </h3>
              </div>

              {/* TABS LỌC TIÊU CHÍ */}
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '16px' }}>
                <button 
                  onClick={() => setActiveTab('today')}
                  style={{ 
                    padding: '8px 14px', borderRadius: '8px', border: activeTab === 'today' ? '1px solid #3b82f6' : '1px solid #e2e8f0',
                    background: activeTab === 'today' ? '#eff6ff' : '#fff', color: activeTab === 'today' ? '#2563eb' : '#64748b',
                    fontWeight: 700, fontSize: '13.5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap'
                  }}
                >
                  <Clock size={15} /> Hôm nay ({todayRegs.length})
                </button>
                <button 
                  onClick={() => setActiveTab('active')}
                  style={{ 
                    padding: '8px 14px', borderRadius: '8px', border: activeTab === 'active' ? '1px solid #10b981' : '1px solid #e2e8f0',
                    background: activeTab === 'active' ? '#ecfdf5' : '#fff', color: activeTab === 'active' ? '#059669' : '#64748b',
                    fontWeight: 700, fontSize: '13.5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap'
                  }}
                >
                  <Calendar size={15} /> Đã đăng ký ({activeRegs.length})
                </button>
                <button 
                  onClick={() => setActiveTab('closed')}
                  style={{ 
                    padding: '8px 14px', borderRadius: '8px', border: activeTab === 'closed' ? '1px solid #64748b' : '1px solid #e2e8f0',
                    background: activeTab === 'closed' ? '#f1f5f9' : '#fff', color: activeTab === 'closed' ? '#334155' : '#64748b',
                    fontWeight: 700, fontSize: '13.5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap'
                  }}
                >
                  <CheckCircle size={15} /> Đã đóng & Hoàn tất ({closedRegs.length})
                </button>
              </div>
            </div>

            {/* Nội dung danh sách theo Tab */}
            <div className="stu-card-body" style={{ padding: '20px' }}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}><Loader2 size={32} style={{ color: '#2563eb', animation: 'spin 1s linear infinite', margin: '0 auto' }} /></div>
              ) : activeTab === 'today' ? (
                todayRegs.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '36px 16px', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                    <Clock size={36} color="#94a3b8" style={{ margin: '0 auto 10px' }} />
                    <h4 style={{ color: '#334155', margin: '0 0 6px 0' }}>Không có sự kiện nào diễn ra hôm nay</h4>
                    <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>Nhấp sang tab "Đã đăng ký" để xem các sự kiện sắp tới.</p>
                  </div>
                ) : todayRegs.map(reg => renderTicketCard(reg))
              ) : activeTab === 'active' ? (
                activeRegs.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '36px 16px', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                    <Calendar size={36} color="#94a3b8" style={{ margin: '0 auto 10px' }} />
                    <h4 style={{ color: '#334155', margin: '0 0 6px 0' }}>Chưa có sự kiện nào sắp diễn ra</h4>
                    <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 16px 0' }}>Khám phá các sự kiện hấp dẫn đang mở đăng ký ngay hôm nay.</p>
                    <Link to="/explore" className="edu-btn-primary btn-sm" style={{ textDecoration: 'none', display: 'inline-flex' }}>Xem danh sách sự kiện</Link>
                  </div>
                ) : activeRegs.map(reg => renderTicketCard(reg))
              ) : (
                closedRegs.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '36px 16px', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                    <CheckCircle size={36} color="#94a3b8" style={{ margin: '0 auto 10px' }} />
                    <h4 style={{ color: '#334155', margin: '0 0 6px 0' }}>Danh sách trống</h4>
                    <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>Chưa có sự kiện nào chuyển sang trạng thái đã đóng hay hoàn tất điểm danh.</p>
                  </div>
                ) : closedRegs.map(reg => renderTicketCard(reg))
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
                    <Link 
                      to={`/explore/${reg.eventId}`} 
                      className="stu-task-item" 
                      key={reg.id}
                      style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '12px', transition: 'background 0.2s', padding: '10px', borderRadius: '8px', cursor: 'pointer' }}
                      onMouseOver={e => e.currentTarget.style.background = '#f1f5f9'}
                      onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                      title="Nhấp để đi đến trang sự kiện"
                    >
                      <div className="stu-task-dot" style={{ background: '#10b981', boxShadow: '0 0 0 3px #d1fae5' }}></div>
                      <div className="stu-task-info" style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ color: 'var(--edu-text)', fontSize: '14px', fontWeight: 700, margin: '0 0 4px 0' }}>{reg.eventTitle} <span style={{ fontSize: '11px', color: '#2563eb' }}>↗</span></h4>
                        <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Đã Check-in &bull; {reg.checkedInAt ? new Date(reg.checkedInAt).toLocaleDateString('vi-VN') : 'Gần đây'}</p>
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: '#10b981' }}>+{reg.trainingPoints || 0} ĐRL</span>
                    </Link>
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
