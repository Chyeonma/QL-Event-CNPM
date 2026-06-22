import React from 'react';
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
} from 'lucide-react';

const stats = [
  {
    label: 'Tổng sự kiện',
    value: '128',
    change: '12.5%',
    trend: 'up',
    tone: 'indigo',
    icon: CalendarCheck,
  },
  {
    label: 'Người dùng',
    value: '3,456',
    change: '4.2%',
    trend: 'up',
    tone: 'cyan',
    icon: Users,
  },
  {
    label: 'Lượt đăng ký',
    value: '8,920',
    change: '18.3%',
    trend: 'up',
    tone: 'emerald',
    icon: ClipboardCheck,
  },
  {
    label: 'Đã điểm danh',
    value: '6,704',
    change: '2.1%',
    trend: 'down',
    tone: 'rose',
    icon: UserRoundCheck,
  },
];

const registrationData = [
  { month: 'Sep', registrations: 28, checkins: 21 },
  { month: 'Oct', registrations: 24, checkins: 12 },
  { month: 'Nov', registrations: 36, checkins: 24 },
  { month: 'Dec', registrations: 29, checkins: 27 },
  { month: 'Jan', registrations: 46, checkins: 15 },
  { month: 'Feb', registrations: 35, checkins: 24 },
  { month: 'Mar', registrations: 64, checkins: 38 },
  { month: 'Apr', registrations: 52, checkins: 23 },
  { month: 'May', registrations: 59, checkins: 45 },
  { month: 'Jun', registrations: 36, checkins: 24 },
  { month: 'Jul', registrations: 40, checkins: 32 },
  { month: 'Aug', registrations: 52, checkins: 46 },
];

const weeklyData = [
  { day: 'M', registered: 44, checkedIn: 14 },
  { day: 'T', registered: 55, checkedIn: 24 },
  { day: 'W', registered: 41, checkedIn: 20 },
  { day: 'T', registered: 67, checkedIn: 9 },
  { day: 'F', registered: 22, checkedIn: 14 },
  { day: 'S', registered: 43, checkedIn: 28 },
  { day: 'S', registered: 65, checkedIn: 16 },
];

const statusData = [
  { name: 'Published', value: 54, color: '#4f46e5' },
  { name: 'Draft', value: 27, color: '#38bdf8' },
  { name: 'Closed', value: 19, color: '#10b981' },
];

const recentEvents = [
  {
    title: 'Hội thảo Nghiên cứu Khoa học N23',
    status: 'PUBLISHED',
    date: '24/06/2026',
    registrations: 95,
    capacity: 120,
  },
  {
    title: 'Ngày hội An toàn thông tin',
    status: 'DRAFT',
    date: '29/06/2026',
    registrations: 0,
    capacity: 200,
  },
  {
    title: 'Giải bóng đá sinh viên',
    status: 'CLOSED',
    date: '15/06/2026',
    registrations: 48,
    capacity: 50,
  },
  {
    title: 'Talkshow Định hướng nghề nghiệp',
    status: 'PUBLISHED',
    date: '02/07/2026',
    registrations: 144,
    capacity: 180,
  },
];

const activities = [
  { title: 'Cập nhật đối tượng tham gia', meta: 'Sự kiện NCKH N23', time: '09:45' },
  { title: 'Điểm danh thủ công', meta: '48 sinh viên đã check-in', time: '10:20' },
  { title: 'Tạo bản nháp sự kiện mới', meta: 'Ngày hội An toàn thông tin', time: '11:05' },
];

const AdminDashboard = () => {
  return (
    <div className="admin-dashboard">
      <section className="admin-page-header">
        <div>
          <p>Dashboard</p>
          <h1>Tổng quan quản trị sự kiện</h1>
        </div>
        <button className="admin-primary-action" type="button">
          Tạo sự kiện
        </button>
      </section>

      <section className="admin-stats-grid">
        {stats.map((item) => {
          const Icon = item.icon;
          const TrendIcon = item.trend === 'up' ? TrendingUp : TrendingDown;

          return (
            <article className="admin-stat-card" key={item.label}>
              <div className={`admin-stat-icon ${item.tone}`}>
                <Icon size={24} />
              </div>
              <div className="admin-stat-content">
                <strong>{item.value}</strong>
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
          <div className="admin-panel-header">
            <div className="admin-chart-legend">
              <span className="legend-item registrations">Lượt đăng ký</span>
              <span className="legend-item checkins">Đã điểm danh</span>
            </div>
            <div className="admin-segmented">
              <button className="active" type="button">
                Ngày
              </button>
              <button type="button">Tuần</button>
              <button type="button">Tháng</button>
            </div>
          </div>

          <div className="admin-chart-area">
            <ResponsiveContainer height={330} width="100%">
              <AreaChart data={registrationData} margin={{ left: -20, right: 10, top: 10 }}>
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
                <XAxis axisLine={false} dataKey="month" tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Area
                  dataKey="registrations"
                  fill="url(#registrationsGradient)"
                  stroke="#38bdf8"
                  strokeWidth={3}
                  type="monotone"
                />
                <Area
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
              <p>Đăng ký và điểm danh</p>
            </div>
            <button className="admin-filter-button" type="button">
              Tuần này
            </button>
          </div>

          <div className="admin-mini-legend">
            <span className="bar-registered">Đăng ký</span>
            <span className="bar-checkin">Điểm danh</span>
          </div>

          <ResponsiveContainer height={275} width="100%">
            <BarChart data={weeklyData} margin={{ left: -20, right: 10, top: 10 }}>
              <CartesianGrid stroke="#e5e7eb" vertical={false} />
              <XAxis axisLine={false} dataKey="day" tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="registered" fill="#4f46e5" radius={[8, 8, 0, 0]} />
              <Bar dataKey="checkedIn" fill="#7dd3fc" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </article>
      </section>

      <section className="admin-lower-grid">
        <article className="admin-panel">
          <div className="admin-panel-header compact">
            <div>
              <h2>Sự kiện gần đây</h2>
              <p>Khung bảng cho module quản lý sự kiện</p>
            </div>
            <button className="admin-filter-button" type="button">
              Tháng này
            </button>
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
                {recentEvents.map((event) => (
                  <tr key={event.title}>
                    <td>{event.title}</td>
                    <td>
                      <span className={`admin-status-badge ${event.status.toLowerCase()}`}>
                        {event.status}
                      </span>
                    </td>
                    <td>{event.date}</td>
                    <td>
                      {event.registrations}/{event.capacity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="admin-panel">
          <div className="admin-panel-header compact">
            <div>
              <h2>Trạng thái sự kiện</h2>
              <p>Placeholder cho thống kê theo database</p>
            </div>
          </div>

          <div className="admin-status-panel">
            <ResponsiveContainer height={210} width="100%">
              <PieChart>
                <Pie
                  cx="50%"
                  cy="50%"
                  data={statusData}
                  dataKey="value"
                  innerRadius={58}
                  outerRadius={82}
                  paddingAngle={4}
                >
                  {statusData.map((entry) => (
                    <Cell fill={entry.color} key={entry.name} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <div className="admin-activity-list">
              {activities.map((activity) => (
                <div className="admin-activity-item" key={activity.title}>
                  <span></span>
                  <div>
                    <strong>{activity.title}</strong>
                    <small>{activity.meta}</small>
                  </div>
                  <time>{activity.time}</time>
                </div>
              ))}
            </div>
          </div>
        </article>
      </section>
    </div>
  );
};

export default AdminDashboard;
