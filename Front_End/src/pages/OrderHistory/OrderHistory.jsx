import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import "./OrderHistory.scss";
import { Link } from "react-router-dom";

const STATUS_TABS = [
  { key: "all", label: "Tất cả" },
  { key: "Đang xử lý", label: "Đang xử lý" },
  { key: "Hoàn tất", label: "Hoàn tất" },
  { key: "Bị hủy", label: "Bị huỷ" },
];

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const user = JSON.parse(Cookies.get("user"));
    if (user && user._id) {
      axios
        .get(`/api/orders?userId=${user._id}`)
        .then((res) => {
          console.log("Dữ liệu đơn hàng trả về:", res.data);
          if (res.data.success) setOrders(res.data.data);
          else setError("Không lấy được đơn hàng.");
          setLoading(false);
        })
        .catch(() => {
          setError("Có lỗi khi lấy đơn hàng.");
          setLoading(false);
        });
    }
  }, []);

  const filteredOrders = status === "all" ? orders : orders.filter((o) => o.status === status);

  // Tổng hợp sản phẩm đã mua (không trùng lặp)
  const purchasedProducts = orders
    .flatMap((order) => order.products)
    .reduce((acc, product) => {
      if (!acc.some((p) => p.productId === product.productId)) {
        acc.push(product);
      }
      return acc;
    }, []);

  return (
    <div className="order-history-container">
      <aside className="order-sidebar">
        {/* Có thể tái sử dụng sidebar của profile */}
        <div className="avatar">
          <img src={JSON.parse(Cookies.get("user")).avatar} alt="User Avatar" />
        </div>
        <div className="user-info">
          <h2>{JSON.parse(Cookies.get("user")).fullName}</h2>
        </div>
        <ul className="profile-menu">
          <li>
            <Link to="/profile">Thông tin tài khoản</Link>
          </li>
          <li className="active">
            <Link to="/order-history">Đơn hàng của tôi</Link>
          </li>
        </ul>
      </aside>
      <main className="order-main">
        <div className="order-status-tabs">
          {STATUS_TABS.map((tab) => (
            <button key={tab.key} className={status === tab.key ? "active" : ""} onClick={() => setStatus(tab.key)}>
              {tab.label}
            </button>
          ))}
        </div>
        <div className="order-list">
          {error && <div style={{ color: "red" }}>{error}</div>}
          {loading ? (
            <div>Đang tải...</div>
          ) : filteredOrders.length === 0 ? (
            <div>Không có đơn hàng nào.</div>
          ) : (
            filteredOrders.map((order) => (
              <div className="order-card" key={order._id}>
                <div className="order-header">
                  <span className="order-id">#{order._id}</span>
                  {(() => {
                    let statusClass = "order-status";
                    let statusText = order.status;
                    if (order.status === "Đang xử lý") {
                      statusClass += " order-status-processing";
                    } else if (order.status === "Đã xác nhận") {
                      statusClass += " order-status-success";
                      statusText = "Thành công";
                    } else if (order.status === "Bị hủy" || order.status === "Bị huỷ") {
                      statusClass += " order-status-cancel";
                    }
                    return <span className={statusClass}>{statusText}</span>;
                  })()}
                  <span className="order-date">{new Date(order.createdAt).toLocaleString()}</span>
                </div>
                <div className="order-products">
                  {order.products.map((p) => (
                    <div className="order-product" key={p.productId}>
                      <img src={p.image} alt={p.name} />
                      <span>{p.name}</span>
                    </div>
                  ))}
                </div>
                <div className="order-footer">
                  <span className="order-total">Tổng tiền: {order.totalAmount?.toLocaleString()} đ</span>
                  <button className="order-btn">Mua lại</button>
                  {order.status !== "Bị hủy" && <button className="order-btn order-cancel">Huỷ đơn</button>}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default OrderHistory;
