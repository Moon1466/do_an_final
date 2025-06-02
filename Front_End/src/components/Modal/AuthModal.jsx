import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import axios from "axios";
import Cookies from "js-cookie";
import "./AuthModal.scss";

// Cấu hình axios mặc định
axios.defaults.withCredentials = true;

const AuthModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    fullName: "",
  });
  const [error, setError] = useState("");
  const [settings, setSettings] = useState(null);
  const [remember, setRemember] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [formErrors, setFormErrors] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    fetch("/api/setting")
      .then((res) => res.json())
      .then((data) => setSettings(data));
  }, []);

  // Validate Vietnamese phone number
  const validatePhone = (phone) => {
    const phoneRegex = /^(0|84)(3[2-9]|5[689]|7[06-9]|8[1-689]|9[0-46-9])[0-9]{7}$/;
    return phoneRegex.test(phone);
  };

  // Validate Gmail address
  const validateEmail = (email) => {
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    return gmailRegex.test(email);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    let error = "";

    // Phone number validation
    if (name === "phone") {
      newValue = value.replace(/[^\d]/g, '');
      if (newValue && !validatePhone(newValue)) {
        error = "Số điện thoại không hợp lệ (VD: 0332339xxxx)";
      }
    }

    // Email validation
    if (name === "email") {
      if (value && !validateEmail(value)) {
        error = "Vui lòng nhập địa chỉ Gmail hợp lệ";
      }
    }

    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    if (showErrors) {
      setFormErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setShowErrors(true);

    if (isLogin) {
      // Xử lý đăng nhập
      try {
        const response = await axios.post(
          "http://localhost:3000/api/account/login",
          {
            email: formData.email,
            password: formData.password
          },
          {
            withCredentials: true,
          }
        );

        if (response.data.success) {
          // Lưu thông tin người dùng vào cookie
          const userInfo = {
            _id: response.data.account._id,
            username: response.data.account.username,
            email: response.data.account.email,
            fullName: response.data.account.fullName,
            role: response.data.account.role,
            avatar: response.data.account.avatar,
            phone: response.data.account.phone || ""
          };
          Cookies.set("user", JSON.stringify(userInfo), { expires: 7 });
          if (onLoginSuccess) onLoginSuccess(userInfo);
          onClose();
          setFormData({
            username: "",
            email: "",
            password: "",
            confirmPassword: "",
            fullName: "",
            phone: "",
          });
        }
      } catch (error) {
        console.error("Login error:", error);
        setError(error.response?.data?.message || "Đã <div className="
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          "></div> lỗi xảy ra khi đăng nhập");
      }
    } else {
      // Xử lý đăng ký
      if (formData.password !== formData.confirmPassword) {
        setError("Mật khẩu xác nhận không khớp");
        return;
      }

      // Validate all fields before submission
      const errors = {
        username: !formData.username ? "Vui lòng nhập tên đăng nhập" : "",
        email: !formData.email ? "Vui lòng nhập email" : !validateEmail(formData.email) ? "Vui lòng nhập địa chỉ Gmail hợp lệ" : "",
        phone: !formData.phone ? "Vui lòng nhập số điện thoại" : !validatePhone(formData.phone) ? "Số điện thoại không hợp lệ" : "",
        password: !formData.password ? "Vui lòng nhập mật khẩu" : "",
        confirmPassword: formData.password !== formData.confirmPassword ? "Mật khẩu không khớp" : ""
      };

      setFormErrors(errors);

      // Check if there are any errors
      if (Object.values(errors).some(error => error)) {
        return;
      }

      try {
        const response = await axios.post(
          "http://localhost:3000/api/account/create",
          {
            username: formData.username,
            email: formData.email,
            password: formData.password,
            fullName: formData.fullName,
            phone: formData.phone || "",
            role: "user",
          },
          {
            withCredentials: true,
          }
        );

        if (response.data.success) {
          // Lưu thông tin người dùng vào cookie
          const userInfo = {
            _id: response.data.account._id,
            username: response.data.account.username,
            email: response.data.account.email,
            fullName: response.data.account.fullName,
            role: response.data.account.role,
            avatar: response.data.account.avatar,
            phone: response.data.account.phone || formData.phone || "",
          };
          Cookies.set("user", JSON.stringify(userInfo), { expires: 7 });
          if (onLoginSuccess) onLoginSuccess(userInfo);
          onClose();
          setFormData({
            username: "",
            email: "",
            password: "",
            confirmPassword: "",
            fullName: "",
            phone: "",
          });
        }
      } catch (error) {
        console.error("Registration error:", error);
        setError(error.response?.data?.message || "Đã có lỗi xảy ra khi đăng ký");
      }
    }
  };

  // Reset showErrors when switching between login and register
  useEffect(() => {
    setShowErrors(false);
    setFormErrors({
      username: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    });
  }, [isLogin]);

  if (!isOpen) return null;

  return (
    <div className="auth-modal">
      <div className="auth-modal__overlay" onClick={onClose}></div>
      <div className="auth-modal__content">
        <button className="auth-modal__close" onClick={onClose}>
          <FaTimes />
        </button>

        <div className="auth-modal__logo" style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <img
            src={settings?.logo || "/assets/images/icon/fahasa-logo.webp"}
            alt="Logo"
            style={{ height: 48, objectFit: "contain" }}
          />
        </div>

        <div className="auth-modal__tabs">
          <button className={`auth-modal__tab ${isLogin ? "active" : ""}`} onClick={() => setIsLogin(true)}>
            Đăng nhập
          </button>
          <button className={`auth-modal__tab ${!isLogin ? "active" : ""}`} onClick={() => setIsLogin(false)}>
            Đăng ký
          </button>
        </div>

        {error && <div className="auth-modal__error">{error}</div>}

        <div className="auth-modal__form">
          {isLogin ? (
            <form className="auth-modal__login-form" onSubmit={handleSubmit}>
              <div className="auth-modal__form-group">
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  className={`auth-modal__input ${showErrors && formErrors.email ? 'error' : ''}`}
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
                {showErrors && formErrors.email && <span className="auth-modal__error">{formErrors.email}</span>}
              </div>
              <div className="auth-modal__form-group">
                <input
                  type="password"
                  name="password"
                  placeholder="Mật khẩu"
                  className={`auth-modal__input ${showErrors && formErrors.password ? 'error' : ''}`}
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
                {showErrors && formErrors.password && <span className="auth-modal__error">{formErrors.password}</span>}
              </div>
              <div className="auth-modal__remember-row">
                <label className="auth-modal__remember-label">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={() => setRemember((v) => !v)}
                    style={{ marginRight: 4 }}
                  />
                  Ghi nhớ mật khẩu
                </label>
                <a href="/forgot-password" className="auth-modal__forgot-link">
                  Quên mật khẩu?
                </a>
              </div>
              <button type="submit" className="auth-modal__submit">
                Đăng nhập
              </button>
            </form>
          ) : (
            <form className="auth-modal__register-form" onSubmit={handleSubmit}>
              <div className="auth-modal__form-group">
                <input
                  type="text"
                  name="username"
                  placeholder="Tên đăng nhập"
                  className={`auth-modal__input ${showErrors && formErrors.username ? 'error' : ''}`}
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                />
                {showErrors && formErrors.username && <span className="auth-modal__error">{formErrors.username}</span>}
              </div>
              <div className="auth-modal__form-group">
                <input
                  type="text"
                  name="fullName"
                  placeholder="Họ và tên"
                  className="auth-modal__input"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="auth-modal__form-group">
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  className={`auth-modal__input ${showErrors && formErrors.email ? 'error' : ''}`}
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
                {showErrors && formErrors.email && <span className="auth-modal__error">{formErrors.email}</span>}
              </div>
              <div className="auth-modal__form-group">
                <input
                  type="tel"
                  name="phone"
                  placeholder="Số điện thoại"
                  className={`auth-modal__input ${showErrors && formErrors.phone ? 'error' : ''}`}
                  value={formData.phone}
                  onChange={handleInputChange}
                />
                {showErrors && formErrors.phone && <span className="auth-modal__error">{formErrors.phone}</span>}
              </div>
              <div className="auth-modal__form-group">
                <input
                  type="password"
                  name="password"
                  placeholder="Mật khẩu"
                  className={`auth-modal__input ${showErrors && formErrors.password ? 'error' : ''}`}
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
                {showErrors && formErrors.password && <span className="auth-modal__error">{formErrors.password}</span>}
              </div>
              <div className="auth-modal__form-group">
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Nhập lại mật khẩu"
                  className={`auth-modal__input ${showErrors && formErrors.confirmPassword ? 'error' : ''}`}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
                {showErrors && formErrors.confirmPassword && <span className="auth-modal__error">{formErrors.confirmPassword}</span>}
              </div>
              <button type="submit" className="auth-modal__submit">
                Đăng ký
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
