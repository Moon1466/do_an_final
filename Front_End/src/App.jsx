import React from "react";
import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import Header from "./layout/Header/Header";
import Footer from "./layout/Footer/Footer";
import { Outlet, useLocation } from "react-router-dom";

const App = () => {
  const location = useLocation();
  const hideFooter = location.pathname.startsWith("/payment") || location.pathname === "/forgot-password";
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      {!hideFooter && <Footer />}
    </>
  );
};

export default App;
