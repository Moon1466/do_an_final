import React from "react";
import "./Filter.scss";

const PriceFilter = ({ priceRange, onPriceChange, maxPrice = 1000000 }) => {
  const handlePriceChange = (e) => {
    onPriceChange([0, parseInt(e.target.value)]);
  };

  return (
    <div className="price-filter">
      <h3>Lọc theo giá ({priceRange[1].toLocaleString("vi-VN")}đ)</h3>
      <input
        type="range"
        min="0"
        max={maxPrice}
        step={maxPrice / 20}
        value={priceRange[1]}
        onChange={handlePriceChange}
        className="price-slider"
      />
      <div className="price-range-labels">
        <span>0đ</span>
        <span>{maxPrice.toLocaleString("vi-VN")}đ</span>
      </div>
    </div>
  );
};

export default PriceFilter;
