import React, { createContext, useState, useEffect, useContext } from 'react';
import axiosInstance from '../config/axios';

const AuthContext = createContext(null);

// Hàm helper để trích xuất nội dung lỗi chi tiết từ Backend
const getErrorMessage = (error, defaultMessage) => {
  if (error.response?.data) {
    const data = error.response.data;
    if (data.message) {
      return data.message;
    }
    if (data.details) {
      // Trường hợp lỗi validation (ví dụ: mật khẩu ngắn hơn 8 ký tự), 
      // gộp các thông tin lỗi từ map chi tiết lại thành chuỗi.
      return Object.values(data.details).join(', ');
    }
  }
  return defaultMessage;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Lấy thông tin User hiện tại từ API /api/auth/me
  const fetchCurrentUser = async () => {
    try {
      const response = await axiosInstance.get('/api/auth/me');
      setUser(response.data);
      return response.data;
    } catch (error) {
      setUser(null);
      return null;
    }
  };

  // Khôi phục phiên làm việc khi F5/load web
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        await fetchCurrentUser();
      }
      setLoading(false);
    };

    initializeAuth();

    // Lắng nghe sự kiện logout phát ra từ axios interceptor khi refresh token hết hạn
    const handleForceLogout = () => {
      setUser(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    };

    window.addEventListener('auth-logout', handleForceLogout);
    return () => {
      window.removeEventListener('auth-logout', handleForceLogout);
    };
  }, []);

  // Hàm Đăng nhập
  const login = async (identifier, password) => {
    try {
      const response = await axiosInstance.post('/api/auth/login', {
        identifier,
        password,
      });

      const { accessToken, refreshToken } = response.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      // Fetch thông tin chi tiết user
      const userData = await fetchCurrentUser();
      return { success: true, user: userData };
    } catch (error) {
      // Trích xuất lỗi chi tiết
      const message = getErrorMessage(error, 'Đăng nhập thất bại');
      return { success: false, message };
    }
  };

  // Hàm Đăng xuất
  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        await axiosInstance.post('/api/auth/logout', { refreshToken });
      } catch (e) {
        console.error('Logout error on server:', e);
      }
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  // Hàm Đổi mật khẩu
  const changePassword = async (currentPassword, newPassword) => {
    try {
      await axiosInstance.post('/api/auth/change-password', {
        currentPassword,
        newPassword,
      });
      // Đổi mật khẩu xong thì logout vì Backend đã thu hồi toàn bộ token
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      return { success: true, message: 'Đổi mật khẩu thành công. Vui lòng đăng nhập lại.' };
    } catch (error) {
      const message = getErrorMessage(error, 'Đổi mật khẩu thất bại');
      return { success: false, message };
    }
  };

  // Hàm Quên mật khẩu
  const forgotPassword = async (email) => {
    try {
      const response = await axiosInstance.post('/api/auth/forgot-password', { email });
      return { success: true, message: response.data.message };
    } catch (error) {
      const message = getErrorMessage(error, 'Gửi yêu cầu thất bại');
      return { success: false, message };
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    changePassword,
    forgotPassword,
    fetchCurrentUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
