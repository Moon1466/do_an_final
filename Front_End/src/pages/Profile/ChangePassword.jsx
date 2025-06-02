import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './ChangePassword.scss';
import Cookies from 'js-cookie';
import axios from 'axios';

const DEFAULT_AVATAR = "https://res.cloudinary.com/dcqyuixqu/image/upload/v1745775273/logo_user_empty_a971qi.png";

const ChangePassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({
    fullName: "",
    avatar: DEFAULT_AVATAR,
  });

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const userCookie = Cookies.get("user");
    if (userCookie) {
      try {
        const userData = JSON.parse(userCookie);
        setUserData({
          fullName: userData.fullName || userData.username || "",
          avatar: userData.avatar || DEFAULT_AVATAR,
        });
      } catch (e) {
        console.error("Error parsing user cookie:", e);
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Kiểm tra mật khẩu mới và xác nhận mật khẩu
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Mật khẩu mới và xác nhận mật khẩu không khớp');
      setLoading(false);
      return;
    }

    // Kiểm tra độ dài mật khẩu mới
    if (formData.newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
      setLoading(false);
      return;
    }

    try {
      const userCookie = Cookies.get("user");
      if (!userCookie) {
        toast.error('Vui lòng đăng nhập lại');
        navigate('/login');
        return;
      }

      const userData = JSON.parse(userCookie);
      const userId = userData._id;

      const response = await axios.put(
        `/api/accounts/${userId}/change-password`,
        {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        }
      );

      if (response.data.success) {
        // Hiển thị toast và đợi 1 giây trước khi chuyển trang
        toast.success('Đổi mật khẩu thành công', {
          onClose: () => {
            navigate('/profile');
          }
        });
      }
    } catch (error) {
      if (error.response) {
        // Lỗi từ server với status code
        const message = error.response.data.message || 'Có lỗi xảy ra khi đổi mật khẩu';
        toast.error(message);
      } else if (error.request) {
        // Lỗi không nhận được response
        toast.error('Không thể kết nối đến server');
      } else {
        // Lỗi khác
        toast.error('Có lỗi xảy ra khi đổi mật khẩu');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <ToastContainer 
        position="top-right" 
        autoClose={2000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
      />
      <div className="profile-sidebar">
        <div className="avatar">
          <img src={userData.avatar} alt="User Avatar" />
        </div>
        <div className="user-info">
          <h2>{userData.fullName}</h2>
        </div>
        
        <ul className="profile-menu">
          <li className={location.pathname === "/profile" ? "active" : ""}>
            <Link to="/profile">Thông tin tài khoản</Link>
          </li>
          <li className={location.pathname === "/change-password" ? "active" : ""}>
            <Link to="/change-password">Đổi mật khẩu</Link>
          </li>
          <li className={location.pathname === "/order-history" ? "active" : ""}>
            <Link to="/order-history">Đơn hàng của tôi</Link>
          </li>
        </ul>
      </div>

      <div className="profile-content">
        <div className="change-password-form">
          <h2>Đổi mật khẩu</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Mật khẩu hiện tại</label>
              <input
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                placeholder="Nhập mật khẩu hiện tại"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Mật khẩu mới</label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Nhập mật khẩu mới"
                required
                minLength={6}
              />
            </div>

            <div className="form-group">
              <label>Xác nhận mật khẩu mới</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Nhập lại mật khẩu mới"
                required
              />
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                className="btn-submit"
                disabled={loading}
              >
                {loading ? 'Đang xử lý...' : 'Cập nhật mật khẩu'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword; 