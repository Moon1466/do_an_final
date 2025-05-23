import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import "./Profile.scss";
import { Link, useLocation } from "react-router-dom";

const DEFAULT_AVATAR = "https://res.cloudinary.com/dcqyuixqu/image/upload/v1745775273/logo_user_empty_a971qi.png";

const Profile = () => {
  const [user, setUser] = useState({
    fullName: "",
    phone: "",
    email: "",
    avatar: DEFAULT_AVATAR,
  });
  const [editUser, setEditUser] = useState(user);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const userCookie = Cookies.get("user");
    if (userCookie) {
      try {
        const userData = JSON.parse(userCookie);
        const newUser = {
          fullName: userData.fullName || userData.username || "",
          phone: userData.phone || "",
          email: userData.email || "",
          avatar: userData.avatar || DEFAULT_AVATAR,
        };
        setUser(newUser);
        setEditUser(newUser);
      } catch (e) {}
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = () => {
    setIsEditing(true);
    setMessage("");
  };

  const handleCancel = () => {
    setEditUser(user);
    setIsEditing(false);
    setMessage("");
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
      setEditUser((prev) => ({ ...prev, avatar: URL.createObjectURL(e.target.files[0]) }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      // Lấy _id từ user cookie
      const userCookie = Cookies.get("user");
      let userId = "";
      if (userCookie) {
        try {
          const userData = JSON.parse(userCookie);
          userId = userData._id;
        } catch {}
      }
      if (!userId) {
        setMessage("Không tìm thấy ID người dùng!");
        setLoading(false);
        return;
      }
      let res;
      if (avatarFile) {
        // Nếu có file ảnh mới, gửi FormData
        const formData = new FormData();
        formData.append("fullName", editUser.fullName);
        formData.append("phone", editUser.phone);
        formData.append("email", editUser.email);
        formData.append("avatar", avatarFile);
        res = await axios.put(`/api/accounts/${userId}`, formData, {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        // Nếu không có file, gửi JSON như cũ
        res = await axios.put(`/api/accounts/${userId}`, editUser, { withCredentials: true });
      }
      if (res.data.success) {
        setUser(editUser);
        Cookies.set("user", JSON.stringify({ ...editUser, _id: userId, avatar: res.data.account.avatar }), {
          expires: 7,
        });
        setMessage("Cập nhật thành công!");
        setAvatarFile(null);
      } else {
        setMessage("Cập nhật thất bại!");
      }
    } catch (err) {
      setMessage("Có lỗi xảy ra khi cập nhật!");
    }
    setLoading(false);
  };

  return (
    <div className="profile-container">
      {/* Sidebar left */}
      <div className="profile-sidebar">
        <div className="avatar">
          <img src={isEditing ? editUser.avatar : user.avatar} alt="User Avatar" />
        </div>
        <div className="user-info">
          <h2>{isEditing ? editUser.fullName : user.fullName}</h2>
        </div>
        <ul className="profile-menu">
          <li className={location.pathname === "/profile" ? "active" : ""}>
            <Link to="/profile">Thông tin tài khoản</Link>
          </li>
          <li className={location.pathname === "/order-history" ? "active" : ""}>
            <Link to="/order-history">Đổi mật khẩu</Link>
          </li>
          <li className={location.pathname === "/order-history" ? "active" : ""}>
            <Link to="/order-history">Đơn hàng của tôi</Link>
          </li>
        </ul>
      </div>
      {/* Main content right */}
      <div className="profile-main">
        <div className="profile-details">
          <h3>Hồ sơ cá nhân</h3>
          <form onSubmit={handleSave}>
            <label>Họ và tên</label>
            <input type="text" name="fullName" value={editUser.fullName} onChange={handleChange} required />
            <label>Số điện thoại</label>
            <input type="text" name="phone" value={editUser.phone} onChange={handleChange} />
            <label>Email</label>
            <input type="email" name="email" value={editUser.email} onChange={handleChange} required />
            <label>Avatar</label>
            <input type="file" name="avatar" accept="image/*" onChange={handleFileChange} />
            {editUser.avatar && (
              <img
                src={editUser.avatar}
                alt="Avatar Preview"
                style={{ width: 80, height: 80, borderRadius: "50%", marginTop: 8 }}
              />
            )}
            {message && <div style={{ color: message.includes("thành công") ? "green" : "red" }}>{message}</div>}
            <div style={{ marginTop: 12 }}>
              <button type="submit" disabled={loading} className="btn profile-save-btn">
                Lưu
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
