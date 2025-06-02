import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import "./Profile.scss";
import { Link, useLocation } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
      } catch (e) {
        console.error("Error parsing user cookie:", e);
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditUser(user);
    setIsEditing(false);
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
    try {
      const userCookie = Cookies.get("user");
      let userId = "";
      let currentUserData = {};
      if (userCookie) {
        try {
          currentUserData = JSON.parse(userCookie);
          userId = currentUserData._id;
        } catch (err) {
          console.error("Error parsing user cookie:", err);
        }
      }
      if (!userId) {
        toast.error("Không tìm thấy ID người dùng!");
        setLoading(false);
        return;
      }

      // Kiểm tra xem có dữ liệu nào thay đổi không
      const isDataChanged = 
        editUser.fullName !== user.fullName ||
        editUser.phone !== user.phone ||
        avatarFile !== null;

      if (!isDataChanged) {
        toast.info("Không có dữ liệu nào được thay đổi!");
        setLoading(false);
        return;
      }

      let res;
      if (avatarFile) {
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
        res = await axios.put(`/api/accounts/${userId}`, editUser, { withCredentials: true });
      }
      if (res.data.success) {
        const updatedUser = {
          ...currentUserData,
          ...editUser,
          avatar: res.data.account.avatar || editUser.avatar
        };
        setUser(updatedUser);
        Cookies.set("user", JSON.stringify(updatedUser), {
          expires: 7,
        });
        toast.success("Cập nhật thành công!");
        setAvatarFile(null);
      } else {
        toast.error("Cập nhật thất bại!");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      toast.error("Có lỗi xảy ra khi cập nhật!");
    }
    setLoading(false);
  };

  return (
    <div className="profile-container">
      <ToastContainer position="top-right" autoClose={3000} />
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
          <li className={location.pathname === "/change-password" ? "active" : ""}>
            <Link to="/change-password">Đổi mật khẩu</Link>
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
            <input type="email" name="email" value={editUser.email} disabled />
            <label>Avatar</label>
            <input type="file" name="avatar" accept="image/*" onChange={handleFileChange} />
            {editUser.avatar && (
              <img
                src={editUser.avatar}
                alt="Avatar Preview"
                style={{ width: 80, height: 80, borderRadius: "50%", marginTop: 8 }}
              />
            )}
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
