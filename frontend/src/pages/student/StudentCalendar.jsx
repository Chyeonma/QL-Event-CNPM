import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { vi } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { publicEventService } from '../../services/publicEventService';
import { Loader2, Calendar as CalIcon, ArrowLeft } from 'lucide-react';

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

const StudentCalendar = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRegs = async () => {
      try {
        setLoading(true);
        const data = await publicEventService.getMyRegistrations();
        const calEvents = (data || []).map(reg => {
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
        setEvents(calEvents);
      } catch (err) {
        console.error('Lỗi khi tải lịch:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRegs();
  }, []);

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <button 
            onClick={() => navigate('/dashboard')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontWeight: 600, marginBottom: '8px', padding: 0 }}
          >
            <ArrowLeft size={16} /> Quay lại Đăng ký
          </button>
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CalIcon color="#2563eb" /> Lịch sự kiện cá nhân
          </h2>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>Tổng hợp thời gian các sự kiện ngoại khóa bạn đã đăng ký tham gia</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', fontSize: '13px', fontWeight: 600 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: 12, height: 12, borderRadius: 3, background: '#2563eb' }}></span> Sắp diễn ra</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: 12, height: 12, borderRadius: 3, background: '#10b981' }}></span> Đã điểm danh</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: 12, height: 12, borderRadius: 3, background: '#64748b' }}></span> Đã kết thúc</span>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '500px' }}>
            <Loader2 size={36} style={{ color: '#2563eb', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : (
          <div style={{ height: '620px' }}>
            <BigCalendar
              localizer={localizer}
              events={events}
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
                let backgroundColor = '#2563eb'; // active
                if (event.resource.checkedInAt) backgroundColor = '#10b981';
                else if (event.resource.eventStatus === 'CLOSED') backgroundColor = '#64748b';
                return { 
                  style: { 
                    backgroundColor, 
                    borderRadius: '6px', 
                    border: 'none', 
                    opacity: 0.95, 
                    fontSize: '13px',
                    fontWeight: '600',
                    padding: '4px 8px',
                    cursor: 'pointer'
                  } 
                };
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentCalendar;
