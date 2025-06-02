import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./OrderHistory.scss";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); // all, processing, completed, cancelled
  const [filteredOrders, setFilteredOrders] = useState([]);

  // Filter orders based on status
  const filterOrders = (orderList = [], status) => {
    if (!Array.isArray(orderList)) {
      console.error('orderList is not an array:', orderList);
      setFilteredOrders([]);
      return;
    }

    if (status === "all") {
      setFilteredOrders(orderList);
    } else {
      const filtered = orderList.filter(order => {
        const orderStatus = order.status?.toLowerCase() || '';
        switch (status) {
          case "processing":
            return orderStatus.includes('xử lý') || orderStatus.includes('chờ xác nhận');
          case "completed":
            return orderStatus.includes('hoàn tất') || 
                   orderStatus.includes('đã giao') || 
                   orderStatus.includes('đã xác nhận');
          case "cancelled":
            return orderStatus.includes('hủy');
          default:
            return true;
        }
      });
      setFilteredOrders(filtered);
    }
  };

  const getStatusClass = (status) => {
    if (!status) return '';
    const statusLower = status.toLowerCase();
    if (statusLower.includes('xử lý') || statusLower.includes('chờ xác nhận')) {
      return 'processing';
    }
    if (statusLower.includes('hoàn tất') || statusLower.includes('đã giao') || statusLower.includes('đã xác nhận')) {
      return 'completed';
    }
    if (statusLower.includes('hủy')) {
      return 'cancelled';
    }
    return '';
  };

  const getStatusColor = (status) => {
    if (!status) return {};
    const statusClass = getStatusClass(status);
    switch (statusClass) {
      case 'processing':
        return { backgroundColor: '#fff3e0', color: '#f57c00' };
      case 'completed':
        return { backgroundColor: '#e8f5e9', color: '#2e7d32' };
      case 'cancelled':
        return { backgroundColor: '#ffebee', color: '#c62828' };
      default:
        return {};
    }
  };

  const getStatusText = (status) => {
    if (!status) return 'Không xác định';
    const statusLower = status.toLowerCase();
    if (statusLower.includes('xử lý') || statusLower.includes('chờ xác nhận')) {
      return 'Đang xử lý';
    }
    if (statusLower.includes('đã xác nhận')) {
      return 'Đã xác nhận';
    }
    if (statusLower.includes('hoàn tất') || statusLower.includes('đã giao')) {
      return 'Hoàn tất';
    }
    if (statusLower.includes('hủy')) {
      return 'Đã hủy';
    }
    return status;
  };

  // Fetch orders
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const userCookie = Cookies.get("user");
      if (!userCookie) {
        toast.error("Vui lòng đăng nhập để xem đơn hàng!");
        setLoading(false);
        return;
      }

      let userData;
      try {
        userData = JSON.parse(userCookie);
        if (!userData._id) {
          toast.error("Không tìm thấy thông tin người dùng!");
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error("Error parsing user cookie:", err);
        toast.error("Lỗi khi đọc thông tin người dùng!");
        setLoading(false);
        return;
      }

      const response = await axios.get(`/api/orders`, {
        params: {
          userId: userData._id
        }
      });
      
      console.log('Response from API:', response.data); // Log để debug

      if (response.data.success && Array.isArray(response.data.data)) {
        const orderData = response.data.data.map(order => {
          console.log('Order data:', order); // Log từng order để debug
          return {
            ...order,
            items: order.products || [] // Sử dụng products thay vì items
          };
        });
        console.log('Processed order data:', orderData); // Log sau khi xử lý
        setOrders(orderData);
        filterOrders(orderData, activeTab);
      } else {
        console.error('Invalid response format:', response.data);
        toast.error("Định dạng dữ liệu không hợp lệ!");
        setOrders([]);
        setFilteredOrders([]);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      if (error.response) {
        toast.error(error.response.data.message || "Lỗi khi tải đơn hàng!");
      } else if (error.request) {
        toast.error("Không thể kết nối đến server!");
      } else {
        toast.error("Có lỗi xảy ra khi tải đơn hàng!");
      }
      setOrders([]);
      setFilteredOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    filterOrders(orders, tab);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="order-history-container">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="profile-sidebar">
        <div className="avatar">
          <img
            src={
              JSON.parse(Cookies.get("user") || '{}')?.avatar ||
              "https://res.cloudinary.com/dcqyuixqu/image/upload/v1745775273/logo_user_empty_a971qi.png"
            }
            alt="User Avatar"
          />
        </div>
        <div className="user-info">
          <h2>{JSON.parse(Cookies.get("user") || '{}')?.fullName || 'User'}</h2>
        </div>
        <ul className="profile-menu">
          <li className={window.location.pathname === "/profile" ? "active" : ""}>
            <Link to="/profile">Thông tin tài khoản</Link>
          </li>
          <li className={window.location.pathname === "/change-password" ? "active" : ""}>
            <Link to="/change-password">Đổi mật khẩu</Link>
          </li>
          <li className={window.location.pathname === "/order-history" ? "active" : ""}>
            <Link to="/order-history">Đơn hàng của tôi</Link>
          </li>
        </ul>
      </div>
      <div className="order-history-main">
        <h3>Đơn hàng của tôi</h3>
        <div className="order-tabs">
          <button
            className={`order-tab ${activeTab === "all" ? "active" : ""}`}
            onClick={() => handleTabChange("all")}
          >
            Tất cả
          </button>
          <button
            className={`order-tab ${activeTab === "processing" ? "active" : ""}`}
            onClick={() => handleTabChange("processing")}
            style={activeTab === "processing" ? { backgroundColor: '#f57c00' } : {}}
          >
            Đang xử lý
          </button>
          <button
            className={`order-tab ${activeTab === "completed" ? "active" : ""}`}
            onClick={() => handleTabChange("completed")}
            style={activeTab === "completed" ? { backgroundColor: '#2e7d32' } : {}}
          >
            Hoàn tất
          </button>
          <button
            className={`order-tab ${activeTab === "cancelled" ? "active" : ""}`}
            onClick={() => handleTabChange("cancelled")}
            style={activeTab === "cancelled" ? { backgroundColor: '#c62828' } : {}}
          >
            Bị hủy
          </button>
        </div>

        <div className="order-list">
          {loading ? (
            <div className="loading">Đang tải đơn hàng...</div>
          ) : !Array.isArray(filteredOrders) || filteredOrders.length === 0 ? (
            <div className="no-orders">
              <p>Không có đơn hàng nào.</p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              if (!order) return null;
              const displayStatus = getStatusText(order.status);
              return (
                <div key={order._id} className="order-item">
                  <div className="order-header">
                    <span className="order-id">Mã đơn hàng: {order._id}</span>
                    <span 
                      className={`order-status ${getStatusClass(order.status)}`}
                      style={getStatusColor(order.status)}
                    >
                      {displayStatus}
                    </span>
                  </div>
                  <div className="order-products">
                    {Array.isArray(order.products) && order.products.length > 0 ? (
                      order.products.map((product) => {
                        if (!product) return null;
                        console.log('Rendering product:', product); // Log để debug
                        return (
                          <div key={product.productId} className="order-product">
                            <img 
                              src={product.image || product.productImage} 
                              alt={product.name || product.productName} 
                              onError={(e) => {
                                console.log('Image load error:', e);
                                e.target.src = "https://res.cloudinary.com/dcqyuixqu/image/upload/v1745775273/logo_user_empty_a971qi.png";
                              }}
                            />
                            <div className="product-info">
                              <h4>{product.name || product.productName}</h4>
                              <p>Số lượng: {product.quantity}</p>
                              <p>Giá: {(product.price || 0).toLocaleString()}đ</p>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="no-products">Không có sản phẩm</div>
                    )}
                  </div>
                  <div className="order-footer">
                    <div className="order-total">
                      <span>Tổng tiền:</span>
                      <span className="total-amount">
                        {(order.totalAmount || 0).toLocaleString()}đ
                      </span>
                    </div>
                    <div className="order-date">
                      Ngày đặt: {order.createdAt ? new Date(order.createdAt).toLocaleDateString("vi-VN") : 'N/A'}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderHistory;
