import React, { useState } from 'react';
import { X, Send, Sparkles, Bell, CheckCircle } from 'lucide-react';
import { notificationService } from '../services/notificationService';

const SendNotificationModal = ({ isOpen, onClose, eventId, eventTitle, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const quickTemplates = [
    {
      label: '⏰ Nhắc nhở sự kiện',
      title: '⏰ Nhắc nhở sự kiện sắp diễn ra',
      message: `Xin chào bạn, sự kiện "${eventTitle || 'Sự kiện'}" sẽ sắp sửa diễn ra. Bạn hãy chuẩn bị thời gian và mang theo mã QR để check-in đúng giờ nhé!`
    },
    {
      label: '📍 Thay đổi địa điểm',
      title: '⚠️ Thông báo cập nhật thông tin sự kiện',
      message: `Sự kiện "${eventTitle || 'Sự kiện'}" có một số cập nhật mới về địa điểm hoặc thời gian tổ chức. Vui lòng xem chi tiết trên trang sự kiện để không bị bỏ lỡ.`
    },
    {
      label: '🎉 Cảm ơn tham gia',
      title: '🎉 Cảm ơn bạn đã tham dự sự kiện',
      message: `Cảm ơn bạn đã tham gia sự kiện "${eventTitle || 'Sự kiện'}". Điểm rèn luyện của bạn sẽ được hệ thống cập nhật tự động trong thời gian sớm nhất. Hẹn gặp lại bạn!`
    }
  ];

  const handleApplyTemplate = (tpl) => {
    setTitle(tpl.title);
    setMessage(tpl.message);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setError('Vui lòng nhập đầy đủ tiêu đề và nội dung');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await notificationService.sendNotificationForManager(eventId, {
        title: title.trim(),
        message: message.trim()
      });
      if (onSuccess) {
        onSuccess(res?.message || 'Gửi thông báo thành công');
      }
      onClose();
      setTitle('');
      setMessage('');
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Có lỗi xảy ra khi gửi thông báo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.6)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '20px',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '560px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Bell size={22} color="#ffffff" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>Gửi thông báo sự kiện</h3>
              <p style={{ margin: 0, fontSize: '13px', opacity: 0.9 }}>Đến tất cả sinh viên đã đăng ký tham gia</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: '#ffffff',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {error && (
            <div style={{
              padding: '12px 16px',
              background: '#fef2f2',
              color: '#dc2626',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '20px',
              border: '1px solid #fecaca'
            }}>
              {error}
            </div>
          )}

          {/* Quick Templates Section */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700', color: '#475569', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <Sparkles size={14} color="#f59e0b" /> Mẫu thông báo nhanh (Chọn để điền tự động):
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {quickTemplates.map((tpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyTemplate(tpl)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '20px',
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    color: '#334155',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.color = '#1d4ed8'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#334155'; }}
                >
                  {tpl.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title Input */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
              Tiêu đề thông báo <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              placeholder="VD: Nhắc nhở check-in sự kiện..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '12px',
                border: '1px solid #cbd5e1',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#2563eb'}
              onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
            />
          </div>

          {/* Message Input */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
              Nội dung thông báo <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <textarea
              rows="5"
              placeholder="Nhập nội dung thông báo gửi tới các bạn sinh viên..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '12px',
                border: '1px solid #cbd5e1',
                fontSize: '14px',
                outline: 'none',
                resize: 'vertical',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
                lineHeight: '1.5'
              }}
              onFocus={(e) => e.target.style.borderColor = '#2563eb'}
              onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: '12px 20px',
                borderRadius: '12px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#475569',
                fontSize: '14px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '12px 24px',
                borderRadius: '12px',
                border: 'none',
                background: loading ? '#93c5fd' : '#2563eb',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
              }}
            >
              <Send size={16} />
              {loading ? 'Đang gửi...' : 'Gửi thông báo ngay'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SendNotificationModal;
