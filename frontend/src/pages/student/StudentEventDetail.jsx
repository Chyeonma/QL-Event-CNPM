import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, MapPin, Users, Award, Clock, ArrowLeft, 
  CheckCircle2, AlertCircle, ChevronLeft, ChevronRight, Share2, Sparkles, Target, Loader2 
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

  const fetchDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await publicEventService.getEventDetail(id);
      setEvent(data);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || err?.message || 'Không thể tải chi tiết sự kiện');
    } finally {
      setLoading(false);
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
            <span style={{ background: 'rgba(16, 185, 129, 0.9)', color: 'white', padding: '6px 14px', borderRadius: '50px', fontSize: '13px', fontWeight: '700', backdropFilter: 'blur(4px)' }}>
              Đang mở đăng ký
            </span>
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

      {/* 3. MAIN CONTENT LAYOUT (2 COLUMNS) */}
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
            {event.isRegistered ? (
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
              Mã QR điểm danh sẽ xuất hiện tại Trang cá nhân (Dashboard) sau khi đăng ký thành công.
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

    </div>
  );
};

export default StudentEventDetail;
