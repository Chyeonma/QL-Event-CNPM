import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminEventService } from '../../services/adminEventService';
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
  Target,
  ImagePlus,
  Download,
  Trash2
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
  const [isSaving, setIsSaving] = useState(false);

  const [eventData, setEventData] = useState(null);
  const [editData, setEditData] = useState(null);

  useEffect(() => {
    fetchEventDetail();
  }, [id]);

  const toDateTimeLocal = (dateVal) => {
    if (!dateVal) return '';
    const d = Array.isArray(dateVal) 
      ? new Date(dateVal[0], dateVal[1]-1, dateVal[2], dateVal[3]||0, dateVal[4]||0, dateVal[5]||0)
      : new Date(dateVal);
    const pad = (n) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const fetchEventDetail = async () => {
    try {
      const data = await adminEventService.getEventById(id);
      setEventData(data);
      setEditData({
        title: data.title,
        startTime: toDateTimeLocal(data.startTime),
        endTime: toDateTimeLocal(data.endTime),
        location: data.location || '',
        capacity: data.capacity,
        trainingPoints: data.trainingPoints,
        description: data.description || '',
        status: data.status,
        targets: data.targets || [],
        imageUrls: (data.images || []).map(img => img.imageUrl)
      });
    } catch (error) {
      console.error(error);
      alert("Không tìm thấy sự kiện");
      navigate('/admin/events');
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await adminEventService.updateEvent(id, editData);
      setIsEditing(false);
      fetchEventDetail();
    } catch (error) {
      console.error(error);
      alert("Lỗi cập nhật sự kiện");
    } finally {
      setIsSaving(false);
    }
  };

  // Lọc sinh viên theo tên hoặc mã
  const filteredRegistrants = mockRegistrants.filter(
    (student) =>
      student.name.toLowerCase().includes(searchStudent.toLowerCase()) ||
      student.code.toLowerCase().includes(searchStudent.toLowerCase())
  );

  if (!eventData || !editData) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Đang tải dữ liệu sự kiện...</div>;
  }

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
            <h1>{eventData.title}</h1>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span className={`admin-status-badge ${eventData.status.toLowerCase()}`} style={{ fontSize: '14px', padding: '6px 12px' }}>
            {eventData.status === 'PUBLISHED' ? 'Đang mở' : eventData.status === 'DRAFT' ? 'Bản nháp' : 'Đã đóng'}
          </span>
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
                onClick={() => {
                  setIsEditing(false);
                  fetchEventDetail(); // Reset edits
                }}
                disabled={isSaving}
                style={{ background: '#f8fafc', color: '#111827', border: '1px solid #dde5ef', fontWeight: '600' }}
              >
                Hủy
              </button>
              <button 
                className="admin-primary-action" 
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                style={{ opacity: isSaving ? 0.7 : 1 }}
              >
                <Save size={18} style={{ marginRight: '8px' }} />
                {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
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
            <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '40px', opacity: isEditing ? 1 : 0.85 }}>
              {/* CỘT TRÁI: FORM NHẬP LIỆU */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontWeight: '500' }}>Tên sự kiện</label>
                  <input type="text" disabled={!isEditing} value={editData.title} onChange={e => setEditData({...editData, title: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #dde5ef', background: isEditing ? '#ffffff' : '#f8fafc', color: '#111827', cursor: isEditing ? 'text' : 'not-allowed' }} />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontWeight: '500' }}>Bắt đầu</label>
                    <input type="datetime-local" disabled={!isEditing} value={editData.startTime} onChange={e => setEditData({...editData, startTime: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #dde5ef', background: isEditing ? '#ffffff' : '#f8fafc', color: '#111827', cursor: isEditing ? 'text' : 'not-allowed' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontWeight: '500' }}>Kết thúc</label>
                    <input type="datetime-local" disabled={!isEditing} value={editData.endTime} onChange={e => setEditData({...editData, endTime: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #dde5ef', background: isEditing ? '#ffffff' : '#f8fafc', color: '#111827', cursor: isEditing ? 'text' : 'not-allowed' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontWeight: '500' }}>Địa điểm</label>
                    <div style={{ display: 'flex', alignItems: 'center', background: isEditing ? '#ffffff' : '#f8fafc', border: '1px solid #dde5ef', borderRadius: '8px', padding: '0 12px', cursor: isEditing ? 'text' : 'not-allowed' }}>
                      <MapPin size={18} color="#6b7280" />
                      <input type="text" disabled={!isEditing} value={editData.location} onChange={e => setEditData({...editData, location: e.target.value})} style={{ flex: 1, padding: '12px', border: 'none', background: 'transparent', color: '#111827', outline: 'none', cursor: isEditing ? 'text' : 'not-allowed' }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontWeight: '500' }}>Sức chứa</label>
                    <input type="number" disabled={!isEditing} value={editData.capacity} onChange={e => setEditData({...editData, capacity: parseInt(e.target.value)})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #dde5ef', background: isEditing ? '#ffffff' : '#f8fafc', color: '#111827', cursor: isEditing ? 'text' : 'not-allowed' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontWeight: '500' }}>Điểm rèn luyện</label>
                    <input type="number" disabled={!isEditing} value={editData.trainingPoints} onChange={e => setEditData({...editData, trainingPoints: parseInt(e.target.value)})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #dde5ef', background: isEditing ? '#ffffff' : '#f8fafc', color: '#111827', cursor: isEditing ? 'text' : 'not-allowed' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontWeight: '500' }}>Mô tả chi tiết</label>
                  <textarea rows="4" disabled={!isEditing} value={editData.description} onChange={e => setEditData({...editData, description: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #dde5ef', background: isEditing ? '#ffffff' : '#f8fafc', color: '#111827', resize: 'vertical', cursor: isEditing ? 'text' : 'not-allowed' }}></textarea>
                </div>
                
                {isEditing && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontWeight: '500' }}>Trạng thái sự kiện</label>
                    <select value={editData.status} onChange={e => setEditData({...editData, status: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #dde5ef', background: '#ffffff', color: '#111827' }}>
                      <option value="DRAFT">Lưu nháp (DRAFT)</option>
                      <option value="PUBLISHED">Đang mở (PUBLISHED)</option>
                      <option value="CLOSED">Đã đóng (CLOSED)</option>
                    </select>
                  </div>
                )}
              </div>

              {/* CỘT PHẢI: QUẢN LÝ HÌNH ẢNH */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <label style={{ fontWeight: '500' }}>Hình ảnh sự kiện</label>
                <div style={{ 
                  border: '2px dashed #dde5ef', 
                  borderRadius: '12px', 
                  padding: '40px 20px', 
                  textAlign: 'center',
                  background: isEditing ? '#f8fafc' : '#ffffff',
                  cursor: isEditing ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <ImagePlus size={36} color="#94a3b8" />
                  <div>
                    <strong style={{ color: '#4f46e5', display: 'block', marginBottom: '4px' }}>Click để tải ảnh lên</strong>
                    <span style={{ color: '#6b7280', fontSize: '13px' }}>Chỉ hỗ trợ JPG, PNG (Tối đa 5MB)</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid #dde5ef', aspectRatio: '16/9' }}>
                    <img src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&q=80" alt="event" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    {isEditing && (
                      <button style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(239, 68, 68, 0.9)', color: 'white', border: 'none', borderRadius: '4px', padding: '6px', cursor: 'pointer' }}>
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid #dde5ef', aspectRatio: '16/9' }}>
                    <img src="https://images.unsplash.com/photo-1515169067868-5387ec356754?w=500&q=80" alt="event" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    {isEditing && (
                      <button style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(239, 68, 68, 0.9)', color: 'white', border: 'none', borderRadius: '4px', padding: '6px', cursor: 'pointer' }}>
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
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

                <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
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

                  <div style={{ width: '1px', height: '32px', background: '#dde5ef' }}></div>

                  <button className="btn btn-secondary" style={{ background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Download size={16} /> Xuất Excel
                  </button>
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
