import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, Search, Filter, ArrowRight, CheckCircle2, Loader2, Lock } from 'lucide-react';
import { publicEventService } from '../../services/publicEventService';

const ExploreEvents = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [actionLoading, setActionLoading] = useState(null); // eventId being registered/cancelled
  const [activeCategory, setActiveCategory] = useState('Tất cả');

  const categories = ['Tất cả', 'Văn hóa', 'Thể thao', 'Học thuật', 'Tình nguyện'];

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await publicEventService.getPublishedEvents(keyword);
      setEvents(data || []);
    } catch (err) {
      console.error('Lỗi khi tải sự kiện:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      fetchEvents();
    }
  };

  const handleRegister = async (eventId) => {
    try {
      setActionLoading(eventId);
      await publicEventService.registerEvent(eventId);
      alert('Đăng ký tham gia sự kiện thành công!');
      fetchEvents();
    } catch (err) {
      alert(err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi đăng ký');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (eventId) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đăng ký sự kiện này?')) return;
    try {
      setActionLoading(eventId);
      await publicEventService.cancelRegistration(eventId);
      alert('Đã hủy đăng ký sự kiện.');
      fetchEvents();
    } catch (err) {
      alert(err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi hủy đăng ký');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'Sắp diễn ra';
    const date = new Date(isoString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Lọc theo tab danh mục (Dựa vào từ khóa trong tiêu đề/mô tả)
  const filteredEvents = events.filter(ev => {
    if (activeCategory === 'Tất cả') return true;
    const text = `${ev.title} ${ev.description}`.toLowerCase();
    if (activeCategory === 'Văn hóa') return text.includes('văn hóa') || text.includes('nhạc') || text.includes('hội');
    if (activeCategory === 'Thể thao') return text.includes('thể thao') || text.includes('bóng') || text.includes('giải');
    if (activeCategory === 'Học thuật') return text.includes('học thuật') || text.includes('seminar') || text.includes('ai') || text.includes('thảo');
    if (activeCategory === 'Tình nguyện') return text.includes('tình nguyện') || text.includes('mùa hè') || text.includes('xanh');
    return true;
  });

  return (
    <div className="explore-page">
      <div className="explore-header">
        <h1>Khám phá <span className="edu-highlight">Sự kiện</span></h1>
        <p>Tìm kiếm và đăng ký tham gia các hoạt động ngoại khóa để rèn luyện kỹ năng và tích lũy điểm rèn luyện.</p>
      </div>

      {/* Thanh Tìm kiếm và Bộ lọc */}
      <div className="explore-filters">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Tìm kiếm tên sự kiện, địa điểm..." 
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={handleSearch}
          />
        </div>
        
        <div className="category-tabs">
          {categories.map(cat => (
            <button 
              key={cat} 
              className={`category-tab ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        
        <button className="filter-btn" onClick={fetchEvents}>
          <Filter size={18} /> Tìm kiếm
        </button>
      </div>

      {/* Danh sách Sự kiện */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Loader2 size={36} className="spin" style={{ color: 'var(--edu-primary)', margin: '0 auto' }} />
          <p style={{ marginTop: '12px', color: 'var(--edu-text-muted)' }}>Đang tải danh sách sự kiện...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="stu-card" style={{ textAlign: 'center', padding: '48px' }}>
          <h3>Không tìm thấy sự kiện phù hợp</h3>
          <p className="stu-text-muted">Thử thay đổi từ khóa tìm kiếm hoặc chọn danh mục khác nhé.</p>
        </div>
      ) : (
        <div className="explore-grid">
          {filteredEvents.map((ev, idx) => {
            const bgUrl = ev.images && ev.images.length > 0
              ? ev.images[0].imageUrl
              : `https://images.unsplash.com/photo-${1515187029135 + idx}-18ee286d815b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80`;
            const isClosed = ev.status === 'CLOSED';

            return (
              <div className="event-grid-card" key={ev.id} style={{ transition: 'transform 0.2s', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', opacity: isClosed ? 0.78 : 1 }}>
                <div 
                  className="event-card-img" 
                  onClick={() => navigate(`/explore/${ev.id}`)}
                  style={{ backgroundImage: `url('${bgUrl}')`, backgroundSize: 'cover', backgroundPosition: 'center', cursor: 'pointer', filter: isClosed ? 'grayscale(35%)' : 'none' }}
                >
                  <div className="event-badges">
                    <span className="badge-cat">{ev.location || 'PTIT Campus'}</span>
                    {isClosed ? (
                      <span style={{ fontSize: '11px', fontWeight: 700, background: '#475569', color: '#f8fafc', padding: '3px 10px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Lock size={12}/> Đã kết thúc
                      </span>
                    ) : (
                      <span className="badge-status green">Đang mở</span>
                    )}
                  </div>
                </div>
                <div className="event-card-body">
                  <h3 
                    onClick={() => navigate(`/explore/${ev.id}`)}
                    style={{ minHeight: '52px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', cursor: 'pointer', color: '#0f172a' }}
                    onMouseOver={e => e.currentTarget.style.color = 'var(--edu-primary)'}
                    onMouseOut={e => e.currentTarget.style.color = '#0f172a'}
                  >
                    {ev.title}
                  </h3>
                  <div className="event-meta-list">
                    <div className="meta-item"><Calendar size={14} /> {formatDate(ev.startTime)}</div>
                    <div className="meta-item"><MapPin size={14} /> {ev.location || 'Sân trường'}</div>
                    <div className="meta-item"><Users size={14} /> {ev.registeredCount || 0} / {ev.capacity || 100} Đã đăng ký</div>
                  </div>
                  <p className="event-desc" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '60px' }}>
                    {ev.description || 'Hoạt động dành cho sinh viên tham gia rèn luyện.'}
                  </p>
                  <div className="event-card-footer" style={{ borderTop: '1px solid var(--edu-border)', paddingTop: '16px', marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span className="event-dr-points" style={{ opacity: isClosed ? 0.7 : 1 }}>+{ev.trainingPoints ?? 0} ĐRL</span>
                      <button 
                        onClick={() => navigate(`/explore/${ev.id}`)}
                        style={{ background: 'transparent', border: 'none', color: '#3b82f6', fontSize: '12px', fontWeight: '600', padding: 0, cursor: 'pointer', textAlign: 'left', display: 'inline-flex', alignItems: 'center', gap: '2px' }}
                      >
                        Chi tiết <ArrowRight size={12} />
                      </button>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {isClosed ? (
                        <button 
                          style={{ background: '#e2e8f0', color: '#64748b', border: '1px solid #cbd5e1', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'not-allowed', display: 'flex', alignItems: 'center', gap: '4px' }}
                          disabled={true}
                        >
                          <Lock size={13}/> Đã khép lại
                        </button>
                      ) : ev.isRegistered ? (
                        <>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981', fontSize: '13px', fontWeight: 700 }}>
                            <CheckCircle2 size={16} /> Đã đăng ký
                          </span>
                          <button 
                            className="edu-btn-outline btn-sm" 
                            style={{ color: '#ef4444', borderColor: '#fca5a5', padding: '6px 12px', fontSize: '12px' }}
                            onClick={() => handleCancel(ev.id)}
                            disabled={actionLoading === ev.id}
                          >
                            {actionLoading === ev.id ? '...' : 'Hủy'}
                          </button>
                        </>
                      ) : (
                        <button 
                          className="edu-btn-primary btn-sm"
                          onClick={() => handleRegister(ev.id)}
                          disabled={actionLoading === ev.id || (ev.registeredCount >= ev.capacity)}
                        >
                          {actionLoading === ev.id ? 'Đang xử lý...' : ev.registeredCount >= ev.capacity ? 'Hết chỗ' : 'Đăng ký ngay'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ExploreEvents;
