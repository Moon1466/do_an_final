import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./CategoryProducts.scss";

const CategoryProducts = ({
  categoryId,
  title = "Danh mục sản phẩm",
  limit = 5,
  viewAllLink = null,
  useScroll = false,
}) => {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [childCategories, setChildCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Lấy thông tin danh mục cha (tùy chọn, để hiển thị tiêu đề)
        let currentCategory = null;
        if (categoryId) {
          const categoryRes = await axios.get(`http://localhost:3000/api/categories/${categoryId}`);
          if (categoryRes.data) {
            // Giả định thành công nếu có dữ liệu trả về cho GET /categories/:id
            setCategory(categoryRes.data); // Sử dụng toàn bộ đối tượng danh mục
            currentCategory = categoryRes.data;
          } else {
            setCategory(null); // Xử lý trường hợp không tìm thấy danh mục
          }
        } else {
          setCategory(null); // Xử lý trường hợp categoryId là null
        }

        // --- Lấy sản phẩm sử dụng API mới ---
        if (categoryId) {
          // Sử dụng API mới: /api/products/by-category
          const productsRes = await axios.get(`http://localhost:3000/api/products/by-category?category=${categoryId}`);

          if (productsRes.data.success) {
            // Giả định API mới trả về { success: boolean, data: [...] }
            const limitedProducts = productsRes.data.data.slice(0, limit);
            setProducts(limitedProducts);
            console.log(
              `Sản phẩm cho danh mục ${categoryId} ('${currentCategory?.name || title}'):`,
              limitedProducts.length,
              "sản phẩm"
            );
          } else {
            setProducts([]); // Xóa sản phẩm nếu API báo lỗi
            console.error(`Gọi API lấy sản phẩm cho danh mục ${categoryId} thất bại:`, productsRes.data.message);
          }
        } else {
          setProducts([]); // Không có categoryId, không lấy sản phẩm
          console.log("Không có categoryId được cung cấp cho component CategoryProducts.");
        }

        setLoading(false);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu sản phẩm cho danh mục:", error);
        setProducts([]); // Đảm bảo danh sách sản phẩm trống khi có lỗi
        setLoading(false);
      }
    };

    // Chỉ gọi fetch nếu categoryId được cung cấp
    if (categoryId) {
      fetchData();
    } else {
      setProducts([]);
      setLoading(false);
    }
  }, [categoryId, limit, title]); // useEffect phụ thuộc vào categoryId, limit, title

  // Tạo link xem tất cả
  const generateViewAllLink = () => {
    if (viewAllLink) return viewAllLink;
    if (categoryId) return `/category/${categoryId}`;
    return "/products";
  };

  // Kiểm tra nếu đang ở mobile
  const isMobile = () => {
    return window.innerWidth <= 768;
  };

  // Tiêu đề hiển thị
  const displayTitle = category?.name || title;

  // Xác định class cho component
  const componentClass = () => {
    if (useScroll || isMobile()) {
      return "category-products category-products-scroll";
    }
    return "category-products";
  };

  if (loading) {
    return (
      <div className="category-products loading">
        <div className="container">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  // Không hiển thị gì nếu không có sản phẩm
  if (products.length === 0) {
    return null;
  }

  return (
    <section className={componentClass()}>
      <div className="container">
        <div className="category__header">
          <div className="category-wrapper">
            <div className="category-header">
              <h2 className="category-title">{displayTitle}</h2>
              <Link to={generateViewAllLink()} className="view-all-link">
                Xem tất cả <i className="fas fa-angle-right"></i>
              </Link>
            </div>

            <div className="products-container">
              {products.map((product) => (
                <div key={product._id} className="product-card">
                  <Link to={`/product-detail/${product._id}`} className="product-link">
                    <div className="product-image-container">
                      <img src={product.images && product.images[0]} alt={product.name} className="product-image" />
                    </div>
                    <div className="product-info">
                      <h3 className="product-name">{product.name}</h3>
                      <div className="product-price">
                        {product.isSale && product.sale > 0 ? (
                          <>
                            <span
                              className="original-price"
                              style={{
                                textDecoration: "line-through",
                                color: "#888",
                                marginRight: "8px",
                                fontSize: "0.9em",
                              }}>
                              {product.price.toLocaleString("vi-VN")} đ
                            </span>
                        <div className="discount">
                              <span className="discounted-price" style={{ fontWeight: "bold", color: "#e53935" }}>
                                {(product.price * (1 - product.sale / 100)).toLocaleString("vi-VN")} đ
                              </span>
                              <span
                                className="discount-percentage"
                                style={{ marginLeft: "8px", color: "#e53935", fontWeight: "bold", borderRadius: "5px", backgroundColor: "#e53935", padding: "5px", color: "white"}}>
                                -{product.sale}%
                              </span>
                        </div>
                          </>
                        ) : (
                          <span className="current-price">{product.price.toLocaleString("vi-VN")} đ</span>
                        )}
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategoryProducts;
