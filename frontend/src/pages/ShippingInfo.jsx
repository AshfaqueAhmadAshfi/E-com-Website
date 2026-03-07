import { FiTruck, FiClock, FiMapPin, FiDollarSign } from 'react-icons/fi';

const ShippingInfo = () => (
    <div className="page"><div className="container" style={{ maxWidth: '900px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'linear-gradient(135deg, var(--accent), #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '1.5rem', color: '#fff' }}><FiTruck /></div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Shipping Information</h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Everything you need to know about our shipping process</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '48px' }}>
            {[
                { icon: <FiTruck />, title: 'Courier Partner', desc: 'Steadfast Courier', color: '#8b5cf6' },
                { icon: <FiClock />, title: 'Delivery Time', desc: '2-5 Business Days', color: '#f59e0b' },
                { icon: <FiMapPin />, title: 'Coverage', desc: 'All over Bangladesh', color: '#10b981' },
                { icon: <FiDollarSign />, title: 'Free Shipping', desc: 'Orders over ৳5,000', color: '#06b6d4' },
            ].map((item, i) => (
                <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px', textAlign: 'center' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${item.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '1.2rem', color: item.color }}>{item.icon}</div>
                    <div style={{ fontWeight: 700, marginBottom: '4px' }}>{item.title}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{item.desc}</div>
                </div>
            ))}
        </div>

        {[
            { title: 'Shipping Rates', content: 'We offer a flat shipping rate of ৳100 for all orders under ৳5,000. Orders over ৳5,000 qualify for FREE shipping across Bangladesh. We use Steadfast Courier for reliable and fast delivery.' },
            { title: 'Delivery Timeline', content: 'Dhaka City: 1-2 business days. Dhaka Suburbs (Gazipur, Narayanganj, Savar): 2-3 business days. Other Divisions: 3-5 business days. Remote Areas: 5-7 business days. Please note delivery times may vary during holidays and special events.' },
            { title: 'Order Processing', content: 'Orders are processed within 24 hours of placement (excluding weekends and holidays). You will receive a confirmation with tracking details once your order is dispatched via Steadfast Courier.' },
            { title: 'Tracking Your Order', content: 'After dispatch, you will receive a Steadfast tracking code. You can track your shipment through the Steadfast website or from your Order History on our platform.' },
            { title: 'Delivery Attempts', content: 'Our courier partner will attempt delivery up to 2 times. If delivery fails after 2 attempts, the order will be returned to us and you will be contacted for re-shipping arrangements.' },
            { title: 'Cash on Delivery (COD)', content: 'Cash on Delivery is available for all orders across Bangladesh. Please keep the exact amount ready at the time of delivery to ensure a smooth handover.' },
        ].map((section, i) => (
            <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '10px', color: 'var(--accent-light)' }}>{section.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.8 }}>{section.content}</p>
            </div>
        ))}
    </div></div>
);

export default ShippingInfo;
