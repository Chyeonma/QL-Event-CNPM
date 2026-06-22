import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Edit,
  UserCheck, 
  UserX, 
  Search, 
  MapPin, 
  Clock, 
  Calendar,
  Users,
  Target
} from 'lucide-react';

// Mock data sinh viên đăng ký
const mockRegistrants = [
  { id: 101, code: 'B22DCCN123', name: 'Nguyễn Văn A', clazz: 'D22CQCN01-B', time: '20/06/2026 09:15', checkedIn: true },
  { id: 102, code: 'B22DCCN456', name: 'Trần Thị B', clazz: 'D22CQCN02-B', time: '21/06/2026 14:20', checkedIn: false },
  { id: 103, code: 'B23DCAT001', name: 'Lê Hoàng C', clazz: 'D23CQAT01-B', time: '22/06/2026 08:00', checkedIn: false },
  { id: 104, code: 'B21DCVT999', name: 'Phạm Minh D', clazz: 'D21CQVT01-B', time: '19/06/2026 21:45', checkedIn: true },
];

const AdminEventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('general'); // tabs: 'general', 'targets', 'checkin'
  const [searchStudent, setSearchStudent] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Lọc sinh viên theo tên hoặc mã
  const filteredRegistrants = mockRegistrants.filter(
    (student) =>
      student.name.toLowerCase().includes(searchStudent.toLowerCase()) ||
      student.code.toLowerCase().includes(searchStudent.toLowerCase())
  );

  return (
    <div className="admin-event-detail-page">
      <section className="admin-page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            className="admin-icon-button" 
            onClick={() => navigate('/admin/events')}
            style={{ background: '#f8fafc', border: 'none' }}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <p>Quản lý sự kiện</p>
            <h1>Hội thảo Nghiên cứu Khoa học N23</h1>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <span className="admin-status-badge published" style={{ fontSize: '14px', padding: '6px 12px' }}>Đang mở</span>
          {!isEditing ? (
            <button 
              className="admin-primary-action" 
              type="button"
              onClick={() => setIsEditing(true)}
              style={{ background: '#ffffff', color: '#111827', border: '1px solid #dde5ef', fontWeight: '600', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
            >
              <Edit size={18} style={{ marginRight: '8px' }} />
              Chỉnh sửa
            </button>
          ) : (
            <>
              <button 
                className="btn btn-secondary" 
                type="button"
                onClick={() => setIsEditing(false)}
                style={{ background: '#f8fafc', color: '#111827', border: '1px solid #dde5ef', fontWeight: '600' }}
              >
                Hủy
              </button>
              <button 
                className="admin-primary-action" 
                type="button"
                onClick={() => setIsEditing(false)}
              >
                <Save size={18} style={{ marginRight: '8px' }} />
                Lưu thay đổi
              </button>
            </>
          )}
        </div>
      </section>

      {/* Tabs Layout */}
      <section className="admin-panel" style={{ marginTop: '24px', padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #dde5ef', background: '#ffffff' }}>
          <button 
            onClick={() => setActiveTab('general')}
            style={{ 
              flex: 1, padding: '16px', background: 'transparent', border: 'none', cursor: 'pointer',
              borderBottom: activeTab === 'general' ? '3px solid var(--primary-color)' : '3px solid transparent',
              color: activeTab === 'general' ? 'var(--primary-color)' : '#6b7280',
              fontWeight: activeTab === 'general' ? '600' : '500',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: '0.2s'
            }}
          >
            <Calendar size={18} /> Thông tin chung
          </button>
          <button 
            onClick={() => setActiveTab('targets')}
            style={{ 
              flex: 1, padding: '16px', background: 'transparent', border: 'none', cursor: 'pointer',
              borderBottom: activeTab === 'targets' ? '3px solid var(--primary-color)' : '3px solid transparent',
              color: activeTab === 'targets' ? 'var(--primary-color)' : '#6b7280',
              fontWeight: activeTab === 'targets' ? '600' : '500',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: '0.2s'
            }}
          >
            <Target size={18} /> Điều kiện tham gia
          </button>
          <button 
            onClick={() => setActiveTab('checkin')}
            style={{ 
              flex: 1, padding: '16px', background: 'transparent', border: 'none', cursor: 'pointer',
              borderBottom: activeTab === 'checkin' ? '3px solid var(--primary-color)' : '3px solid transparent',
              color: activeTab === 'checkin' ? 'var(--primary-color)' : '#6b7280',
              fontWeight: activeTab === 'checkin' ? '600' : '500',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: '0.2s'
            }}
          >
            <Users size={18} /> Đăng ký & Điểm danh
          </button>
        </div>

        <div style={{ padding: '24px' }}>
          
          {/* TAB 1: THÔNG TIN CHUNG */}
          {activeTab === 'general' && (
            <div style={{ display: 'grid', gap: '20px', maxWidth: '800px', opacity: isEditing ? 1 : 0.85 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontWeight: '500' }}>Tên sự kiện</label>
                <input type="text" disabled={!isEditing} defaultValue="Hội thảo Nghiên cứu Khoa học N23" style={{ padding: '12px', borderRadius: '8px', border: '1px solid #dde5ef', background: isEditing ? '#ffffff' : '#f8fafc', color: '#111827', cursor: isEditing ? 'text' : 'not-allowed' }} />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontWeight: '500' }}>Bắt đầu</label>
                  <input type="datetime-local" disabled={!isEditing} defaultValue="2026-06-24T08:00" style={{ padding: '12px', borderRadius: '8px', border: '1px solid #dde5ef', background: isEditing ? '#ffffff' : '#f8fafc', color: '#111827', cursor: isEditing ? 'text' : 'not-allowed' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontWeight: '500' }}>Kết thúc</label>
                  <input type="datetime-local" disabled={!isEditing} defaultValue="2026-06-24T11:30" style={{ padding: '12px', borderRadius: '8px', border: '1px solid #dde5ef', background: isEditing ? '#ffffff' : '#f8fafc', color: '#111827', cursor: isEditing ? 'text' : 'not-allowed' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontWeight: '500' }}>Địa điểm</label>
                  <div style={{ display: 'flex', alignItems: 'center', background: isEditing ? '#ffffff' : '#f8fafc', border: '1px solid #dde5ef', borderRadius: '8px', padding: '0 12px', cursor: isEditing ? 'text' : 'not-allowed' }}>
                    <MapPin size={18} color="#6b7280" />
                    <input type="text" disabled={!isEditing} defaultValue="Hội trường A1" style={{ flex: 1, padding: '12px', border: 'none', background: 'transparent', color: '#111827', outline: 'none', cursor: isEditing ? 'text' : 'not-allowed' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontWeight: '500' }}>Sức chứa (Capacity)</label>
                  <input type="number" disabled={!isEditing} defaultValue="120" style={{ padding: '12px', borderRadius: '8px', border: '1px solid #dde5ef', background: isEditing ? '#ffffff' : '#f8fafc', color: '#111827', cursor: isEditing ? 'text' : 'not-allowed' }} />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontWeight: '500' }}>Mô tả chi tiết</label>
                <textarea rows="4" disabled={!isEditing} defaultValue="Hội thảo thường niên dành cho sinh viên N23 nhằm định hướng và cung cấp kỹ năng NCKH..." style={{ padding: '12px', borderRadius: '8px', border: '1px solid #dde5ef', background: isEditing ? '#ffffff' : '#f8fafc', color: '#111827', resize: 'vertical', cursor: isEditing ? 'text' : 'not-allowed' }}></textarea>
              </div>
            </div>
          )}

          {/* TAB 2: ĐIỀU KIỆN THAM GIA */}
          {activeTab === 'targets' && (
            <div style={{ maxWidth: '800px', opacity: isEditing ? 1 : 0.85 }}>
              <p style={{ color: '#6b7280', marginBottom: '20px' }}>
                Thêm các luật giới hạn đối tượng được phép đăng ký. Nếu để trống, toàn bộ sinh viên trong trường đều được phép đăng ký.
              </p>
              
              <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '20px', border: '1px solid #dde5ef' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 60px', gap: '16px', alignItems: 'end', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontWeight: '500', fontSize: '14px' }}>Khóa (Batch)</label>
                    <select disabled={!isEditing} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #dde5ef', background: isEditing ? '#ffffff' : '#f8fafc', color: '#111827', cursor: isEditing ? 'pointer' : 'not-allowed' }}>
                      <option>Tất cả khóa</option>
                      <option selected>N23</option>
                      <option>N22</option>
                      <option>N21</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontWeight: '500', fontSize: '14px' }}>Ngành (Major)</label>
                    <select disabled={!isEditing} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #dde5ef', background: isEditing ? '#ffffff' : '#f8fafc', color: '#111827', cursor: isEditing ? 'pointer' : 'not-allowed' }}>
                      <option>Tất cả ngành</option>
                      <option selected>Công nghệ thông tin (CN)</option>
                      <option>An toàn thông tin (AT)</option>
                    </select>
                  </div>
                  <button className="btn btn-secondary" disabled={!isEditing} style={{ height: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', opacity: isEditing ? 1 : 0.5, cursor: isEditing ? 'pointer' : 'not-allowed' }}>
                    Xóa
                  </button>
                </div>

                <button disabled={!isEditing} style={{ background: 'transparent', border: '1px dashed #dde5ef', color: isEditing ? 'var(--primary-color)' : '#9ca3af', width: '100%', padding: '12px', borderRadius: '8px', cursor: isEditing ? 'pointer' : 'not-allowed', fontWeight: '500' }}>
                  + Thêm điều kiện mới
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: ĐĂNG KÝ VÀ ĐIỂM DANH */}
          {activeTab === 'checkin' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <label className="admin-search" style={{ margin: 0, width: '300px' }}>
                  <Search size={18} />
                  <input 
                    placeholder="Tìm theo Tên hoặc Mã SV..." 
                    type="search" 
                    value={searchStudent}
                    onChange={(e) => setSearchStudent(e.target.value)}
                  />
                </label>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <span style={{ fontSize: '13px', color: '#6b7280' }}>Tổng đăng ký</span>
                    <strong style={{ fontSize: '16px' }}>95 / 120</strong>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <span style={{ fontSize: '13px', color: '#6b7280' }}>Đã điểm danh</span>
                    <strong style={{ fontSize: '16px', color: 'var(--primary-color)' }}>2 / 95</strong>
                  </div>
                </div>
              </div>

              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>STT</th>
                      <th>Sinh viên</th>
                      <th>Lớp</th>
                      <th>Thời gian đăng ký</th>
                      <th>Trạng thái</th>
                      <th style={{ textAlign: 'right' }}>Điểm danh</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRegistrants.map((student, index) => (
                      <tr key={student.id}>
                        <td>{index + 1}</td>
                        <td>
                          <div style={{ fontWeight: '600', color: '#111827' }}>{student.name}</div>
                          <div style={{ fontSize: '13px', color: '#6b7280' }}>{student.code}</div>
                        </td>
                        <td>{student.clazz}</td>
                        <td style={{ color: '#6b7280' }}>{student.time}</td>
                        <td>
                          {student.checkedIn ? (
                            <span style={{ color: 'var(--primary-color)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <UserCheck size={16} /> Đã đến
                            </span>
                          ) : (
                            <span style={{ color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              Chờ check-in
                            </span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {student.checkedIn ? (
                            <button 
                              style={{ background: '#f8fafc', color: 'var(--danger-color)', border: '1px solid #dde5ef', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}
                            >
                              Hủy điểm danh
                            </button>
                          ) : (
                            <button 
                              style={{ background: 'var(--primary-color)', color: '#fff', border: 'none', padding: '6px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500', boxShadow: '0 2px 4px rgba(79, 70, 229, 0.2)' }}
                            >
                              Điểm danh
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {filteredRegistrants.length === 0 && (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
                          Không tìm thấy sinh viên nào khớp với từ khóa "{searchStudent}".
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </section>
    </div>
  );
};

export default AdminEventDetail;
