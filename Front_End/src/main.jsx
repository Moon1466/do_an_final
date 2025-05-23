import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ProductDetail from "./pages/ProductDetail/ProductDetail.jsx";
import Cart from "./pages/Cart/Cart.jsx";
import Payment from "./pages/Payment/Payment.jsx";
import Search from "./pages/Search/Search.jsx";
import Home from "./pages/Home/Home.jsx";
import VnpayCheckout from "./pages/Payment/VnpayCheckout.jsx";
import PaymentSuccess from "./pages/Payment/PaymentSuccess.jsx";
import Profile from "./pages/Profile/Profile.jsx";
import OrderHistory from "./pages/OrderHistory/OrderHistory.jsx";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
// Import global styles
import "./styles/index.scss";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "/product-detail/:id",
        element: <ProductDetail />,
      },
      {
        path: "/cart",
        element: <Cart />,
      },
      {
        path: "/payment",
        element: <Payment />,
      },
      {
        path: "/payment/vnpay-checkout",
        element: <VnpayCheckout />,
      },
      {
        path: "/payment/success",
        element: <PaymentSuccess />,
      },
      {
        path: "/search",
        element: <Search />,
      },
      {
        path: "/profile",
        element: <Profile />,
      },
      {
        path: "/order-history",
        element: <OrderHistory />,
      },
      {
        path: "/forgot-password",
        element: <ForgotPassword />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(<RouterProvider router={router} />);
