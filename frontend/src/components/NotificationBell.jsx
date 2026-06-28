import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Bell, Check, Trash2, ExternalLink, Calendar, Shield, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../services/notificationService';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [coords, setCoords] = useState({ top: 0, right: 0 });

  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationService.getMyNotifications();
      if (res) {
        setNotifications(res.notifications || []);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (err) {
      console.error("Lỗi khi tải thông báo:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateCoords = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const right = window.innerWidth - rect.right;
      setCoords({
        top: rect.bottom + 8,
        right: Math.max(10, right - 10)
      });
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    updateCoords();
    window.addEventListener('resize', updateCoords);
    window.addEventListener('scroll', updateCoords, true);
    return () => {
      window.removeEventListener('resize', updateCoords);
      window.removeEventListener('scroll', updateCoords, true);
    };
  }, [isOpen]);

  // Đóng dropdown khi click ra ngoài button và dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(event.target) &&
        buttonRef.current && !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleItemClick = async (item) => {
    if (!item.isRead) {
      handleMarkAsRead(item.id);
    }
    setIsOpen(false);
    if (item.eventId) {
      navigate(`/explore/${item.eventId}`);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays === 1) return 'Hôm qua';
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <div style={{ display: 'inline-block' }}>
      <button 
        ref={buttonRef}
        type="button"
        onClick={() => {
          if (!isOpen) {
            updateCoords();
            fetchNotifications();
          }
          setIsOpen(!isOpen);
        }}
        style={{
          background: isOpen ? '#e2e8f0' : '#f1f5f9',
          border: 'none',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          position: 'relative',
          transition: 'all 0.2s',
          color: '#334155'
        }}
        title="Thông báo"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            background: '#ef4444',
            color: '#fff',
            fontSize: '11px',
            fontWeight: '700',
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid #fff',
            boxShadow: '0 2px 4px rgba(239,68,68,0.3)'
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && createPortal(
        <div 
          ref={dropdownRef}
          style={{
            position: 'fixed',
            right: `${coords.right}px`,
            top: `${coords.top}px`,
            width: '380px',
            maxHeight: '520px',
            background: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25), 0 10px 15px -3px rgba(0,0,0,0.1)',
            border: '1px solid #cbd5e1',
            zIndex: 9999999,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          {/* Header */}
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#f8fafc'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Thông báo</h4>
              {unreadCount > 0 && (
                <span style={{ background: '#dbeafe', color: '#1e40af', fontSize: '12px', fontWeight: '700', padding: '2px 8px', borderRadius: '12px' }}>
                  {unreadCount} mới
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2563eb',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Check size={14} /> Đọc tất cả
              </button>
            )}
          </div>

          {/* Body */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {loading && notifications.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
                Đang tải thông báo...
              </div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: '60px 20px', textAlign: 'center', color: '#94a3b8' }}>
                <Bell size={36} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                <p style={{ margin: 0, fontSize: '14px', fontWeight: '500' }}>Bạn chưa có thông báo nào</p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  style={{
                    padding: '14px 20px',
                    borderBottom: '1px solid #f1f5f9',
                    background: item.isRead ? '#ffffff' : '#eff6ff',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    display: 'flex',
                    gap: '12px',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = item.isRead ? '#f8fafc' : '#e0f2fe'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = item.isRead ? '#ffffff' : '#eff6ff'; }}
                >
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: item.isRead ? '#f1f5f9' : '#dbeafe',
                    color: item.isRead ? '#64748b' : '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px'
                  }}>
                    <Info size={18} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '4px' }}>
                      <strong style={{ fontSize: '14px', color: '#0f172a', fontWeight: item.isRead ? '600' : '700', lineHeight: '1.3' }}>
                        {item.title}
                      </strong>
                      {!item.isRead && (
                        <span
                          onClick={(e) => handleMarkAsRead(item.id, e)}
                          title="Đánh dấu đã đọc"
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: '#2563eb',
                            display: 'inline-block',
                            flexShrink: 0,
                            marginTop: '4px'
                          }}
                        />
                      )}
                    </div>
                    <p style={{ margin: '0 0 6px 0', fontSize: '13px', color: '#475569', lineHeight: '1.4', wordBreak: 'break-word' }}>
                      {item.message}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#94a3b8' }}>
                      <span>{formatDate(item.createdAt)}</span>
                      {item.eventTitle && (
                        <span style={{ color: '#2563eb', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '2px' }}>
                          Chi tiết <ExternalLink size={10} />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default NotificationBell;
