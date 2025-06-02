import React, { useEffect, useState } from "react";
import "./Footer.scss";

const Footer = () => {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    fetch("/api/setting")
      .then((res) => res.json())
      .then((data) => setSettings(data));
  }, []);

  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__column">
          <h3 className="footer__title">BookStore - Thế Giới Sách Online</h3>
          <div className="footer__info">
            <div className="footer__info-item">
              <span role="img" aria-label="location">
                📍
              </span>{" "}
              {settings?.address || "TP. Hồ Chí Minh"}
            </div>
            <div className="footer__info-item">
              <span role="img" aria-label="phone">
                📞
              </span>{" "}
              {settings?.phone || "0123 456 789"}
            </div>
            <div className="footer__info-item">
              <span role="img" aria-label="email">
                ✉️
              </span>{" "}
              {settings?.gmail || "bookstore@gmail.com"}
            </div>
          </div>
        </div>
        <div className="footer__column">
          <h4 className="footer__subtitle">Danh Mục Sách</h4>
          <ul className="footer__list">
            <li>Sách Văn Học</li>
            <li>Sách Kinh Tế</li>
            <li>Sách Thiếu Nhi</li>
            <li>Sách Ngoại Ngữ</li>
          </ul>
        </div>
        <div className="footer__column">
          <h4 className="footer__subtitle">Hỗ Trợ Khách Hàng</h4>
          <ul className="footer__list">
            <li>Chính sách đổi trả</li>
            <li>Chính sách bảo mật</li>
            <li>Hướng dẫn mua hàng</li>
            <li>Phương thức thanh toán</li>
          </ul>
        </div>
        <div className="footer__column">
           <div className="footer__social">
            <div className="footer__fanpage">
              <iframe
                title="BookStore Facebook Fanpage"
                src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Fbookstore&tabs&width=300&height=120&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId"
                width="300"
                height="120"
                style={{ border: "none", overflow: "hidden" }}
                scrolling="no"
                frameBorder="0"
                allowFullScreen={true}
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share">
              </iframe>
            </div>
         
          </div>
        </div>
      </div>
      <div className="footer__bottom">
        <p>© 20255 BookStore.</p>
      </div>
    </footer>
  );
};

export default Footer;
