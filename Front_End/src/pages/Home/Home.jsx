import React, { useState, useEffect } from "react";
import Banner from "../../components/Banner/Banner";
import CategoryProducts from "../../components/CategoryProducts/CategoryProducts";
import axios from "axios";
import "./Home.scss";

const Home = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // Lấy danh sách các danh mục
    const fetchCategories = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/categories");
        if (response.data.success) {
          // Lọc các danh mục chính (parent categories)
          const parentCategories = response.data.data.filter((cat) => !cat.parent);
          setCategories(parentCategories);
        }
        setLoading(false);
      } catch (error) {
        console.error("Lỗi khi tải danh mục:", error);
        setLoading(false);
        // Không sử dụng fallback nữa, để hiển thị thông báo lỗi
        setCategories([]);
      }
    };

    fetchCategories();
  }, []);

  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  return (
    <div className="home">
      {/* Banner chính */}
      <Banner searchEnabled={true} onSearch={handleSearchChange} bannerImage="/src/assets/banner/balo.webp" />

      {/* Hiển thị tổng số giá sách */}
       
      {/* Danh sách sản phẩm theo từng danh mục */}
      {!loading &&
        categories.map((category) => (
          <CategoryProducts
            key={category._id}
            categoryId={category._id}
            title={category.name}
            limit={5}
            useScroll={isMobile}
          />
        ))}

      {/* Hiển thị thông báo nếu không có danh mục */}
      {!loading && categories.length === 0 && (
        <div className="no-categories">
          <p>Không tìm thấy danh mục sản phẩm. Vui lòng kiểm tra kết nối hoặc thêm danh mục trong trang quản trị.</p>
        </div>
      )}
    </div>
  );
};

export default Home;
