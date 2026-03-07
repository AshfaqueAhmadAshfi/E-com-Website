import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'shopverse_secret_key_2026';
const DB_FILE = path.join(__dirname, 'database.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static(UPLOADS_DIR));

// Database Logic
let db = { users: [], products: [], categories: [], orders: [], coupons: [] };

const loadDB = () => {
    try {
        if (fs.existsSync(DB_FILE)) {
            const data = fs.readFileSync(DB_FILE, 'utf-8');
            db = JSON.parse(data);
        }
    } catch (err) {
        console.error('❌ Error loading DB:', err.message);
    }
};

const saveDB = () => {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
    } catch (err) {
        console.error('❌ Error saving DB:', err.message);
    }
};

loadDB();

// Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOADS_DIR),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Helpers
const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
const genToken = (id) => jwt.sign({ id }, JWT_SECRET, { expiresIn: '7d' });

const sendToken = (user, code, res) => {
    const token = genToken(user._id);
    const { password, ...userData } = user;
    res.status(code).cookie('token', token, {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        sameSite: 'lax'
    }).json({ success: true, token, user: userData });
};

// Middleware: Protect
const protect = (req, res, next) => {
    let token = req.cookies?.token || (req.headers.authorization?.startsWith('Bearer') ? req.headers.authorization.split(' ')[1] : null);
    if (!token) return res.status(401).json({ success: false, message: 'Not authorized' });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = db.users.find(u => u._id === decoded.id);
        if (!user) return res.status(401).json({ success: false, message: 'User not found' });
        if (user.isBlocked) return res.status(403).json({ success: false, message: 'Account blocked' });
        req.user = user;
        next();
    } catch {
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

// Middleware: Admin
const admin = (req, res, next) => {
    if (req.user?.role === 'admin') next();
    else res.status(403).json({ success: false, message: 'Admin access required' });
};

// ============================================================
// AUTH ROUTES
// ============================================================
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (db.users.find(u => u.email === email)) {
            return res.status(400).json({ success: false, message: 'Email already registered' });
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = {
            _id: generateId(),
            name,
            email,
            password: hashedPassword,
            role: 'user',
            avatar: '',
            phone: '',
            address: { street: '', city: '', state: '', zipCode: '', country: 'Bangladesh' },
            isBlocked: false,
            wishlist: [],
            createdAt: new Date().toISOString()
        };
        db.users.push(user);
        saveDB();
        sendToken(user, 201, res);
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = db.users.find(u => u.email === email);
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        if (user.isBlocked) return res.status(403).json({ success: false, message: 'Account blocked' });
        sendToken(user, 200, res);
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.post('/api/auth/logout', (req, res) => {
    res.cookie('token', '', { httpOnly: true, expires: new Date(0) }).json({ success: true, message: 'Logged out' });
});

app.get('/api/auth/me', protect, (req, res) => {
    const { password, ...userData } = req.user;
    res.json({ success: true, user: userData });
});

app.put('/api/auth/profile', protect, (req, res) => {
    const { name, phone, address } = req.body;
    const userIndex = db.users.findIndex(u => u._id === req.user._id);
    if (name) db.users[userIndex].name = name;
    if (phone) db.users[userIndex].phone = phone;
    if (address) db.users[userIndex].address = { ...db.users[userIndex].address, ...address };
    saveDB();
    const { password, ...userData } = db.users[userIndex];
    res.json({ success: true, user: userData });
});

// ============================================================
// PRODUCT ROUTES
// ============================================================
const getProductWithCategory = (product) => {
    const cat = db.categories.find(c => c._id === product.category);
    return { ...product, category: cat ? { _id: cat._id, name: cat.name } : null };
};

app.get('/api/products/featured', (req, res) => {
    const activeCats = db.categories.filter(c => c.isActive).map(c => c._id);
    const featured = db.products
        .filter(p => p.featured && p.isActive && activeCats.includes(p.category))
        .slice(0, 8)
        .map(getProductWithCategory);
    res.json({ success: true, products: featured });
});

app.get('/api/products/top-rated', (req, res) => {
    const activeCats = db.categories.filter(c => c.isActive).map(c => c._id);
    const topRated = db.products
        .filter(p => p.isActive && activeCats.includes(p.category))
        .sort((a, b) => (b.ratings || 0) - (a.ratings || 0))
        .slice(0, 8)
        .map(getProductWithCategory);
    res.json({ success: true, products: topRated });
});

app.get('/api/products', (req, res) => {
    let { page = 1, limit = 12, sort = '-createdAt', category, search, minPrice, maxPrice, featured, all } = req.query;

    let filtered = db.products;

    // Admin view
    let isAdmin = false;
    let token = req.cookies?.token;
    if (token) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            const user = db.users.find(u => u._id === decoded.id);
            if (user?.role === 'admin' && all === 'true') isAdmin = true;
        } catch { }
    }

    if (!isAdmin) {
        const activeCats = db.categories.filter(c => c.isActive).map(c => c._id);
        filtered = filtered.filter(p => p.isActive && activeCats.includes(p.category));
    }

    if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(p => p.name.toLowerCase().includes(s) || p.description.toLowerCase().includes(s));
    }
    if (category) filtered = filtered.filter(p => p.category === category);
    if (minPrice) filtered = filtered.filter(p => p.price >= Number(minPrice));
    if (maxPrice) filtered = filtered.filter(p => p.price <= Number(maxPrice));
    if (featured === 'true') filtered = filtered.filter(p => p.featured);

    // Sort
    if (sort === 'price') filtered.sort((a, b) => a.price - b.price);
    else if (sort === '-price') filtered.sort((a, b) => b.price - a.price);
    else if (sort === '-ratings') filtered.sort((a, b) => (b.ratings || 0) - (a.ratings || 0));
    else if (sort === '-sold') filtered.sort((a, b) => (b.sold || 0) - (a.sold || 0));
    else filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const total = filtered.length;
    const start = (Number(page) - 1) * Number(limit);
    const paginated = filtered.slice(start, start + Number(limit)).map(getProductWithCategory);

    res.json({
        success: true,
        products: paginated,
        pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
        }
    });
});

