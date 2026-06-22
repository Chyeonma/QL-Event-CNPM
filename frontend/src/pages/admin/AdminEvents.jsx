import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Plus, Edit, Trash2, Users, MoreHorizontal } from 'lucide-react';
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

const mockEvents = [
  {
    id: 1,
    title: 'Hội thảo Nghiên cứu Khoa học N23',
    location: 'Hội trường A1',
    status: 'PUBLISHED',
    date: '24/06/2026',
    time: '08:00 - 11:30',
    registrations: 95,
    capacity: 120,
    targets: 'N23 - CN',
  },
  {
    id: 2,
    title: 'Ngày hội An toàn thông tin',
    location: 'Sân D',
    status: 'DRAFT',
    date: '29/06/2026',
    time: '07:30 - 17:00',
    registrations: 0,
    capacity: 200,
    targets: 'Tất cả',
  },
  {
    id: 3,
    title: 'Giải bóng đá sinh viên',
    location: 'Sân bóng cỏ nhân tạo',
    status: 'CLOSED',
    date: '15/06/2026',
    time: '14:00 - 18:00',
    registrations: 48,
    capacity: 50,
    targets: 'N21, N22',
  },
  {
    id: 4,
    title: 'Talkshow Định hướng nghề nghiệp',
    location: 'Hội trường C2',
    status: 'PUBLISHED',
    date: '02/07/2026',
    time: '09:00 - 11:00',
    registrations: 144,
    capacity: 180,
    targets: 'N22 - AT, CT',
  },
  {
    id: 5,
    title: 'Workshop Kỹ năng mềm: Giao tiếp hiệu quả',
    location: 'Phòng chuyên đề 1',
    status: 'PUBLISHED',
    date: '10/07/2026',
    time: '13:30 - 16:30',
    registrations: 45,
    capacity: 60,
    targets: 'Tất cả',
  },
];

const AdminEvents = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Chuẩn bị dữ liệu cho Lịch
  const calendarEvents = mockEvents.map(event => {
    const [day, month, year] = event.date.split('/');
    let startHour = 8, startMin = 0, endHour = 12, endMin = 0;
    
    if (event.time) {
      const times = event.time.split(' - ');
      if (times.length === 2) {
        const startParts = times[0].split(':');
        const endParts = times[1].split(':');
        startHour = parseInt(startParts[0], 10);
        startMin = parseInt(startParts[1], 10);
        endHour = parseInt(endParts[0], 10);
        endMin = parseInt(endParts[1], 10);
      }
    }

    return {
      id: event.id,
      title: event.title,
      start: new Date(year, month - 1, day, startHour, startMin),
      end: new Date(year, month - 1, day, endHour, endMin),
      resource: event,
    };
  });

  // Lọc sự kiện dựa trên tìm kiếm và trạng thái
  const filteredEvents = mockEvents.filter((event) => {
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
        <button className="admin-primary-action" type="button">
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
              {filteredEvents.length > 0 ? (
                filteredEvents.map((event) => (
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
                      <div style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{event.date}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {event.time} • {event.location}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '13px', background: 'var(--bg-secondary)', padding: '4px 8px', borderRadius: '6px' }}>
                        {event.targets}
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
                          {event.registrations} <span style={{ color: 'var(--text-secondary)', fontWeight: '400' }}>/ {event.capacity}</span>
                        </span>
                      </div>
                      {/* Thanh tiến trình mini */}
                      <div style={{ width: '100%', height: '4px', background: 'var(--bg-secondary)', borderRadius: '2px', marginTop: '4px', overflow: 'hidden' }}>
                        <div 
                          style={{ 
                            height: '100%', 
                            background: event.registrations >= event.capacity ? 'var(--danger-color)' : 'var(--primary-color)', 
                            width: `${Math.min((event.registrations / event.capacity) * 100, 100)}%` 
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
                          onClick={(e) => e.stopPropagation()}
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
                ))
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
    </div>
  );
};

export default AdminEvents;
