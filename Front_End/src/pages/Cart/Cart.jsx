import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import "./Cart.scss";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const navigate = useNavigate();

  // Fetch cart items when component mounts
  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const user = JSON.parse(Cookies.get("user"));
        if (!user) {
          setError("Vui lòng đăng nhập để xem giỏ hàng");
          setLoading(false);
          return;
        }

        const response = await axios.get(`/api/basket/${user._id || user.username}`);
        if (response.data.success) {
          setCartItems(response.data.data?.items || []);
        }
      } catch (err) {
        setError("Không thể tải giỏ hàng. Vui lòng thử lại sau.");
        console.error("Error fetching cart:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, []);

  // Calculate subtotal whenever selected items change
  useEffect(() => {
    const total = selectedItems.reduce((sum, item) => {
      const cartItem = cartItems.find((i) => i.productId === item);
      if (cartItem) {
        // Tính giá sau khi giảm nếu có giảm giá
        const priceAfterDiscount =
          cartItem.isSale && cartItem.sale > 0 ? cartItem.price * (1 - cartItem.sale / 100) : cartItem.price;
        return sum + priceAfterDiscount * cartItem.quantity;
      }
      return sum;
    }, 0);
    setSubtotal(total);
  }, [selectedItems, cartItems]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(cartItems.map((item) => item.productId));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (productId) => {
    setSelectedItems((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      const user = JSON.parse(Cookies.get("user"));
      if (!user) {
        toast.error("Vui lòng đăng nhập để thực hiện thao tác này");
        return;
      }

      const currentItem = cartItems.find((item) => item.productId === productId);
      if (!currentItem) {
        toast.error("Không tìm thấy sản phẩm trong giỏ hàng");
        return;
      }

      // Kiểm tra số lượng tồn kho trước khi thực hiện bất kỳ thay đổi nào
      if (newQuantity > currentItem.stock) {
        toast.warning(`Không thể thêm quá số lượng tồn kho (${currentItem.stock} sản phẩm)`);
        return; // Dừng hàm tại đây, không cập nhật UI hay gọi API
      }

      // Thực hiện gọi API trước
      const response = await axios.post("/api/basket/update-quantity", {
        userId: user._id,
        productId: productId,
        quantity: newQuantity,
      });

      if (response.data.success) {
        // Nếu API thành công, cập nhật UI và hiển thị toast
        const updatedItems = cartItems.map((item) =>
          item.productId === productId ? { ...item, quantity: newQuantity } : item
        );
        setCartItems(updatedItems);
       } else {
        // Nếu API thất bại, chỉ hiển thị lỗi
        toast.error(response.data.message);
        // Không cần rollback vì UI chưa được cập nhật trước đó
      }
    } catch (err) {
      console.error("Error updating quantity:", err);
      toast.error("Không thể cập nhật số lượng. Vui lòng thử lại sau.");
      // Không cần rollback
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      const user = JSON.parse(Cookies.get("user"));
      if (!user) {
        toast.warning("Vui lòng đăng nhập để thực hiện thao tác này");
        return;
      }

      const response = await axios.delete(`/api/basket/${user._id || user.username}/${productId}`);
      if (response.data.success) {
        setCartItems(response.data.data.items);
        setSelectedItems((prev) => prev.filter((id) => id !== productId));
        toast.success("Đã xóa sản phẩm khỏi giỏ hàng");
        // Kích hoạt sự kiện để Header cập nhật giỏ hàng
        document.dispatchEvent(new CustomEvent("cartUpdated"));
      }
    } catch (err) {
      console.error("Error removing item:", err);
      toast.error("Không thể xóa sản phẩm. Vui lòng thử lại sau.");
    }
  };

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      toast.warning("Vui lòng chọn ít nhất một sản phẩm để thanh toán");
      return;
    }
    sessionStorage.setItem("selectedCartItems", JSON.stringify(selectedItems));
    navigate("/payment", { state: { selectedItems } });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="cart__error">{error}</div>;

  return (
    <section className="cart">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div className="container">
        <div className="cart__container">
          {cartItems.length === 0 ? (
            <div className="cart__empty">
              <img src="/src/assets/images/icon/empty.svg" alt="" className="cart__empty-img" />
              <span className="cart__notice">Giỏ hàng của bạn đang trống</span>
            </div>
          ) : (
            <div className="cart__has-product">
              <div className="cart__items">
                <div className="cart__heading">
                  <div className="cart__select-all">
                    <input
                      type="checkbox"
                      className="cart__select-all-checkbox"
                      checked={selectedItems.length === cartItems.length}
                      onChange={handleSelectAll}
                    />
                    <label className="cart__select-all-label">Chọn tất cả</label>
                  </div>
                  <label className="cart__header-quantity">Số lượng</label>
                  <label className="cart__header-total">Thành tiền</label>
                  <label className="cart__header-delete"></label>
                </div>
                <div className="cart__body">
                  <ul className="cart__item-list">
                    {cartItems.map((item) => (
                      <li key={item.productId} className="cart-item">
                        <div className="cart-item__wrapper">
                          <div className="cart-item__selection">
                            <input
                              type="checkbox"
                              checked={selectedItems.includes(item.productId)}
                              onChange={() => handleSelectItem(item.productId)}
                            />
                          </div>
                          <div className="cart-item__img-container">
                            <img src={item.productImage} alt={item.productName} className="cart-item__img" />
                          </div>
                          <div className="cart-item__detail">
                            <h3 className="cart-item__name">{item.productName}</h3>
                            <div className="cart-item__price">
                              {item.isSale && item.sale > 0 ? (
                                <>
                                  <span
                                    className="original-price"
                                    style={{
                                      textDecoration: "line-through",
                                      color: "#888",
                                      marginRight: "8px",
                                      fontSize: "0.9em",
                                    }}>
                                    {item.price.toLocaleString()} đ
                                  </span>
                                  <span className="discounted-price" style={{ fontWeight: "bold", color: "#e53935" }}>
                                    {(item.price * (1 - item.sale / 100)).toLocaleString()} đ
                                  </span>
                                  <span
                                    className="discount-badge"
                                    style={{
                                      marginLeft: "8px",
                                      backgroundColor: "#e53935",
                                      color: "white",
                                      padding: "2px 6px",
                                      borderRadius: "4px",
                                      fontSize: "0.7em",
                                      fontWeight: "bold",
                                    }}>
                                    -{item.sale}%
                                  </span>
                                </>
                              ) : (
                                <span className="current-price">{item.price.toLocaleString()} đ</span>
                              )}
                            </div>
                          </div>
                          <div className="cart-item__quantity">
                            <button
                              onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="cart-item__quantity-btn">
                              -
                            </button>
                            <input
                              type="number"
                              value={item.quantity}
                              min={1}
                              max={item.stock}
                              readOnly
                              className="cart-item__quantity-input"
                            />
                            <button
                              onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                              disabled={item.quantity >= item.stock}
                              style={{
                                opacity: item.quantity >= item.stock ? 0.5 : 1,
                                cursor: item.quantity >= item.stock ? "not-allowed" : "pointer",
                              }}
                              className="cart-item__quantity-btn">
                              +
                            </button>
                          </div>
                          <div className="cart-item__total">
                            {(
                              (item.isSale && item.sale > 0 ? item.price * (1 - item.sale / 100) : item.price) *
                              item.quantity
                            ).toLocaleString()}{" "}
                            đ
                          </div>
                          <div className="cart-item__remove">
                            <button onClick={() => handleRemoveItem(item.productId)}>
                              <img src="/src/assets/images/icon/delete.svg" alt="Delete" className="cart-item__icon" />
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="cart-summary">
                <div className="cart-summary__subtotal">
                  <h3 className="cart-summary__label">Thành tiền</h3>
                  <span className="cart-summary__amout">{subtotal.toLocaleString()} đ</span>
                </div>
                <div className="cart-summary__vat">
                  <h3 className="cart-summary__label">Thuế VAT (10%)</h3>
                  <span className="cart-summary__amout">{(subtotal * 0.1).toLocaleString()} đ</span>
                </div>
                <div className="cart-summary__total">
                  <h3 className="cart-summary__label cart-summary__label--bold">Tổng tiền (đã gồm VAT)</h3>
                  <span className="cart-summary__amout cart-summary__amout--bold">
                    {(subtotal * 1.1).toLocaleString()} đ
                  </span>
                </div>
                <div className="cart-summary__action">
                  <button
                    className={`cart-summary__submit ${selectedItems.length === 0 ? "disabled" : ""}`}
                    disabled={selectedItems.length === 0}
                    onClick={handleCheckout}>
                    THANH TOÁN
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Cart;