app.get('/api/products/:id', (req, res) => {
    const product = db.products.find(p => p._id === req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, product: getProductWithCategory(product) });
});

app.post('/api/products', protect, admin, upload.array('images', 5), (req, res) => {
    const images = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];
    const product = {
        ...req.body,
        _id: generateId(),
        price: Number(req.body.price),
        discountPrice: Number(req.body.discountPrice || 0),
        stock: Number(req.body.stock),
        featured: req.body.featured === 'true',
        images,
        tags: req.body.tags ? req.body.tags.split(',').map(t => t.trim()) : [],
        sizes: req.body.sizes ? req.body.sizes.split(',').map(s => s.trim()) : [],
        colors: req.body.colors ? req.body.colors.split(',').map(c => c.trim()) : [],
        ratings: 0,
        numReviews: 0,
        reviews: [],
        sold: 0,
        isActive: true,
        createdAt: new Date().toISOString()
    };
    db.products.push(product);
    saveDB();
    res.status(201).json({ success: true, product: getProductWithCategory(product) });
});

app.put('/api/products/:id', protect, admin, upload.array('images', 5), (req, res) => {
    const index = db.products.findIndex(p => p._id === req.params.id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Product not found' });

    const updates = { ...req.body };
    if (updates.price) updates.price = Number(updates.price);
    if (updates.discountPrice !== undefined) updates.discountPrice = Number(updates.discountPrice);
    if (updates.stock) updates.stock = Number(updates.stock);
    if (updates.featured !== undefined) updates.featured = updates.featured === 'true' || updates.featured === true;

    if (req.files?.length > 0) {
        const newImages = req.files.map(f => `/uploads/${f.filename}`);
        updates.images = [...(db.products[index].images || []), ...newImages];
    }

    db.products[index] = { ...db.products[index], ...updates };
    saveDB();
    res.json({ success: true, product: getProductWithCategory(db.products[index]) });
});

app.delete('/api/products/:id', protect, admin, (req, res) => {
    db.products = db.products.filter(p => p._id !== req.params.id);
    saveDB();
    res.json({ success: true, message: 'Product deleted' });
});

app.put('/api/products/:id/toggle', protect, admin, (req, res) => {
    const index = db.products.findIndex(p => p._id === req.params.id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Product not found' });
    db.products[index].isActive = !db.products[index].isActive;
    saveDB();
    res.json({ success: true, product: db.products[index] });
});

// ============================================================
// CATEGORY ROUTES
// ============================================================
app.get('/api/categories', (req, res) => {
    const { all } = req.query;
    let categories = db.categories;
    if (all !== 'true') categories = categories.filter(c => c.isActive);
    res.json({ success: true, categories: categories.sort((a, b) => a.name.localeCompare(b.name)) });
});

app.post('/api/categories', protect, admin, upload.single('image'), (req, res) => {
    const image = req.file ? `/uploads/${req.file.filename}` : '';
    const category = {
        _id: generateId(),
        name: req.body.name,
        description: req.body.description || '',
        image,
        isActive: true,
        createdAt: new Date().toISOString()
    };
    db.categories.push(category);
    saveDB();
    res.status(201).json({ success: true, category });
});

app.put('/api/categories/:id/toggle', protect, admin, (req, res) => {
    const index = db.categories.findIndex(c => c._id === req.params.id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Category not found' });
    db.categories[index].isActive = !db.categories[index].isActive;
    saveDB();
    res.json({ success: true, category: db.categories[index] });
});

// ============================================================
// ORDER ROUTES
// ============================================================
app.post('/api/orders', protect, (req, res) => {
    const { items, shippingAddress, paymentMethod, couponCode } = req.body;
    let itemsPrice = 0;
    const orderItems = items.map(item => {
        const prod = db.products.find(p => p._id === item.product);
        const price = prod.discountPrice > 0 ? prod.discountPrice : prod.price;
        itemsPrice += price * item.quantity;

        // Update stock
        prod.stock -= item.quantity;
        prod.sold = (prod.sold || 0) + item.quantity;

        return { ...item, name: prod.name, price, image: prod.images[0] };
    });

    const shippingPrice = shippingAddress.city === 'Dhaka' ? 70 : 130;
    const order = {
        _id: generateId(),
        orderNumber: db.orders.length + 1001,
        user: req.user._id,
        items: orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        shippingPrice,
        totalPrice: itemsPrice + shippingPrice,
        status: 'pending',
        paymentStatus: 'pending',
        createdAt: new Date().toISOString()
    };

    db.orders.push(order);
    saveDB();
    res.status(201).json({ success: true, order });
});

app.get('/api/orders/my-orders', protect, (req, res) => {
    const orders = db.orders.filter(o => o.user === req.user._id);
    res.json({ success: true, orders: orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) });
});

app.get('/api/orders', protect, admin, (req, res) => {
    res.json({ success: true, orders: db.orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) });
});

app.get('/api/orders/:id', protect, (req, res) => {
    const order = db.orders.find(o => o._id === req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Not found' });
    const user = db.users.find(u => u._id === order.user);
    res.json({ success: true, order: { ...order, user: { name: user.name, email: user.email } } });
});

app.put('/api/orders/:id/status', protect, admin, (req, res) => {
    const index = db.orders.findIndex(o => o._id === req.params.id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Not found' });
    db.orders[index] = { ...db.orders[index], ...req.body };
    saveDB();
    res.json({ success: true, order: db.orders[index] });
});

// ============================================================
// PASSWORD UPDATE
// ============================================================
app.put('/api/auth/password', protect, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userIndex = db.users.findIndex(u => u._id === req.user._id);
        if (userIndex === -1) return res.status(404).json({ success: false, message: 'User not found' });
        const isMatch = await bcrypt.compare(currentPassword, db.users[userIndex].password);
        if (!isMatch) return res.status(400).json({ success: false, message: 'Current password is incorrect' });
        db.users[userIndex].password = await bcrypt.hash(newPassword, 12);
        saveDB();
        res.json({ success: true, message: 'Password updated successfully' });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ============================================================
// PRODUCT REVIEWS
// ============================================================
app.post('/api/products/:id/reviews', protect, (req, res) => {
    try {
        const index = db.products.findIndex(p => p._id === req.params.id);
        if (index === -1) return res.status(404).json({ success: false, message: 'Product not found' });

        const alreadyReviewed = db.products[index].reviews.find(r => r.user === req.user._id);
        if (alreadyReviewed) return res.status(400).json({ success: false, message: 'Already reviewed' });

        const review = {
            user: req.user._id,
            name: req.user.name,
            rating: Number(req.body.rating),
            comment: req.body.comment,
            createdAt: new Date().toISOString()
        };
        db.products[index].reviews.push(review);
        db.products[index].numReviews = db.products[index].reviews.length;
        db.products[index].ratings = db.products[index].reviews.reduce((acc, r) => acc + r.rating, 0) / db.products[index].reviews.length;
        saveDB();
        res.status(201).json({ success: true, message: 'Review added' });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.put('/api/products/:id/reviews/:reviewId', protect, (req, res) => {
    try {
        const productIndex = db.products.findIndex(p => p._id === req.params.id);
        if (productIndex === -1) return res.status(404).json({ success: false, message: 'Product not found' });

        const reviewIndex = db.products[productIndex].reviews.findIndex(r => r._id === req.params.reviewId || (r.user === req.user._id && !req.params.reviewId));
        if (reviewIndex === -1) return res.status(404).json({ success: false, message: 'Review not found' });

        const review = db.products[productIndex].reviews[reviewIndex];
        if (review.user !== req.user._id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        db.products[productIndex].reviews[reviewIndex].rating = Number(req.body.rating) || review.rating;
        db.products[productIndex].reviews[reviewIndex].comment = req.body.comment || review.comment;
        db.products[productIndex].reviews[reviewIndex].updatedAt = new Date().toISOString();

        db.products[productIndex].ratings = db.products[productIndex].reviews.reduce((acc, r) => acc + r.rating, 0) / db.products[productIndex].reviews.length;
        saveDB();
        res.json({ success: true, message: 'Review updated' });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.delete('/api/products/:id/reviews/:reviewId', protect, (req, res) => {
    try {
        const productIndex = db.products.findIndex(p => p._id === req.params.id);
        if (productIndex === -1) return res.status(404).json({ success: false, message: 'Product not found' });

        const reviewId = req.params.reviewId;
        const review = db.products[productIndex].reviews.find(r => r._id === reviewId || r.user === req.user._id);
        if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

        if (review.user !== req.user._id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        db.products[productIndex].reviews = db.products[productIndex].reviews.filter(r => r._id !== review._id);
        db.products[productIndex].numReviews = db.products[productIndex].reviews.length;
        if (db.products[productIndex].reviews.length > 0) {
            db.products[productIndex].ratings = db.products[productIndex].reviews.reduce((acc, r) => acc + r.rating, 0) / db.products[productIndex].reviews.length;
        } else {
            db.products[productIndex].ratings = 0;
        }
        saveDB();
        res.json({ success: true, message: 'Review deleted' });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ============================================================
// CATEGORY UPDATE & DELETE
// ============================================================
app.put('/api/categories/:id', protect, admin, upload.single('image'), (req, res) => {
    const index = db.categories.findIndex(c => c._id === req.params.id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Category not found' });
    if (req.body.name) db.categories[index].name = req.body.name;
    if (req.body.description) db.categories[index].description = req.body.description;
    if (req.file) db.categories[index].image = `/uploads/${req.file.filename}`;
    saveDB();
    res.json({ success: true, category: db.categories[index] });
});

app.delete('/api/categories/:id', protect, admin, (req, res) => {
    db.categories = db.categories.filter(c => c._id !== req.params.id);
    saveDB();
    res.json({ success: true, message: 'Category deleted' });
});

// ============================================================
// ORDER DELETE, CANCEL, PAYMENT INFO
// ============================================================
app.delete('/api/orders/:id', protect, admin, (req, res) => {
    db.orders = db.orders.filter(o => o._id !== req.params.id);
    saveDB();
    res.json({ success: true, message: 'Order deleted' });
});

app.put('/api/orders/:id/cancel', protect, (req, res) => {
    const index = db.orders.findIndex(o => o._id === req.params.id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Not found' });
    if (db.orders[index].user !== req.user._id && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    db.orders[index].status = 'cancelled';
    db.orders[index].paymentStatus = 'refunded';
    saveDB();
    res.json({ success: true, order: db.orders[index] });
});

app.put('/api/orders/:id/payment-info', protect, (req, res) => {
    const index = db.orders.findIndex(o => o._id === req.params.id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Not found' });
    db.orders[index].paymentInfo = req.body;
    db.orders[index].paymentStatus = 'submitted';
    saveDB();
    res.json({ success: true, order: db.orders[index] });
});

// ============================================================
// COUPON ROUTES
// ============================================================
app.get('/api/coupons', protect, admin, (req, res) => {
    res.json({ success: true, coupons: db.coupons || [] });
});

app.post('/api/coupons', protect, admin, (req, res) => {
    const coupon = {
        _id: generateId(),
        ...req.body,
        usedCount: 0,
        isActive: true,
        createdAt: new Date().toISOString()
    };
    if (!db.coupons) db.coupons = [];
    db.coupons.push(coupon);
    saveDB();
    res.status(201).json({ success: true, coupon });
});

app.put('/api/coupons/:id', protect, admin, (req, res) => {
    if (!db.coupons) db.coupons = [];
    const index = db.coupons.findIndex(c => c._id === req.params.id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Coupon not found' });
    db.coupons[index] = { ...db.coupons[index], ...req.body };
    saveDB();
    res.json({ success: true, coupon: db.coupons[index] });
});

app.delete('/api/coupons/:id', protect, admin, (req, res) => {
    if (!db.coupons) db.coupons = [];
    db.coupons = db.coupons.filter(c => c._id !== req.params.id);
    saveDB();
    res.json({ success: true, message: 'Coupon deleted' });
});

app.post('/api/coupons/validate', protect, (req, res) => {
    if (!db.coupons) db.coupons = [];
    const { code, orderAmount } = req.body;
    const coupon = db.coupons.find(c => c.code === code && c.isActive);
    if (!coupon) return res.status(404).json({ success: false, message: 'Invalid coupon code' });

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
        return res.status(400).json({ success: false, message: 'Coupon expired' });
    }
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
    }
    if (coupon.minOrderAmount && orderAmount < coupon.minOrderAmount) {
        return res.status(400).json({ success: false, message: `Minimum order amount is ৳${coupon.minOrderAmount}` });
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
        discount = (orderAmount * coupon.discountValue) / 100;
        if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    } else {
        discount = coupon.discountValue;
    }

    res.json({ success: true, coupon, discount: Math.round(discount) });
});

// ============================================================
// ADMIN USER MANAGEMENT
// ============================================================
app.get('/api/admin/users', protect, admin, (req, res) => {
    const users = db.users.map(({ password, ...u }) => u);
    res.json({ success: true, users });
});

app.put('/api/admin/users/:id/block', protect, admin, (req, res) => {
    const index = db.users.findIndex(u => u._id === req.params.id);
    if (index === -1) return res.status(404).json({ success: false, message: 'User not found' });
    db.users[index].isBlocked = !db.users[index].isBlocked;
    saveDB();
    const { password, ...userData } = db.users[index];
    res.json({ success: true, user: userData });
});

app.put('/api/admin/users/:id/role', protect, admin, (req, res) => {
    const index = db.users.findIndex(u => u._id === req.params.id);
    if (index === -1) return res.status(404).json({ success: false, message: 'User not found' });
    db.users[index].role = req.body.role;
    saveDB();
    const { password, ...userData } = db.users[index];
    res.json({ success: true, user: userData });
});

// ============================================================
// ADMIN DASHBOARD
// ============================================================
app.get('/api/admin/dashboard', protect, admin, (req, res) => {
    const { startDate, endDate } = req.query;
    let filteredOrders = db.orders;

    if (startDate) {
        filteredOrders = filteredOrders.filter(o => new Date(o.createdAt) >= new Date(startDate));
    }
    if (endDate) {
        filteredOrders = filteredOrders.filter(o => new Date(o.createdAt) <= new Date(endDate));
    }

    const revenue = filteredOrders.filter(o => o.status !== 'cancelled').reduce((acc, o) => acc + (o.totalPrice || 0), 0);
    const stats = {
        totalRevenue: revenue,
        totalOrders: filteredOrders.length,
        totalProducts: db.products.length,
        totalUsers: db.users.length,
        pendingOrders: filteredOrders.filter(o => o.status === 'pending').length,
        recentOrders: filteredOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10),
        bestSelling: db.products.sort((a, b) => (b.sold || 0) - (a.sold || 0)).slice(0, 5)
    };
    res.json({ success: true, dashboard: stats });
});

app.post('/api/admin/generate-description', protect, admin, (req, res) => {
    const { name, category, brand } = req.body;
    const desc = `Premium ${name}${brand ? ' by ' + brand : ''} from the ${category || 'latest'} collection. High-quality materials, exceptional craftsmanship, and modern design. Perfect for your stylish lifestyle.`;
    res.json({ success: true, description: desc });
});

// Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`\n🚀 Backend running on port ${PORT}`);
    console.log(`💾 Mode: Local JSON DB`);
});
