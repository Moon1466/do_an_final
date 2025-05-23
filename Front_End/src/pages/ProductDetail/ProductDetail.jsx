import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import axios from "axios";
import "./ProductDetail.scss";
import Cookies from "js-cookie";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AuthModal from "../../components/Modal/AuthModal";

// Hàm để kiểm tra xem một chuỗi có phải là HTML hay không
const isHTML = (str) => {
  const doc = new DOMParser().parseFromString(str, "text/html");
  return Array.from(doc.body.childNodes).some((node) => node.nodeType === 1);
};

// Hàm chuyển đổi text thành HTML
const convertTextToHTML = (text) => {
  if (!text) return "";
  if (isHTML(text)) return text;

  // Tách các đoạn văn bản theo dòng mới
  const paragraphs = text.split("\n\n").filter((p) => p.trim());

  if (paragraphs.length === 0) {
    return `<p>${text}</p>`;
  }

  return paragraphs.map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`).join("");
};

const ProductDetail = () => {
  // Hỗ trợ cả id và slug
  const { id, slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categoryBreadcrumbs, setCategoryBreadcrumbs] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [canReview, setCanReview] = useState(false);
  const [loadingCheck, setLoadingCheck] = useState(true);

  // Thêm state để theo dõi thông tin rating từ CommentSection
  const [productRating, setProductRating] = useState({
    avgRating: 0,
    totalReviews: 0,
  });

  // Callback để nhận thông tin rating từ CommentSection
  const updateProductRating = React.useCallback((avgRating, totalReviews) => {
    // Sử dụng hàm setter của useState để tránh phụ thuộc vào productRating hiện tại
    setProductRating((prev) => {
      // Nếu không có thay đổi thực sự, trả về đúng object cũ để tránh re-render
      if (prev.avgRating === avgRating && prev.totalReviews === totalReviews) {
        return prev;
      }
      return { avgRating, totalReviews };
    });
  }, []);
  
  // Thêm hàm showStockLimitMessage 
  const showStockLimitMessage = React.useCallback(() => {
    toast.warning(`Số lượng đặt hàng đã đạt giới hạn tồn kho (${product?.stock || 0} sản phẩm)`);
  }, [product]);

  // Memoize các handler để giảm re-render
  const handleIncrease = React.useCallback(() => {
    if (quantity >= (product?.stock || 0)) {
      showStockLimitMessage();
      return;
    }
    setQuantity((prev) => prev + 1);
  }, [quantity, product, showStockLimitMessage]);

  const handleDecrease = React.useCallback(() => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  }, [quantity]);

  // Thay thế state showLoginModal bằng state để quản lý AuthModal
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [actionAfterAuth, setActionAfterAuth] = useState(null); // 'add-to-cart' hoặc 'buy-now'

  // Sửa lại hàm handleAddToCart
  const handleAddToCart = React.useCallback(async () => {
    let user = null;
    try {
      user = JSON.parse(Cookies.get("user"));
    } catch (e) {
      // Hiển thị AuthModal thay vì tạo modal mới
      setActionAfterAuth('add-to-cart');
      setShowAuthModal(true);
      return;
    }
    
    if (!user || !(user._id || user.username)) {
      setActionAfterAuth('add-to-cart');
      setShowAuthModal(true);
      return;
    }

    // Kiểm tra sản phẩm đã tồn tại trong giỏ hàng chưa
    try {
      const userId = user._id || user.username;
      const basketResponse = await axios.get(`/api/basket/${userId}`);
      if (basketResponse.data && basketResponse.data.data && basketResponse.data.data.items) {
        // Đảm bảo rằng chúng ta đang truy cập đúng cấu trúc dữ liệu từ API
        const existingItem = basketResponse.data.data.items.find(
          (item) => item.productId.toString() === product._id.toString()
        );

        if (existingItem) {
          toast.error("Sản phẩm đã có trong giỏ hàng!");
          return;
        }
      }
    } catch (error) {
      console.error("Lỗi khi kiểm tra giỏ hàng:", error);
      // Tiếp tục xử lý ngay cả khi không kiểm tra được giỏ hàng
    }

    // Nếu sản phẩm chưa có trong giỏ hàng, tiến hành thêm vào
    try {
      const apiUrl = "/api/basket/add";
      const response = await axios.post(apiUrl, {
        userId: user._id || user.username,
        userName: user.name || user.fullName || user.username,
        userAvatar: user.avatar,
        productId: product._id,
        productName: product.name,
        productImage: product.images[0],
        quantity,
        price: product.price,
      });

      if (response.data && response.data.success) {
        toast.success("Đã thêm vào giỏ hàng!");
      } else {
        toast.error("Không thể thêm vào giỏ hàng. Vui lòng thử lại sau!");
      }
    } catch (error) {
      console.error("Lỗi khi thêm vào giỏ hàng:", error);
      toast.error("Lỗi khi thêm vào giỏ hàng: " + (error.response?.data?.message || error.message));
    }
  }, [product, quantity]);

  // Sửa lại hàm handleBuyNow
  const handleBuyNow = React.useCallback(() => {
    let user = null;
    try {
      user = JSON.parse(Cookies.get("user"));
    } catch (e) {
      setActionAfterAuth('buy-now');
      setShowAuthModal(true);
      return;
    }

    if (!user || !(user._id || user.username)) {
      setActionAfterAuth('buy-now');
      setShowAuthModal(true);
      return;
    }

    // Nếu sản phẩm chưa có trong giỏ hàng, tiến hành thêm vào
    try {
      const apiUrl = "/api/basket/add";
      const response = axios.post(apiUrl, {
        userId: user._id || user.username,
        userName: user.name || user.fullName || user.username,
        userAvatar: user.avatar,
        productId: product._id,
        productName: product.name,
        productImage: product.images[0],
        quantity,
        price: product.price,
      });

      // Chuyển hướng đến trang thanh toán với thông tin sản phẩm đã chọn
      navigate("/payment", {
        state: {
          selectedItems: [{ productId: product._id, quantity }],
        },
      });
    } catch (error) {
      console.error("Lỗi khi thêm vào giỏ hàng:", error);
      toast.error("Lỗi khi thêm vào giỏ hàng: " + (error.response?.data?.message || error.message));
    }
  }, [product, quantity, navigate]);

  // Thêm hàm xử lý sau khi đăng nhập thành công
  const handleAuthSuccess = (userData) => {
    setShowAuthModal(false);
    if (actionAfterAuth === 'add-to-cart') {
      handleAddToCart();
    } else if (actionAfterAuth === 'buy-now') {
      handleBuyNow();
    }
    setActionAfterAuth(null);
  };

  // Thêm hàm đóng modal
  const handleCloseAuth = () => {
    setShowAuthModal(false);
    setActionAfterAuth(null);
  };

  // Memoize breadcrumbItems để tránh tính lại không cần thiết
  const breadcrumbItems = React.useMemo(() => {
    if (!product) return [];
    return [
      ...categoryBreadcrumbs.map((cat) => ({
        name: cat.name,
        path: `/category/${cat.slug}`,
      })),
      { name: product?.name },
    ];
  }, [categoryBreadcrumbs, product]);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError("");
      try {
        let response;
        if (id) {
          response = await axios.get(`/api/products/${id}`);
        } else if (slug) {
          response = await axios.get(`/api/products/slug/${slug}`);
        } else {
          setError("Không có id hoặc slug sản phẩm.");
          setLoading(false);
          return;
        }
        if (response.data && response.data.success && response.data.data) {
          setProduct(response.data.data);
          setCategoryBreadcrumbs(response.data.categoryBreadcrumbs || []);
        } else {
          setError("Không tìm thấy sản phẩm hoặc dữ liệu trả về không hợp lệ.");
        }
      } catch (error) {
        setError("Lỗi khi lấy dữ liệu sản phẩm: " + (error.response?.data?.message || error.message));
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();

    // Kiểm tra đăng nhập
    const userCookie = Cookies.get("user");
    setIsLoggedIn(!!userCookie);

    const checkCanReview = async () => {
      setLoadingCheck(true);
      try {
        const user = JSON.parse(Cookies.get("user"));
        if (!user || !user.email) {
          setCanReview(false);
          setLoadingCheck(false);
          return;
        }
        // 1. Lấy tất cả đơn hàng (không filter userId)
        const ordersRes = await axios.get(`/api/orders`);
        const allOrders = ordersRes.data.data || [];
        // 2. Lọc đơn hàng có email trùng với user
        const orders = allOrders.filter((order) => order.customer && order.customer.email === user.email);

        // 3. Kiểm tra có đơn hàng đã xác nhận và chứa sản phẩm này không
        const hasPurchased = orders.some(
          (order) =>
            order.status === "Đã xác nhận" && order.products.some((p) => p.productId?.toString() === id?.toString())
        );

        if (!hasPurchased) {
          setCanReview(false);
          setLoadingCheck(false);
          return;
        }
        // 4. Lấy tất cả comment của sản phẩm
        const commentsRes = await axios.get(`/api/comments/${id}`);
        const comments = commentsRes.data.comments || [];

        // 5. Kiểm tra user đã từng bình luận chưa (theo email hoặc fullName)
        // const hasReviewed = comments.some((c) => c.userEmail === user.email || c.userName === user.fullName);
        // setCanReview(!hasReviewed);
        setCanReview(true);
      } catch (e) {
        console.error("Error in checkCanReview", e);
        setCanReview(false);
      }
      setLoadingCheck(false);
    };

    if (id) {
      checkCanReview();
    }
  }, [id, slug]);

  // Đặt ngoài cùng file và sử dụng React.memo để tránh render không cần thiết
  const ReviewModal = React.memo(
    ({ showModal, setShowModal, rating, setRating, comment, setComment, handleSubmitReview, loading }) => {
      if (!showModal) return null;

      const handleClose = () => {
        setShowModal(false);
      };

      return (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Viết đánh giá sản phẩm</h3>
              <button onClick={handleClose}>&times;</button>
            </div>
            <form onSubmit={handleSubmitReview}>
              <div className="rating-input">
                <label>Đánh giá của bạn:</label>
                <div className="stars" style={{ display: "flex", gap: 4 }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      style={{
                        cursor: "pointer",
                        fontSize: 28,
                        color: rating >= star ? "#FFD700" : "#ccc",
                        transition: "color 0.2s",
                      }}
                      onClick={() => setRating(star)}
                      role="button"
                      aria-label={`Đánh giá ${star} sao`}>
                      ★
                    </span>
                  ))}
                </div>
              </div>
              <div className="comment-input">
                <label>Nhận xét của bạn:</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Chia sẻ cảm nhận của bạn về sản phẩm này..."
                  required
                  style={{ width: "100%", minHeight: 80, resize: "vertical" }}
                />
              </div>
              <div className="modal-footer">
                <button type="button" onClick={handleClose}>
                  Hủy
                </button>
                <button type="submit" disabled={loading || !rating || !comment}>
                  {loading ? "Đang gửi..." : "Gửi đánh giá"}
                </button>
              </div>
            </form>
          </div>
        </div>
      );
    }
  );

  const CommentSection = React.memo(({ id, canReview, loadingCheck, onRatingUpdate }) => {
    const [showModal, setShowModal] = React.useState(false);
    const [rating, setRating] = React.useState(0);
    const [comment, setComment] = React.useState("");
    const [loading, setLoading] = React.useState(false);

    // Quản lý state reviews trong component con
    const [localReviews, setLocalReviews] = React.useState([]);

    // Sử dụng useRef để lưu giá trị trước đó
    const previousValuesRef = React.useRef({ avgRating: 0, reviewCount: 0 });

    // Tính toán avg rating trong CommentSection
    const avgRating = React.useMemo(() => {
      return localReviews.length > 0
        ? (localReviews.reduce((acc, review) => acc + review.rating, 0) / localReviews.length).toFixed(1)
        : "0";
    }, [localReviews]);

    // Cập nhật thông tin rating cho component cha - CHỈ khi localReviews thay đổi
    React.useEffect(() => {
      // Rất quan trọng: chỉ gọi onRatingUpdate một lần sau khi fetch reviews
      if (onRatingUpdate && localReviews.length > 0) {
        const currentAvg = parseFloat(avgRating);
        const currentCount = localReviews.length;

        // Chỉ cập nhật khi thực sự có thay đổi
        if (
          previousValuesRef.current.avgRating !== currentAvg ||
          previousValuesRef.current.reviewCount !== currentCount
        ) {
          // Cập nhật giá trị tham chiếu
          previousValuesRef.current = { avgRating: currentAvg, reviewCount: currentCount };

          // Thông báo lên component cha
          onRatingUpdate(currentAvg, currentCount);
        }
      }
    }, [localReviews, avgRating, onRatingUpdate]);

    // Sử dụng useCallback để hàm này không bị tạo lại mỗi khi component re-render
    const fetchReviews = React.useCallback(async () => {
      try {
        const response = await axios.get(`/api/comments/${id}`);
        if (response.data.success) {
          setLocalReviews(response.data.comments || []);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    }, [id]);

    // Chỉ fetch reviews một lần khi id thay đổi hoặc fetchReviews thay đổi
    React.useEffect(() => {
      if (id) {
        fetchReviews();
      }
    }, [id, fetchReviews]);

    const handleSubmitReview = React.useCallback(
      async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
          const user = JSON.parse(Cookies.get("user"));
          if (!user || !user.email) {
            toast.warning("Vui lòng đăng nhập để gửi đánh giá!");
            setLoading(false);
            return;
          }
          if (!rating || rating < 1 || rating > 5) {
            toast.warning("Vui lòng chọn số sao từ 1-5!");
            setLoading(false);
            return;
          }
          if (!comment || comment.trim().length === 0) {
            toast.warning("Vui lòng nhập nội dung đánh giá!");
            setLoading(false);
            return;
          }
          const productIdToSend = id;
          if (!productIdToSend) {
            toast.error("Không xác định được sản phẩm!");
            setLoading(false);
            return;
          }
          const response = await axios.post(
            `/api/comments/${productIdToSend}`,
            {
              userId: user.email,
              rating,
              comment,
            },
            {
              headers: {
                Authorization: `Bearer ${Cookies.get("token")}`,
              },
            }
          );
          if (response.data.success) {
            setShowModal(false);
            setRating(0);
            setComment("");
            fetchReviews();
          } else {
            toast.error(response.data.message || "Không thể gửi bình luận");
          }
        } catch (error) {
          toast.error(error.response?.data?.message || "Không thể gửi bình luận");
          console.error("Error submitting review:", error);
        } finally {
          setLoading(false);
        }
      },
      [comment, fetchReviews, id, rating]
    );

    // Sử dụng useCallback cho handler bấm nút để tránh tạo hàm mới mỗi lần render
    const handleOpenModal = React.useCallback(() => {
      setShowModal(true);
    }, []);

    // Thêm state để quản lý trạng thái loading của nút like
    const [loadingLike, setLoadingLike] = useState(false);
    const [likedComments, setLikedComments] = useState(new Set());

    // Hàm xử lý thích/bỏ thích
    const handleToggleLike = async (productId, reviewId) => {
      try {
        const user = JSON.parse(Cookies.get("user"));
        if (!user || !user.email) {
          toast.warning("Vui lòng đăng nhập để thích bình luận!");
          return;
        }

        // Kiểm tra reviewId
        if (!reviewId) {
          toast.error("Không thể xác định bình luận");
          return;
        }

        setLoadingLike(true);

        // Log để debug
        console.log('Sending like request:', {
          productId,
          reviewId,
          userId: user.email
        });

        const response = await axios.put(
          `/api/comments/${productId}/reviews/${reviewId}/like`,
          { userId: user.email },
          {
            headers: {
              Authorization: `Bearer ${Cookies.get("token")}`
            }
          }
        );

        if (response.data.success) {
          setLocalReviews(prevReviews => 
            prevReviews.map(review => {
              if (review._id === reviewId) {
                return {
                  ...review,
                  likes: response.data.likesCount,
                  likedBy: response.data.isLiked 
                    ? [...(review.likedBy || []), user.email]
                    : (review.likedBy || []).filter(email => email !== user.email)
                };
              }
              return review;
            })
          );
          
          toast.success(response.data.message);
        }
      } catch (error) {
        console.error("Error toggling like:", error);
        toast.error("Không thể cập nhật trạng thái thích. Vui lòng thử lại sau.");
      } finally {
        setLoadingLike(false);
      }
    };

    // Thêm state để theo dõi tab đang active
    const [activeTab, setActiveTab] = useState('newest'); // 'newest' hoặc 'mostLiked'
    
    // Tính toán danh sách reviews đã được sắp xếp
    const sortedReviews = React.useMemo(() => {
      if (activeTab === 'newest') {
        return [...localReviews].sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
      } else {
        return [...localReviews].sort((a, b) => 
          (b.likedBy?.length || 0) - (a.likedBy?.length || 0)
        );
      }
    }, [localReviews, activeTab]);

    // Thêm handler cho việc click tab
    const handleTabClick = (tab) => {
      setActiveTab(tab);
    };

    return (
      <section className="comment">
        <div className="container">
          <div className="comment__wrapper">
            <div className="comment__heading">Đánh giá sản phẩm</div>
            {/* Top */}
            <div className="comment__top">
              <div className="comment-rating">
                <div className="comment-rating__score-detail">
                  <div className="comment-rating__score">
                    <span className="comment-rating__value">
                      {localReviews.length > 0
                        ? (localReviews.reduce((acc, review) => acc + review.rating, 0) / localReviews.length).toFixed(
                            1
                          )
                        : "0"}
                    </span>
                    <span className="comment-rating__max">/5</span>
                  </div>
                  <div className="comment-rating__stars">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const rating = parseFloat(avgRating);
                      let percent = 0;
                      if (star <= Math.floor(rating)) {
                        percent = 100;
                      } else if (star === Math.ceil(rating) && rating % 1 !== 0) {
                        percent = (rating % 1) * 100;
                      }
                      return (
                        <span
                          key={star}
                          style={{
                            display: "inline-block",
                            width: 24,
                            height: 24,
                            background: percent 
                              ? `linear-gradient(90deg, #FFD700 ${percent}%, #ccc ${percent}%)` 
                              : "#ccc",
                            WebkitMask: "url(/src/assets/images/icon/star.svg) no-repeat center / contain",
                            mask: "url(/src/assets/images/icon/star.svg) no-repeat center / contain",
                            marginRight: 2
                          }}
                        />
                      );
                    })}
                  </div>
                  <span className="comment-rating__count">({localReviews.length} đánh giá)</span>
                </div>
                <div className="comment-rating__bars">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = localReviews.filter((r) => r.rating === star).length;
                    const percentage = localReviews.length > 0 ? (count / localReviews.length) * 100 : 0;
                    return (
                      <div className="comment-rating__bar" key={star}>
                        <span className="comment-rating__label">{star} sao</span>
                        <div className="comment-rating__progress-bar">
                          <div
                            className="comment-rating__progress"
                            style={{ width: `${percentage}%`, background: "#FFD600" }}></div>
                        </div>
                        <span className="comment-rating__percentage">{`${Math.round(percentage)}%`}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="comment-reviews">
                {loadingCheck ? (
                  <span>Đang kiểm tra quyền bình luận...</span>
                ) : isLoggedIn ? (
                  canReview ? (
                    <button className="comment-reviews__btn" onClick={handleOpenModal}>
                      <img src="/src/assets/images/icon/edit.svg" alt="" />
                      <span> Viết bình luận</span>
                    </button>
                  ) : (
                    <span className="comment-reviews__label">Bạn cần mua sản phẩm để được đánh giá</span>
                  )
                ) : (
                  <span className="comment-reviews__label">Bạn phải đăng nhập để đánh giá bình luận</span>
                )}
              </div>
            </div>
            {/* Body */}
            <div className="comment__body">
              {/* Tabs */}
              <div className="comment__tabs">
                <ul className="comment__list">
                  <li 
                    className={`comment__item ${activeTab === 'newest' ? 'comment__item--active' : ''}`}
                    onClick={() => handleTabClick('newest')}
                  >
                    Mới nhất
                  </li>
                  <li 
                    className={`comment__item ${activeTab === 'mostLiked' ? 'comment__item--active' : ''}`}
                    onClick={() => handleTabClick('mostLiked')}
                  >
                    Yêu thích nhất
                  </li>
                </ul>
              </div>
              {/* Content */}
              <div className="comment-content">
                <ul className="comment-content__list">
                  {sortedReviews.map((review, idx) => (
                    <li className="comment-content__item" key={review._id || idx}>
                      <div className="comment-content__left">
                        {review.avatar ? (
                          <img src={review.avatar} alt={review.userName} className="comment-content__avatar" />
                        ) : (
                          <div className="comment-content__avatar comment-content__avatar--placeholder">
                            {review.userName ? review.userName.charAt(0).toUpperCase() : "A"}
                          </div>
                        )}
                        <span className="comment-content__name">{review.userName}</span>
                        <span className="comment-content__date">
                          {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                      <div className="comment-content__right">
                        <div className="comment-content__stars">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              style={{
                                display: "inline-block",
                                width: 24,
                                height: 24,
                                background: star <= review.rating 
                                  ? "#FFD700"  // Màu vàng cho sao được chọn
                                  : "#ccc",    // Màu xám cho sao chưa chọn
                                WebkitMask: "url(/src/assets/images/icon/star.svg) no-repeat center / contain",
                                mask: "url(/src/assets/images/icon/star.svg) no-repeat center / contain",
                                marginRight: 2
                              }}
                            />
                          ))}
                        </div>
                        <p className="comment-content__text">{review.comment}</p>

                        <div className="comment-content__actions">
                          {isLoggedIn && (
                            <button
                              className={`like-button ${
                                review.likedBy?.includes(JSON.parse(Cookies.get("user"))?.email) ? "liked" : ""
                              }`}
                              onClick={() => handleToggleLike(id, review._id)}
                              disabled={loadingLike}
                            >
                              <img 
                                src="/src/assets/images/icon/like.svg" 
                                alt="Like"
HayHay                                className={`like-icon ${
                                  review.likedBy?.includes(JSON.parse(Cookies.get("user"))?.email) ? "liked" : ""
                                }`}
                              />
                              <span className="like-count">{review.likedBy?.length || 0}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <ReviewModal
          showModal={showModal}
          setShowModal={setShowModal}
          rating={rating}
          setRating={setRating}
          comment={comment}
          setComment={setComment}
          handleSubmitReview={handleSubmitReview}
          loading={loading}
        />
      </section>
    );
  });

  // Không cần biến avg nữa vì nó được tính trong CommentSection

  return (
    <div className="product-detail-wrapper">
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
      {/* Breadcrumb luôn hiển thị, nếu có dữ liệu category */}
      {product && <Breadcrumb items={breadcrumbItems} />}
      <div className="container">
        <section className="pd-dt">
          <form method="post" className="pd-dt__form">
            <div className="pd-dt__essential">
              {/* Left */}
              <div className="pd-dt__media">
                <div className="pd-dt__media-container">
                  {/* Review */}
                  <div className="pd-dt__product-image-img">
                    <div className="pd-dt__container-primary">
                      <img
                        src={product?.images?.[0] || "/assets/images/book/combo-20102022001.webp"}
                        alt={product?.name}
                        className="pd-dt__img-primary"
                        id="imgProduct"
                      />
                    </div>
                    <ul className="pd-dt__img-list">
                      {product?.subImages?.slice(0, 3).map((img, idx) => (
                        <li className="pd-dt__img-item" key={idx}>
                          <img src={img} alt={product?.name} className="pd-dt__img-sub" />
                        </li>
                      ))}
                      {product?.subImages?.length > 4 && (
                        <li className="pd-dt__img-item" key="more">
                          <div className="pd-dt__img-more">+{product.subImages.length - 3}</div>
                        </li>
                      )}
                      {product?.subImages?.length === 4 && (
                        <li className="pd-dt__img-item" key={3}>
                          <img src={product.subImages[3]} alt={product?.name} className="pd-dt__img-sub" />
                        </li>
                      )}
                    </ul>
                  </div>
                  {/* BTN */}
                  <div className="pd-dt__act">
                    <button type="button" className="pd-dt__add-cart" onClick={handleAddToCart}>
                      Thêm vào giỏ hàng
                    </button>
                    <button type="button" className="pd-dt__buy" onClick={handleBuyNow}>
                      Mua ngay
                    </button>
                  </div>
                  {/* Policy */}
                  <div className="pd-dt-policy">
                    <h4 className="pd-dt-policy__title">Chính sách ưu đãi</h4>
                    {[
                      {
                        icon: "/src/assets/images/icon/ico_truck_v2.webp",
                        title: "Thời gian giao hàng:",
                        desc: "Giao nhanh và uy tín",
                      },
                      {
                        icon: "/src/assets/images/icon/ico_transfer_v2.webp",
                        title: "Chính sách đổi trả:",
                        desc: "Đổi trả miễn phí toàn quốc",
                      },
                      {
                        icon: "/src/assets/images/icon/ico_shop_v2.webp",
                        title: "Chính sách khách sỉ:",
                        desc: "Ưu đãi khi mua số lượng lớn",
                      },
                    ].map((item, i) => (
                      <div className="pd-dt-policy__note" key={i}>
                        <div className="pd-dt-policy__left">
                          <img src={item.icon} alt="" className="pd-dt-policy__icon" />
                          <span className="pd-dt-policy__bold">{item.title}</span>
                        </div>
                        <div className="pd-dt-policy__right">
                          <span>{item.desc}</span>
                          <img src="/assets/images/icon/arrow_right.svg" alt="" className="pd-dt-policy__arrow" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right */}
              <div className="pd-dt__content">
                {/* Info */}
                <div className="pd-dt-info">
                  {/* Heading */}
                  <h2 className="pd-dt-info__heading" id="nameProduct">
                    {product?.name}
                  </h2>

                  {/* Details */}
                  <div className="pd-dt-info__details">
                    <ul className="pd-dt-info__list">
                      {product?.supplier && product.supplier !== "Đang cập nhật" && (
                        <li className="pd-dt-info__item">
                          Nhà cung cấp: <span className="pd-dt-info__bold">{product.supplier}</span>
                        </li>
                      )}
                      {product?.publisher && product.publisher !== "Đang cập nhật" && (
                        <li className="pd-dt-info__item">
                          Nhà xuất bản: <span className="pd-dt-info__bold">{product.publisher}</span>
                        </li>
                      )}
                      {product?.author && product.author !== "Đang cập nhật" && (
                        <li className="pd-dt-info__item">
                          Tác giả: <span className="pd-dt-info__bold">{product.author}</span>
                        </li>
                      )}
                      {product?.type && product.type !== "Đang cập nhật" && (
                        <li className="pd-dt-info__item">
                          Thể loại: <span className="pd-dt-info__bold">{product.type}</span>
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Rating */}
                  <div className="pd-dt-info__rating">
                    {/* Star */}
                    <div className="pd-dt-info__rating-stars">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const rating = parseFloat(productRating.avgRating);
                        let percent = 0;
                        if (star <= Math.floor(rating)) {
                          percent = 100;
                        } else if (star === Math.ceil(rating) && rating % 1 !== 0) {
                          percent = (rating % 1) * 100;
                        }
                        return (
                          <span
                            key={star}
                            style={{
                              display: "inline-block",
                              width: 24,
                              height: 24,
                              background: percent 
                                ? `linear-gradient(90deg, #FFD700 ${percent}%, #ccc ${percent}%)` 
                                : "#ccc",
                              WebkitMask: "url(/src/assets/images/icon/star.svg) no-repeat center / contain",
                              mask: "url(/src/assets/images/icon/star.svg) no-repeat center / contain",
                              marginRight: 2
                            }}
                          />
                        );
                      })}
                    </div>
                    {/* Comment */}
                    <span className="pd-dt-info__comment">({productRating.totalReviews} đánh giá)</span>
                    {/* Quantity */}
                    <div className="pd-dt-info__quantity">
                      <p>Đã bán</p>
                      <span className="pd-dt-info__quantity-sale">{product?.sold || 0}</span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="pd-dt-info__price">
                    <div className="product-price">
                      {product ? ( // Kiểm tra product có tồn tại không
                        product.isSale && product.sale > 0 ? (
                          <>
                            {/* Hiển thị giá gốc bị gạch ngang */}
                            <span
                              className="original-price"
                              style={{
                                textDecoration: "line-through",
                                color: "#888",
                                marginRight: "10px",
                                fontSize: "0.9em",
                              }}>
                              {product.price.toLocaleString("vi-VN")} đ
                            </span>
                            {/* Tính và hiển thị giá sau giảm giá */}
                            <span
                              className="discounted-price"
                              style={{ fontWeight: "bold", color: "#e53935", fontSize: "1.2em" }}>
                              {(product.price * (1 - product.sale / 100)).toLocaleString("vi-VN")} đ
                            </span>
                            {/* Hiển thị phần trăm giảm giá */}
                            <span
                              className="discount-badge"
                              style={{
                                marginLeft: "10px",
                                backgroundColor: "#e53935",
                                color: "white",
                                padding: "2px 8px",
                                borderRadius: "4px",
                                fontSize: "0.8em",
                                fontWeight: "bold",
                              }}>
                              -{product.sale}%
                            </span>
                          </>
                        ) : (
                          // Nếu không có giảm giá, hiển thị giá gốc
                          <span className="current-price">{product.price.toLocaleString("vi-VN")} đ</span>
                        )
                      ) : (
                        // Hiển thị loading hoặc placeholder khi product chưa load xong
                        <span>Đang tải...</span>
                      )}
                    </div>
                  </div>
                </div>
                {/* Quantity */}
                <div className="pd-dt-qtt">
                  <div className="pd-dt-qtt__span">Số lượng (Còn {product?.stock || 0} sản phẩm)</div>
                  <div className="pd-dt-qtt__act">
                    <button
                      type="button"
                      className="pd-dt-qtt__click"
                      onClick={handleDecrease}
                      disabled={quantity <= 1}>
                      <img
                        src="/src/assets/images/icon/minus.webp"
                        alt=""
                        className="pd-dt-qtt__act-btn"
                        style={{ height: "2px" }}
                      />
                    </button>
                    <input
                      type="number"
                      className="pd-dt-qtt__number"
                      id="productValue"
                      value={quantity}
                      readOnly
                      min="1"
                      max={product?.stock || 0}
                    />
                    <button
                      type="button"
                      className="pd-dt-qtt__click"
                      onClick={handleIncrease} // Chỉ gọi handleIncrease
                      // Bỏ disabled để button luôn nhận được sự kiện click
                      >
                      <img
                        src="/src/assets/images/icon/plus.webp"
                        alt=""
                        className="pd-dt-qtt__act-btn"
                      />
                    </button>
                  </div>
                </div>
                {/* Thêm phần Mô tả sản phẩm */}
                {product?.description && (
                  <div className="pd-dt-info__description">
                    <h3 className="pd-dt-info__description-title">Mô tả sản phẩm</h3>
                    <div
                      className="pd-dt-info__description-content"
                      dangerouslySetInnerHTML={{ __html: convertTextToHTML(product.description) }}
                    />
                  </div>
                )}

                {/* Xóa phần Thông tin chi tiết */}
                {/* Thay bằng log để kiểm tra dữ liệu sản phẩm */}
                <div style={{ display: "none" }}>{console.log("Dữ liệu sản phẩm:", product)}</div>
              </div>
            </div>
          </form>
        </section>
      </div>
      {/* Tách biệt CommentSection thành một phần riêng biệt để tránh lỗi cấu trúc DOM */}
      <CommentSection id={id} canReview={canReview} loadingCheck={loadingCheck} onRatingUpdate={updateProductRating} />

      {/* Thay thế modal cũ bằng AuthModal */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={handleCloseAuth}
        onLoginSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default ProductDetail;
