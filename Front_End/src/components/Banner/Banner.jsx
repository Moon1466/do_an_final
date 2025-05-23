import React from "react";
import { Link } from "react-router-dom";
import "./Banner.scss";

const Banner = ({
  searchEnabled = true,
  onSearch,
  bannerImage = "src/assets/images/banner/balo.webp",
  linkTo = "/products",
}) => {
  return (
    <div className="main-banner">
      <Link to={linkTo} className="banner-link">
        <img src={bannerImage} alt="Banner khuyến mãi" className="banner-image" />
      </Link>

    
    </div>
  );
};

export default Banner;
