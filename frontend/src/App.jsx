import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import Products from './pages/Products.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import Categories from './pages/Categories.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Profile from './pages/Profile.jsx';
import Orders from './pages/Orders.jsx';
import OrderSuccess from './pages/OrderSuccess.jsx';
import PaymentGateway from './pages/PaymentGateway.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import HelpCenter from './pages/HelpCenter.jsx';
import ShippingInfo from './pages/ShippingInfo.jsx';
import ReturnPolicy from './pages/ReturnPolicy.jsx';
import PrivacyPolicy from './pages/PrivacyPolicy.jsx';
import Developer from './pages/Developer.jsx';
import WhatsAppButton from './components/WhatsAppButton.jsx';

const App = () => {
    const { loading } = useAuth();
    const location = useLocation();
    const isAdmin = location.pathname.startsWith('/admin');
    const isDeveloper = location.pathname === '/developer';

    // Scroll to top on route change
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname]);

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: '16px' }}>
                <div className="spinner" />
                <p style={{ color: 'var(--text-muted)' }}>Loading X-Look...</p>
            </div>
        );
    }

    return (
        <>
            {!isDeveloper && <Navbar />}
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/order-success" element={<OrderSuccess />} />
                <Route path="/payment/:type" element={<PaymentGateway />} />
                <Route path="/help-center" element={<HelpCenter />} />
                <Route path="/shipping-info" element={<ShippingInfo />} />
                <Route path="/return-policy" element={<ReturnPolicy />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/developer" element={<Developer />} />
                <Route path="/admin/*" element={<AdminDashboard />} />
            </Routes>
            <WhatsAppButton />
            {!isAdmin && !isDeveloper && <Footer />}
        </>
    );
};

export default App;
