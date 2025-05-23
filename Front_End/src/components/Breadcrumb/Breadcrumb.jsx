import React from "react";
import { Link } from "react-router-dom";
import "./Breadcrumb.scss";

const Breadcrumb = ({ items }) => {
  return (
    <section className="breadcrumb">
      <div className="container">
        <div className="breadcrumb__inner">
          <ul className="breadcrumb__list">
            <li className="breadcrumb__item">
              <Link to="/" className="breadcrumb__link">
                Trang chủ
              </Link>
            </li>
            {items.map((item, index) => (
              <li key={index} className="breadcrumb__item">
                {index === items.length - 1 ? (
                  <span className="breadcrumb__link active">{item.name}</span>
                ) : (
                  <Link to={item.path} className="breadcrumb__link">
                    {item.name}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default Breadcrumb;
