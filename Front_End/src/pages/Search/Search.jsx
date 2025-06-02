import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import axios from "axios";
import "./Search.scss";

const PRICE_RANGES = [
  { label: "0đ - 150,000đ", min: 0, max: 150000 },
  { label: "150,000đ - 300,000đ", min: 150000, max: 300000 },
  { label: "300,000đ - 500,000đ", min: 300000, max: 500000 },
  { label: "500,000đ - 700,000đ", min: 500000, max: 700000 },
  { label: "700,000đ trở lên", min: 700000, max: Infinity },
];

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedPrice, setSelectedPrice] = useState(null);

  // Lấy danh mục
  useEffect(() => {
    axios
      .get("/api/categories")
      .then((res) => {
        console.log("API categories:", res.data);
        if (Array.isArray(res.data)) setCategories(res.data);
        else if (Array.isArray(res.data.data)) setCategories(res.data.data);
        else setCategories([]);
      })
      .catch(() => setCategories([]));
  }, []);

  // Lấy sản phẩm khi filter thay đổi
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        let query = `/api/products?search=${searchTerm}`;
        if (selectedCategories.length > 0) {
          query += `&categories=${selectedCategories.join(",")}`;
        }
        if (selectedPrice) {
          query += `&minPrice=${selectedPrice.min}&maxPrice=${selectedPrice.max}`;
        }
        const response = await axios.get(query);
        setProducts(response.data.data);
      } catch (err) {
        setError("Có lỗi xảy ra khi tìm kiếm sản phẩm");
      } finally {
        setLoading(false);
      }
    };

    if (searchTerm) {
      const debounceTimer = setTimeout(fetchProducts, 400);
      return () => clearTimeout(debounceTimer);
    }
  }, [searchTerm, selectedCategories, selectedPrice]);

  // Sửa lại hàm handleSearch
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Cập nhật searchParams và searchTerm
      setSearchParams({ q: searchTerm.trim() });
      setSearchTerm(searchTerm.trim());
    }
  };

  // Thêm useEffect để lắng nghe thay đổi từ URL
  useEffect(() => {
    const queryParam = searchParams.get("q");
    if (queryParam) {
      setSearchTerm(queryParam);
    }
  }, [searchParams]);

  const handleCategoryChange = (catId) => {
    setSelectedCategories((prev) => (prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]));
  };

  const handlePriceChange = (range) => {
    setSelectedPrice(range);
  };

  const formatPrice = (price) => {
    if (!price) return "0";
    // Nếu price là string, chuyển về number
    const numPrice = typeof price === 'string' ? parseFloat(price.replace(/[^\d]/g, '')) : price;
    // Kiểm tra nếu không phải số hợp lệ
    if (isNaN(numPrice)) return "0";
    return new Intl.NumberFormat('vi-VN').format(numPrice);
  };

  const calculateDiscount = (originalPrice, salePrice) => {
    if (!originalPrice || !salePrice) return null;
    
    // Chuyển đổi giá về số
    const original = typeof originalPrice === 'string' ? 
      parseFloat(originalPrice.replace(/[^\d]/g, '')) : originalPrice;
    const sale = typeof salePrice === 'string' ? 
      parseFloat(salePrice.replace(/[^\d]/g, '')) : salePrice;
    
    // Kiểm tra tính hợp lệ của giá
    if (isNaN(original) || isNaN(sale) || original <= 0 || sale <= 0) return null;
    if (original <= sale) return null;
    
    const discount = Math.round(((original - sale) / original) * 100);
    return discount;
  };

  const renderProductCard = (product) => {
    // Kiểm tra và lấy giá gốc
    const originalPrice = product.price || product.originalPrice || 0;
    // Tính giá sale nếu có
    const salePrice = product.salePrice || (product.isSale ? 
      originalPrice - (originalPrice * product.sale / 100) : originalPrice);
    
    const discount = calculateDiscount(originalPrice, salePrice);

    return (
      <Link to={`/product-detail/${product._id}`} className="product-card" key={product._id}>
        <div className="product-card__image">
          <img src={product.images?.[0] || product.image} alt={product.name} />
        </div>
        <div className="product-card__content">
          <h3 className="product-card__title">{product.name}</h3>
          <div className="product-card__price">
            {salePrice && salePrice !== originalPrice ? (
              <>
                <div className="price-row">
                  <span className="product-card__price--sale">
                    {formatPrice(salePrice)}đ
                  </span>
                  {discount && (
                    <span className="discount-tag">
                      -{discount}%
                    </span>
                  )}
                </div>
                <span className="product-card__price--original">
                  {formatPrice(originalPrice)}đ
                </span>
              </>
            ) : (
              <div className="price-row">
                <span className="product-card__price--current">
                  {formatPrice(originalPrice)}đ
                </span>
              </div>
            )}
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="search-page">
      <div className="container search-page__layout">
        {/* Sidebar filter */}
        <aside className="search-page__sidebar">
          <div className="filter-group">
            <h3 className="filter-title">Danh mục</h3>
            <ul className="filter-list">
              {categories
                .filter((cat) => !cat.parent)
                .map((cat) => (
                  <li key={cat._id}>
                    <label>
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat._id)}
                        onChange={() => handleCategoryChange(cat._id)}
                      />
                      {cat.name}
                    </label>
                  </li>
                ))}
            </ul>
          </div>
          <div className="filter-group">
            <h3 className="filter-title">Giá</h3>
            <ul className="filter-list">
              {PRICE_RANGES.map((range, idx) => (
                <li key={idx}>
                  <label>
                    <input
                      type="radio"
                      name="price"
                      checked={selectedPrice === range}
                      onChange={() => handlePriceChange(range)}
                    />
                    {range.label}
                  </label>
                </li>
              ))}
            </ul>
          </div>
        </aside>
        {/* Main content */}
        <section className="search-page__main">
          <div className="search-page__results">
            {loading ? (
              <div className="search-page__loading">Đang tìm kiếm...</div>
            ) : error ? (
              <div className="search-page__error">{error}</div>
            ) : searchTerm && products.length === 0 ? (
              <div className="search-page__no-results">Không tìm thấy sản phẩm phù hợp với từ khóa "{searchTerm}"</div>
            ) : (
              <div className="search-page__products">
                {products.map((product) => renderProductCard(product))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Search;
