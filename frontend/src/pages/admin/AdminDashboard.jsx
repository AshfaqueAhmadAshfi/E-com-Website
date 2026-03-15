import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import {
    getDashboardAPI, getProductsAPI, getAllCategoriesAPI as getCategoriesAPI, getAllOrdersAPI, getAdminUsersAPI, getCouponsAPI,
    createProductAPI, updateProductAPI, deleteProductAPI, toggleProductAPI,
    createCategoryAPI, updateCategoryAPI, deleteCategoryAPI,
    updateOrderStatusAPI, toggleBlockUserAPI, changeRoleAPI,
    createCouponAPI, deleteCouponAPI, deleteOrderAPI,
    generateDescriptionAPI,
    getCourierSettingsAPI, updateCourierSettingsAPI, shipOrderAPI
} from '../../utils/api.js';
import toast from 'react-hot-toast';
import { FiGrid, FiPackage, FiLayers, FiShoppingCart, FiUsers, FiTag, FiPlus, FiEdit, FiTrash2, FiDollarSign, FiTrendingUp, FiArrowLeft, FiLogOut, FiEye, FiCalendar, FiTruck } from 'react-icons/fi';

const AdminDashboard = () => {
    const { user, isAdmin, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [dashboard, setDashboard] = useState(null);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState([]);
    const [coupons, setCoupons] = useState([]);
    const [courierSettings, setCourierSettings] = useState({ pathao: {}, steadfast: {} });
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(null);
    const [activeOrder, setActiveOrder] = useState(null);
    const [form, setForm] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [orderView, setOrderView] = useState('all'); // all, cancelled
    const [dateFilter, setDateFilter] = useState('all'); // today, week, month, year, all, custom
    const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });
    const [orderPage, setOrderPage] = useState(1);
    const [orderPagination, setOrderPagination] = useState({ total: 0, pages: 1 });
    const [paymentPage, setPaymentPage] = useState(1);

    const ITEMS_PER_PAGE = 10;
    const formatOrderNum = (o) => o.orderNumber ? `#ORD${String(o.orderNumber).padStart(5, '0')}` : `#${o._id.slice(-6).toUpperCase()}`;

    const getDateRange = (filter) => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        switch (filter) {
            case 'today': return { startDate: today.toISOString(), endDate: now.toISOString() };
            case 'yesterday': { const y = new Date(today); y.setDate(y.getDate() - 1); const yEnd = new Date(y); yEnd.setHours(23, 59, 59, 999); return { startDate: y.toISOString(), endDate: yEnd.toISOString() }; }
            case 'week': { const w = new Date(today); w.setDate(w.getDate() - 7); return { startDate: w.toISOString(), endDate: now.toISOString() }; }
            case 'month': { const m = new Date(now.getFullYear(), now.getMonth(), 1); return { startDate: m.toISOString(), endDate: now.toISOString() }; }
            case 'year': { const y = new Date(now.getFullYear(), 0, 1); return { startDate: y.toISOString(), endDate: now.toISOString() }; }
            case 'custom': {
                if (customDateRange.start) {
                    const start = new Date(customDateRange.start + 'T00:00:00');
                    const end = new Date(customDateRange.start + 'T00:00:00'); end.setHours(23, 59, 59, 999);
                    return { startDate: start.toISOString(), endDate: end.toISOString() };
                }
                return {};
            }
            default: return {};
        }
    };

    useEffect(() => { if (!user || !isAdmin) navigate('/login'); }, [user, isAdmin]);

    // Real-time notifications (Removed InsForge logic)

    useEffect(() => { loadData(); }, [activeTab, dateFilter, customDateRange, orderPage, paymentPage]);

    // Auto-search for orders with debounce
    useEffect(() => {
        if (activeTab === 'orders') {
            const delayDebounceFn = setTimeout(() => {
                loadData();
            }, 300);
            return () => clearTimeout(delayDebounceFn);
        }
    }, [searchQuery, activeTab]);

    const loadData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'dashboard') { const params = getDateRange(dateFilter); const r = await getDashboardAPI(params); setDashboard(r.data.dashboard); }
            if (activeTab === 'products') { const r = await getProductsAPI({ limit: 100, all: 'true' }); setProducts(r.data.products); const c = await getCategoriesAPI(); setCategories(c.data.categories); }
            if (activeTab === 'categories') { const r = await getCategoriesAPI(); setCategories(r.data.categories); }
            if (activeTab === 'orders' || activeTab === 'payments') {
                const dateParams = getDateRange(dateFilter);
                const isMobile = activeTab === 'payments';
                const pg = isMobile ? paymentPage : orderPage;
                const r = await getAllOrdersAPI({ limit: ITEMS_PER_PAGE, page: pg, search: searchQuery, isMobile: isMobile ? 'true' : 'false', ...dateParams });
                setOrders(r.data.orders);
                if (isMobile) setOrderPagination(r.data.pagination || { total: 0, pages: 1 });
                else setOrderPagination(r.data.pagination || { total: 0, pages: 1 });
            }
            if (activeTab === 'users') { const r = await getAdminUsersAPI({ limit: 50 }); setUsers(r.data.users); }
            if (activeTab === 'coupons') { const r = await getCouponsAPI(); setCoupons(r.data.coupons); }
            if (activeTab === 'courier') { const r = await getCourierSettingsAPI(); setCourierSettings(r.data.settings); }
        } catch { }
        setLoading(false);
    };

    const [generatingAI, setGeneratingAI] = useState(false);
    const handleGenerateDescription = async () => {
        if (!form.name) return toast.error('Please enter product name first');
        setGeneratingAI(true);
        try {
            const { data } = await generateDescriptionAPI({ name: form.name, brand: form.brand, category: categories.find(c => c._id === form.category)?.name });
            setForm(f => ({ ...f, description: data.description }));
            toast.success('AI Description Generated!');
        } catch (err) {
            toast.error('AI generation failed');
        }
        setGeneratingAI(false);
    };

    // Product actions
    const handleProductSave = async (e) => {
        e.preventDefault();
        const fd = new FormData();
        ['name', 'description', 'price', 'discountPrice', 'category', 'stock', 'brand', 'tags'].forEach(k => { if (form[k] !== undefined) fd.append(k, form[k]); });
        if (form.sizes !== undefined) fd.append('sizes', Array.isArray(form.sizes) ? form.sizes.join(',') : form.sizes);
        if (form.colors !== undefined) fd.append('colors', Array.isArray(form.colors) ? form.colors.join(',') : form.colors);
        if (form.featured) fd.append('featured', form.featured);
        if (form.imageFiles) {
            Array.from(form.imageFiles).forEach(f => fd.append('images', f));
        }
        try {
            if (form._id) { await updateProductAPI(form._id, fd); toast.success('Product updated'); }
            else { await createProductAPI(fd); toast.success('Product created'); }
            setModal(null); loadData();
        } catch (err) {
            console.error('Save Product Error:', err);
            toast.error(err.response?.data?.message || 'Error saving product');
        }
    };

    const handleDeleteProduct = async (id) => {
        if (!confirm('Delete this product?')) return;
        try { await deleteProductAPI(id); toast.success('Deleted'); loadData(); } catch { toast.error('Error'); }
    };

    const handleProductToggle = async (id) => {
        try {
            await toggleProductAPI(id);
            toast.success('Visibility toggled');
            loadData();
        } catch { toast.error('Error toggling visibility'); }
    };

    // Category actions
    const handleCategorySave = async (e) => {
        e.preventDefault();
        const fd = new FormData();
        fd.append('name', form.name);
        if (form.description) fd.append('description', form.description);
        if (form.imageFile) fd.append('image', form.imageFile);
        try {
            if (form._id) { await updateCategoryAPI(form._id, fd); toast.success('Updated'); }
            else { await createCategoryAPI(fd); toast.success('Created'); }
            setModal(null); loadData();
        } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    };

    const handleDeleteCategory = async (id) => {
        if (!confirm('Delete?')) return;
        try { await deleteCategoryAPI(id); toast.success('Deleted'); loadData(); } catch { toast.error('Error'); }
    };

    // Order actions
    const handleOrderStatus = async (id, status) => {
        try { await updateOrderStatusAPI(id, { status }); toast.success('Updated'); loadData(); } catch { toast.error('Error'); }
    };
    const handlePaymentStatus = async (id, paymentStatus) => {
        try { await updateOrderStatusAPI(id, { paymentStatus }); toast.success('Updated'); loadData(); } catch { toast.error('Error'); }
    };
    const handleDeleteOrder = async (id) => {
        if (!confirm('Permanently delete this order?')) return false;
        try {
            await deleteOrderAPI(id);
            toast.success('Order Deleted');
            loadData();
            return true;
        } catch {
            toast.error('Error deleting order');
            return false;
        }
    };

    // User actions
    const handleBlockUser = async (id) => {
        try { await toggleBlockUserAPI(id); toast.success('Updated'); loadData(); } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    };
    const handleRoleChange = async (id, role) => {
        try { await changeRoleAPI(id, { role }); toast.success('Updated'); loadData(); } catch { toast.error('Error'); }
    };

    // Coupon
    const handleCouponSave = async (e) => {
        e.preventDefault();
        try {
            await createCouponAPI(form);
            toast.success('Coupon created'); setModal(null); loadData();
        } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    };

    // Courier Settings
    const handleCourierSave = async (e) => {
        e.preventDefault();
        try {
            await updateCourierSettingsAPI(courierSettings);
            toast.success('Courier settings saved');
        } catch { toast.error('Error saving settings'); }
    };

    const handleShipOrder = async (orderId, courier) => {
        const loadingToast = toast.loading(`Sending to ${courier}...`);
        try {
            const { data } = await shipOrderAPI(orderId, { courier });
            toast.success(data.message, { id: loadingToast });
            loadData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Shipping failed', { id: loadingToast });
        }
    };

    const navItems = [
        { id: 'dashboard', icon: <FiGrid />, label: 'Dashboard' },
        { id: 'products', icon: <FiPackage />, label: 'Products' },
        { id: 'categories', icon: <FiLayers />, label: 'Categories' },
        { id: 'orders', icon: <FiShoppingCart />, label: 'Orders' },
        { id: 'payments', icon: <FiDollarSign />, label: 'Advance Payments' },
        { id: 'users', icon: <FiUsers />, label: 'Users' },
        { id: 'coupons', icon: <FiTag />, label: 'Coupons' },
        { id: 'courier', icon: <FiTruck />, label: 'Courier' },
    ];

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="admin-sidebar-header" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <img src="/logo.png" alt="Logo" style={{ height: '35px', objectFit: 'contain' }} />
                        <span style={{
                            fontSize: '1.2rem',
                            fontWeight: '800',
                            background: 'var(--gradient-1)',
                            WebkitBackgroundClip: 'text',
                            backgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>X-Look</span>
                    </div>
                    <p>Admin Dashboard</p>
                </div>
                <div className="admin-nav-section">
                    <div className="admin-nav-label">Main</div>
                    {navItems.map(item => (
                        <div key={item.id} className={`admin-nav-item ${activeTab === item.id ? 'active' : ''}`} onClick={() => setActiveTab(item.id)}>
                            {item.icon} {item.label}
                        </div>
                    ))}
                </div>
                <div className="admin-nav-section" style={{ marginTop: 'auto' }}>
                    <div className="admin-nav-label">Other</div>
                    <Link to="/" className="admin-nav-item"><FiArrowLeft /> Back to Store</Link>
                    <div className="admin-nav-item" onClick={logout} style={{ color: 'var(--danger)' }}><FiLogOut /> Logout</div>
                </div>
            </aside>

            <main className="admin-main">
                <div className="admin-topbar">
                    <h1>{navItems.find(n => n.id === activeTab)?.label || 'Dashboard'}</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Welcome, {user?.name}</span>
                        <div className="nav-avatar" style={{ width: '36px', height: '36px' }}>{user?.name?.charAt(0)}</div>
                    </div>
                </div>

                {loading ? <div className="loading-page"><div className="spinner" /></div> : (
                    <>
                        {/* DASHBOARD */}
                        {activeTab === 'dashboard' && dashboard && (
                            <div className="fade-in">
                                {/* Date Filter Bar */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', flexWrap: 'wrap', padding: '12px 16px', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                    <FiCalendar style={{ color: 'var(--accent)', flexShrink: 0 }} />
                                    <span style={{ fontSize: '0.85rem', fontWeight: 600, marginRight: '4px' }}>Period:</span>
                                    {[
                                        { id: 'today', label: 'Today' },
                                        { id: 'yesterday', label: 'Yesterday' },
                                        { id: 'week', label: 'This Week' },
                                        { id: 'month', label: 'This Month' },
                                        { id: 'year', label: 'This Year' },
                                        { id: 'all', label: 'All Time' },
                                        { id: 'custom', label: 'Specific Date' },
                                    ].map(f => (
                                        <button
                                            key={f.id}
                                            onClick={() => setDateFilter(f.id)}
                                            style={{
                                                padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', border: 'none',
                                                background: dateFilter === f.id ? 'var(--accent)' : 'var(--bg-secondary)',
                                                color: dateFilter === f.id ? '#fff' : 'var(--text-secondary)',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {f.label}
                                        </button>
                                    ))}
                                    {dateFilter === 'custom' && (
                                        <div style={{ display: 'flex', gap: '8px', marginLeft: '8px', alignItems: 'center' }}>
                                            <input type="date" className="form-input" value={customDateRange.start} onChange={e => setCustomDateRange(p => ({ ...p, start: e.target.value }))} style={{ padding: '4px 8px', fontSize: '0.8rem', width: '140px' }} />
                                        </div>
                                    )}
                                </div>

                                <div className="stats-grid">
                                    <div className="stat-card"><div className="stat-card-header"><div><div className="stat-card-value">৳{(dashboard.totalRevenue || 0).toLocaleString()}</div><div className="stat-card-label">{{ today: "Today's", yesterday: "Yesterday's", week: "This Week's", month: "This Month's", year: "This Year's", all: "Total", custom: "Selected" }[dateFilter] || 'Total'} Revenue</div></div><div className="stat-card-icon purple"><FiDollarSign /></div></div></div>
                                    <div className="stat-card"><div className="stat-card-header"><div><div className="stat-card-value">{dashboard.totalOrders}</div><div className="stat-card-label">{{ today: "Today's", yesterday: "Yesterday's", week: "This Week's", month: "This Month's", year: "This Year's", all: "Total", custom: "Selected" }[dateFilter] || 'Total'} Orders</div></div><div className="stat-card-icon green"><FiShoppingCart /></div></div></div>
                                    <div className="stat-card"><div className="stat-card-header"><div><div className="stat-card-value">{dashboard.totalProducts}</div><div className="stat-card-label">Total Products</div></div><div className="stat-card-icon blue"><FiPackage /></div></div></div>
                                    <div className="stat-card"><div className="stat-card-header"><div><div className="stat-card-value">{dashboard.totalUsers}</div><div className="stat-card-label">Total Users</div></div><div className="stat-card-icon orange"><FiUsers /></div></div></div>
                                </div>


                                <div className="table-container">
                                    <div className="table-header"><h3>🏆 Best Sellers</h3></div>
                                    <table>
                                        <thead><tr><th>Product</th><th>Sold</th><th>Price</th></tr></thead>
                                        <tbody>
                                            {dashboard.bestSelling?.map(p => (
                                                <tr key={p._id}><td style={{ fontWeight: 500 }}>{p.name}</td><td>{p.sold}</td><td>৳{p.price?.toLocaleString()}</td></tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="table-container" style={{ marginTop: '24px' }}>
                                    <div className="table-header"><h3>Recent Orders</h3></div>
                                    <table>
                                        <thead><tr><th>Order</th><th>Customer</th><th>Status</th><th>Total</th><th>Date</th></tr></thead>
                                        <tbody>
                                            {dashboard.recentOrders?.slice(0, 10).map(o => (
                                                <tr key={o._id}>
                                                    <td><strong style={{ color: 'var(--accent)', fontSize: '0.85rem' }}>{formatOrderNum(o)}</strong></td>
                                                    <td>{o.user?.name}</td>
                                                    <td><span className={`status-badge status-${o.status}`}>{o.status}</span></td>
                                                    <td>৳{o.totalPrice?.toLocaleString()}</td>
                                                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* PRODUCTS */}
                        {activeTab === 'products' && (
                            <div className="fade-in">
                                {/* Top bar: filter + global add */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Filter by Category:</span>
                                        <select
                                            className="form-input form-select"
                                            value={form._filterCategory || ''}
                                            onChange={e => setForm(f => ({ ...f, _filterCategory: e.target.value }))}
                                            style={{ width: '200px', padding: '8px 12px', fontSize: '0.85rem' }}
                                        >
                                            <option value="">All Categories</option>
                                            {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                        </select>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            {products.length} total product{products.length !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                    <button className="btn btn-primary" onClick={() => { setForm({ name: '', description: '', price: '', discountPrice: '', category: categories[0]?._id || '', stock: '', brand: '', tags: '', featured: false }); setModal('product'); }}><FiPlus /> Add Product</button>
                                </div>

                                {/* Category-wise product sections */}
                                {(() => {
                                    // Group products by category
                                    const grouped = {};
                                    const uncategorized = [];
                                    products.forEach(p => {
                                        const catId = p.category?._id || p.category;
                                        const catName = p.category?.name || 'Uncategorized';
                                        if (!catId || !p.category?.name) {
                                            uncategorized.push(p);
                                        } else {
                                            if (!grouped[catId]) grouped[catId] = { name: catName, products: [] };
                                            grouped[catId].products.push(p);
                                        }
                                    });

                                    // Filter by selected category
                                    const filterCat = form._filterCategory || '';
                                    let categoryEntries = Object.entries(grouped);
                                    if (filterCat) {
                                        categoryEntries = categoryEntries.filter(([id]) => id === filterCat);
                                    }

                                    // Sort categories alphabetically
                                    categoryEntries.sort((a, b) => a[1].name.localeCompare(b[1].name));

                                    if (categoryEntries.length === 0 && (filterCat || uncategorized.length === 0)) {
                                        return (
                                            <div className="empty-state" style={{ padding: '48px 0' }}>
                                                <div className="empty-icon">📦</div>
                                                <h3>No products found</h3>
                                                <p style={{ color: 'var(--text-muted)' }}>
                                                    {filterCat ? 'No products in this category yet.' : 'Start by adding your first product.'}
                                                </p>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                            {categoryEntries.map(([catId, catData]) => (
                                                <div key={catId} className="table-container" style={{ overflow: 'visible' }}>
                                                    {/* Category Header */}
                                                    <div style={{
                                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                        padding: '16px 20px',
                                                        background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.08), rgba(99, 102, 241, 0.05))',
                                                        borderBottom: '1px solid var(--border)',
                                                        borderRadius: '12px 12px 0 0'
                                                    }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                            <div style={{
                                                                width: '36px', height: '36px', borderRadius: '10px',
                                                                background: 'linear-gradient(135deg, var(--primary), var(--primary-dark, #5b21b6))',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                color: '#fff', fontSize: '0.85rem', fontWeight: 700
                                                            }}>
                                                                <FiLayers />
                                                            </div>
                                                            <div>
                                                                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>{catData.name}</h3>
                                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                                    {catData.products.length} product{catData.products.length !== 1 ? 's' : ''}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <button
                                                            className="btn btn-primary btn-sm"
                                                            onClick={() => {
                                                                setForm({ name: '', description: '', price: '', discountPrice: '', category: catId, stock: '', brand: '', tags: '', featured: false });
                                                                setModal('product');
                                                            }}
                                                            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                                                        >
                                                            <FiPlus size={14} /> Add to {catData.name}
                                                        </button>
                                                    </div>
                                                    {/* Products Table */}
                                                    <table>
                                                        <thead>
                                                            <tr>
                                                                <th style={{ width: '60px' }}>Image</th>
                                                                <th>Name</th>
                                                                <th>Price</th>
                                                                <th>Stock</th>
                                                                <th>Sold</th>
                                                                <th>Featured</th>
                                                                <th>Actions</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {catData.products.map(p => (
                                                                <tr key={p._id}>
                                                                    <td>
                                                                        <div className="table-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                            {p.images?.[0] ? <img src={p.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }} /> : '📦'}
                                                                        </div>
                                                                    </td>
                                                                    <td style={{ fontWeight: 500, maxWidth: '200px' }}>{p.name}</td>
                                                                    <td>
                                                                        <div>
                                                                            <span style={{ fontWeight: 600 }}>৳{p.price?.toLocaleString()}</span>
                                                                            {p.discountPrice ? <span style={{ fontSize: '0.75rem', color: 'var(--success)', marginLeft: '6px' }}>৳{p.discountPrice?.toLocaleString()}</span> : null}
                                                                        </div>
                                                                    </td>
                                                                    <td><span className={p.stock < 10 ? 'tag tag-red' : 'tag tag-green'}>{p.stock}</span></td>
                                                                    <td>{p.sold || 0}</td>
                                                                    <td>{p.featured ? <span className="tag tag-purple">⭐ Yes</span> : <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No</span>}</td>
                                                                    <td>
                                                                        <div style={{ display: 'flex', gap: '6px' }}>
                                                                            <button
                                                                                className="btn btn-sm"
                                                                                onClick={() => handleProductToggle(p._id)}
                                                                                title={p.isActive === false ? 'Unhide Product' : 'Hide Product'}
                                                                                style={{ display: 'flex', alignItems: 'center', background: p.isActive === false ? 'rgba(239, 68, 68, 0.1)' : 'rgba(139, 92, 246, 0.1)', color: p.isActive === false ? '#ef4444' : '#8b5cf6' }}
                                                                            >
                                                                                <FiEye style={{ opacity: p.isActive === false ? 0.5 : 1 }} />
                                                                            </button>
                                                                            <button className="btn btn-secondary btn-sm" onClick={() => { setForm({ ...p, category: p.category?._id || p.category }); setModal('product'); }}><FiEdit /></button>
                                                                            <button className="btn btn-danger btn-sm" onClick={() => handleDeleteProduct(p._id)}><FiTrash2 /></button>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ))}

                                            {/* Uncategorized products */}
                                            {!filterCat && uncategorized.length > 0 && (
                                                <div className="table-container" style={{ overflow: 'visible' }}>
                                                    <div style={{
                                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                        padding: '16px 20px',
                                                        background: 'rgba(239, 68, 68, 0.04)',
                                                        borderBottom: '1px solid var(--border)',
                                                        borderRadius: '12px 12px 0 0'
                                                    }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                            <div style={{
                                                                width: '36px', height: '36px', borderRadius: '10px',
                                                                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                color: '#fff', fontSize: '0.85rem', fontWeight: 700
                                                            }}>
                                                                <FiPackage />
                                                            </div>
                                                            <div>
                                                                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Uncategorized</h3>
                                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                                    {uncategorized.length} product{uncategorized.length !== 1 ? 's' : ''} — assign a category
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <table>
                                                        <thead>
                                                            <tr>
                                                                <th style={{ width: '60px' }}>Image</th>
                                                                <th>Name</th>
                                                                <th>Price</th>
                                                                <th>Stock</th>
                                                                <th>Sold</th>
                                                                <th>Featured</th>
                                                                <th>Actions</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {uncategorized.map(p => (
                                                                <tr key={p._id}>
                                                                    <td>
                                                                        <div className="table-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                            {p.images?.[0] ? <img src={p.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }} /> : '📦'}
                                                                        </div>
                                                                    </td>
                                                                    <td style={{ fontWeight: 500, maxWidth: '200px' }}>{p.name}</td>
                                                                    <td>৳{p.price?.toLocaleString()}</td>
                                                                    <td><span className={p.stock < 10 ? 'tag tag-red' : 'tag tag-green'}>{p.stock}</span></td>
                                                                    <td>{p.sold || 0}</td>
                                                                    <td>{p.featured ? <span className="tag tag-purple">⭐ Yes</span> : <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No</span>}</td>
                                                                    <td>
                                                                        <div style={{ display: 'flex', gap: '6px' }}>
                                                                            <button
                                                                                className="btn btn-sm"
                                                                                onClick={() => handleProductToggle(p._id)}
                                                                                title={p.isActive === false ? 'Unhide Product' : 'Hide Product'}
                                                                                style={{ display: 'flex', alignItems: 'center', background: p.isActive === false ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: p.isActive === false ? '#ef4444' : '#10b981' }}
                                                                            >
                                                                                <FiEye style={{ opacity: p.isActive === false ? 0.5 : 1 }} />
                                                                            </button>
                                                                            <button className="btn btn-secondary btn-sm" onClick={() => { setForm({ ...p, category: p.category?._id || p.category }); setModal('product'); }}><FiEdit /></button>
                                                                            <button className="btn btn-danger btn-sm" onClick={() => handleDeleteProduct(p._id)}><FiTrash2 /></button>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()}
                            </div>
                        )}

                        {/* CATEGORIES */}
                        {activeTab === 'categories' && (
                            <div className="fade-in">
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                                    <button className="btn btn-primary" onClick={() => { setForm({ name: '', description: '' }); setModal('category'); }}><FiPlus /> Add Category</button>
                                </div>
                                <div className="table-container">
                                    <table>
                                        <thead><tr><th>Name</th><th>Description</th><th>Status</th><th>Actions</th></tr></thead>
                                        <tbody>
                                            {categories.map(c => (
                                                <tr key={c._id}>
                                                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                                                    <td style={{ color: 'var(--text-muted)' }}>{c.description || '-'}</td>
                                                    <td><span className={`tag ${c.isActive ? 'tag-green' : 'tag-red'}`}>{c.isActive ? 'Active' : 'Inactive'}</span></td>
                                                    <td>
                                                        <div style={{ display: 'flex', gap: '6px' }}>
                                                            <button className="btn btn-secondary btn-sm" onClick={() => { setForm(c); setModal('category'); }}><FiEdit /></button>
                                                            <button className="btn btn-danger btn-sm" onClick={() => handleDeleteCategory(c._id)}><FiTrash2 /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* ORDERS */}
                        {activeTab === 'orders' && (
                            <div className="fade-in">
                                {/* Date Filter */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', flexWrap: 'wrap', padding: '12px 16px', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                    <FiCalendar style={{ color: 'var(--accent)', flexShrink: 0 }} />
                                    <span style={{ fontSize: '0.85rem', fontWeight: 600, marginRight: '4px' }}>Period:</span>
                                    {[{ id: 'today', label: 'Today' }, { id: 'yesterday', label: 'Yesterday' }, { id: 'week', label: 'This Week' }, { id: 'month', label: 'This Month' }, { id: 'year', label: 'This Year' }, { id: 'all', label: 'All Time' }, { id: 'custom', label: 'Specific Date' }].map(f => (
                                        <button key={f.id} onClick={() => { setDateFilter(f.id); setOrderPage(1); }} style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', border: 'none', background: dateFilter === f.id ? 'var(--accent)' : 'var(--bg-secondary)', color: dateFilter === f.id ? '#fff' : 'var(--text-secondary)', transition: 'all 0.2s' }}>{f.label}</button>
                                    ))}
                                    {dateFilter === 'custom' && (
                                        <div style={{ display: 'flex', gap: '8px', marginLeft: '8px', alignItems: 'center' }}>
                                            <input type="date" className="form-input" value={customDateRange.start} onChange={e => setCustomDateRange(p => ({ ...p, start: e.target.value }))} style={{ padding: '4px 8px', fontSize: '0.8rem', width: '140px' }} />
                                        </div>
                                    )}
                                </div>

                                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                                    <div style={{ flex: 1 }} />
                                    <input type="text" className="form-input" placeholder="Search orders..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ maxWidth: '280px', fontSize: '0.85rem' }} onKeyPress={(e) => e.key === 'Enter' && loadData()} />
                                    <button className="btn btn-primary btn-sm" onClick={loadData}>Search</button>
                                </div>

                                <div className="table-container">
                                    <table>
                                        <thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Payment</th><th>Date</th><th>Actions</th></tr></thead>
                                        <tbody>
                                            {orders.filter(o => orderView === 'all' ? true : ['cancelled', 'refunded'].includes(o.status) || o.paymentStatus === 'failed').map(o => (
                                                <tr key={o._id}>
                                                    <td><strong style={{ color: 'var(--accent)', fontSize: '0.85rem' }}>{formatOrderNum(o)}</strong></td>
                                                    <td>{o.user?.name}<br /><span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{o.user?.email}</span><br /><span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent)' }}>{o.shippingAddress?.phone}</span></td>
                                                    <td>{o.items?.length} items</td>
                                                    <td style={{ fontWeight: 600 }}>৳{o.totalPrice?.toLocaleString()}</td>
                                                    <td>
                                                        <select className={`form-input form-select status-select ${o.status}`} value={o.status} onChange={e => handleOrderStatus(o._id, e.target.value)} style={{ padding: '4px 8px', fontSize: '0.75rem', width: '120px' }}>
                                                            {['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'].map(s => <option key={s} value={s} style={{ background: '#fff', color: '#000' }}>{s}</option>)}
                                                        </select>
                                                    </td>
                                                    <td>
                                                        <select className={`form-input form-select status-select ${o.paymentStatus}`} value={o.paymentStatus} onChange={e => handlePaymentStatus(o._id, e.target.value)} style={{ padding: '4px 8px', fontSize: '0.75rem', width: '100px' }}>
                                                            {['pending', 'paid', 'failed', 'refunded'].map(s => <option key={s} value={s} style={{ background: '#fff', color: '#000' }}>{s}</option>)}
                                                        </select>
                                                    </td>
                                                    <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                                                    <td>
                                                        <div style={{ display: 'flex', gap: '4px' }}>
                                                            <button className="btn btn-secondary btn-sm" onClick={() => { setActiveOrder(o); setModal('orderDetails'); }} style={{ padding: '6px' }} title="View Details"><FiEye /></button>
                                                            {o.status === 'pending' && (
                                                                <>
                                                                    <button 
                                                                        className="btn btn-sm" 
                                                                        onClick={() => handleShipOrder(o._id, 'steadfast')}
                                                                        style={{ padding: '6px', background: 'rgba(5, 150, 105, 0.1)', color: '#059669', border: '1px solid #059669' }}
                                                                        title="Send to Steadfast"
                                                                    >
                                                                        SF
                                                                    </button>
                                                                    <button 
                                                                        className="btn btn-sm" 
                                                                        onClick={() => handleShipOrder(o._id, 'pathao')}
                                                                        style={{ padding: '6px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid #ef4444' }}
                                                                        title="Send to Pathao"
                                                                    >
                                                                        PH
                                                                    </button>
                                                                </>
                                                            )}
                                                            <button className="btn btn-danger btn-sm" onClick={() => handleDeleteOrder(o._id)} style={{ padding: '6px' }} title="Delete"><FiTrash2 /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {orderPagination.pages > 1 && (
                                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', marginTop: '20px', flexWrap: 'wrap' }}>
                                        <button className="btn btn-secondary btn-sm" disabled={orderPage <= 1} onClick={() => setOrderPage(p => p - 1)} style={{ fontSize: '0.8rem' }}>← Prev</button>
                                        {Array.from({ length: orderPagination.pages }, (_, i) => i + 1).map(p => (
                                            <button key={p} onClick={() => setOrderPage(p)} style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', border: 'none', background: orderPage === p ? 'var(--accent)' : 'var(--bg-secondary)', color: orderPage === p ? '#fff' : 'var(--text-secondary)', transition: 'all 0.2s' }}>{p}</button>
                                        ))}
                                        <button className="btn btn-secondary btn-sm" disabled={orderPage >= orderPagination.pages} onClick={() => setOrderPage(p => p + 1)} style={{ fontSize: '0.8rem' }}>Next →</button>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '8px' }}>{orderPagination.total} total orders</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* PAYMENTS (ADVANCE MOBILE PAYMENTS) */}
                        {activeTab === 'payments' && (() => {
                            return (
                                <div className="fade-in">
                                    {/* Date Filter */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', flexWrap: 'wrap', padding: '12px 16px', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                        <FiCalendar style={{ color: 'var(--accent)', flexShrink: 0 }} />
                                        <span style={{ fontSize: '0.85rem', fontWeight: 600, marginRight: '4px' }}>Period:</span>
                                        {[{ id: 'today', label: 'Today' }, { id: 'yesterday', label: 'Yesterday' }, { id: 'week', label: 'This Week' }, { id: 'month', label: 'This Month' }, { id: 'year', label: 'This Year' }, { id: 'all', label: 'All Time' }, { id: 'custom', label: 'Specific Date' }].map(f => (
                                            <button key={f.id} onClick={() => { setDateFilter(f.id); setPaymentPage(1); }} style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', border: 'none', background: dateFilter === f.id ? 'var(--accent)' : 'var(--bg-secondary)', color: dateFilter === f.id ? '#fff' : 'var(--text-secondary)', transition: 'all 0.2s' }}>{f.label}</button>
                                        ))}
                                        {dateFilter === 'custom' && (
                                            <div style={{ display: 'flex', gap: '8px', marginLeft: '8px', alignItems: 'center' }}>
                                                <input type="date" className="form-input" value={customDateRange.start} onChange={e => setCustomDateRange(p => ({ ...p, start: e.target.value }))} style={{ padding: '4px 8px', fontSize: '0.8rem', width: '140px' }} />
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ marginBottom: '16px' }}>
                                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Mobile Payment Verification</h3>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Review manual bKash and Nagad payment submissions from customers.</p>
                                    </div>
                                    <div className="table-container">
                                        <table>
                                            <thead><tr><th>Order</th><th>Customer</th><th>Method</th><th>Sender Num</th><th>Amount</th><th>Status</th><th>Submitted</th><th>Actions</th></tr></thead>
                                            <tbody>
                                                {orders.map(o => (
                                                    <tr key={o._id}>
                                                        <td><strong style={{ color: 'var(--accent)', fontSize: '0.85rem' }}>{formatOrderNum(o)}</strong></td>
                                                        <td style={{ fontSize: '0.85rem' }}>{o.user?.name}<br /><span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{o.shippingAddress?.phone}</span></td>
                                                        <td>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                {['bkash', 'nagad'].includes(o.paymentMethod) && <img src={`/${o.paymentMethod}.png`} style={{ width: '20px', height: '20px', objectFit: 'contain' }} alt="" />}
                                                                <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{o.paymentMethod}</span>
                                                            </div>
                                                        </td>
                                                        <td style={{ fontWeight: 800 }}>{o.paymentInfo?.senderNumber || '-'}</td>
                                                        <td style={{ fontWeight: 800, color: 'var(--success)' }}>৳{o.paymentInfo?.amountSent || o.totalPrice}</td>
                                                        <td><span className={`status-badge status-${o.paymentStatus}`}>{o.paymentStatus}</span></td>
                                                        <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{o.paymentInfo?.submittedAt ? new Date(o.paymentInfo.submittedAt).toLocaleString() : '-'}</td>
                                                        <td>
                                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                                <button className="btn btn-secondary btn-sm" onClick={() => { setActiveOrder(o); setModal('orderDetails'); }} title="Verify Payment">
                                                                    <FiEye /> Review
                                                                </button>
                                                                <button className="btn btn-danger btn-sm" onClick={() => handleDeleteOrder(o._id)} title="Delete Order">
                                                                    <FiTrash2 />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {orders.length === 0 && (
                                                    <tr><td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No advance payments found for this period.</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination */}
                                    {orderPagination.pages > 1 && (
                                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', marginTop: '20px', flexWrap: 'wrap' }}>
                                            <button className="btn btn-secondary btn-sm" disabled={paymentPage <= 1} onClick={() => setPaymentPage(p => p - 1)} style={{ fontSize: '0.8rem' }}>← Prev</button>
                                            {Array.from({ length: orderPagination.pages }, (_, i) => i + 1).map(p => (
                                                <button key={p} onClick={() => setPaymentPage(p)} style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', border: 'none', background: paymentPage === p ? 'var(--accent)' : 'var(--bg-secondary)', color: paymentPage === p ? '#fff' : 'var(--text-secondary)', transition: 'all 0.2s' }}>{p}</button>
                                            ))}
                                            <button className="btn btn-secondary btn-sm" disabled={paymentPage >= orderPagination.pages} onClick={() => setPaymentPage(p => p + 1)} style={{ fontSize: '0.8rem' }}>Next →</button>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '8px' }}>{orderPagination.total} total payments</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })()}

                        {/* USERS */}
                        {activeTab === 'users' && (
                            <div className="fade-in">
                                <div className="table-container">
                                    <table>
                                        <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Location</th><th>Orders</th><th>Spent</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
                                        <tbody>
                                            {users.map(u => (
                                                <tr key={u._id}>
                                                    <td style={{ fontWeight: 500 }}>{u.name}</td>
                                                    <td style={{ color: 'var(--text-muted)' }}>{u.email}</td>
                                                    <td style={{ fontWeight: 600, color: 'var(--accent)' }}>{u.phone || '-'}</td>
                                                    <td>{u.address?.city || '-'}</td>
                                                    <td style={{ textAlign: 'center' }}><span className="tag tag-blue">{u.orderCount || 0}</span></td>
                                                    <td style={{ fontWeight: 700, color: 'var(--success)' }}>৳{(u.totalSpent || 0).toLocaleString()}</td>
                                                    <td>
                                                        <select className="form-input form-select" value={u.role} onChange={e => handleRoleChange(u._id, e.target.value)} style={{ padding: '4px 8px', fontSize: '0.75rem', width: '90px' }}>
                                                            <option value="user">User</option>
                                                            <option value="admin">Admin</option>
                                                        </select>
                                                    </td>
                                                    <td><span className={`tag ${u.isBlocked ? 'tag-red' : 'tag-green'}`}>{u.isBlocked ? 'Blocked' : 'Active'}</span></td>
                                                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                                                    <td>
                                                        {u.role !== 'admin' && <button className={`btn btn-sm ${u.isBlocked ? 'btn-success' : 'btn-danger'}`} onClick={() => handleBlockUser(u._id)}>{u.isBlocked ? 'Unblock' : 'Block'}</button>}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* COUPONS */}
                        {activeTab === 'coupons' && (
                            <div className="fade-in">
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                                    <button className="btn btn-primary" onClick={() => { setForm({ code: '', discountType: 'percentage', discountValue: '', minOrderAmount: '', maxDiscount: '', usageLimit: '', expiresAt: '' }); setModal('coupon'); }}><FiPlus /> Add Coupon</button>
                                </div>
                                <div className="table-container">
                                    <table>
                                        <thead><tr><th>Code</th><th>Type</th><th>Value</th><th>Min Order</th><th>Used</th><th>Expires</th><th>Actions</th></tr></thead>
                                        <tbody>
                                            {coupons.map(c => (
                                                <tr key={c._id}>
                                                    <td style={{ fontWeight: 700, letterSpacing: '1px' }}>{c.code}</td>
                                                    <td><span className="tag tag-purple">{c.discountType}</span></td>
                                                    <td>{c.discountType === 'percentage' ? `${c.discountValue}%` : `৳${c.discountValue}`}</td>
                                                    <td>৳{c.minOrderAmount}</td>
                                                    <td>{c.usedCount}{c.usageLimit ? `/${c.usageLimit}` : ''}</td>
                                                    <td style={{ fontSize: '0.8rem' }}>{new Date(c.expiresAt).toLocaleDateString()}</td>
                                                    <td><button className="btn btn-danger btn-sm" onClick={async () => { if (confirm('Delete?')) { await deleteCouponAPI(c._id); toast.success('Deleted'); loadData(); } }}><FiTrash2 /></button></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* COURIER SETTINGS */}
                        {activeTab === 'courier' && (
                            <div className="fade-in">
                                <form onSubmit={handleCourierSave} className="table-container" style={{ padding: '24px', maxWidth: '800px' }}>
                                    <div style={{ marginBottom: '24px' }}>
                                        <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>🚚 Courier Connection</h3>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Configure API and Secret Keys for automated shipping labels.</p>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                                        {/* Steadfast */}
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                                <img src="/steadfast.png" alt="Steadfast" style={{ height: '32px', background: '#fff', padding: '4px', borderRadius: '4px' }} />
                                                <h4 style={{ margin: 0 }}>Steadfast Courier</h4>
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">API Key</label>
                                                <input 
                                                    className="form-input" 
                                                    value={courierSettings.steadfast?.apiKey || ''} 
                                                    onChange={e => setCourierSettings(s => ({ ...s, steadfast: { ...s.steadfast, apiKey: e.target.value } }))}
                                                    placeholder="Enter Steadfast API Key"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Secret Key</label>
                                                <input 
                                                    type="password"
                                                    className="form-input" 
                                                    value={courierSettings.steadfast?.secretKey || ''} 
                                                    onChange={e => setCourierSettings(s => ({ ...s, steadfast: { ...s.steadfast, secretKey: e.target.value } }))}
                                                    placeholder="Enter Steadfast Secret Key"
                                                />
                                            </div>
                                        </div>

                                        {/* Pathao */}
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                                <img src="/pathao.png" alt="Pathao" style={{ height: '32px', background: '#fff', padding: '4px', borderRadius: '4px' }} />
                                                <h4 style={{ margin: 0 }}>Pathao Courier</h4>
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">API Key / Client ID</label>
                                                <input 
                                                    className="form-input" 
                                                    value={courierSettings.pathao?.apiKey || ''} 
                                                    onChange={e => setCourierSettings(s => ({ ...s, pathao: { ...s.pathao, apiKey: e.target.value } }))}
                                                    placeholder="Enter Pathao API Key"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Secret Key</label>
                                                <input 
                                                    type="password"
                                                    className="form-input" 
                                                    value={courierSettings.pathao?.secretKey || ''} 
                                                    onChange={e => setCourierSettings(s => ({ ...s, pathao: { ...s.pathao, secretKey: e.target.value } }))}
                                                    placeholder="Enter Pathao Secret Key"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                                        <button type="submit" className="btn btn-primary">Save Connections</button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </>
                )}

                {/* MODALS */}
                {modal === 'product' && (
                    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setModal(null)}>
                        <div className="modal">
                            <div className="modal-header"><h3>{form._id ? 'Edit Product' : 'Add Product'}</h3><button className="modal-close" onClick={() => setModal(null)}>×</button></div>
                            <form onSubmit={handleProductSave}>
                                <div className="modal-body">
                                    <div className="form-group"><label className="form-label">Name *</label><input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
                                    <div className="form-group">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                            <label className="form-label" style={{ marginBottom: 0 }}>Description *</label>
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-secondary"
                                                onClick={handleGenerateDescription}
                                                disabled={generatingAI}
                                                style={{ fontSize: '0.7rem', padding: '2px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                                            >
                                                {generatingAI ? 'Generating...' : '✨ AI Generate'}
                                            </button>
                                        </div>
                                        <textarea className="form-input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required style={{ minHeight: '100px' }} />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <div className="form-group"><label className="form-label">Price *</label><input type="number" className="form-input" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required /></div>
                                        <div className="form-group"><label className="form-label">Discount Price</label><input type="number" className="form-input" value={form.discountPrice || ''} onChange={e => setForm(f => ({ ...f, discountPrice: e.target.value }))} /></div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <div className="form-group"><label className="form-label">Category *</label><select className="form-input form-select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>{categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}</select></div>
                                        <div className="form-group"><label className="form-label">Stock *</label><input type="number" className="form-input" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} required /></div>
                                    </div>
                                    <div className="form-group"><label className="form-label">Brand</label><input className="form-input" value={form.brand || ''} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} /></div>
                                    <div className="form-group"><label className="form-label">Tags (comma separated)</label><input className="form-input" value={form.tags || ''} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} /></div>
                                    {(() => {
                                        const allSizes = ['Free Size', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL', '4XL', '5XL'];
                                        const allColors = ['Multi', 'Black', 'White', 'Blue', 'Red', 'Green', 'Yellow', 'Grey', 'Navy', 'Brown', 'Beige', 'Maroon', 'Olive', 'Pink', 'Purple', 'Orange', 'Gold', 'Silver'];
                                        const currentSizes = Array.isArray(form.sizes) ? form.sizes : (typeof form.sizes === 'string' && form.sizes ? form.sizes.split(',').map(s => s.trim()) : []);
                                        const currentColors = Array.isArray(form.colors) ? form.colors : (typeof form.colors === 'string' && form.colors ? form.colors.split(',').map(c => c.trim()) : []);
                                        return (
                                            <>
                                                <div className="form-group">
                                                    <label className="form-label">Available Sizes</label>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                                                        {allSizes.map(size => {
                                                            const isActive = currentSizes.includes(size);
                                                            return (
                                                                <button
                                                                    key={size}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const updated = isActive
                                                                            ? currentSizes.filter(s => s !== size)
                                                                            : [...currentSizes, size];
                                                                        setForm(f => ({ ...f, sizes: updated }));
                                                                    }}
                                                                    style={{
                                                                        padding: '6px 14px',
                                                                        borderRadius: '8px',
                                                                        border: isActive ? '2px solid var(--accent)' : '2px solid var(--border)',
                                                                        background: isActive ? 'var(--accent)' : 'transparent',
                                                                        color: isActive ? '#fff' : 'var(--text-secondary)',
                                                                        fontSize: '0.8rem',
                                                                        fontWeight: 600,
                                                                        cursor: 'pointer',
                                                                        transition: 'all 0.2s ease'
                                                                    }}
                                                                >
                                                                    {size}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                                <div className="form-group">
                                                    <label className="form-label">Available Colors</label>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                                                        {allColors.map(color => {
                                                            const isActive = currentColors.includes(color);
                                                            return (
                                                                <button
                                                                    key={color}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const updated = isActive
                                                                            ? currentColors.filter(c => c !== color)
                                                                            : [...currentColors, color];
                                                                        setForm(f => ({ ...f, colors: updated }));
                                                                    }}
                                                                    style={{
                                                                        padding: '6px 14px',
                                                                        borderRadius: '8px',
                                                                        border: isActive ? '2px solid var(--accent)' : '2px solid var(--border)',
                                                                        background: isActive ? 'var(--accent)' : 'transparent',
                                                                        color: isActive ? '#fff' : 'var(--text-secondary)',
                                                                        fontSize: '0.8rem',
                                                                        fontWeight: 600,
                                                                        cursor: 'pointer',
                                                                        transition: 'all 0.2s ease'
                                                                    }}
                                                                >
                                                                    {color}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </>
                                        );
                                    })()}
                                    <div className="form-group">
                                        <label className="form-label">Images</label>
                                        <input type="file" multiple accept="image/*" className="form-input" onChange={e => setForm(f => ({ ...f, imageFiles: e.target.files }))} />
                                        {((form.images && form.images.length > 0) || (form.imageFiles && form.imageFiles.length > 0)) && (
                                            <div style={{ display: 'flex', gap: '8px', marginTop: '10px', overflowX: 'auto', paddingBottom: '5px' }}>
                                                {/* Existing Images */}
                                                {form.images?.map((img, i) => (
                                                    <div key={i} style={{ width: '60px', height: '60px', borderRadius: '8px', border: '1px solid var(--border)', overflow: 'hidden', flexShrink: 0 }}>
                                                        <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    </div>
                                                ))}
                                                {/* New Selection Previews */}
                                                {form.imageFiles && Array.from(form.imageFiles).map((file, i) => (
                                                    <div key={i} style={{ width: '60px', height: '60px', borderRadius: '8px', border: '2px dashed var(--accent)', overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                                                        <img src={URL.createObjectURL(file)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        <div style={{ position: 'absolute', top: 0, right: 0, background: 'var(--accent)', color: 'white', fontSize: '10px', padding: '2px 4px' }}>New</div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="form-group"><label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}><input type="checkbox" checked={form.featured || false} onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))} /> Featured Product</label></div>
                                </div>
                                <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button><button type="submit" className="btn btn-primary">{form._id ? 'Update' : 'Create'}</button></div>
                            </form>
                        </div>
                    </div>
                )}

                {modal === 'category' && (
                    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setModal(null)}>
                        <div className="modal">
                            <div className="modal-header"><h3>{form._id ? 'Edit Category' : 'Add Category'}</h3><button className="modal-close" onClick={() => setModal(null)}>×</button></div>
                            <form onSubmit={handleCategorySave}>
                                <div className="modal-body">
                                    <div className="form-group"><label className="form-label">Name *</label><input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
                                    <div className="form-group"><label className="form-label">Description</label><textarea className="form-input" value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
                                    <div className="form-group">
                                        <label className="form-label">Image</label>
                                        <input type="file" accept="image/*" className="form-input" onChange={e => setForm(f => ({ ...f, imageFile: e.target.files[0] }))} />
                                        {(form.image || form.imageFile) && (
                                            <div style={{ marginTop: '10px' }}>
                                                <div style={{ width: '80px', height: '80px', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                                                    <img src={form.imageFile ? URL.createObjectURL(form.imageFile) : form.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                </div>
                                                {form.imageFile && <span style={{ fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 600 }}>New selection</span>}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button><button type="submit" className="btn btn-primary">{form._id ? 'Update' : 'Create'}</button></div>
                            </form>
                        </div>
                    </div>
                )}

                {modal === 'coupon' && (
                    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setModal(null)}>
                        <div className="modal">
                            <div className="modal-header"><h3>Add Coupon</h3><button className="modal-close" onClick={() => setModal(null)}>×</button></div>
                            <form onSubmit={handleCouponSave}>
                                <div className="modal-body">
                                    <div className="form-group"><label className="form-label">Code *</label><input className="form-input" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} required /></div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <div className="form-group"><label className="form-label">Type</label><select className="form-input form-select" value={form.discountType} onChange={e => setForm(f => ({ ...f, discountType: e.target.value }))}><option value="percentage">Percentage</option><option value="fixed">Fixed Amount</option></select></div>
                                        <div className="form-group"><label className="form-label">Value *</label><input type="number" className="form-input" value={form.discountValue} onChange={e => setForm(f => ({ ...f, discountValue: e.target.value }))} required /></div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <div className="form-group"><label className="form-label">Min Order Amount</label><input type="number" className="form-input" value={form.minOrderAmount} onChange={e => setForm(f => ({ ...f, minOrderAmount: e.target.value }))} /></div>
                                        <div className="form-group"><label className="form-label">Max Discount</label><input type="number" className="form-input" value={form.maxDiscount} onChange={e => setForm(f => ({ ...f, maxDiscount: e.target.value }))} /></div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <div className="form-group"><label className="form-label">Usage Limit</label><input type="number" className="form-input" value={form.usageLimit} onChange={e => setForm(f => ({ ...f, usageLimit: e.target.value }))} /></div>
                                        <div className="form-group"><label className="form-label">Expires At *</label><input type="date" className="form-input" value={form.expiresAt} onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))} required /></div>
                                    </div>
                                </div>
                                <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button><button type="submit" className="btn btn-primary">Create</button></div>
                            </form>
                        </div>
                    </div>
                )}
                {modal === 'orderDetails' && activeOrder && (
                    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setModal(null)}>
                        <div className="modal" style={{ maxWidth: '700px' }}>
                            <div className="modal-header">
                                <h3>Order Details #{activeOrder._id.slice(-6).toUpperCase()}</h3>
                                <button className="modal-close" onClick={() => setModal(null)}>×</button>
                            </div>
                            <div className="modal-body">
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '32px' }}>
                                    <div>
                                        <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>Customer Info</h4>
                                        <div style={{ marginBottom: '24px' }}>
                                            <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '4px' }}>{activeOrder.user?.name}</div>
                                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '4px' }}>{activeOrder.user?.email}</div>
                                            <div style={{ fontWeight: 800, color: 'var(--accent-light)', fontSize: '1rem' }}>{activeOrder.shippingAddress?.phone}</div>
                                        </div>

                                        <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>Shipping Address</h4>
                                        <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                                            <strong>{activeOrder.shippingAddress?.fullName}</strong><br />
                                            {activeOrder.shippingAddress?.street}<br />
                                            {activeOrder.shippingAddress?.city}, {activeOrder.shippingAddress?.state}<br />
                                            {activeOrder.shippingAddress?.country || 'Bangladesh'}
                                        </div>

                                        {activeOrder.paymentInfo && (
                                            <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(0, 123, 255, 0.05)', border: '1px solid rgba(0, 123, 255, 0.1)', borderRadius: '12px' }}>
                                                <h4 style={{ fontSize: '0.8rem', color: 'var(--accent)', marginBottom: '10px', textTransform: 'uppercase', fontWeight: 800 }}>Manual Payment Info</h4>
                                                <div style={{ fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                    <div><span style={{ color: 'var(--text-muted)' }}>Sender:</span> <strong>{activeOrder.paymentInfo.senderNumber}</strong></div>
                                                    <div><span style={{ color: 'var(--text-muted)' }}>Amount:</span> <strong>৳{activeOrder.paymentInfo.amountSent}</strong></div>
                                                    {activeOrder.paymentInfo.transactionId && <div><span style={{ color: 'var(--text-muted)' }}>TrxID:</span> <strong style={{ letterSpacing: '0.5px' }}>{activeOrder.paymentInfo.transactionId}</strong></div>}
                                                    {activeOrder.paymentInfo.submittedAt && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Submitted: {new Date(activeOrder.paymentInfo.submittedAt).toLocaleString()}</div>}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>Order Items</h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                                            {activeOrder.items?.map((item, i) => (
                                                <div key={i} style={{ display: 'flex', gap: '12px', padding: '12px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px' }}>
                                                    <div style={{ width: '50px', height: '50px', borderRadius: '8px', background: 'var(--bg-secondary)', overflow: 'hidden', flexShrink: 0 }}>
                                                        {item.image ? <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <FiPackage style={{ padding: '12px' }} />}
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{item.name}</div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                                            {item.quantity} x ৳{item.price.toLocaleString()}
                                                            {item.size && ` | Size: ${item.size}`}
                                                            {item.color && ` | Color: ${item.color}`}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}><span>Subtotal</span><span>৳{activeOrder.itemsPrice?.toLocaleString()}</span></div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}><span>Shipping</span><span>৳{activeOrder.shippingPrice?.toLocaleString()}</span></div>
                                            {activeOrder.couponDiscount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--success)' }}><span>Discount</span><span>-৳{activeOrder.couponDiscount?.toLocaleString()}</span></div>}
                                            <div style={{ height: '1px', background: 'var(--border)', margin: '12px 0' }} />
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.1rem', color: 'var(--accent-light)' }}><span>Total</span><span>৳{activeOrder.totalPrice?.toLocaleString()}</span></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
                                <button className="btn btn-danger" onClick={async () => { if (await handleDeleteOrder(activeOrder._id)) setModal(null); }}>
                                    <FiTrash2 style={{ marginRight: '8px' }} /> Delete Order
                                </button>
                                <button className="btn btn-primary" onClick={() => setModal(null)}>Close Details</button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
