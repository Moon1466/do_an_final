import React, { useState, useEffect } from "react";
import "./Payment.scss";
import axios from "axios";
import Cookies from "js-cookie";
import provincesData from "../../assets/vietnam_provinces.json";
import { useNavigate, useLocation } from "react-router-dom";

const Payment = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    nation: "",
    city: "",
    district: "",
    ward: "",
    details: "",
    note: "",
  });

  const [shippingMethod, setShippingMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("");

  const [cartItems, setCartItems] = useState([]);
  const [loadingCart, setLoadingCart] = useState(true);
  const [errorCart, setErrorCart] = useState(null);

  const [agree, setAgree] = useState(true);
  const shippingFee = 35000;
  const [displayedCartItems, setDisplayedCartItems] = useState([]);
  const subtotal = displayedCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal + shippingFee;

  const [cities] = useState(provincesData);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const [addressError, setAddressError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  // Ưu tiên lấy selectedItems từ location.state, nếu không có thì lấy từ sessionStorage
  const selectedItemsFromState = location.state?.selectedItems;
  const selectedItemsFromSession = JSON.parse(sessionStorage.getItem("selectedCartItems"));
  const selectedItems = selectedItemsFromState || selectedItemsFromSession || [];

  const selectedItemsWithQuantity = JSON.parse(sessionStorage.getItem("selectedCartItemsWithQuantity")) || [];

  console.log("Payment page - initial selectedItems:", selectedItems);
  console.log("Payment page - selectedItems from State:", selectedItemsFromState);
  console.log("Payment page - selectedItems from Session:", selectedItemsFromSession);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Xử lý submit form ở đây
    console.log("Form data:", formData);
    console.log("Shipping method:", shippingMethod);
    console.log("Payment method:", paymentMethod);
  };

  useEffect(() => {
    const fetchCartItems = async () => {
      let response = null;
      try {
        const user = JSON.parse(Cookies.get("user"));
        if (!user) {
          setErrorCart("Vui lòng đăng nhập để xem giỏ hàng");
          setLoadingCart(false);
          return;
        }
        response = await axios.get(`/api/basket/${user._id || user.username}`);
        if (response.data.success) {
          setCartItems(response.data.data?.items || []);
        }
      } catch (err) {
        setErrorCart("Không thể tải giỏ hàng. Vui lòng thử lại sau.");
      } finally {
        setLoadingCart(false);
        console.log(
          "Payment page - fetchCartItems finished.",
          response ? "cartItems:" : "No response data.",
          response?.data?.data?.items
        );
      }
    };
    fetchCartItems();

    if (!selectedItems || selectedItems.length === 0) {
      setErrorCart("Không tìm thấy sản phẩm được chọn. Vui lòng quay lại giỏ hàng.");
      setCartItems([]);
      setDisplayedCartItems([]);
    } else {
      // Nếu có selectedItems, lọc cartItems sau khi fetch
      // Logic lọc sẽ nằm trong useEffect riêng khi cartItems được cập nhật
    }
  }, []);

  // Effect để lọc cartItems mỗi khi cartItems hoặc selectedItems thay đổi
  useEffect(() => {
    console.log("Payment page - Filtering useEffect triggered.");
    console.log("Current cartItems:", cartItems);
    console.log("Current selectedItems:", selectedItems);

    if (cartItems.length > 0 && selectedItems && selectedItems.length > 0) {
      // Nếu có selectedItemsWithQuantity (tức là từ nút Mua ngay)
      if (selectedItemsWithQuantity.length > 0) {
        const filteredItems = cartItems
          .filter((item) => selectedItems.includes(item.productId))
          .map((item) => {
            const found = selectedItemsWithQuantity.find((si) => si.productId === item.productId);
            return found ? { ...item, quantity: found.quantity } : item;
          });
        if (JSON.stringify(filteredItems) !== JSON.stringify(displayedCartItems)) {
          setDisplayedCartItems(filteredItems);
        }
      } else {
        // Mặc định như cũ (từ giỏ hàng)
        const filteredItems = cartItems.filter((item) => selectedItems.includes(item.productId));
        if (JSON.stringify(filteredItems) !== JSON.stringify(displayedCartItems)) {
          setDisplayedCartItems(filteredItems);
        }
      }
    } else if (!selectedItems || selectedItems.length === 0) {
      console.log("Payment page - selectedItems is empty or undefined.");
      // Nếu không có selectedItems, đảm bảo displayedCartItems là mảng rỗng
      if (displayedCartItems.length > 0) {
        // Chỉ cập nhật nếu đang có sản phẩm hiển thị
        setDisplayedCartItems([]);
      }

      // Set lỗi nếu không có selectedItems VÀ fetch giỏ hàng xong không có items được hiển thị
      // Điều này tránh hiển thị lỗi ngay lập tức khi page vừa load và đang fetch
      if (!loadingCart && cartItems.length === 0 && displayedCartItems.length === 0) {
        setErrorCart("Không tìm thấy sản phẩm được chọn. Vui lòng quay lại giỏ hàng.");
      } else if (errorCart) {
        // Clear error if conditions change and it's no longer applicable
        setErrorCart(null);
      }
    } else {
      // cartItems is empty but selectedItems might not be (unlikely if fetch successful)
      console.log("Payment page - cartItems is empty.");
      if (displayedCartItems.length > 0) {
        setDisplayedCartItems([]);
      }
      if (!loadingCart && !errorCart) {
        // Set error if cart is empty after fetch and no other error
        setErrorCart("Giỏ hàng trống sau khi tải.");
      }
    }
  }, [cartItems, selectedItems, selectedItemsWithQuantity, displayedCartItems, loadingCart]); // Thêm selectedItemsWithQuantity vào dependencies

  const handleCityChange = (e) => {
    const cityName = e.target.value;
    setFormData((prev) => ({ ...prev, city: cityName, district: "", ward: "" }));
    const city = cities.find((c) => c.name === cityName);
    setDistricts(city ? city.districts : []);
    setWards([]);
  };

  const handleDistrictChange = (e) => {
    const districtName = e.target.value;
    setFormData((prev) => ({ ...prev, district: districtName, ward: "" }));
    const district = districts.find((d) => d.name === districtName);
    setWards(district ? district.wards : []);
  };

  const handleWardChange = (e) => {
    setFormData((prev) => ({ ...prev, ward: e.target.value }));
  };

  const isAddressValid = () => {
    const { name, phone, city, district, ward, details } = formData;
    return name && phone && city && district && ward && details;
  };

  const handleCheckout = async (e) => {
    console.log("Bạn đã chọn phương thức thanh toán:", paymentMethod);
    if (!isAddressValid()) {
      e.preventDefault();
      setAddressError("Vui lòng điền đầy đủ thông tin địa chỉ giao hàng!");
      return;
    }
    setAddressError("");
    if (displayedCartItems.length === 0) {
      alert("Không có sản phẩm nào để thanh toán.");
      e.preventDefault();
      return;
    }
    if (paymentMethod === "vnpay") {
      console.log("Chuyển hướng sang trang VNPAY!");
      e.preventDefault();
      navigate("/payment/vnpay-checkout", {
        state: {
          order: {
            ...formData,
            total,
          },
        },
      });
    } else if (paymentMethod === "cash") {
      e.preventDefault();
      try {
        // Lấy user từ cookie
        const user = JSON.parse(Cookies.get("user"));
        // Tạo đơn hàng mới
        const orderData = {
          customer: {
            _id: user?._id,
            name: formData.name,
            email: user?.email || "",
            phone: formData.phone,
            address: `${formData.details}, ${formData.ward}, ${formData.district}, ${formData.city}`,
            username: user?.username || "",
          },
          products: displayedCartItems.map((item) => ({
            productId: item.productId,
            name: item.productName,
            price: item.price,
            quantity: item.quantity,
            image: item.productImage,
          })),
          totalAmount: total,
          paymentMethod: "Tiền mặt",
          paymentStatus: "Chưa thanh toán",
          status: "Chờ xác nhận",
          notes: formData.note,
        };

        const response = await axios.post("/api/orders/create", orderData);

        if (response.data.success) {
          // Xóa các sản phẩm đã thanh toán khỏi giỏ hàng
          const userId = user._id || user.username;
          for (const productId of selectedItems) {
            try {
              await axios.delete(`/api/basket/${userId}/${productId}`);
            } catch (deleteError) {
              console.error("Lỗi khi xóa sản phẩm khỏi giỏ hàng:", deleteError);
            }
          }
          // Xóa dữ liệu sessionStorage sau khi thanh toán thành công
          sessionStorage.removeItem("selectedCartItems");
          sessionStorage.removeItem("selectedCartItemsWithQuantity");
          // Chuyển hướng đến trang thông báo thành công
          navigate("/payment/success", {
            state: {
              orderCode: response.data.data.orderCode,
            },
          });
        }
      } catch (error) {
        console.error("Error creating order:", error);
        alert("Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại sau.");
      }
    }
  };

  useEffect(() => {
    // Khi rời khỏi trang Payment, xóa dữ liệu sessionStorage liên quan đến mua ngay
    return () => {
      sessionStorage.removeItem("selectedCartItems");
      sessionStorage.removeItem("selectedCartItemsWithQuantity");
    };
  }, []);

  return (
    <div>
      <section className="payment">
        <div className="container">
          <form onSubmit={handleSubmit} className="payment-form">
            <section className="payment-address">
              <div className="payment-address__heading">
                <h3 className="payment-address__title">Địa chỉ giao hàng</h3>
              </div>
              <div className="payment-address__body">
                <div className="payment-address__wrapper">
                  {/* Name */}
                  <div className="payment-address__collect">
                    <label htmlFor="name" className="payment-address__label">
                      Họ và tên người nhận
                    </label>
                    <input
                      type="text"
                      id="name"
                      className="payment-address__input"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  {/* Phone */}
                  <div className="payment-address__collect">
                    <label htmlFor="phone" className="payment-address__label">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      className="payment-address__input"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  {/* City */}
                  <div className="payment-address__collect">
                    <label htmlFor="city" className="payment-address__label">
                      Tỉnh/Thành phố
                    </label>
                    <select
                      id="city"
                      className="payment-address__input"
                      value={formData.city}
                      onChange={handleCityChange}
                      required>
                      <option value="">Chọn Tỉnh/Thành phố</option>
                      {cities.map((city) => (
                        <option key={city.code} value={city.name}>
                          {city.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* District */}
                  <div className="payment-address__collect">
                    <label htmlFor="district" className="payment-address__label">
                      Quận/Huyện
                    </label>
                    <select
                      id="district"
                      className="payment-address__input"
                      value={formData.district}
                      onChange={handleDistrictChange}
                      required
                      disabled={!formData.city}>
                      <option value="">Chọn Quận/Huyện</option>
                      {districts.map((district) => (
                        <option key={district.code} value={district.name}>
                          {district.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* Ward */}
                  <div className="payment-address__collect">
                    <label htmlFor="ward" className="payment-address__label">
                      Phường/Xã
                    </label>
                    <select
                      id="ward"
                      className="payment-address__input"
                      value={formData.ward}
                      onChange={handleWardChange}
                      required
                      disabled={!formData.district}>
                      <option value="">Chọn Phường/Xã</option>
                      {wards.map((ward) => (
                        <option key={ward.code} value={ward.name}>
                          {ward.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* Details */}
                  <div className="payment-address__collect">
                    <label htmlFor="details" className="payment-address__label">
                      Địa chỉ chi tiết
                    </label>
                    <input
                      type="text"
                      id="details"
                      className="payment-address__input"
                      value={formData.details}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  {/* Note */}
                  <div className="payment-address__collect payment-address__collect--full">
                    <label htmlFor="note" className="payment-address__label">
                      Ghi chú
                    </label>
                    <input
                      type="text"
                      id="note"
                      className="payment-address__input"
                      value={formData.note}
                      onChange={handleInputChange}
                      placeholder="Ghi chú về đơn hàng, ví dụ: thời gian hay chỉ dẫn địa điểm giao hàng chi tiết hơn"
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="payment-shipper-method">
              <div className="payment-shipper-method__heading">
                <h3 className="payment-shipper-method__title">Phương thức vận chuyển</h3>
              </div>
              <div className="payment-shipper-method__body">
                <div className="payment-shipper-method__input">
                  <input
                    type="radio"
                    name="shipping"
                    id="standard"
                    className="payment-shipper-method__submit"
                    checked={shippingMethod === "standard"}
                    onChange={() => setShippingMethod("standard")}
                  />
                </div>
                <div className="payment-shipper-method__label">
                  <span className="payment-shipper-method__name">Giao hàng tiêu chuẩn: 32.000 đ</span>
                </div>
              </div>
            </section>

            <section className="payment-method">
              <div className="container">
                <div className="payment-method__heading">
                  <h3 className="payment-method__title">Phương thức thanh toán</h3>
                </div>
                <div className="payment-method__body">
                  <div className="payment-method__select">
                    <input
                      type="radio"
                      name="payment"
                      id="vnpay"
                      className="payment-method__confirm"
                      checked={paymentMethod === "vnpay"}
                      onChange={() => setPaymentMethod("vnpay")}
                    />
                    <img src="/src/assets/images/icon/vnpay.svg" alt="vnpay" className="payment-method__img" />
                    <label htmlFor="vnpay" className="payment-method__label">
                      VNPAY
                    </label>
                  </div>
                  <div className="payment-method__select">
                    <input
                      type="radio"
                      name="payment"
                      id="cash"
                      className="payment-method__confirm"
                      checked={paymentMethod === "cash"}
                      onChange={() => setPaymentMethod("cash")}
                    />
                    <img src="/src/assets/images/icon/cash.svg" alt="cash" className="payment-method__img" />
                    <label htmlFor="cash" className="payment-method__label">
                      Thanh toán tiền mặt khi nhận hàng
                    </label>
                  </div>
                </div>
              </div>
            </section>

            {/* Order Review */}
            <section className="payment-order-review">
              <h3 className="payment-order-review__title">KIỂM TRA LẠI ĐƠN HÀNG</h3>
              <hr className="payment-order-review__divider" />
              {loadingCart ? (
                <div>Đang tải đơn hàng...</div>
              ) : errorCart ? (
                <div className="payment-order-review__error">{errorCart}</div>
              ) : displayedCartItems.length === 0 ? (
                <div>Bạn chưa chọn sản phẩm nào hoặc không tìm thấy thông tin sản phẩm.</div>
              ) : (
                <div className="payment-order-review__table-wrapper">
                  <table className="payment-order-review__table">
                    <tbody>
                      {displayedCartItems.map((item) => (
                        <tr key={item.productId} className="payment-order-review__row">
                          <td className="payment-order-review__img-cell">
                            <img src={item.productImage} alt={item.productName} className="payment-order-review__img" />
                          </td>
                          <td className="payment-order-review__name-cell">
                            <span className="payment-order-review__name">{item.productName}</span>
                          </td>
                          <td className="payment-order-review__price-cell">
                            <span className="payment-order-review__price">{item.price.toLocaleString()} đ</span>
                            {item.originPrice && (
                              <div className="payment-order-review__origin-price">
                                {item.originPrice.toLocaleString()} đ
                              </div>
                            )}
                          </td>
                          <td className="payment-order-review__quantity-cell">{item.quantity}</td>
                          <td className="payment-order-review__total-cell">
                            {(item.price * item.quantity).toLocaleString()} đ
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </form>
        </div>
      </section>
      <div className="payment-checkout-bar">
        <div className="payment-checkout-bar__container">
          <div className="payment-checkout-bar__summary">
            <div className="payment-checkout-bar__row">
              <span>Thành tiền</span>
              <span className="payment-checkout-bar__value">{subtotal.toLocaleString()} đ</span>
            </div>
            <div className="payment-checkout-bar__row">
              <span>Phí vận chuyển (Giao hàng tiêu chuẩn)</span>
              <span className="payment-checkout-bar__value">{shippingFee.toLocaleString()} đ</span>
            </div>
            <div className="payment-checkout-bar__row payment-checkout-bar__row--total">
              <span>Tổng Số Tiền (gồm VAT)</span>
              <span className="payment-checkout-bar__total">{total.toLocaleString()} đ</span>
            </div>
          </div>
          <div className="payment-checkout-bar__action">
            <div className="payment-checkout-bar__agree">
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} id="agree-term" />
              <label htmlFor="agree-term">
                Bằng việc tiến hành Mua hàng, Bạn đã đồng ý với
                <a href="#" className="payment-checkout-bar__link">
                  Điều khoản & Điều kiện của chúng tôi
                </a>
              </label>
            </div>
            <button
              type="button"
              className="payment-submit__button payment-checkout-bar__button"
              disabled={!agree}
              onClick={handleCheckout}>
              Xác nhận thanh toán
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
