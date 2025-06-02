import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaSearch, FaBell, FaShoppingCart, FaUser } from "react-icons/fa";
import { IoApps } from "react-icons/io5";
import AuthModal from "../../components/Modal/AuthModal";
import Cookies from "js-cookie";
import moment from 'moment';
import 'moment/locale/vi';

// Thiết lập ngôn ngữ tiếng Việt cho moment
moment.locale('vi');

import "./Header.scss";

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const [settings, setSettings] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);
  const [isCartDropdownOpen, setIsCartDropdownOpen] = useState(false);
  const cartDropdownRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
  const notificationDropdownRef = useRef(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownTimeoutRef = useRef(null);

  useEffect(() => {
    // Kiểm tra cookie khi component mount
    const userCookie = Cookies.get("user");
    if (userCookie) {
      const user = JSON.parse(decodeURIComponent(userCookie));
      setUserInfo(user);
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    fetch("/api/setting")
      .then((res) => res.json())
      .then((data) => setSettings(data));
  }, []);

  const handleAuthClick = () => {
    setIsAuthModalOpen(true);
  };

  const handleCloseAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const handleLoginSuccess = (userData) => {
    setUserInfo(userData);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    Cookies.remove("user");
    setUserInfo(null);
    setIsLoggedIn(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm(searchTerm.trim());
    }
  };

  const handleAvatarClick = (e) => {
    e.stopPropagation();
    setIsDropdownOpen(true);
  };

  useEffect(() => {
    if (!isDropdownOpen) return;
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  // Lấy giỏ hàng khi đăng nhập hoặc khi mở dropdown
  const fetchCart = async () => {
    try {
      setCartLoading(true);
      const userCookie = Cookies.get("user");
      if (!userCookie) {
        setCartItems([]);
        setCartLoading(false);
        return;
      }
      const user = JSON.parse(decodeURIComponent(userCookie));
      const response = await fetch(`/api/basket/${user._id || user.username}`);
      const data = await response.json();
      if (data.success && data.data && data.data.items) {
        setCartItems(data.data.items);
      } else {
        setCartItems([]);
      }
    } catch (err) {
      setCartItems([]);
    } finally {
      setCartLoading(false);
    }
  };

  // Lấy giỏ hàng khi đăng nhập
  useEffect(() => {
    if (isLoggedIn) fetchCart();
  }, [isLoggedIn]);

  // Lấy giỏ hàng khi hover vào icon giỏ hàng
  const handleCartMouseEnter = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setActiveDropdown('cart');
    fetchCart();
  };

  useEffect(() => {
    if (!isCartDropdownOpen) return;
    const handleClickOutside = (event) => {
      if (cartDropdownRef.current && !cartDropdownRef.current.contains(event.target)) {
        setIsCartDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isCartDropdownOpen]);

  // Lắng nghe sự kiện cập nhật giỏ hàng từ các component khác
  useEffect(() => {
    const handleCartUpdated = () => {
      console.log("Cart updated event received, fetching cart...");
      fetchCart();
    };

    document.addEventListener("cartUpdated", handleCartUpdated);

    return () => {
      document.removeEventListener("cartUpdated", handleCartUpdated);
    };
  }, [isLoggedIn]); // Thêm isLoggedIn vào dependency array nếu việc fetchCart phụ thuộc vào trạng thái đăng nhập

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const userCookie = Cookies.get("user");
      if (!userCookie) return;

      const user = JSON.parse(decodeURIComponent(userCookie));
      const response = await fetch(`/api/notifications/${user._id}`);
      const data = await response.json();
      
      if (data.success) {
        setNotifications(data.data);
        setUnreadNotifications(data.data.filter(n => !n.isRead).length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Fetch notifications when user logs in
  useEffect(() => {
    if (isLoggedIn) {
      fetchNotifications();
    }
  }, [isLoggedIn]);

  // Handle notification click
  const handleNotificationClick = async (notificationId) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT'
      });
      fetchNotifications(); // Refresh notifications
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Handle notification hover
  const handleNotificationMouseEnter = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setActiveDropdown('notification');
    fetchNotifications();
  };

  // Handle mouse leave for both dropdowns
  const handleDropdownMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 300); // Delay 300ms before hiding dropdown
  };

  return (
    <header id="header" className="header">
      {/* Link test chuyển hướng profile */}

      <div className="container">
        <div className="header__inner">
          <Link to="/" className="logo">
            <img src={settings?.logo || "/assets/images/icon/fahasa-logo.webp"} alt="Logo" className="logo__icon" />
          </Link>
          <div className="search">
            <form onSubmit={handleSearch} className="search__form">
              <input
                type="text"
                className="search__input"
                placeholder="Tìm kiếm sản phẩm mong muốn..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button type="submit" className="btn search__btn">
                <FaSearch className="search__icon" />
              </button>
            </form>
          </div>
          <div className="header-act">
            <div className="header-act__control">
              {/* Notice */}
              <div
                className="header-act__border notification-container"
                ref={notificationDropdownRef}
                onMouseEnter={handleNotificationMouseEnter}
                onMouseLeave={handleDropdownMouseLeave}>
                <div className="header-act__notice">
                  <FaBell className="header-act__img" />
                  {unreadNotifications > 0 && (
                    <span className="notification-badge">{unreadNotifications}</span>
                  )}
                </div>
                <div 
                  className={`notice-dropdown ${activeDropdown === 'notification' ? 'active' : ''}`}
                  onMouseEnter={handleNotificationMouseEnter}
                  onMouseLeave={handleDropdownMouseLeave}>
                  <div className="notice-dropdown__wrapper">
                    <div className="notice-dropdown__heading">
                      <FaBell className="notice-dropdown__icon" />
                      <h3 className="notice-dropdown__title">Thông báo</h3>
                    </div>
                    <div className="notice-dropdown__body">
                      {notifications.length === 0 ? (
                        <div className="notice-dropdown__notice-no-empty">
                          <span className="notice-dropdown__label">
                            Hiện bạn chưa có thông báo
                          </span>
                        </div>
                      ) : (
                        <ul className="notice-dropdown__list">
                          {notifications.map((notification) => (
                            <li
                              key={notification._id}
                              className={`notice-dropdown__item ${
                                !notification.isRead ? "unread" : ""
                              }`}
                              onClick={() => handleNotificationClick(notification._id)}>
                              <div className={`notice-dropdown__icon ${notification.type}`}>
                                <FaBell />
                              </div>
                              <div className="notice-dropdown__content">
                                <h4 className="notice-dropdown__item-title">
                                  {notification.title}
                                </h4>
                                <p className="notice-dropdown__item-message">
                                  {notification.message}
                                </p>
                                <span className="notice-dropdown__item-time">
                                  {moment(notification.createdAt).fromNow()}
                                </span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              {/* Cart */}
              <div
                className="header-act__border cart-container"
                ref={cartDropdownRef}
                onMouseEnter={handleCartMouseEnter}
                onMouseLeave={handleDropdownMouseLeave}>
                <Link to="/cart" className="header-act__cart">
                  <FaShoppingCart className="header-act__img" />
                  {cartItems.length > 0 && <span className="cart-badge">{cartItems.length}</span>}
                </Link>
                <div 
                  className={`cart-dropdown ${activeDropdown === 'cart' ? 'active' : ''}`}
                  onMouseEnter={handleCartMouseEnter}
                  onMouseLeave={handleDropdownMouseLeave}>
                  <div className="cart-dropdown__wrapper">
                    <div className="cart-dropdown__heading">
                      <FaShoppingCart className="cart-dropdown__icon" />
                      <h3 className="cart-dropdown__title">Giỏ hàng</h3>
                    </div>
                    <div className="cart-dropdown__body">
                      {cartLoading ? (
                        <div className="cart-dropdown__loading">Đang tải...</div>
                      ) : cartItems.length === 0 ? (
                        <div className="cart-dropdown__notice-no-empty">
                          <span className="cart-dropdown__label">Hiện bạn chưa có sản phẩm</span>
                        </div>
                      ) : (
                        <ul className="cart-dropdown__list">
                          {cartItems
                            .slice(-3)
                            .reverse()
                            .map((item) => (
                              <li
                                key={item.productId}
                                className="cart-dropdown__item"
                                onClick={(e) => {
                                  e.preventDefault();
                                  navigate(`/product-detail/${item.productId}`);
                                }}>
                                <img src={item.productImage} alt={item.productName} className="cart-dropdown__img" />
                                <div className="cart-dropdown__info">
                                  <div className="cart-dropdown__name">{item.productName}</div>
                                  <div className="cart-dropdown__price">{item.price.toLocaleString()} đ</div>
                                  <div className="cart-dropdown__quantity">Số lượng: {item.quantity}</div>
                                </div>
                              </li>
                            ))}
                        </ul>
                      )}
                    </div>
                    {cartItems.length > 0 && (
                      <div className="cart-dropdown__footer">
                        <Link to="/cart" className="cart-dropdown__view-all">
                          Xem tất cả
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="header-act__account">
              {!isLoggedIn ? (
                <img
                  src="https://res.cloudinary.com/dcqyuixqu/image/upload/v1748018815/your_folder_name/qlrdmznl2wxr1iv0ojoz.svg"
                  alt="User Avatar"
                  className="user-avatar"
                  onClick={handleAuthClick}
                  style={{ cursor: "pointer" }}
                />
              ) : (
                <div onClick={handleAvatarClick} style={{ position: "relative" }}>
                  <img
                    src={
                      userInfo && userInfo.avatar
                        ? userInfo.avatar
                        : "https://res.cloudinary.com/dcqyuixqu/image/upload/v1745775273/logo_user_empty_a971qi.png"
                    }
                    alt="User Avatar"
                    className="user-avatar"
                  />
                  <div
                    className={`user-dropdown ${isDropdownOpen ? 'active' : ''}`}
                    ref={dropdownRef}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}>
                    <ul className="user-dropdown__list">
                      <li
                        className="user-dropdown__item"
                        onClick={() => {
                          navigate('/profile');
                          setIsDropdownOpen(false);
                        }}>
                        <Link to="/profile" style={{ color: "inherit", textDecoration: "none" }}>
                          Trang cá nhân
                        </Link>
                      </li>
                      <li className="user-dropdown__item" onClick={handleLogout}>
                        Đăng xuất
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <AuthModal isOpen={isAuthModalOpen} onClose={handleCloseAuthModal} onLoginSuccess={handleLoginSuccess} />
    </header>
  );
};

export default Header;
