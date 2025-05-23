import React, { useState, useEffect } from "react";
import "./ForgotPassword.scss";

const ForgotPassword = () => {
  const [settings, setSettings] = useState(null);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    fetch("/api/setting")
      .then((res) => res.json())
      .then((data) => setSettings(data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    if (!email) {
      setError("Vui lòng nhập email.");
      return;
    }
    if (!otp) {
      setError("Vui lòng nhập mã xác minh.");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }
    if (newPassword !== confirm) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }
    // TODO: Gửi request xác minh OTP và đổi mật khẩu
    setSuccessMsg("Đổi mật khẩu thành công! Bạn có thể đăng nhập với mật khẩu mới.");
  };

  const handleSendOtp = async () => {
    setError("");
    setSuccessMsg("");
    if (!email) {
      setError("Vui lòng nhập email trước khi gửi mã xác minh.");
      return;
    }
    // TODO: Gửi request gửi mã OTP về email
    setSuccessMsg("Mã xác minh đã được gửi tới email của bạn.");
  };

  return (
    <div className="forgot-container">
      <div className="forgot-box">
        <div className="forgot-logo">
          <img src={settings?.logo || "/assets/images/icon/fahasa-logo.webp"} alt="Logo" />
        </div>
        <h2>Quên mật khẩu?</h2>
        <p className="forgot-desc">Nhập email, mã xác minh và mật khẩu mới để đặt lại mật khẩu.</p>
        {error && <div className="forgot-error">{error}</div>}
        {successMsg && <div className="forgot-success">{successMsg}</div>}
        {successMsg ? (
          <a href="/login" className="forgot-back">
            &larr; Quay lại đăng nhập
          </a>
        ) : (
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Nhập email của bạn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="forgot-input"
              required
            />
            <div className="forgot-otp-row">
              <input
                type="text"
                placeholder="Nhập mã xác minh"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="forgot-input"
                required
                style={{ flex: 1 }}
              />
              <button
                type="button"
                className="forgot-otp-btn"
                onClick={handleSendOtp}
                disabled={!email}
                style={{ marginLeft: 8 }}>
                Gửi
              </button>
            </div>
            <input
              type="password"
              placeholder="Mật khẩu mới"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="forgot-input"
              required
            />
            <input
              type="password"
              placeholder="Nhập lại mật khẩu mới"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="forgot-input"
              required
            />
            <button type="submit" className="forgot-btn">
              Đổi mật khẩu
            </button>
          </form>
        )}
        <a href="/login" className="forgot-back">
          &larr; Quay lại đăng nhập
        </a>
      </div>
    </div>
  );
};

export default ForgotPassword;
