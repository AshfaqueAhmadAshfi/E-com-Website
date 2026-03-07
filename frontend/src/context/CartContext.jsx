import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [items, setItems] = useState(() => {
        try { return JSON.parse(localStorage.getItem('cart')) || []; }
        catch { return []; }
    });

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(items));
    }, [items]);

    // Generate a unique cart key: productId + size + color
    const getCartKey = (productId, size, color) => `${productId}_${size || 'no'}_${color || 'no'}`;

    const addToCart = (product, qty = 1, size = null, color = null) => {
        setItems(prev => {
            const cartKey = getCartKey(product._id, size, color);
            const existing = prev.find(i => i.cartKey === cartKey);
            if (existing) {
                toast.success('Cart updated');
                return prev.map(i => i.cartKey === cartKey ? { ...i, quantity: i.quantity + qty } : i);
            }
            toast.success('Added to cart');
            return [...prev, {
                _id: product._id,
                cartKey,
                name: product.name,
                price: product.discountPrice > 0 ? product.discountPrice : product.price,
                image: product.images?.[0] || '',
                stock: product.stock,
                quantity: qty,
                size: size || null,
                color: color || null
            }];
        });
    };

    const updateQuantity = (cartKey, qty) => {
        if (qty < 1) return removeFromCart(cartKey);
        setItems(prev => prev.map(i => i.cartKey === cartKey ? { ...i, quantity: qty } : i));
    };

    const removeFromCart = (cartKey) => {
        setItems(prev => prev.filter(i => i.cartKey !== cartKey));
        toast.success('Removed from cart');
    };

    const clearCart = () => { setItems([]); };

    const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
    const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    return (
        <CartContext.Provider value={{ items, addToCart, updateQuantity, removeFromCart, clearCart, totalItems, totalPrice }}>
            {children}
        </CartContext.Provider>
    );
};
