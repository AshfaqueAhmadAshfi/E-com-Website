# 🛍️ ShopVerse - MERN E-Commerce Platform

A full-stack e-commerce platform built with the MERN stack (MongoDB, Express.js, React.js, Node.js).

## ✨ Features

### 🛒 Customer Features
- User registration & login (JWT authentication)
- Browse products with search, filtering & pagination
- Product details with reviews & ratings
- Shopping cart with persistent storage
- Checkout with multiple payment methods
- Order history & order cancellation
- Profile management & password change
- Coupon system for discounts

### 👑 Admin Dashboard
- **Dashboard Analytics**: Revenue, orders, users, best sellers, charts
- **Product Management**: Add, edit, delete products with image upload
- **Category Management**: Full CRUD operations
- **Order Management**: Update order & payment status, refunds
- **User Management**: View, block/unblock users, change roles
- **Coupon Management**: Create & manage discount coupons

### 💳 Payment Methods
- Cash on Delivery (COD)
- bKash (Bangladesh)
- Nagad (Bangladesh)
- Stripe (International)
- SSLCommerz (Bangladesh Banks)

### 🔐 Security
- JWT authentication with HTTP-only cookies
- Password hashing with bcrypt (12 rounds)
- Admin route protection middleware
- Input validation
- CORS configuration

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18+)
- **MongoDB** (local or Atlas)

### 1. Clone & Setup

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment

Edit `backend/.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/ecom_store
JWT_SECRET=your_secure_secret_key
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

### 3. Seed Database

```bash
cd backend
node seed.js
```

This creates:
- **Admin**: admin@ecom.com / admin123
- **User**: user@ecom.com / user123
- 8 categories, 20 products, 3 coupons

### 4. Run Development Servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

## 📁 Project Structure

```
├── backend/
│   ├── config/db.js          # MongoDB connection
│   ├── controllers/          # Business logic
│   ├── middleware/            # Auth, error handling, upload
│   ├── models/               # Mongoose schemas
│   ├── routes/               # API endpoints
│   ├── utils/                # JWT helpers
│   ├── uploads/              # Product images
│   ├── seed.js               # Database seeder
│   └── server.js             # Express server
├── frontend/
│   ├── src/
│   │   ├── components/       # Navbar, Footer, ProductCard
│   │   ├── context/          # Auth & Cart state
│   │   ├── pages/            # All page components
│   │   ├── utils/api.js      # Axios API client
│   │   ├── App.jsx           # Routes
│   │   └── index.css         # Complete design system
│   └── vite.config.js        # Vite + proxy config
└── README.md
```

## 🎨 Design
- Dark theme with purple/cyan accent gradients
- Glassmorphism & modern UI patterns
- Responsive design (mobile, tablet, desktop)
- Smooth animations & micro-interactions
- Inter font family

## 📡 API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/register | Register user | - |
| POST | /api/auth/login | Login | - |
| GET | /api/products | List products | - |
| GET | /api/products/:id | Product detail | - |
| POST | /api/products | Create product | Admin |
| GET | /api/categories | List categories | - |
| POST | /api/orders | Create order | User |
| GET | /api/orders/my-orders | User orders | User |
| GET | /api/admin/dashboard | Analytics | Admin |
| GET | /api/admin/users | List users | Admin |

## 🧪 Test Coupons
- `WELCOME10` - 10% off (min ৳1,000)
- `SAVE500` - ৳500 off (min ৳3,000)
- `MEGA20` - 20% off (min ৳5,000, max ৳2,000)
