import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminEventService } from '../../services/adminEventService';
import { adminUserService } from '../../services/adminUserService';
import { adminRegistrationService } from '../../services/adminRegistrationService';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  CalendarCheck,
  ClipboardCheck,
  TrendingDown,
  TrendingUp,
  UserRoundCheck,
  Users,
  Target,
  MapPin,
  Award
} from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [allRegs, setAllRegs] = useState([]);

  // Date range picker state
  const thirtyDaysAgoStr = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const todayStr = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(thirtyDaysAgoStr);
  const [endDate, setEndDate] = useState(todayStr);

  // Selected event for Pie Chart on right
  const [selectedEventId, setSelectedEventId] = useState(null);

  useEffect(() => {
    adminEventService.getAllEvents().then(list => {
      setEvents(list || []);
      if (list && list.length > 0) {
        setSelectedEventId(list[0].id);
      }
    }).catch(console.error);

    adminUserService.getUsersByRole('ALL').then(list => {
      setUsersList(list || []);
    }).catch(console.error);

    adminRegistrationService.getAllRegistrations().then(list => {
      setAllRegs(list || []);
    }).catch(console.error);
  }, []);

  // 1. Thẻ Thống kê Người dùng (Kích hoạt / Chưa kích hoạt)
  const activatedCount = usersList.filter(u => !u.requirePasswordChange && !u.isDeleted).length;
  const unactivatedCount = usersList.filter(u => u.requirePasswordChange || u.isDeleted).length;
  const usersDisplayValue = `${activatedCount} / ${unactivatedCount}`;

  // Thống kê sự kiện & đăng ký tổng
  const totalEventsCount = events.length;
  const totalRegsCount = events.reduce((sum, e) => sum + (e.totalRegistrations || 0), 0);
  const totalChecksCount = events.reduce((sum, e) => sum + (e.checkedInCount || 0), 0);

  const dynamicStats = [
    { label: 'Tổng sự kiện', value: totalEventsCount.toString(), change: 'Thực tế CSDL', trend: 'up', tone: 'indigo', icon: CalendarCheck },
    { label: 'Tài khoản (Đã kích hoạt / Chưa)', value: usersDisplayValue, change: 'Mọi vai trò', trend: 'up', tone: 'cyan', icon: Users },
    { label: 'Lượt đăng ký', value: totalRegsCount.toString(), change: 'Thực tế CSDL', trend: 'up', tone: 'emerald', icon: ClipboardCheck },
    { label: 'Đã điểm danh', value: totalChecksCount.toString(), change: 'Thực tế CSDL', trend: 'up', tone: 'rose', icon: UserRoundCheck },
  ];

  // 2. Dữ liệu biểu đồ AreaChart theo bộ lọc startDate & endDate
  const chartMap = {};
  if (startDate && endDate) {
    let curr = new Date(startDate);
    const end = new Date(endDate);
    while (curr <= end) {
      const dStr = curr.toISOString().split('T')[0];
      const displayDate = `${curr.getDate()}/${curr.getMonth()+1}`;
      chartMap[dStr] = { date: displayDate, registrations: 0, checkins: 0 };
      curr.setDate(curr.getDate() + 1);
    }
  }

  allRegs.forEach(r => {
    if (r.registeredAt) {
      const dStr = r.registeredAt.split('T')[0];
      if (chartMap[dStr]) chartMap[dStr].registrations += 1;
    }
    if (r.checkedInAt) {
      const cStr = r.checkedInAt.split('T')[0];
      if (chartMap[cStr]) chartMap[cStr].checkins += 1;
    }
  });

  const dynamicRegistrationData = Object.keys(chartMap).sort().map(k => chartMap[k]);

  // 3. Dữ liệu biểu đồ tuần này (Thứ 2 - CN)
  const now = new Date();
  const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1; // Mon=0 ... Sun=6
  const monday = new Date(now);
  monday.setDate(now.getDate() - dayOfWeek);
  monday.setHours(0,0,0,0);

  const weekDaysLabels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  const dynamicWeeklyData = weekDaysLabels.map((dayLabel, idx) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + idx);
    const dStr = d.toISOString().split('T')[0];

    const evsOnDay = events.filter(e => e.startTime && e.startTime.startsWith(dStr));
    const evCount = evsOnDay.length;
    const regCount = evsOnDay.reduce((sum, e) => sum + (e.totalRegistrations || 0), 0);

    return { day: dayLabel, events: evCount, registrations: regCount };
  });

  // 4. Bảng Sự kiện gần đây
  const dynamicRecentEvents = [...events]
    .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
    .slice(0, 5);

  // 5. Sự kiện được chọn bên phải (Pie Chart & Chi tiết)
  const selectedEvent = events.find(e => e.id === selectedEventId) || events[0] || null;

  let pieData = [];
  if (selectedEvent) {
    const checked = selectedEvent.checkedInCount || 0;
    const unchecked = Math.max(0, (selectedEvent.totalRegistrations || 0) - checked);
    if (checked > 0 || unchecked > 0) {
      pieData = [
        { name: 'Đã điểm danh', value: checked, color: '#10b981' },
        { name: 'Chưa điểm danh', value: unchecked, color: '#f43f5e' }
      ];
    } else {
      pieData = [{ name: 'Chưa có lượt đăng ký', value: 1, color: '#e2e8f0' }];
    }
  } else {
    pieData = [{ name: 'Chưa chọn sự kiện', value: 1, color: '#e2e8f0' }];
  }

  const formatTargets = (tList) => {
    if (!tList || tList.length === 0) return "Tất cả sinh viên";
    return tList.map(t => t.targetName).join(', ');
  };

  return (
    <div className="admin-dashboard">
      <section className="admin-page-header">
        <div>
          <p>Dashboard</p>
          <h1>Tổng quan quản trị sự kiện</h1>
        </div>
        <button className="admin-primary-action" type="button" onClick={() => navigate('/admin/events')}>
          Quản lý sự kiện
        </button>
      </section>

      <section className="admin-stats-grid">
        {dynamicStats.map((item) => {
          const Icon = item.icon;
          const TrendIcon = item.trend === 'up' ? TrendingUp : TrendingDown;

          return (
            <article className="admin-stat-card" key={item.label}>
              <div className={`admin-stat-icon ${item.tone}`}>
                <Icon size={24} />
              </div>
              <div className="admin-stat-content">
                <strong style={{ fontSize: item.label.includes('Tài khoản') ? '22px' : '26px' }}>{item.value}</strong>
                <span>{item.label}</span>
              </div>
              <div className={`admin-stat-change ${item.trend}`}>
                <span>{item.change}</span>
                <TrendIcon size={16} />
              </div>
            </article>
          );
        })}
      </section>

      <section className="admin-dashboard-grid">
        <article className="admin-panel admin-panel-large">
          <div className="admin-panel-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
            <div className="admin-chart-legend">
              <span className="legend-item registrations" style={{ color: '#0ea5e9', fontWeight: 600 }}>Lượt đăng ký</span>
              <span className="legend-item checkins" style={{ color: '#4f46e5', fontWeight: 600 }}>Đã điểm danh</span>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '13px' }}>
              <label style={{ color: '#64748b', fontWeight: 500 }}>Từ:</label>
              <input 
                type="date" 
                value={startDate} 
                onChange={e => setStartDate(e.target.value)}
                className="admin-input"
                style={{ borderRadius: '6px', padding: '4px 8px', fontSize: '13px' }}
              />
              <label style={{ color: '#64748b', fontWeight: 500 }}>Đến:</label>
              <input 
                type="date" 
                value={endDate} 
                onChange={e => setEndDate(e.target.value)}
                className="admin-input"
                style={{ borderRadius: '6px', padding: '4px 8px', fontSize: '13px' }}
              />
            </div>
          </div>

          <div className="admin-chart-area">
            <ResponsiveContainer height={330} width="100%">
              <AreaChart data={dynamicRegistrationData} margin={{ left: -20, right: 10, top: 10 }}>
                <defs>
                  <linearGradient id="registrationsGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="checkinsGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#e5e7eb" vertical={false} />
                <XAxis axisLine={false} dataKey="date" tickLine={false} />
                <YAxis axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip />
                <Area
                  name="Lượt đăng ký"
                  dataKey="registrations"
                  fill="url(#registrationsGradient)"
                  stroke="#38bdf8"
                  strokeWidth={3}
                  type="monotone"
                />
                <Area
                  name="Đã điểm danh"
                  dataKey="checkins"
                  fill="url(#checkinsGradient)"
                  stroke="#4f46e5"
                  strokeWidth={3}
                  type="monotone"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="admin-panel">
          <div className="admin-panel-header compact">
            <div>
              <h2>Hoạt động tuần này</h2>
              <p>Thống kê sự kiện và lượt tham gia</p>
            </div>
            <span style={{ fontSize: '12px', background: '#e0e7ff', color: '#4338ca', padding: '4px 10px', borderRadius: '12px', fontWeight: 600 }}>Tuần hiện tại</span>
          </div>

          <div style={{ display: 'flex', gap: '20px', padding: '6px 24px 12px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', color: '#4f46e5' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#4f46e5' }}></span>
              Sự kiện
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', color: '#38bdf8' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#38bdf8' }}></span>
              Lượt đăng ký
            </span>
          </div>

          <ResponsiveContainer height={260} width="100%">
            <BarChart data={dynamicWeeklyData} margin={{ left: -20, right: 10, top: 10 }}>
              <CartesianGrid stroke="#e5e7eb" vertical={false} />
              <XAxis axisLine={false} dataKey="day" tickLine={false} />
              <YAxis axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip />
              <Bar name="Sự kiện" dataKey="events" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              <Bar name="Lượt đăng ký" dataKey="registrations" fill="#38bdf8" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </article>
      </section>

      <section className="admin-lower-grid">
        <article className="admin-panel">
          <div className="admin-panel-header compact">
            <div>
              <h2>Sự kiện gần đây</h2>
              <p>Nhấp vào từng sự kiện để xem biểu đồ điểm danh bên phải</p>
            </div>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Tên sự kiện</th>
                  <th>Trạng thái</th>
                  <th>Ngày</th>
                  <th>Đăng ký</th>
                </tr>
              </thead>
              <tbody>
                {dynamicRecentEvents.length > 0 ? dynamicRecentEvents.map((event) => {
                  const statusLabel = event.status === 'PUBLISHED' ? 'Đang mở' : event.status === 'DRAFT' ? 'Bản nháp' : 'Đã đóng';
                  const isSelected = selectedEventId === event.id;

                  return (
                    <tr 
                      key={event.id} 
                      style={{ 
                        cursor: 'pointer',
                        background: isSelected ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                        fontWeight: isSelected ? '600' : 'normal',
                        transition: 'background 0.15s'
                      }} 
                      onClick={() => setSelectedEventId(event.id)}
                    >
                      <td style={{ color: isSelected ? '#3b82f6' : 'inherit' }}>
                        {event.title} {isSelected && <span style={{ fontSize: '11px', color: '#3b82f6' }}>◀</span>}
                      </td>
                      <td>
                        <span className={`admin-status-badge ${event.status ? event.status.toLowerCase() : ''}`}>
                          {statusLabel}
                        </span>
                      </td>
                      <td>{new Date(event.startTime).toLocaleDateString('vi-VN')}</td>
                      <td>
                        <strong>{event.totalRegistrations || 0}</strong>/{event.capacity || 0}
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>Chưa có sự kiện nào</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>

        <article className="admin-panel">
          <div className="admin-panel-header compact">
            <div style={{ overflow: 'hidden', width: '100%' }}>
              <h2>Tỉ lệ điểm danh sự kiện</h2>
              {selectedEvent ? (
                <p 
                  onClick={() => navigate(`/admin/events/${selectedEvent.id}`)}
                  style={{ color: 'var(--primary-color)', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                  title="Nhấp để xem trang quản lý sự kiện này"
                >
                  {selectedEvent.title} (Xem chi tiết ↗)
                </p>
              ) : (
                <p>Chọn sự kiện ở bảng bên trái</p>
              )}
            </div>
          </div>

          <div className="admin-status-panel" style={{ padding: '10px 20px 20px' }}>
            <ResponsiveContainer height={190} width="100%">
              <PieChart>
                <Pie
                  cx="50%"
                  cy="50%"
                  data={pieData}
                  dataKey="value"
                  innerRadius={52}
                  outerRadius={76}
                  paddingAngle={4}
                >
                  {pieData.map((entry, idx) => (
                    <Cell fill={entry.color} key={idx} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            {selectedEvent ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
                <div className="dashboard-detail-box">
                  <Target size={20} color="#4f46e5" style={{ flexShrink: 0 }} />
                  <div style={{ overflow: 'hidden' }}>
                    <span>Điều kiện tham gia</span>
                    <strong>
                      {formatTargets(selectedEvent.targets)}
                    </strong>
                  </div>
                </div>

                <div className="dashboard-detail-box">
                  <MapPin size={20} color="#06b6d4" style={{ flexShrink: 0 }} />
                  <div style={{ overflow: 'hidden' }}>
                    <span>Địa điểm tổ chức</span>
                    <strong>
                      {selectedEvent.location || 'Chưa xác định'}
                    </strong>
                  </div>
                </div>

                <div className="dashboard-detail-box highlight">
                  <Award size={20} color="#d97706" style={{ flexShrink: 0 }} />
                  <div>
                    <span>Điểm rèn luyện tích lũy</span>
                    <strong>
                      +{selectedEvent.trainingPoints || 0} điểm
                    </strong>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '13px', padding: '20px' }}>Chưa có sự kiện được chọn</div>
            )}
          </div>
        </article>
      </section>
    </div>
  );
};

export default AdminDashboard;
