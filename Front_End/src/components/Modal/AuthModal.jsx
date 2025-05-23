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
    password: "",
    confirmPassword: "",
    fullName: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [settings, setSettings] = useState(null);
  const [remember, setRemember] = useState(false);

  useEffect(() => {
    fetch("/api/setting")
      .then((res) => res.json())
      .then((data) => setSettings(data));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (isLogin) {
      // Xử lý đăng nhập
      try {
        const response = await axios.post(
          "http://localhost:3000/api/account/login",
          {
            email: formData.email,
            password: formData.password,
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
            phone: response.data.account.phone || "",
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
        setError(error.response?.data?.message || "Đã có lỗi xảy ra khi đăng nhập");
      }
    } else {
      // Xử lý đăng ký
      if (formData.password !== formData.confirmPassword) {
        setError("Mật khẩu xác nhận không khớp");
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
            phone: response.data.account.phone || "",
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
                  className="auth-modal__input"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="auth-modal__form-group">
                <input
                  type="password"
                  name="password"
                  placeholder="Mật khẩu"
                  className="auth-modal__input"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
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
                  className="auth-modal__input"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="auth-modal__form-group">
                <input
                  type="text"
                  name="fullName"
                  placeholder="Họ và tên"
                  className="auth-modal__input"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="auth-modal__form-group">
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  className="auth-modal__input"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="auth-modal__form-group">
                <input
                  type="tel"
                  name="phone"
                  placeholder="Số điện thoại (không bắt buộc)"
                  className="auth-modal__input"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              <div className="auth-modal__form-group">
                <input
                  type="password"
                  name="password"
                  placeholder="Mật khẩu"
                  className="auth-modal__input"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="auth-modal__form-group">
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Nhập lại mật khẩu"
                  className="auth-modal__input"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
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
