import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminEventService } from '../../services/adminEventService';
import { adminRegistrationService } from '../../services/adminRegistrationService';
import { publicEventService } from '../../services/publicEventService';
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
  Trash2,
  Shield,
  UserPlus,
  Send
} from 'lucide-react';
import SendNotificationModal from '../../components/SendNotificationModal';

const AdminEventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('general'); // tabs: 'general', 'targets', 'checkin'
  const [checkinSubTab, setCheckinSubTab] = useState('registrants'); // 'registrants' | 'managers'
  const [searchStudent, setSearchStudent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showNotifModal, setShowNotifModal] = useState(false);

  const [eventData, setEventData] = useState(null);
  const [editData, setEditData] = useState(null);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [registrations, setRegistrations] = useState([]);
  const [managers, setManagers] = useState([]);
  const [managerInput, setManagerInput] = useState('');
  const [isAddingManager, setIsAddingManager] = useState(false);

  const handleAddImageUrl = () => {
    if (!newImageUrl || !newImageUrl.trim()) return;
    setEditData({
      ...editData,
      imageUrls: [...(editData.imageUrls || []), newImageUrl.trim()]
    });
    setNewImageUrl('');
  };

  const handleRemoveImageUrl = (idxToRemove) => {
    setEditData({
      ...editData,
      imageUrls: (editData.imageUrls || []).filter((_, idx) => idx !== idxToRemove)
    });
  };

  useEffect(() => {
    fetchEventDetail();
    fetchRegistrations();
    fetchManagers();
  }, [id]);

  const fetchManagers = async () => {
    try {
      const data = await publicEventService.getEventManagers(id);
      setManagers(data || []);
    } catch (err) {
      console.error("Lỗi tải danh sách quản lý:", err);
    }
  };

  const handleAddManager = async (e) => {
    e.preventDefault();
    if (!managerInput || !managerInput.trim()) return;
    setIsAddingManager(true);
    try {
      await publicEventService.addEventManager(id, managerInput.trim());
      setManagerInput('');
      fetchManagers();
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Lỗi khi thêm quản lý");
    } finally {
      setIsAddingManager(false);
    }
  };

  const handleRemoveManager = async (userId, name) => {
    if (!window.confirm(`Bạn có chắc muốn xóa quyền quản lý sự kiện của "${name}"?`)) return;
    try {
      await publicEventService.removeEventManager(id, userId);
      fetchManagers();
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Lỗi khi xóa quản lý");
    }
  };

  const fetchRegistrations = async () => {
    try {
      const data = await adminRegistrationService.getEventRegistrations(id);
      setRegistrations(data || []);
    } catch (err) {
      console.error("Lỗi tải danh sách đăng ký:", err);
    }
  };

  const handleManualCheckIn = async (regId) => {
    try {
      await adminRegistrationService.manualCheckIn(regId);
      fetchRegistrations();
      fetchEventDetail();
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Lỗi điểm danh");
    }
  };

  const handleCancelCheckIn = async (regId) => {
    try {
      await adminRegistrationService.cancelCheckIn(regId);
      fetchRegistrations();
      fetchEventDetail();
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Lỗi hủy điểm danh");
    }
  };

  const handleCancelReg = async (regId) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy suất đăng ký tham gia này của sinh viên?")) return;
    try {
      await adminRegistrationService.cancelRegistration(regId);
      fetchRegistrations();
      fetchEventDetail();
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Lỗi hủy suất");
    }
  };

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
  const filteredRegistrants = registrations.filter(
    (student) =>
      (student.fullName || '').toLowerCase().includes(searchStudent.toLowerCase()) ||
      (student.studentCode || '').toLowerCase().includes(searchStudent.toLowerCase()) ||
      (student.email || '').toLowerCase().includes(searchStudent.toLowerCase())
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
          
          {/* TAB 1: THÔNG TIN CHUNG (TRẢI DÀI TOÀN MÀN HÌNH) */}
          {activeTab === 'general' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', opacity: isEditing ? 1 : 0.85 }}>
              {/* PHẦN 1: THÔNG TIN CƠ BẢN */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontWeight: '600', fontSize: '14px', color: '#334155' }}>Tên sự kiện</label>
                  <input type="text" disabled={!isEditing} value={editData.title} onChange={e => setEditData({...editData, title: e.target.value})} style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #dde5ef', background: isEditing ? '#ffffff' : '#f8fafc', color: '#0f172a', fontSize: '16px', fontWeight: '600', cursor: isEditing ? 'text' : 'not-allowed' }} />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontWeight: '600', fontSize: '14px', color: '#334155' }}>Thời gian bắt đầu</label>
                    <input type="datetime-local" disabled={!isEditing} value={editData.startTime} onChange={e => setEditData({...editData, startTime: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #dde5ef', background: isEditing ? '#ffffff' : '#f8fafc', color: '#0f172a', cursor: isEditing ? 'text' : 'not-allowed' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontWeight: '600', fontSize: '14px', color: '#334155' }}>Thời gian kết thúc</label>
                    <input type="datetime-local" disabled={!isEditing} value={editData.endTime} onChange={e => setEditData({...editData, endTime: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #dde5ef', background: isEditing ? '#ffffff' : '#f8fafc', color: '#0f172a', cursor: isEditing ? 'text' : 'not-allowed' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontWeight: '600', fontSize: '14px', color: '#334155' }}>Địa điểm tổ chức</label>
                    <div style={{ display: 'flex', alignItems: 'center', background: isEditing ? '#ffffff' : '#f8fafc', border: '1px solid #dde5ef', borderRadius: '8px', padding: '0 12px', cursor: isEditing ? 'text' : 'not-allowed' }}>
                      <MapPin size={18} color="#6b7280" />
                      <input type="text" disabled={!isEditing} value={editData.location} onChange={e => setEditData({...editData, location: e.target.value})} style={{ flex: 1, padding: '12px', border: 'none', background: 'transparent', color: '#0f172a', outline: 'none', cursor: isEditing ? 'text' : 'not-allowed' }} />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontWeight: '600', fontSize: '14px', color: '#334155' }}>Sức chứa tối đa</label>
                    <input type="number" disabled={!isEditing} value={editData.capacity} onChange={e => setEditData({...editData, capacity: parseInt(e.target.value) || 0})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #dde5ef', background: isEditing ? '#ffffff' : '#f8fafc', color: '#0f172a', cursor: isEditing ? 'text' : 'not-allowed' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontWeight: '600', fontSize: '14px', color: '#334155' }}>Điểm rèn luyện (+ĐRL)</label>
                    <input type="number" disabled={!isEditing} value={editData.trainingPoints} onChange={e => setEditData({...editData, trainingPoints: parseInt(e.target.value) || 0})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #dde5ef', background: isEditing ? '#ffffff' : '#f8fafc', color: '#0f172a', cursor: isEditing ? 'text' : 'not-allowed' }} />
                  </div>
                  {isEditing ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontWeight: '600', fontSize: '14px', color: '#334155' }}>Trạng thái sự kiện</label>
                      <select value={editData.status} onChange={e => setEditData({...editData, status: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #dde5ef', background: '#ffffff', color: '#0f172a', fontWeight: '600' }}>
                        <option value="DRAFT">Lưu nháp (DRAFT)</option>
                        <option value="PUBLISHED">Đang mở (PUBLISHED)</option>
                        <option value="CLOSED">Đã đóng (CLOSED)</option>
                      </select>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontWeight: '600', fontSize: '14px', color: '#334155' }}>Trạng thái</label>
                      <div style={{ padding: '12px', borderRadius: '8px', border: '1px solid #dde5ef', background: '#f8fafc', fontWeight: '700', color: editData.status === 'PUBLISHED' ? '#10b981' : editData.status === 'DRAFT' ? '#64748b' : '#ef4444' }}>
                        {editData.status === 'PUBLISHED' ? 'Đang mở đăng ký' : editData.status === 'DRAFT' ? 'Bản thảo nháp' : 'Đã đóng / Kết thúc'}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* PHẦN 2: MÔ TẢ CHI TIẾT */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid #dde5ef', paddingTop: '24px' }}>
                <label style={{ fontWeight: '600', fontSize: '16px', color: '#0f172a' }}>Mô tả nội dung chi tiết</label>
                <textarea 
                  rows={isEditing ? 12 : 8} 
                  disabled={!isEditing} 
                  value={editData.description} 
                  onChange={e => setEditData({...editData, description: e.target.value})} 
                  placeholder="Nhập nội dung chương trình, thể lệ, khách mời..."
                  style={{ padding: '16px', borderRadius: '12px', border: '1px solid #dde5ef', background: isEditing ? '#ffffff' : '#f8fafc', color: '#0f172a', fontSize: '14px', lineHeight: '1.7', resize: 'vertical', cursor: isEditing ? 'text' : 'default' }}
                ></textarea>
              </div>

              {/* PHẦN 3: QUẢN LÝ HÌNH ẢNH MINH HỌA */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid #dde5ef', paddingTop: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <label style={{ fontWeight: '600', fontSize: '16px', color: '#0f172a', display: 'block' }}>Hình ảnh minh họa</label>
                    <span style={{ fontSize: '13px', color: '#64748b' }}>Danh sách các đường dẫn URL hình ảnh hiển thị trên slider và thẻ sự kiện</span>
                  </div>

                  {isEditing && (
                    <div style={{ display: 'flex', gap: '8px', flex: 1, maxWidth: '500px', minWidth: '280px' }}>
                      <input 
                        type="text" 
                        placeholder="Dán link đường dẫn ảnh (VD: https://imgur.com/...)" 
                        value={newImageUrl}
                        onChange={e => setNewImageUrl(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddImageUrl())}
                        style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '13px' }}
                      />
                      <button 
                        type="button"
                        onClick={handleAddImageUrl}
                        className="btn btn-primary"
                        style={{ background: 'var(--primary-color)', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
                      >
                        <ImagePlus size={16} /> Thêm ảnh
                      </button>
                    </div>
                  )}
                </div>

                {/* Lưới hình ảnh rộng rãi toàn màn hình */}
                {(() => {
                  const currentUrls = isEditing ? (editData.imageUrls || []) : (eventData.images || []).map(i => i.imageUrl);
                  
                  if (currentUrls.length === 0) {
                    return (
                      <div style={{ border: '2px dashed #dde5ef', borderRadius: '12px', padding: '48px 20px', textAlign: 'center', background: '#f8fafc' }}>
                        <ImagePlus size={40} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
                        <p style={{ fontWeight: '600', color: '#475569', marginBottom: '4px' }}>Chưa có hình ảnh minh họa nào</p>
                        <p style={{ fontSize: '13px', color: '#94a3b8' }}>{isEditing ? 'Hãy dán đường link URL phía trên để thêm ảnh vào sự kiện.' : 'Sự kiện này đang sử dụng ảnh mặc định của hệ thống.'}</p>
                      </div>
                    );
                  }

                  return (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px', marginTop: '8px' }}>
                      {currentUrls.map((url, idx) => (
                        <div key={idx} style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid #dde5ef', aspectRatio: '16/9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', background: '#f1f5f9' }}>
                          <img src={url} alt={`Minh họa ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600&q=80'; }} />
                          {isEditing && (
                            <button 
                              type="button"
                              onClick={() => handleRemoveImageUrl(idx)}
                              title="Xóa ảnh này"
                              style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(239, 68, 68, 0.9)', color: 'white', border: 'none', borderRadius: '6px', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                          <span style={{ position: 'absolute', bottom: '8px', left: '8px', background: 'rgba(15, 23, 42, 0.7)', color: 'white', fontSize: '11px', padding: '2px 8px', borderRadius: '4px' }}>
                            Ảnh #{idx + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                })()}
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
              {/* SUB-TABS NAVIGATION */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid #e5e7eb', paddingBottom: '16px' }}>
                <button
                  type="button"
                  onClick={() => setCheckinSubTab('registrants')}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    background: checkinSubTab === 'registrants' ? 'var(--primary-color)' : '#f3f4f6',
                    color: checkinSubTab === 'registrants' ? '#fff' : '#4b5563',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s'
                  }}
                >
                  <Users size={18} /> Danh sách Sinh viên Đăng ký ({registrations.length})
                </button>
                <button
                  type="button"
                  onClick={() => setCheckinSubTab('managers')}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    background: checkinSubTab === 'managers' ? 'var(--primary-color)' : '#f3f4f6',
                    color: checkinSubTab === 'managers' ? '#fff' : '#4b5563',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s'
                  }}
                >
                  <Shield size={18} /> Quản lý Sự kiện & CTV ({managers.length})
                </button>
              </div>

              {/* SUB-TAB 1: DANH SÁCH ĐĂNG KÝ */}
              {checkinSubTab === 'registrants' && (
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
                          <strong style={{ fontSize: '16px' }}>{registrations.length} / {eventData?.capacity || 0}</strong>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                          <span style={{ fontSize: '13px', color: '#6b7280' }}>Đã điểm danh</span>
                          <strong style={{ fontSize: '16px', color: 'var(--primary-color)' }}>{registrations.filter(r => r.checkedInAt).length} / {registrations.length}</strong>
                        </div>
                      </div>

                      <div style={{ width: '1px', height: '32px', background: '#dde5ef' }}></div>

                      <button className="btn btn-secondary" style={{ background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Download size={16} /> Xuất Excel
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowNotifModal(true)}
                        style={{
                          padding: '10px 18px',
                          borderRadius: '8px',
                          border: 'none',
                          background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                          color: '#ffffff',
                          fontWeight: '700',
                          fontSize: '14px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                          transition: 'all 0.2s'
                        }}
                      >
                        <Send size={16} /> Gửi thông báo
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
                          <th style={{ textAlign: 'right' }}>Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRegistrants.map((student, index) => (
                          <tr key={student.id} style={{ opacity: student.status === 'CANCELLED' ? 0.5 : 1 }}>
                            <td>{index + 1}</td>
                            <td>
                              <div style={{ fontWeight: '600', color: '#111827' }}>{student.fullName}</div>
                              <div style={{ fontSize: '13px', color: '#6b7280' }}>{student.studentCode}</div>
                            </td>
                            <td>{student.classCode}</td>
                            <td style={{ color: '#6b7280' }}>
                              {student.registeredAt ? new Date(student.registeredAt).toLocaleString('vi-VN') : ''}
                            </td>
                            <td>
                              {student.status === 'CANCELLED' ? (
                                <span style={{ color: '#ef4444', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <UserX size={16} /> Đã hủy suất
                                </span>
                              ) : student.checkedInAt ? (
                                <span style={{ color: '#10b981', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <UserCheck size={16} /> Đã đến
                                </span>
                              ) : (
                                <span style={{ color: '#f59e0b', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <Clock size={16} /> Chờ check-in
                                </span>
                              )}
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              {student.status !== 'CANCELLED' && (
                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                  {!student.checkedInAt ? (
                                    <button 
                                      onClick={() => handleManualCheckIn(student.id)}
                                      style={{ background: 'var(--primary-color)', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', boxShadow: '0 2px 4px rgba(79, 70, 229, 0.2)' }}
                                    >
                                      Điểm danh
                                    </button>
                                  ) : (
                                    <button 
                                      onClick={() => handleCancelCheckIn(student.id)}
                                      style={{ background: '#ffedd5', color: '#c2410c', border: '1px solid #fdba74', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
                                    >
                                      Hủy điểm danh
                                    </button>
                                  )}
                                  <button 
                                    onClick={() => handleCancelReg(student.id)}
                                    style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fca5a5', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
                                  >
                                    Hủy suất
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                        {filteredRegistrants.length === 0 && (
                          <tr>
                            <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
                              Không tìm thấy sinh viên nào khớp với tìm kiếm "{searchStudent}".
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SUB-TAB 2: QUẢN LÝ SỰ KIỆN & CTV */}
              {checkinSubTab === 'managers' && (
                <div>
                  <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <UserPlus size={20} color="var(--primary-color)" /> Thêm Người quản lý / Cộng tác viên
                    </h4>
                    <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#64748b' }}>
                      Người được gán quyền sẽ có thể truy cập vào sự kiện này tại trang công khai để xem danh sách sinh viên đăng ký và thực hiện điểm danh thủ công.
                    </p>
                    <form onSubmit={handleAddManager} style={{ display: 'flex', gap: '12px', maxWidth: '500px' }}>
                      <input
                        type="text"
                        className="admin-form-input"
                        placeholder="Nhập Email hoặc Mã sinh viên..."
                        value={managerInput}
                        onChange={(e) => setManagerInput(e.target.value)}
                        style={{ flex: 1, margin: 0 }}
                      />
                      <button
                        type="submit"
                        disabled={isAddingManager || !managerInput.trim()}
                        className="btn btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}
                      >
                        <UserPlus size={16} /> {isAddingManager ? 'Đang cấp quyền...' : 'Cấp quyền'}
                      </button>
                    </form>
                  </div>

                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>STT</th>
                          <th>Tài khoản</th>
                          <th>Mã SV</th>
                          <th>Vai trò hệ thống</th>
                          <th>Ngày cấp quyền</th>
                          <th style={{ textAlign: 'right' }}>Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {managers.map((m, index) => (
                          <tr key={m.id}>
                            <td>{index + 1}</td>
                            <td>
                              <div style={{ fontWeight: '600', color: '#111827' }}>{m.fullName}</div>
                              <div style={{ fontSize: '13px', color: '#6b7280' }}>{m.email}</div>
                            </td>
                            <td>{m.studentCode || 'N/A'}</td>
                            <td>
                              <span style={{ 
                                padding: '4px 10px', 
                                borderRadius: '20px', 
                                fontSize: '12px', 
                                fontWeight: '600',
                                background: m.role === 'ADMIN' ? '#fef3c7' : m.role === 'MANAGER' ? '#e0e7ff' : '#f1f5f9',
                                color: m.role === 'ADMIN' ? '#d97706' : m.role === 'MANAGER' ? '#4f46e5' : '#475569'
                              }}>
                                {m.role}
                              </span>
                            </td>
                            <td style={{ color: '#6b7280' }}>
                              {m.assignedAt ? new Date(m.assignedAt).toLocaleString('vi-VN') : ''}
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <button
                                type="button"
                                onClick={() => handleRemoveManager(m.userId, m.fullName)}
                                style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fca5a5', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                              >
                                <Trash2 size={14} /> Thu hồi quyền
                              </button>
                            </td>
                          </tr>
                        ))}
                        {managers.length === 0 && (
                          <tr>
                            <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
                              Chưa có người quản lý / cộng tác viên nào được gán cho sự kiện này.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </section>

      <SendNotificationModal
        isOpen={showNotifModal}
        onClose={() => setShowNotifModal(false)}
        eventId={id}
        eventTitle={eventData?.title}
        onSuccess={(msg) => alert(msg)}
      />
    </div>
  );
};

export default AdminEventDetail;
