import React from "react";
import "./Filter.scss";

const CategoryFilter = ({ categories, selectedCategory, onCategoryChange }) => {
  const handleCategoryClick = (categoryId) => {
    onCategoryChange(categoryId === selectedCategory ? null : categoryId);
  };

  return (
    <div className="category-filter">
      <h3>Danh mục sản phẩm</h3>
      <ul className="category-list">
        {categories.map((category) => (
          <li
            key={category.id}
            className={`category-item ${selectedCategory === category.id ? "active" : ""}`}
            onClick={() => handleCategoryClick(category.id)}>
            {category.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoryFilter;
