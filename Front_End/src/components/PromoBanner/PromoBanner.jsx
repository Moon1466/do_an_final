import React from "react";
import { Link } from "react-router-dom";
import "./PromoBanner.scss";

const PromoBanner = ({
  title = "Mang tri thức trên vai",
  subtitle = "CHẮP CÁNH ƯỚC MƠ BAY",
  buttonText = "Khám phá ngay",
  buttonLink = "/products",
  bgColor = "#FFD541",
  image = "/images/backpack-promo.png",
}) => {
  return (
    <div className="promo-banner" style={{ backgroundColor: bgColor }}>
      <div className="container">
        <div className="promo-banner__content">
          <div className="promo-banner__text">
            <h3>{title}</h3>
            <h2>{subtitle}</h2>
            <Link to={buttonLink} className="promo-button">
              {buttonText}
            </Link>
          </div>
          <div className="promo-banner__image">
            <img src={image} alt={title} />
          </div>
        </div>
      </div>
      <div className="promo-banner__dots">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <span key={i} className={i === 5 ? "active" : ""}></span>
        ))}
      </div>
    </div>
  );
};

export default PromoBanner;
