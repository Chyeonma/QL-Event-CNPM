import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Search, Plus, Filter, UserCheck, UserX, UserMinus,
  Edit, Lock, Unlock, X, Trash2, Eye, UserPlus, Download,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { adminUserService } from '../../services/adminUserService';

const PAGE_SIZE = 10;

const AdminUsers = () => {
  const { role } = useParams();
  const [activeTab, setActiveTab] = useState('ACTIVE');
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({ id: '', studentCode: '', fullName: '', email: '', classCode: '', role: '' });

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailUser, setDetailUser] = useState(null);

  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [promoteEmail, setPromoteEmail] = useState('');
  const [promoteRole, setPromoteRole] = useState('ADMIN');
  const [promoteLoading, setPromoteLoading] = useState(false);

  useEffect(() => {
    if (role) fetchUsers();
  }, [role]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, search]);

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
          role: u.role,
          status,
        };
      });
      setUsers(mapped);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setFormData({ id: '', studentCode: '', fullName: '', email: '', classCode: '', role: role.toUpperCase() });
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
        classCode: data.classCode || '',
        role: data.role || role.toUpperCase(),
      });
      setIsEditMode(true);
      setShowModal(true);
    } catch {
      alert('Lỗi tải thông tin người dùng');
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
        role: formData.role || role.toUpperCase(),
      };
      if (isEditMode) {
        await adminUserService.updateUser(formData.id, payload);
      } else {
        await adminUserService.createUser(payload);
      }
      setShowModal(false);
      fetchUsers();
    } catch (e) {
      alert(e.response?.data?.message || 'Lỗi lưu dữ liệu');
    }
  };

  const handleToggleLock = async (id, isLocked) => {
    if (!window.confirm(`Bạn có chắc muốn ${isLocked ? 'mở khóa' : 'khóa'} tài khoản này?`)) return;
    try {
      isLocked ? await adminUserService.unlockUser(id) : await adminUserService.lockUser(id);
      fetchUsers();
    } catch {
      alert('Lỗi thao tác');
    }
  };

  const handleDeletePermanently = async (id, name) => {
    if (!window.confirm(`Xóa vĩnh viễn tài khoản "${name}"? Hành động này không thể hoàn tác.`)) return;
    try {
      await adminUserService.deleteUserPermanently(id);
      fetchUsers();
    } catch {
      alert('Lỗi xóa tài khoản');
    }
  };

  const handleActivate = async (id) => {
    if (!window.confirm('Kích hoạt tài khoản này?')) return;
    try {
      await adminUserService.activateUser(id);
      fetchUsers();
    } catch {
      alert('Lỗi kích hoạt tài khoản');
    }
  };

  const handleViewDetail = async (id) => {
    try {
      const data = await adminUserService.getUserById(id);
      setDetailUser(data);
      setShowDetailModal(true);
    } catch {
      alert('Lỗi tải thông tin');
    }
  };

  const handlePromote = async (e) => {
    e.preventDefault();
    setPromoteLoading(true);
    try {
      await adminUserService.promoteByEmail(promoteEmail, promoteRole);
      alert(`Đã cấp quyền ${promoteRole} cho ${promoteEmail} thành công!`);
      setShowPromoteModal(false);
      setPromoteEmail('');
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Không tìm thấy email hoặc lỗi cấp quyền');
    } finally {
      setPromoteLoading(false);
    }
  };

  const handleExportCSV = () => {
    const filtered = getFiltered();
    const isStudent = role === 'student';
    const headers = isStudent
      ? ['Mã SV', 'Họ và Tên', 'Email', 'Lớp', 'Trạng thái']
      : ['Mã NV', 'Họ và Tên', 'Email', 'Đơn vị/Phòng ban', 'Role', 'Trạng thái'];
    const rows = filtered.map(u =>
      isStudent
        ? [u.code, u.name, u.email, u.class, u.status]
        : [u.code, u.name, u.email, u.department, u.role, u.status]
    );
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `danh-sach-${role}-${activeTab.toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getFiltered = () =>
    users.filter(u =>
      u.status === activeTab &&
      (u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.code.toLowerCase().includes(search.toLowerCase()))
    );

  const getPaged = () => {
    const filtered = getFiltered();
    const start = (currentPage - 1) * PAGE_SIZE;
    return { paged: filtered.slice(start, start + PAGE_SIZE), total: filtered.length };
  };

  const totalPages = () => Math.ceil(getFiltered().length / PAGE_SIZE) || 1;

  const renderActions = (u) => (
    <div style={{ display: 'flex', gap: '6px' }}>
      <button className="admin-icon-button" title="Xem chi tiết" onClick={() => handleViewDetail(u.id)}>
        <Eye size={15} />
      </button>
      <button className="admin-icon-button" title="Chỉnh sửa" onClick={() => handleOpenEdit(u.id)}>
        <Edit size={15} />
      </button>
      {u.status === 'INACTIVE' && (
        <button className="admin-icon-button" title="Kích hoạt" style={{ color: '#10b981' }} onClick={() => handleActivate(u.id)}>
          <UserCheck size={15} />
        </button>
      )}
      {u.status === 'LOCKED' ? (
        <button className="admin-icon-button" title="Mở khóa" onClick={() => handleToggleLock(u.id, true)}>
          <Unlock size={15} />
        </button>
      ) : (
        <button className="admin-icon-button" title="Khóa" onClick={() => handleToggleLock(u.id, false)}>
          <Lock size={15} />
        </button>
      )}
      <button className="admin-icon-button" title="Xóa vĩnh viễn" style={{ color: '#ef4444' }} onClick={() => handleDeletePermanently(u.id, u.name)}>
        <Trash2 size={15} />
      </button>
    </div>
  );

  const renderTable = () => {
    if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Đang tải dữ liệu...</div>;

    const { paged, total } = getPaged();
    const isStudent = role === 'student';
    const colSpan = isStudent ? 5 : 6;

    return (
      <>
        <table className="admin-table">
          <thead>
            <tr>
              <th>{isStudent ? 'Mã SV' : 'Mã NV'}</th>
              <th>Họ và Tên</th>
              <th>Email</th>
              <th>{isStudent ? 'Lớp' : 'Đơn vị / Phòng ban'}</th>
              {!isStudent && <th>Role</th>}
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {paged.map(u => (
              <tr key={u.id}>
                <td><strong>{u.code}</strong></td>
                <td>{u.name}</td>
                <td style={{ color: '#6b7280' }}>{u.email}</td>
                <td>{isStudent ? u.class : u.department}</td>
                {!isStudent && (
                  <td>
                    <span style={{
                      padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: '600',
                      background: u.role === 'ADMIN' ? '#fef3c7' : '#e0f2fe',
                      color: u.role === 'ADMIN' ? '#d97706' : '#0369a1'
                    }}>
                      {u.role}
                    </span>
                  </td>
                )}
                <td>{renderActions(u)}</td>
              </tr>
            ))}
            {paged.length === 0 && (
              <tr><td colSpan={colSpan} style={{ textAlign: 'center', padding: '30px', color: '#6b7280' }}>Không có tài khoản nào</td></tr>
            )}
          </tbody>
        </table>

        {total > PAGE_SIZE && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', padding: '0 4px' }}>
            <span style={{ fontSize: '14px', color: '#6b7280' }}>
              Hiển thị {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, total)} / {total}
            </span>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                style={{ padding: '6px 10px', border: '1px solid #dde5ef', borderRadius: '6px', background: currentPage === 1 ? '#f8fafc' : '#fff', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}>
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages() }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages() || Math.abs(p - currentPage) <= 1)
                .reduce((acc, p, idx, arr) => {
                  if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, idx) =>
                  p === '...' ? (
                    <span key={`e-${idx}`} style={{ padding: '6px 4px', color: '#6b7280' }}>...</span>
                  ) : (
                    <button key={p} onClick={() => setCurrentPage(p)}
                      style={{ padding: '6px 12px', border: '1px solid #dde5ef', borderRadius: '6px', cursor: 'pointer', background: currentPage === p ? '#3b82f6' : '#fff', color: currentPage === p ? '#fff' : '#374151', fontWeight: currentPage === p ? '600' : '400' }}>
                      {p}
                    </button>
                  )
                )}
              <button onClick={() => setCurrentPage(p => Math.min(totalPages(), p + 1))} disabled={currentPage === totalPages()}
                style={{ padding: '6px 10px', border: '1px solid #dde5ef', borderRadius: '6px', background: currentPage === totalPages() ? '#f8fafc' : '#fff', cursor: currentPage === totalPages() ? 'not-allowed' : 'pointer' }}>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </>
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
        <div style={{ display: 'flex', gap: '10px' }}>
          {role === 'admin' && (
            <button
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 16px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', fontWeight: '500', color: '#166534', cursor: 'pointer' }}
              onClick={() => setShowPromoteModal(true)}
            >
              <UserPlus size={16} /> Cấp quyền từ email
            </button>
          )}
          <button
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 16px', background: '#f8fafc', border: '1px solid #dde5ef', borderRadius: '8px', fontWeight: '500', color: '#111827', cursor: 'pointer' }}
            onClick={handleExportCSV}
          >
            <Download size={16} /> Xuất CSV
          </button>
          <button className="admin-primary-action" onClick={handleOpenCreate}>
            <Plus size={18} style={{ marginRight: '8px' }} />
            Thêm {roleTitle.toLowerCase()}
          </button>
        </div>
      </section>

      <div className="admin-panel" style={{ marginTop: '24px', padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #dde5ef', background: '#ffffff' }}>
          {[
            { key: 'ACTIVE', label: 'Hoạt động', icon: <UserCheck size={18} />, color: '#10b981' },
            { key: 'LOCKED', label: 'Bị khóa', icon: <UserX size={18} />, color: '#ef4444' },
            { key: 'INACTIVE', label: 'Chưa kích hoạt', icon: <UserMinus size={18} />, color: '#6366f1' },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              style={{
                flex: 1, padding: '16px', background: 'transparent', border: 'none', cursor: 'pointer',
                borderBottom: activeTab === tab.key ? `3px solid ${tab.color}` : '3px solid transparent',
                color: activeTab === tab.key ? tab.color : '#6b7280',
                fontWeight: activeTab === tab.key ? '600' : '500',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: '0.2s'
              }}>
              {tab.icon} {tab.label}
              <span style={{
                marginLeft: '4px', padding: '1px 7px', borderRadius: '10px', fontSize: '12px', fontWeight: '600',
                background: activeTab === tab.key ? tab.color : '#f1f5f9',
                color: activeTab === tab.key ? '#fff' : '#64748b'
              }}>
                {users.filter(u => u.status === tab.key).length}
              </span>
            </button>
          ))}
        </div>

        <div style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <label className="admin-search" style={{ margin: 0, width: '300px' }}>
              <Search size={18} />
              <input placeholder="Tìm theo Mã hoặc Tên..." type="search" value={search} onChange={e => setSearch(e.target.value)} />
            </label>
            <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 16px', background: '#f8fafc', border: '1px solid #dde5ef', borderRadius: '8px', fontWeight: '500', color: '#111827' }}>
              <Filter size={16} /> Lọc trạng thái
            </button>
          </div>
          <div className="admin-table-wrap">{renderTable()}</div>
        </div>
      </div>

      {/* Modal Thêm/Sửa */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="admin-panel" style={{ padding: '28px', borderRadius: '12px', width: '460px', maxWidth: '90%', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600' }}>{isEditMode ? 'Chỉnh sửa tài khoản' : 'Thêm tài khoản mới'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>Mã {role === 'student' ? 'Sinh viên' : 'Nhân viên'} *</label>
                <input required type="text" className="admin-input" value={formData.studentCode} onChange={e => setFormData({ ...formData, studentCode: e.target.value })} style={{ width: '100%', padding: '10px 14px', background: '#f8fafc' }} placeholder={`Nhập mã ${role === 'student' ? 'sinh viên' : 'nhân viên'}`} />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>Họ và Tên *</label>
                <input required type="text" className="admin-input" value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} style={{ width: '100%', padding: '10px 14px', background: '#f8fafc' }} placeholder="Nhập họ và tên đầy đủ" />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>Email *</label>
                <input required type="email" className="admin-input" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} style={{ width: '100%', padding: '10px 14px', background: '#f8fafc' }} placeholder="example@ptit.edu.vn" />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>{role === 'student' ? 'Lớp' : 'Đơn vị / Phòng ban'}</label>
                <input type="text" className="admin-input" value={formData.classCode} onChange={e => setFormData({ ...formData, classCode: e.target.value })} style={{ width: '100%', padding: '10px 14px', background: '#f8fafc' }} placeholder={`Nhập ${role === 'student' ? 'lớp' : 'đơn vị'}`} />
              </div>
              {isEditMode && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>Role</label>
                  <select className="admin-input" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} style={{ width: '100%', padding: '10px 14px', background: '#f8fafc' }}>
                    <option value="STUDENT">STUDENT</option>
                    <option value="MANAGER">MANAGER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', fontWeight: '500', cursor: 'pointer' }}>Hủy bỏ</button>
                <button type="submit" className="admin-primary-action" style={{ padding: '10px 16px', borderRadius: '8px' }}>Lưu thông tin</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Xem chi tiết */}
      {showDetailModal && detailUser && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="admin-panel" style={{ padding: '28px', borderRadius: '12px', width: '440px', maxWidth: '90%', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600' }}>Chi tiết tài khoản</h2>
              <button onClick={() => setShowDetailModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            {[
              { label: 'Mã', value: detailUser.studentCode || 'N/A' },
              { label: 'Họ và Tên', value: detailUser.fullName },
              { label: 'Email', value: detailUser.email },
              { label: 'Đơn vị / Lớp', value: detailUser.classCode || 'N/A' },
              { label: 'Role', value: detailUser.role },
              { label: 'Trạng thái', value: detailUser.isDeleted ? 'Bị khóa' : (detailUser.requirePasswordChange && !detailUser.hasPassword) ? 'Chưa kích hoạt' : 'Hoạt động' },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>{label}</span>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>{value}</span>
              </div>
            ))}
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowDetailModal(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #dde5ef', background: '#f8fafc', fontWeight: '500', cursor: 'pointer' }}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cấp quyền từ email */}
      {showPromoteModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="admin-panel" style={{ padding: '28px', borderRadius: '12px', width: '420px', maxWidth: '90%', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600' }}>Cấp quyền từ email</h2>
              <button onClick={() => setShowPromoteModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '20px' }}>
              Nhập email của người dùng đã có tài khoản để cấp quyền mới.
            </p>
            <form onSubmit={handlePromote}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>Email *</label>
                <input required type="email" className="admin-input" value={promoteEmail} onChange={e => setPromoteEmail(e.target.value)} style={{ width: '100%', padding: '10px 14px', background: '#f8fafc' }} placeholder="Nhập email người dùng" />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>Cấp quyền *</label>
                <select className="admin-input" value={promoteRole} onChange={e => setPromoteRole(e.target.value)} style={{ width: '100%', padding: '10px 14px', background: '#f8fafc' }}>
                  <option value="ADMIN">ADMIN</option>
                  <option value="MANAGER">MANAGER</option>
                  <option value="STUDENT">STUDENT</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setShowPromoteModal(false)} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', fontWeight: '500', cursor: 'pointer' }}>Hủy</button>
                <button type="submit" disabled={promoteLoading} className="admin-primary-action" style={{ padding: '10px 16px', borderRadius: '8px', opacity: promoteLoading ? 0.7 : 1 }}>
                  {promoteLoading ? 'Đang xử lý...' : 'Cấp quyền'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
