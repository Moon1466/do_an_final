import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../Filter/Filter.scss";

const CategoryShelf = ({ title = "Danh mục sách", viewAllLink = "/categories" }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch categories from API
    axios
      .get("http://localhost:3000/api/categories")
      .then((res) => {
        // Filter parent categories (categories without a parent)
        const parentCategories = res.data.data.filter((cat) => !cat.parent);
        setCategories(parentCategories);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching categories:", err);
        // Fallback categories if API fails
        setCategories([
          { _id: 1, name: "Sách văn học", image: "/images/categories/van-hoc.jpg" },
          { _id: 2, name: "Sách kinh tế", image: "/images/categories/kinh-te.jpg" },
          { _id: 3, name: "Sách giáo khoa", image: "/images/categories/giao-khoa.jpg" },
          { _id: 4, name: "Sách thiếu nhi", image: "/images/categories/thieu-nhi.jpg" },
          { _id: 5, name: "Truyện tranh", image: "/images/categories/truyen-tranh.jpg" },
          { _id: 6, name: "Sách ngoại ngữ", image: "/images/categories/ngoai-ngu.jpg" },
        ]);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="category-shelf">
        <div className="container">
          <div className="category-shelf__header">
            <h2>{title}</h2>
          </div>
          <div className="loading">Đang tải danh mục...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="category-shelf">
      <div className="container">
        <div className="category-shelf__header">
          <h2>{title}</h2>
          <Link to={viewAllLink} className="view-all">
            Xem tất cả
            <i className="fas fa-angle-right" style={{ marginLeft: "5px" }}></i>
          </Link>
        </div>

        <div className="category-shelf__items">
          {categories.map((category) => (
            <Link key={category._id} to={`/category/${category._id}`} className="category-card">
              <div className="category-card__image">
                {category.image ? (
                  <img src={category.image} alt={category.name} />
                ) : (
                  <i className="fas fa-book" style={{ fontSize: "2rem", color: "#6a11cb" }}></i>
                )}
              </div>
              <div className="category-card__content">
                <h3>{category.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryShelf;
