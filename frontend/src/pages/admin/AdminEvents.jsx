import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Plus, Edit, Trash2, Users, MoreHorizontal, X, Loader2 } from 'lucide-react';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { vi } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { adminEventService } from '../../services/adminEventService';

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

const AdminEvents = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Form tạo sự kiện
  const [draftTitle, setDraftTitle] = useState('');
  const [draftStartTime, setDraftStartTime] = useState('');
  const [draftEndTime, setDraftEndTime] = useState('');
  const [draftLocation, setDraftLocation] = useState('');
  const [draftCapacity, setDraftCapacity] = useState(100);
  const [draftTrainingPoints, setDraftTrainingPoints] = useState(0);
  const [draftDescription, setDraftDescription] = useState('');
  const [draftStatus, setDraftStatus] = useState('DRAFT');

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const data = await adminEventService.getAllEvents();
      setEvents(data);
    } catch (error) {
      console.error("Lỗi tải sự kiện:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreateDraft = async () => {
    if (!draftTitle || !draftStartTime || !draftEndTime) return alert('Vui lòng nhập Tên sự kiện, Ngày bắt đầu và Kết thúc!');
    try {
      setIsCreating(true);
      const newEvent = {
        title: draftTitle,
        location: draftLocation,
        startTime: draftStartTime,
        endTime: draftEndTime,
        capacity: draftCapacity || 0,
        trainingPoints: draftTrainingPoints || 0,
        description: draftDescription,
        status: draftStatus
      };
      const created = await adminEventService.createEvent(newEvent);
      setShowCreateModal(false);
      navigate(`/admin/events/${created.id}`);
    } catch (error) {
      console.error("Lỗi tạo sự kiện:", error);
      alert("Tạo sự kiện thất bại!");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteEvent = async (id, title) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa sự kiện "${title}" không? Hành động này sẽ xóa cả người đăng ký.`)) {
      try {
        await adminEventService.deleteEvent(id);
        fetchEvents(); // Tải lại danh sách sau khi xóa
      } catch (error) {
        console.error("Lỗi xóa sự kiện:", error);
        alert("Không thể xóa sự kiện này!");
      }
    }
  };

  const formatTargetStr = (targets) => {
    if (!targets || targets.length === 0) return 'Tất cả';
    return targets.map(t => `${t.batch || 'Mọi khóa'} - ${t.major || 'Mọi ngành'}`).join(', ');
  };

  const parseEventDate = (dateVal, fallbackDate) => {
    if (!dateVal) {
      if (fallbackDate) {
        const d = new Date(fallbackDate);
        d.setHours(d.getHours() + 1); // Mặc định kết thúc sau 1 tiếng
        return d;
      }
      return new Date();
    }
    // Handle Spring Boot array format: [YYYY, MM, DD, HH, mm]
    if (Array.isArray(dateVal)) {
      const [year, month, day, hour = 0, minute = 0, second = 0] = dateVal;
      return new Date(year, month - 1, day, hour, minute, second);
    }
    return new Date(dateVal);
  };

  // Chuẩn bị dữ liệu cho Lịch
  const calendarEvents = events.map(event => {
    const startDate = parseEventDate(event.startTime);
    const endDate = parseEventDate(event.endTime, startDate);
    
    return {
      id: event.id,
      title: event.title,
      start: startDate,
      end: endDate,
      resource: event,
    };
  });

  // Lọc sự kiện dựa trên tìm kiếm và trạng thái
  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="admin-events-page">
      <section className="admin-page-header">
        <div>
          <p>Quản lý</p>
          <h1>Danh sách sự kiện</h1>
        </div>
        <button className="admin-primary-action" type="button" onClick={() => setShowCreateModal(true)}>
          <Plus size={18} style={{ marginRight: '8px' }} />
          Tạo sự kiện
        </button>
      </section>

      {/* LỊCH SỰ KIỆN */}
      <section className="admin-panel" style={{ marginTop: '24px', padding: '20px', overflow: 'hidden' }}>
        <h2 style={{ fontSize: '16px', marginBottom: '16px', fontWeight: '600' }}>🗓️ Thời khóa biểu sự kiện</h2>
        <div style={{ height: '450px' }}>
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
              noEventsInRange: "Không có sự kiện nào trong khoảng thời gian này.",
            }}
            onSelectEvent={(event) => navigate(`/admin/events/${event.id}`)}
            eventPropGetter={(event) => {
              let backgroundColor = '#4f46e5'; // published
              if (event.resource.status === 'DRAFT') backgroundColor = '#38bdf8';
              if (event.resource.status === 'CLOSED') backgroundColor = '#10b981';
              return { style: { backgroundColor, borderRadius: '4px', border: 'none', opacity: 0.9, fontSize: '13px' } };
            }}
          />
        </div>
      </section>

      {/* DANH SÁCH SỰ KIỆN */}
      <section className="admin-panel" style={{ marginTop: '24px' }}>
        <div className="admin-panel-header compact" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '16px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          
          {/* Search bar */}
          <label className="admin-search" style={{ margin: 0, flex: 1, minWidth: '250px' }}>
            <Search size={18} />
            <input 
              placeholder="Tìm kiếm theo tên sự kiện..." 
              type="search" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </label>

          {/* Filters */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <div className="admin-segmented" style={{ margin: 0 }}>
              <button 
                className={statusFilter === 'ALL' ? 'active' : ''} 
                onClick={() => setStatusFilter('ALL')}
                type="button"
              >
                Tất cả
              </button>
              <button 
                className={statusFilter === 'PUBLISHED' ? 'active' : ''} 
                onClick={() => setStatusFilter('PUBLISHED')}
                type="button"
              >
                Đang mở
              </button>
              <button 
                className={statusFilter === 'DRAFT' ? 'active' : ''} 
                onClick={() => setStatusFilter('DRAFT')}
                type="button"
              >
                Bản nháp
              </button>
              <button 
                className={statusFilter === 'CLOSED' ? 'active' : ''} 
                onClick={() => setStatusFilter('CLOSED')}
                type="button"
              >
                Đã đóng
              </button>
            </div>
            
            <button className="admin-filter-button" type="button" title="Bộ lọc nâng cao">
              <Filter size={18} />
            </button>
          </div>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tên sự kiện</th>
                <th>Thời gian & Địa điểm</th>
                <th>Đối tượng</th>
                <th>Trạng thái</th>
                <th>Đăng ký</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
                    <Loader2 size={24} className="spin" style={{ margin: '0 auto 10px', display: 'block' }} />
                    Đang tải danh sách sự kiện...
                  </td>
                </tr>
              ) : filteredEvents.length > 0 ? (
                filteredEvents.map((event) => {
                  const startDate = parseEventDate(event.startTime);
                  const endDate = parseEventDate(event.endTime, startDate);
                  
                  return (
                  <tr 
                    key={event.id} 
                    onClick={() => navigate(`/admin/events/${event.id}`)}
                    style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td>
                      <strong>{event.title}</strong>
                    </td>
                    <td>
                      <div style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{format(startDate, 'dd/MM/yyyy')}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {format(startDate, 'HH:mm')} - {format(endDate, 'HH:mm')} • {event.location || 'Chưa cập nhật'}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '13px', background: 'var(--bg-secondary)', padding: '4px 8px', borderRadius: '6px' }}>
                        {formatTargetStr(event.targets)}
                      </span>
                    </td>
                    <td>
                      <span className={`admin-status-badge ${event.status.toLowerCase()}`}>
                        {event.status === 'PUBLISHED' ? 'Đang mở' : event.status === 'DRAFT' ? 'Bản nháp' : 'Đã đóng'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Users size={14} color="var(--text-secondary)" />
                        <span style={{ fontSize: '14px', fontWeight: '500' }}>
                          {event.totalRegistrations} <span style={{ color: 'var(--text-secondary)', fontWeight: '400' }}>/ {event.capacity}</span>
                        </span>
                      </div>
                      {/* Thanh tiến trình mini */}
                      <div style={{ width: '100%', height: '4px', background: 'var(--bg-secondary)', borderRadius: '2px', marginTop: '4px', overflow: 'hidden' }}>
                        <div 
                          style={{ 
                            height: '100%', 
                            background: event.totalRegistrations >= event.capacity ? 'var(--danger-color)' : 'var(--primary-color)', 
                            width: `${Math.min((event.totalRegistrations / event.capacity) * 100, 100)}%` 
                          }}
                        ></div>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button 
                          className="admin-icon-button" 
                          type="button" 
                          title="Chỉnh sửa chi tiết & Điểm danh"
                          onClick={(e) => {
                            e.stopPropagation(); // Ngăn sự kiện click của tr
                            navigate(`/admin/events/${event.id}`);
                          }}
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          className="admin-icon-button" 
                          type="button" 
                          title="Xóa"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteEvent(event.id, event.title);
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                        <button 
                          className="admin-icon-button" 
                          type="button" 
                          title="Thêm thao tác"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )})
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
                    Không tìm thấy sự kiện nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* MODAL TẠO SỰ KIỆN MỚI */}
      {showCreateModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#ffffff', width: '100%', maxWidth: '540px', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', overflow: 'hidden', animation: 'scaleUp 0.2s ease-out' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #dde5ef', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>Tạo sự kiện mới</h2>
                <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Khởi tạo sự kiện vào hệ thống</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '65vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontWeight: '600', fontSize: '14px', color: '#334155' }}>Tên sự kiện <span style={{ color: '#ef4444' }}>*</span></label>
                <input type="text" value={draftTitle} onChange={e => setDraftTitle(e.target.value)} placeholder="Nhập tên sự kiện..." style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px', color: '#0f172a' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontWeight: '600', fontSize: '14px', color: '#334155' }}>Bắt đầu <span style={{ color: '#ef4444' }}>*</span></label>
                  <input type="datetime-local" value={draftStartTime} onChange={e => setDraftStartTime(e.target.value)} style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px', color: '#0f172a' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontWeight: '600', fontSize: '14px', color: '#334155' }}>Kết thúc <span style={{ color: '#ef4444' }}>*</span></label>
                  <input type="datetime-local" value={draftEndTime} onChange={e => setDraftEndTime(e.target.value)} style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px', color: '#0f172a' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', gridColumn: 'span 2' }}>
                  <label style={{ fontWeight: '600', fontSize: '14px', color: '#334155' }}>Địa điểm</label>
                  <input type="text" value={draftLocation} onChange={e => setDraftLocation(e.target.value)} placeholder="VD: Hội trường A" style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px', color: '#0f172a' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontWeight: '600', fontSize: '14px', color: '#334155' }}>Số lượng</label>
                  <input type="number" value={draftCapacity} onChange={e => setDraftCapacity(parseInt(e.target.value))} style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px', color: '#0f172a' }} />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontWeight: '600', fontSize: '14px', color: '#334155' }}>Mô tả ngắn</label>
                <textarea rows="3" value={draftDescription} onChange={e => setDraftDescription(e.target.value)} placeholder="Tóm tắt sự kiện..." style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px', color: '#0f172a', resize: 'vertical' }}></textarea>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontWeight: '600', fontSize: '14px', color: '#334155' }}>Điểm rèn luyện</label>
                  <input type="number" value={draftTrainingPoints} onChange={e => setDraftTrainingPoints(parseInt(e.target.value))} style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px', color: '#0f172a' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontWeight: '600', fontSize: '14px', color: '#334155' }}>Trạng thái lưu</label>
                  <select value={draftStatus} onChange={e => setDraftStatus(e.target.value)} style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px', color: '#0f172a', backgroundColor: '#fff' }}>
                    <option value="DRAFT">Lưu nháp (DRAFT)</option>
                    <option value="PUBLISHED">Mở đăng ký ngay (PUBLISHED)</option>
                  </select>
                </div>
              </div>
            </div>

            <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowCreateModal(false)} 
                style={{ background: '#ffffff', color: '#475569', border: '1px solid #cbd5e1', fontWeight: '600', padding: '10px 20px', borderRadius: '8px' }}
              >
                Hủy bỏ
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleCreateDraft} 
                disabled={isCreating}
                style={{ background: 'var(--primary-color)', color: '#fff', border: 'none', fontWeight: '600', padding: '10px 24px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(79, 70, 229, 0.2)', opacity: isCreating ? 0.7 : 1 }}
              >
                {isCreating ? 'Đang tạo...' : (draftStatus === 'PUBLISHED' ? 'Tạo & Mở đăng ký' : 'Tạo Bản nháp')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEvents;
