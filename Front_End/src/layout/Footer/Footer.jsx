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
          <h3 className="footer__title">28Tech - Become A Better Developer</h3>
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
              {settings?.gmail || "28tech.work@gmail.com"}
            </div>
          </div>
        </div>
        <div className="footer__column">
          <h4 className="footer__subtitle">Về 28Tech</h4>
          <ul className="footer__list">
            <li>Về chúng tôi</li>
            <li>Điều khoản dịch vụ</li>
            <li>Chính sách bảo mật</li>
            <li>Hướng dẫn thanh toán</li>
          </ul>
        </div>
        <div className="footer__column">
          <h4 className="footer__subtitle">Thông Tin 28Tech</h4>
          <ul className="footer__list">
            <li>Đăng ký giảng viên</li>
            <li>Danh sách khóa học</li>
            <li>Câu hỏi thường gặp</li>
            <li>Góc chia sẻ</li>
          </ul>
        </div>
        <div className="footer__column">
          <h4 className="footer__subtitle">Fanpage Facebook</h4>
          <div className="footer__fanpage">
            <iframe
              title="28Tech Facebook Fanpage"
              src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2F28tech.edu.vn&tabs&width=300&height=120&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId"
              width="300"
              height="120"
              style={{ border: "none", overflow: "hidden" }}
              scrolling="no"
              frameBorder="0"
              allowFullScreen={true}
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
