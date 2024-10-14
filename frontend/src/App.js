import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "./pages/Home/Home.jsx";
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import Reset from "./pages/auth/Reset.jsx";
import Forgot from "./pages/auth/Forgot.jsx";
import Sidebar from "./components/sidebar/Sidebar.jsx";
import Dashbord from "./pages/dashbord/Dashbord.jsx";
import Layout from "./components/layout/Layout.jsx";
import axios from "axios";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { getLoginStatus } from "./services/AuthService.jsx";
import { SET_LOGIN } from "./redux/feactures/auth/authSlice.js";
import AddProduct from "./pages/addProduct/AddProduct.jsx";
import ProductDetail from "./components/product/productDetail/ProductDetail.jsx";
import EditProduct from "./pages/editProduct/EditProduct.js";
import Contact from "./pages/contact/Contact.js";
import Profile from "./pages/profile/Profile.jsx";
import EditProfile from "./pages/editProfile/EditProfile.js";


axios.defaults.withCredentials = true

function App() {

  const dispatch = useDispatch();

  useEffect(() => {
    async function loginStatus() {
      const status = await getLoginStatus();
      dispatch(SET_LOGIN(status));
    }
    loginStatus();
  }, [dispatch]);
  return (
    <div >
      <ToastContainer />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot" element={<Forgot />} />
          <Route path="/resetpassword/:resetToken" element={<Reset />} />

          <Route path="/dashboard" element={
            <Sidebar>
              <Layout>
                <Dashbord />
              </Layout>
            </Sidebar>
          } />
          <Route path="/product-detail/:id" element={
            <Sidebar>
              <Layout>
                <ProductDetail />
              </Layout>
            </Sidebar>
          } />
          <Route path="/edit-product/:id" element={
            <Sidebar>
              <Layout>
                <EditProduct />
              </Layout>
            </Sidebar>
          } />
          <Route
            path="/profile"
            element={
              <Sidebar>
                <Layout>
                  <Profile />
                </Layout>
              </Sidebar>
            } />
          <Route path="/add-product" element={
            <Sidebar>
              <Layout>
                <AddProduct />
              </Layout>
            </Sidebar>
          } />
          <Route
            path="/contact-us"
            element={
              <Sidebar>
                <Layout>
                  <Contact />
                </Layout>
              </Sidebar>
            }
          />
          <Route
            path="/edit-profile"
            element={
              <Sidebar>
                <Layout>
                  <EditProfile />
                </Layout>
              </Sidebar>
            }
          />

        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
