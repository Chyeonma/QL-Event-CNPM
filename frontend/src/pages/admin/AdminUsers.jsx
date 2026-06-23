import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Search, Plus, Filter, UserCheck, UserX, UserMinus, Edit, Lock, Unlock, X } from 'lucide-react';
import { adminUserService } from '../../services/adminUserService';

const AdminUsers = () => {
  const { role } = useParams(); // 'student', 'manager', 'admin'
  const [activeTab, setActiveTab] = useState('ACTIVE'); // 'ACTIVE', 'LOCKED', 'INACTIVE'
  const [search, setSearch] = useState('');
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({ id: '', studentCode: '', fullName: '', email: '', classCode: '' });

  useEffect(() => {
    if (role) {
      fetchUsers();
    }
  }, [role]);

  const handleOpenCreate = () => {
    setFormData({ id: '', studentCode: '', fullName: '', email: '', classCode: '' });
    setIsEditMode(false);
    setShowModal(true);
  };

  const handleOpenEdit = async (id) => {
    try {
      const data = await adminUserService.getUserById(id);
      setFormData({
        id: data.id,
        studentCode: data.studentCode || '',
        fullName: data.fullName || '',
        email: data.email || '',
        classCode: data.classCode || ''
      });
      setIsEditMode(true);
      setShowModal(true);
    } catch (e) {
      alert("Lỗi tải thông tin người dùng");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        studentCode: formData.studentCode,
        fullName: formData.fullName,
        email: formData.email,
        classCode: formData.classCode,
        role: role.toUpperCase()
      };

      if (isEditMode) {
        await adminUserService.updateUser(formData.id, payload);
      } else {
        await adminUserService.createUser(payload);
      }
      setShowModal(false);
      fetchUsers();
    } catch (e) {
      alert(e.response?.data?.message || "Lỗi lưu dữ liệu");
    }
  };

  const handleToggleLock = async (id, isLocked) => {
    if (window.confirm(`Bạn có chắc chắn muốn ${isLocked ? 'mở khóa' : 'khóa'} tài khoản này?`)) {
      try {
        if (isLocked) {
          await adminUserService.unlockUser(id);
        } else {
          await adminUserService.lockUser(id);
        }
        fetchUsers();
      } catch (e) {
        alert("Lỗi thao tác");
      }
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminUserService.getUsersByRole(role.toUpperCase());
      
      const mapped = data.map(u => {
        let status = 'UNKNOWN';
        if (u.isDeleted) status = 'LOCKED';
        else if (u.requirePasswordChange && !u.hasPassword) status = 'INACTIVE';
        else status = 'ACTIVE';

        return {
          id: u.id,
          code: u.studentCode || 'N/A',
          name: u.fullName,
          email: u.email,
          class: u.classCode || 'N/A',
          department: u.classCode || 'N/A', 
          points: 0, // Điểm rèn luyện tạm thời gán 0
          status: status
        };
      });
      setUsers(mapped);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderTable = () => {
    if (loading) {
      return <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Đang tải dữ liệu...</div>;
    }

    // Lọc theo trạng thái tab và tìm kiếm
    const filtered = users.filter(u => 
      u.status === activeTab && 
      (u.name.toLowerCase().includes(search.toLowerCase()) || u.code.toLowerCase().includes(search.toLowerCase()))
    );

    if (role === 'student') {
      return (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Mã SV</th>
              <th>Họ và Tên</th>
              <th>Email</th>
              <th>Lớp</th>
              <th>Điểm RL</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id}>
                <td><strong>{s.code}</strong></td>
                <td>{s.name}</td>
                <td style={{ color: '#6b7280' }}>{s.email}</td>
                <td>{s.class}</td>
                <td><span style={{ fontWeight: '600', color: 'var(--primary-color)' }}>{s.points}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="admin-icon-button" title="Chỉnh sửa" onClick={() => handleOpenEdit(s.id)}><Edit size={16} /></button>
                    {s.status === 'LOCKED' ? (
                      <button className="admin-icon-button" title="Mở khóa" onClick={() => handleToggleLock(s.id, true)}><Unlock size={16} /></button>
                    ) : (
                      <button className="admin-icon-button" title="Khóa" onClick={() => handleToggleLock(s.id, false)}><Lock size={16} /></button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan="6" style={{textAlign: 'center', padding: '30px', color: '#6b7280'}}>Không có tài khoản nào</td></tr>
            )}
          </tbody>
        </table>
      );
    }
    
    // Bảng dành cho Manager và Admin (có cột Đơn vị/Phòng ban thay vì Lớp/Điểm RL)
    return (
      <table className="admin-table">
        <thead>
          <tr>
            <th>Mã NV</th>
            <th>Họ và Tên</th>
            <th>Email</th>
            <th>Đơn vị / Phòng ban</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(u => (
            <tr key={u.id}>
              <td><strong>{u.code}</strong></td>
              <td>{u.name}</td>
              <td style={{ color: '#6b7280' }}>{u.email}</td>
              <td>{u.department}</td>
              <td>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="admin-icon-button" title="Chỉnh sửa" onClick={() => handleOpenEdit(u.id)}><Edit size={16} /></button>
                  {u.status === 'LOCKED' ? (
                    <button className="admin-icon-button" title="Mở khóa" onClick={() => handleToggleLock(u.id, true)}><Unlock size={16} /></button>
                  ) : (
                    <button className="admin-icon-button" title="Khóa" onClick={() => handleToggleLock(u.id, false)}><Lock size={16} /></button>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr><td colSpan="5" style={{textAlign: 'center', padding: '30px', color: '#6b7280'}}>Không có tài khoản nào</td></tr>
          )}
        </tbody>
      </table>
    );
  };

  const roleTitle = role === 'student' ? 'Sinh viên' : role === 'manager' ? 'Manager' : 'Admin';

  return (
    <div className="admin-users-page">
      <section className="admin-page-header">
        <div>
          <p>Hệ thống</p>
          <h1>Quản lý {roleTitle}</h1>
        </div>
        <button className="admin-primary-action" onClick={handleOpenCreate}>
          <Plus size={18} style={{ marginRight: '8px' }} />
          Thêm {roleTitle.toLowerCase()}
        </button>
      </section>

      <div className="admin-panel" style={{ marginTop: '24px', padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #dde5ef', background: '#ffffff' }}>
          <button 
            onClick={() => setActiveTab('ACTIVE')}
            style={{ 
              flex: 1, padding: '16px', background: 'transparent', border: 'none', cursor: 'pointer',
              borderBottom: activeTab === 'ACTIVE' ? '3px solid #10b981' : '3px solid transparent',
              color: activeTab === 'ACTIVE' ? '#10b981' : '#6b7280',
              fontWeight: activeTab === 'ACTIVE' ? '600' : '500',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: '0.2s'
            }}
          >
            <UserCheck size={18} /> Hoạt động
          </button>
          <button 
            onClick={() => setActiveTab('LOCKED')}
            style={{ 
              flex: 1, padding: '16px', background: 'transparent', border: 'none', cursor: 'pointer',
              borderBottom: activeTab === 'LOCKED' ? '3px solid #ef4444' : '3px solid transparent',
              color: activeTab === 'LOCKED' ? '#ef4444' : '#6b7280',
              fontWeight: activeTab === 'LOCKED' ? '600' : '500',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: '0.2s'
            }}
          >
            <UserX size={18} /> Bị khóa
          </button>
          <button 
            onClick={() => setActiveTab('INACTIVE')}
            style={{ 
              flex: 1, padding: '16px', background: 'transparent', border: 'none', cursor: 'pointer',
              borderBottom: activeTab === 'INACTIVE' ? '3px solid #6366f1' : '3px solid transparent',
              color: activeTab === 'INACTIVE' ? '#6366f1' : '#6b7280',
              fontWeight: activeTab === 'INACTIVE' ? '600' : '500',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: '0.2s'
            }}
          >
            <UserMinus size={18} /> Chưa kích hoạt
          </button>
        </div>

        <div style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <label className="admin-search" style={{ margin: 0, width: '300px' }}>
              <Search size={18} />
              <input 
                placeholder="Tìm theo Mã hoặc Tên..." 
                type="search" 
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </label>
            <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 16px', background: '#f8fafc', border: '1px solid #dde5ef', borderRadius: '8px', fontWeight: '500', color: '#111827' }}>
              <Filter size={16} /> Lọc trạng thái
            </button>
          </div>

          <div className="admin-table-wrap">
            {renderTable()}
          </div>
        </div>
      </div>

      {/* Modal Thêm/Sửa */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="admin-panel" style={{ padding: '28px', borderRadius: '12px', width: '450px', maxWidth: '90%', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600' }}>{isEditMode ? 'Chỉnh sửa tài khoản' : 'Thêm tài khoản mới'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '8px' }}>Mã {role === 'student' ? 'Sinh viên' : 'Nhân viên'} *</label>
                <input required type="text" className="admin-input" value={formData.studentCode} onChange={e => setFormData({...formData, studentCode: e.target.value})} style={{ width: '100%', padding: '10px 14px', background: '#f8fafc' }} placeholder={`Nhập mã ${role === 'student' ? 'sinh viên' : 'nhân viên'}`} />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '8px' }}>Họ và Tên *</label>
                <input required type="text" className="admin-input" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} style={{ width: '100%', padding: '10px 14px', background: '#f8fafc' }} placeholder="Nhập họ và tên đầy đủ" />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '8px' }}>Email *</label>
                <input required type="email" className="admin-input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: '10px 14px', background: '#f8fafc' }} placeholder="example@ptit.edu.vn" />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '8px' }}>{role === 'student' ? 'Lớp' : 'Đơn vị / Phòng ban'}</label>
                <input type="text" className="admin-input" value={formData.classCode} onChange={e => setFormData({...formData, classCode: e.target.value})} style={{ width: '100%', padding: '10px 14px', background: '#f8fafc' }} placeholder={`Nhập ${role === 'student' ? 'lớp' : 'đơn vị'}`} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-primary)', fontWeight: '500', cursor: 'pointer' }}>Hủy bỏ</button>
                <button type="submit" className="admin-primary-action" style={{ padding: '10px 16px', borderRadius: '8px' }}>Lưu thông tin</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
