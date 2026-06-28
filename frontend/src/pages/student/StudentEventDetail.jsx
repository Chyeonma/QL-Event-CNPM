import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, MapPin, Users, Award, Clock, ArrowLeft, 
  CheckCircle2, AlertCircle, ChevronLeft, ChevronRight, Share2, Sparkles, Target, Loader2, Lock,
  Shield, Search, UserCheck, UserX
} from 'lucide-react';
import { publicEventService } from '../../services/publicEventService';

const StudentEventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  const [registrations, setRegistrations] = useState([]);
  const [searchReg, setSearchReg] = useState('');
  const [activeTab, setActiveTab] = useState('info'); // 'info' | 'management'

  const fetchDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await publicEventService.getEventDetail(id);
      setEvent(data);
      if (data?.isManager) {
        fetchManagerRegistrations();
      }
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || err?.message || 'Không thể tải chi tiết sự kiện');
    } finally {
      setLoading(false);
    }
  };

  const fetchManagerRegistrations = async () => {
    try {
      const data = await publicEventService.getEventRegistrationsForManager(id);
      setRegistrations(data || []);
    } catch (err) {
      console.error("Lỗi tải danh sách cho manager:", err);
    }
  };

  const handleManualCheckIn = async (regId) => {
    try {
      await publicEventService.manualCheckInForManager(regId);
      fetchManagerRegistrations();
      fetchDetail();
    } catch (err) {
      alert(err?.response?.data?.message || err?.message || 'Lỗi điểm danh');
    }
  };

  const handleCancelCheckIn = async (regId) => {
    try {
      await publicEventService.cancelCheckInForManager(regId);
      fetchManagerRegistrations();
      fetchDetail();
    } catch (err) {
      alert(err?.response?.data?.message || err?.message || 'Lỗi hủy điểm danh');
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleRegister = async () => {
    try {
      setActionLoading(true);
      await publicEventService.registerEvent(id);
      alert('Đăng ký tham gia sự kiện thành công!');
      fetchDetail();
    } catch (err) {
      alert(err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi đăng ký');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đăng ký tham gia sự kiện này?')) return;
    try {
      setActionLoading(true);
      await publicEventService.cancelRegistration(id);
      alert('Đã hủy đăng ký sự kiện.');
      fetchDetail();
    } catch (err) {
      alert(err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi hủy đăng ký');
    } finally {
      setActionLoading(false);
    }
  };

  const formatFullDate = (isoString) => {
    if (!isoString) return 'Chưa xác định';
    const d = new Date(isoString);
    return d.toLocaleDateString('vi-VN', { 
      weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' 
    }) + ' - ' + d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const filteredRegs = registrations.filter(r => 
    (r.fullName || '').toLowerCase().includes(searchReg.toLowerCase()) ||
    (r.studentCode || '').toLowerCase().includes(searchReg.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <Loader2 size={44} className="spin" style={{ color: 'var(--edu-primary)' }} />
        <p style={{ marginTop: '16px', color: '#64748b', fontWeight: '500', fontSize: '15px' }}>Đang tải dữ liệu chi tiết chương trình...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div style={{ padding: '60px 24px', textAlign: 'center', maxWidth: '600px', margin: '40px auto' }}>
        <AlertCircle size={64} color="#ef4444" style={{ margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>Không tìm thấy sự kiện</h2>
        <p style={{ color: '#64748b', marginBottom: '24px' }}>{error || 'Sự kiện này có thể đã bị xóa hoặc chưa được công bố.'}</p>
        <button 
          onClick={() => navigate('/explore')}
          className="edu-btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px' }}
        >
          <ArrowLeft size={18} /> Quay lại Khám phá
        </button>
      </div>
    );
  }

  // Danh sách hình ảnh minh họa
  const images = (event.images && event.images.length > 0)
    ? event.images.map(img => img.imageUrl)
    : ['https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'];

  const progressPercent = Math.min(100, Math.round(((event.registeredCount || 0) / (event.capacity || 1)) * 100));
  const isFull = (event.registeredCount || 0) >= (event.capacity || 100);
  const isClosed = event.status === 'CLOSED';

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '80px' }}>
      
      {/* 1. TOP NAV BAR */}
      <div style={{ background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid #e2e8f0', padding: '16px 32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button 
            onClick={() => navigate('/explore')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', color: '#334155', fontWeight: '600', fontSize: '15px', cursor: 'pointer', padding: '8px 12px', borderRadius: '8px', transition: '0.2s' }}
            onMouseOver={e => e.currentTarget.style.background = '#f1f5f9'}
            onMouseOut={e => e.currentTarget.style.background = 'transparent'}
          >
            <ArrowLeft size={18} /> Khám phá sự kiện
          </button>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>Chia sẻ chương trình</span>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('Đã sao chép liên kết sự kiện!');
              }}
              style={{ background: '#fff', border: '1px solid #cbd5e1', padding: '8px', borderRadius: '8px', cursor: 'pointer', color: '#475569', display: 'flex', alignItems: 'center' }}
              title="Sao chép liên kết"
            >
              <Share2 size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. HERO IMAGE GALLERY / SLIDER */}
      <div style={{ maxWidth: '1200px', margin: '24px auto 0', padding: '0 24px' }}>
        <div style={{ position: 'relative', borderRadius: '24px', overflow: 'hidden', aspectRatio: '21/9', maxHeight: '480px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)', background: '#0f172a' }}>
          <img 
            src={images[currentImgIndex]} 
            alt="Event Banner" 
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 0.3s ease-in-out' }}
            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=1200&q=80'; }}
          />
          
          {/* Lớp mờ chuyển sắc bên dưới */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.85) 0%, rgba(15,23,42,0.2) 50%, transparent 100%)' }}></div>

          {/* Controls chuyển slide ảnh nếu có > 1 ảnh */}
          {images.length > 1 && (
            <>
              <button 
                onClick={() => setCurrentImgIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', color: 'white', border: 'none', borderRadius: '50%', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.2s' }}
              >
                <ChevronLeft size={24} />
              </button>
              <button 
                onClick={() => setCurrentImgIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', color: 'white', border: 'none', borderRadius: '50%', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.2s' }}
              >
                <ChevronRight size={24} />
              </button>

              {/* Thumbnails dots */}
              <div style={{ position: 'absolute', bottom: '20px', right: '24px', display: 'flex', gap: '8px' }}>
                {images.map((_, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setCurrentImgIndex(idx)}
                    style={{ width: currentImgIndex === idx ? '24px' : '8px', height: '8px', borderRadius: '4px', background: currentImgIndex === idx ? '#3b82f6' : 'rgba(255,255,255,0.5)', border: 'none', cursor: 'pointer', transition: 'all 0.3s' }}
                  ></button>
                ))}
              </div>
            </>
          )}

          {/* Badges nổi bật trên ảnh banner */}
          <div style={{ position: 'absolute', bottom: '24px', left: '28px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            <span style={{ background: 'var(--edu-primary)', color: 'white', padding: '6px 14px', borderRadius: '50px', fontSize: '13px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(37,99,235,0.4)' }}>
              <Sparkles size={14} /> +{event.trainingPoints || 5} Điểm rèn luyện
            </span>
            {isClosed ? (
              <span style={{ background: 'rgba(71, 85, 105, 0.9)', color: 'white', padding: '6px 14px', borderRadius: '50px', fontSize: '13px', fontWeight: '700', backdropFilter: 'blur(4px)', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <Lock size={13}/> Đã kết thúc
              </span>
            ) : (
              <span style={{ background: 'rgba(16, 185, 129, 0.9)', color: 'white', padding: '6px 14px', borderRadius: '50px', fontSize: '13px', fontWeight: '700', backdropFilter: 'blur(4px)' }}>
                Đang mở đăng ký
              </span>
            )}
            {event.location && (
              <span style={{ background: 'rgba(255, 255, 255, 0.25)', color: 'white', padding: '6px 14px', borderRadius: '50px', fontSize: '13px', fontWeight: '600', backdropFilter: 'blur(8px)' }}>
                {event.location}
              </span>
            )}
            {event.targets && event.targets.length > 0 ? (
              event.targets.map((tg, idx) => (
                <span key={idx} style={{ background: 'rgba(245, 158, 11, 0.9)', color: 'white', padding: '6px 14px', borderRadius: '50px', fontSize: '13px', fontWeight: '700', backdropFilter: 'blur(4px)', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <Target size={14} /> Đối tượng: Khóa {tg.batch || 'Tất cả'} - Ngành {tg.major || 'Tất cả'}
                </span>
              ))
            ) : (
              <span style={{ background: 'rgba(59, 130, 246, 0.85)', color: 'white', padding: '6px 14px', borderRadius: '50px', fontSize: '13px', fontWeight: '700', backdropFilter: 'blur(4px)', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <Target size={14} /> Đối tượng: Toàn trường
              </span>
            )}
          </div>
        </div>
      </div>

      {/* TABS DÀNH CHO MANAGER SỰ KIỆN */}
      {event.isManager && (
        <div style={{ maxWidth: '1200px', margin: '28px auto 0', padding: '0 24px' }}>
          <div style={{ display: 'flex', gap: '12px', borderBottom: '2px solid #e2e8f0', paddingBottom: '16px' }}>
            <button
              onClick={() => setActiveTab('info')}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '12px 24px', borderRadius: '12px', fontWeight: '700', fontSize: '15px', cursor: 'pointer',
                border: 'none', transition: '0.2s',
                background: activeTab === 'info' ? 'var(--edu-primary, #2563eb)' : '#f1f5f9',
                color: activeTab === 'info' ? '#ffffff' : '#475569',
                boxShadow: activeTab === 'info' ? '0 4px 12px rgba(37,99,235,0.3)' : 'none'
              }}
            >
              <Calendar size={18} /> Thông tin Sự kiện
            </button>
            <button
              onClick={() => setActiveTab('management')}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '12px 24px', borderRadius: '12px', fontWeight: '700', fontSize: '15px', cursor: 'pointer',
                border: 'none', transition: '0.2s',
                background: activeTab === 'management' ? 'var(--edu-primary, #2563eb)' : '#f1f5f9',
                color: activeTab === 'management' ? '#ffffff' : '#475569',
                boxShadow: activeTab === 'management' ? '0 4px 12px rgba(37,99,235,0.3)' : 'none'
              }}
            >
              <Shield size={18} /> Ban Tổ Chức & Quản lý Điểm danh
            </button>
          </div>
        </div>
      )}

      {/* 3. MAIN CONTENT LAYOUT (2 COLUMNS) */}
      {activeTab === 'info' && (
      <div style={{ maxWidth: '1200px', margin: '32px auto 0', padding: '0 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '32px', alignItems: 'start' }}>
        
        {/* CỘT TRÁI: THÔNG TIN CHI TIẾT GỘP CHUNG (65% width trên desktop) */}
        <div style={{ gridColumn: 'span 2 / auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
          
          {/* Khung sự kiện gộp nội dung chi tiết */}
          <div style={{ background: '#ffffff', padding: '32px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
            <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#0f172a', lineHeight: '1.3', marginBottom: '24px' }}>
              {event.title}
            </h1>

            {/* Khung thời gian & địa điểm nổi bật */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #f1f5f9', marginBottom: '32px' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{ background: '#eff6ff', padding: '12px', borderRadius: '12px', color: '#2563eb' }}>
                  <Calendar size={22} />
                </div>
                <div>
                  <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', display: 'block' }}>Thời gian bắt đầu</span>
                  <strong style={{ color: '#0f172a', fontSize: '15px', marginTop: '2px', display: 'block' }}>{formatFullDate(event.startTime)}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{ background: '#fef2f2', padding: '12px', borderRadius: '12px', color: '#dc2626' }}>
                  <Clock size={22} />
                </div>
                <div>
                  <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', display: 'block' }}>Thời gian kết thúc</span>
                  <strong style={{ color: '#0f172a', fontSize: '15px', marginTop: '2px', display: 'block' }}>{formatFullDate(event.endTime)}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{ background: '#ecfdf5', padding: '12px', borderRadius: '12px', color: '#059669' }}>
                  <MapPin size={22} />
                </div>
                <div>
                  <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', display: 'block' }}>Địa điểm tổ chức</span>
                  <strong style={{ color: '#0f172a', fontSize: '15px', marginTop: '2px', display: 'block' }}>{event.location || 'Hội trường khuôn viên PTIT'}</strong>
                </div>
              </div>
            </div>

            {/* Nội dung chi tiết chương trình */}
            <div style={{ borderTop: '2px solid #f1f5f9', paddingTop: '28px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', marginBottom: '20px' }}>
                Nội dung chi tiết chương trình
              </h3>
              
              <div style={{ fontSize: '15px', color: '#334155', lineHeight: '1.8', whiteSpace: 'pre-wrap', fontFamily: 'var(--font-sans, sans-serif)' }}>
                {event.description || 'Chương trình đang cập nhật nội dung chi tiết. Vui lòng quay lại sau.'}
              </div>
            </div>

          </div>
        </div>

        {/* CỘT PHẢI: STICKY REGISTRATION BOX (35% width) */}
        <div style={{ position: 'sticky', top: '88px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: '#ffffff', padding: '28px', borderRadius: '24px', border: '1px solid #cbd5e1', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '600' }}>Suất tham gia</span>
              <span style={{ fontSize: '14px', fontWeight: '800', color: isFull ? '#ef4444' : '#0f172a' }}>
                {event.registeredCount || 0} / {event.capacity || 100} chỗ
              </span>
            </div>

            {/* Progress bar */}
            <div style={{ width: '100%', height: '10px', background: '#e2e8f0', borderRadius: '6px', overflow: 'hidden', marginBottom: '24px' }}>
              <div 
                style={{ 
                  width: `${progressPercent}%`, height: '100%', 
                  background: isFull ? '#ef4444' : progressPercent > 80 ? '#f59e0b' : 'var(--edu-primary)', 
                  transition: 'width 0.5s ease' 
                }}
              ></div>
            </div>

            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '14px', border: '1px solid #f1f5f9' }}>
              <div style={{ background: '#eff6ff', padding: '10px', borderRadius: '12px', color: '#2563eb' }}>
                <Award size={24} />
              </div>
              <div>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Quyền lợi rèn luyện</span>
                <strong style={{ display: 'block', fontSize: '16px', color: '#1e40af' }}>+{event.trainingPoints || 5} Điểm rèn luyện</strong>
              </div>
            </div>

            {/* KHUNG NÚT ĐĂNG KÝ */}
            {isClosed ? (
              <div style={{ background: '#f1f5f9', border: '1px dashed #cbd5e1', color: '#475569', padding: '20px 16px', borderRadius: '16px', textAlign: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 800, fontSize: '15.5px', color: '#334155', marginBottom: '6px' }}>
                  <Lock size={18} color="#64748b" /> Sự kiện đã khép lại
                </span>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                  Thời hạn tiếp nhận đăng ký và điểm danh đã chính thức kết thúc. Hẹn gặp lại bạn ở các chương trình sau nhé!
                </p>
              </div>
            ) : event.isRegistered ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', padding: '14px', borderRadius: '12px', textAlign: 'center', fontWeight: '700', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <CheckCircle2 size={20} color="#10b981" /> Bạn đã đăng ký sự kiện này
                </div>
                <button 
                  onClick={handleCancel}
                  disabled={actionLoading}
                  style={{ width: '100%', padding: '12px', background: 'transparent', border: '1px solid #fca5a5', color: '#dc2626', borderRadius: '12px', fontWeight: '600', cursor: actionLoading ? 'not-allowed' : 'pointer', transition: '0.2s' }}
                  onMouseOver={e => !actionLoading && (e.currentTarget.style.background = '#fef2f2')}
                  onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
                >
                  {actionLoading ? 'Đang xử lý...' : 'Hủy đăng ký'}
                </button>
              </div>
            ) : isFull ? (
              <button 
                disabled
                style={{ width: '100%', padding: '16px', background: '#e2e8f0', color: '#94a3b8', border: 'none', borderRadius: '14px', fontSize: '16px', fontWeight: '700', cursor: 'not-allowed' }}
              >
                Sự kiện đã hết suất
              </button>
            ) : (
              <button 
                onClick={handleRegister}
                disabled={actionLoading}
                className="edu-btn-primary"
                style={{ 
                  width: '100%', padding: '16px', fontSize: '16px', fontWeight: '800', borderRadius: '14px',
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', color: '#fff', border: 'none',
                  boxShadow: '0 10px 20px -5px rgba(37,99,235,0.4)', cursor: actionLoading ? 'not-allowed' : 'pointer',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                }}
                onMouseOver={e => !actionLoading && (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseOut={e => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                {actionLoading ? 'ĐANG GỬI ĐĂNG KÝ...' : 'ĐĂNG KÝ THAM GIA NGAY'}
              </button>
            )}

            <p style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center', marginTop: '16px', lineHeight: '1.5' }}>
              {isClosed ? 'Danh sách điểm danh đã được hệ thống chốt.' : 'Mã QR điểm danh sẽ xuất hiện tại Trang cá nhân (Dashboard) sau khi đăng ký thành công.'}
            </p>
          </div>

          {/* Hỗ trợ sinh viên */}
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '16px', padding: '18px 20px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <AlertCircle size={20} color="#2563eb" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '13px', color: '#1e40af', lineHeight: '1.5' }}>
              <strong>Lưu ý:</strong> Vui lòng có mặt trước 15 phút và chuẩn bị mã QR trên ứng dụng EduCampus để nhân viên quét điểm danh.
            </div>
          </div>
        </div>

      </div>
      )}

      {/* KHU VỰC DÀNH CHO MANAGER SỰ KIỆN */}
      {event.isManager && activeTab === 'management' && (
        <div style={{ maxWidth: '1200px', margin: '32px auto 0', background: '#ffffff', borderRadius: '24px', border: '2px solid var(--edu-primary, #2563eb)', padding: '32px', boxShadow: '0 20px 25px -5px rgba(37,99,235,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '22px', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Shield size={26} color="var(--edu-primary, #2563eb)" /> Khu Vực Ban Tổ Chức & Quản Lý Sự Kiện
              </h3>
              <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
                Bạn được phân công quyền quản lý/CTV cho sự kiện này. Bạn có thể xem danh sách sinh viên đăng ký và thực hiện điểm danh thủ công tại đây.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ background: '#f1f5f9', padding: '8px 16px', borderRadius: '10px', fontSize: '14px', fontWeight: '600', color: '#334155' }}>
                Tổng đăng ký: <span style={{ color: '#0f172a' }}>{registrations.length}</span>
              </div>
              <div style={{ background: '#ecfdf5', padding: '8px 16px', borderRadius: '10px', fontSize: '14px', fontWeight: '600', color: '#065f46' }}>
                Đã điểm danh: <span style={{ color: '#10b981' }}>{registrations.filter(r => r.checkedInAt).length}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ position: 'relative', width: '350px' }}>
              <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="search"
                placeholder="Tìm theo Tên hoặc Mã sinh viên..."
                value={searchReg}
                onChange={(e) => setSearchReg(e.target.value)}
                style={{ width: '100%', padding: '10px 14px 10px 42px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
              />
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                  <th style={{ padding: '12px 16px', fontWeight: '600' }}>STT</th>
                  <th style={{ padding: '12px 16px', fontWeight: '600' }}>Sinh viên</th>
                  <th style={{ padding: '12px 16px', fontWeight: '600' }}>Lớp</th>
                  <th style={{ padding: '12px 16px', fontWeight: '600' }}>Thời gian đăng ký</th>
                  <th style={{ padding: '12px 16px', fontWeight: '600' }}>Trạng thái</th>
                  <th style={{ padding: '12px 16px', fontWeight: '600', textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredRegs.map((student, index) => (
                  <tr key={student.id} style={{ borderBottom: '1px solid #f1f5f9', opacity: student.status === 'CANCELLED' ? 0.5 : 1 }}>
                    <td style={{ padding: '14px 16px' }}>{index + 1}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: '600', color: '#0f172a' }}>{student.fullName}</div>
                      <div style={{ fontSize: '13px', color: '#64748b' }}>{student.studentCode}</div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>{student.classCode}</td>
                    <td style={{ padding: '14px 16px', color: '#64748b' }}>
                      {student.registeredAt ? new Date(student.registeredAt).toLocaleString('vi-VN') : ''}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {student.status === 'CANCELLED' ? (
                        <span style={{ color: '#ef4444', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <UserX size={16} /> Đã hủy suất
                        </span>
                      ) : student.checkedInAt ? (
                        <span style={{ color: '#10b981', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <UserCheck size={16} /> Đã điểm danh
                        </span>
                      ) : (
                        <span style={{ color: '#f59e0b', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={16} /> Chờ check-in
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      {student.status !== 'CANCELLED' && (
                        !student.checkedInAt ? (
                          <button
                            type="button"
                            onClick={() => handleManualCheckIn(student.id)}
                            style={{ background: 'var(--edu-primary, #2563eb)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', boxShadow: '0 2px 4px rgba(37,99,235,0.2)' }}
                          >
                            Điểm danh
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleCancelCheckIn(student.id)}
                            style={{ background: '#ffedd5', color: '#c2410c', border: '1px solid #fdba74', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
                          >
                            Hủy điểm danh
                          </button>
                        )
                      )}
                    </td>
                  </tr>
                ))}
                {filteredRegs.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                      Không tìm thấy sinh viên nào trong danh sách.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default StudentEventDetail;
