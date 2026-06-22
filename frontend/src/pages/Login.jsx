import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../config/axios';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Dành cho việc test nhanh API Google Login bằng cách dán ID Token thủ công
  const [showGoogleTest, setShowGoogleTest] = useState(false);
  const [googleIdToken, setGoogleIdToken] = useState('');
  const { fetchCurrentUser } = useAuth();

  // Khởi tạo thư viện Google Identity Services (GIS)
  useEffect(() => {
    const initializeGoogleSignIn = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleGoogleCredentialResponse,
        });

        // Render nút Google Button chính thức
        window.google.accounts.id.renderButton(
          document.getElementById('googleBtnDiv'),
          { 
            theme: 'filled_blue', 
            size: 'large', 
            width: 400,
            text: 'signin_with',
            shape: 'rectangular'
          }
        );
      } else {
        // Thử lại sau 500ms nếu script chưa load xong
        setTimeout(initializeGoogleSignIn, 500);
      }
    };

    initializeGoogleSignIn();
  }, []);

  // Xử lý callback trả về ID Token từ Google
  const handleGoogleCredentialResponse = async (response) => {
    const idToken = response.credential;
    setError('');
    setInfoMessage('');
    setLoading(true);
    try {
      const apiResponse = await axiosInstance.post('/api/auth/google-login', { idToken });
      const { accessToken, refreshToken } = apiResponse.data;
      
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      await fetchCurrentUser();
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập Google thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');
    setLoading(true);

    const result = await login(identifier, password);
    setLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      // Nhận diện thông điệp gửi mật khẩu đăng nhập khởi tạo để hiển thị dạng info thay vì lỗi
      if (result.message.includes('Mật khẩu đăng nhập khởi tạo')) {
        setInfoMessage(result.message);
      } else {
        setError(result.message);
      }
    }
  };

  const handleGoogleLoginTest = async (e) => {
    e.preventDefault();
    if (!googleIdToken.trim()) return;

    setError('');
    setLoading(true);
    try {
      const response = await axiosInstance.post('/api/auth/google-login', { idToken: googleIdToken });
      const { accessToken, refreshToken } = response.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      await fetchCurrentUser();
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập Google thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Hệ Thống Sự Kiện</h2>
          <p>Đăng nhập để tiếp tục</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {infoMessage && <div className="alert alert-info">{infoMessage}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="identifier">Tài khoản</label>
            <input
              type="text"
              id="identifier"
              placeholder="Email hoặc Mã sinh viên"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <input
              type="password"
              id="password"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <small className="form-text text-muted">
              * Nếu là lần đầu đăng nhập bằng Mã sinh viên, vui lòng để trống mật khẩu để nhận mật khẩu kích hoạt qua Email.
            </small>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Đang xác thực...' : 'Đăng Nhập'}
          </button>
        </form>

        <div className="auth-footer">
          <Link to="/forgot-password">Quên mật khẩu?</Link>
        </div>

        <hr className="divider" />

        <div className="google-section">
          {/* Nút đăng nhập Google chính thức từ Google SDK */}
          <div id="googleBtnDiv" style={{ display: 'flex', justifyContent: 'center' }}></div>

          <button
            type="button"
            className="btn btn-link btn-block"
            style={{ fontSize: '12px', marginTop: '10px' }}
            onClick={() => setShowGoogleTest(!showGoogleTest)}
          >
            {showGoogleTest ? 'Ẩn mục kiểm thử API thủ công' : 'Hiện mục kiểm thử API thủ công (dán token)'}
          </button>

          {showGoogleTest && (
            <form onSubmit={handleGoogleLoginTest} className="google-test-form">
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Dán ID Token Google ở đây..."
                  value={googleIdToken}
                  onChange={(e) => setGoogleIdToken(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-secondary btn-block btn-sm" disabled={loading}>
                Gửi ID Token
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
