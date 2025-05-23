import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./PaymentSuccess.scss";

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderCode } = location.state || {};

  return (
    <div className="payment-success">
      <div className="payment-success__container">
        <div className="payment-success__icon">
          <i className="fas fa-check-circle"></i>
        </div>
        <h1 className="payment-success__title">Đặt hàng thành công!</h1>
        <p className="payment-success__message">
          Cảm ơn bạn đã đặt hàng. Mã đơn hàng của bạn là: <strong>{orderCode}</strong>
        </p>
        <p className="payment-success__note">
          Vui lòng thanh toán tiền mặt khi nhận hàng. Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.
        </p>
        <div className="payment-success__actions">
          <button className="payment-success__button" onClick={() => navigate("/")}>
            Tiếp tục mua sắm
          </button>
          <button
            className="payment-success__button payment-success__button--outline"
            onClick={() => navigate("/order-history")}>
            Xem đơn hàng
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
