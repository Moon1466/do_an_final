import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./ProductList.scss";

const ProductList = ({
  category,
  priceRange,
  searchTerm,
  isHotDeals = false,
  isNewRelease = false,
  showTabs = true,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const tabs = [
    { id: 0, name: "Xu hướng theo ngày" },
    { id: 1, name: "Sách HOT - giảm sốc" },
    { id: 2, name: "Ngoại văn" },
  ];

  useEffect(() => {
    // Gọi API lấy danh sách sản phẩm
    axios
      .get("http://localhost:3000/api/products")
      .then((res) => {
        setProducts(res.data.data); // Sửa lại đúng key là data
        setFilteredProducts(res.data.data);
        setLoading(false);
      })
      .catch((err) => {
        setProducts([]);
        setFilteredProducts([]);
        setLoading(false);
      });
  }, []);

  // Apply filters whenever filter parameters change
  useEffect(() => {
    if (products.length === 0) return;

    let result = [...products];

    // Apply hot deals filter
    if (isHotDeals) {
      result = result.filter((product) => product.discount && product.discount > 0);
      // Sort by discount percentage (highest first)
      result.sort((a, b) => (b.discount || 0) - (a.discount || 0));
    }

    // Apply new release filter
    if (isNewRelease) {
      // Sort by createdAt date (newest first)
      result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      // Get top 10 newest products
      result = result.slice(0, 10);
    }

    // Apply category filter
    if (category) {
      result = result.filter((product) => product.category === category || product.categoryId === category);
    }

    // Apply price filter
    if (priceRange && priceRange.length === 2) {
      result = result.filter((product) => product.price >= priceRange[0] && product.price <= priceRange[1]);
    }

    // Apply search filter
    if (searchTerm && searchTerm.trim() !== "") {
      const lowercaseSearch = searchTerm.toLowerCase();
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(lowercaseSearch) ||
          (product.description && product.description.toLowerCase().includes(lowercaseSearch))
      );
    }

    // Apply tab filter (only if not isHotDeals and not isNewRelease)
    if (!isHotDeals && !isNewRelease) {
      if (activeTab === 1) {
        // HOT books with discount
        result = result.filter((product) => product.discount && product.discount > 0);
      } else if (activeTab === 2) {
        // Foreign books
        result = result.filter((product) => product.language && product.language !== "Vietnamese");
      }
    }

    // Limit results to prevent performance issues
    if (result.length > 30) {
      result = result.slice(0, 30);
    }

    setFilteredProducts(result);
  }, [products, category, priceRange, searchTerm, activeTab, isHotDeals, isNewRelease]);

  if (loading)
    return (
      <div className="product loading">
        <div className="container">
          <div className="spinner"></div>
          <p>Đang tải sản phẩm...</p>
        </div>
      </div>
    );

  return (
    <section className="product">
      <div className="container">
        <div className="product__wrapper">
          {showTabs && !isHotDeals && !isNewRelease && (
            <div className="product-tab">
              <ul className="product-tab__list">
                {tabs.map((tab) => (
                  <li
                    key={tab.id}
                    className={`product-tab__item ${activeTab === tab.id ? "product-tab__item--active" : ""}`}
                    onClick={() => setActiveTab(tab.id)}>
                    {tab.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="product__body">
            {filteredProducts.length === 0 ? (
              <div className="no-results">
                <i className="fa fa-search"></i>
                <p>Không tìm thấy sản phẩm phù hợp với tiêu chí tìm kiếm</p>
              </div>
            ) : (
              <div className="product__show">
                {!isHotDeals && !isNewRelease && (
                  <div className="results-count">Tìm thấy {filteredProducts.length} sản phẩm</div>
                )}
                <ul className="product__list">
                  {filteredProducts.map((product) => (
                    <li key={product._id} className="product__item">
                      <Link to={`/product-detail/${product._id}`} className="product__link">
                        <div className="product-review">
                          <div className="product-review__image-wrapper">
                            <img
                              src={product.images && product.images[0]}
                              alt={product.name}
                              className="product-review__img"
                            />
                            {product.discount && product.discount > 0 && (
                              <span className="discount-badge">-{product.discount}%</span>
                            )}
                            {isNewRelease && !product.discount && <span className="new-badge">Mới</span>}
                          </div>
                          <div className="product-review__body">
                            <h3 className="product-review__title">{product.name}</h3>
                            <div className="product-review__price-container">
                              <span className="product-review__price">{product.price.toLocaleString("vi-VN")} đ</span>
                              {product.oldPrice && (
                                <span className="product-review__old-price">
                                  {product.oldPrice.toLocaleString("vi-VN")} đ
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          {filteredProducts.length > 0 && !isHotDeals && !isNewRelease && (
            <div className="product__bottom">
              <Link to="#" className="product__more">
                Xem thêm
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProductList;
