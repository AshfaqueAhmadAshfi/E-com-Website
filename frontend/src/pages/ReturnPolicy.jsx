import { FiRefreshCw } from 'react-icons/fi';

const ReturnPolicy = () => (
    <div className="page"><div className="container" style={{ maxWidth: '900px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'linear-gradient(135deg, var(--accent), #f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '1.5rem', color: '#fff' }}><FiRefreshCw /></div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Return Policy</h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>We want you to be 100% satisfied with your purchase</p>
        </div>

        {[
            { title: '7-Day Return Window', content: 'You may return most items within 7 days of delivery for a full refund or exchange. Items must be unused, unwashed, and in their original packaging with all tags attached.' },
            { title: 'Eligible Items', content: 'Clothing, accessories, electronics, and home goods are eligible for return. Items must be in the same condition as received — unworn, unwashed, undamaged, and with original tags.' },
            { title: 'Non-Returnable Items', content: 'The following items cannot be returned: undergarments, swimwear, beauty products (if opened/used), personalized/custom items, and items marked as "Final Sale" or "Non-Returnable".' },
            { title: 'How to Initiate a Return', content: '1. Go to your Order History and select the order. 2. Contact our support team via phone (+880 1234-567890) or Facebook (facebook.com/xlookbd). 3. We will arrange a pickup via our courier partner. 4. Once we receive and inspect the item, your refund will be processed within 3-5 business days.' },
            { title: 'Refund Process', content: 'Refunds will be issued to your original payment method. For Cash on Delivery orders, refunds will be sent via bKash or Nagad to your registered phone number. Refund processing takes 3-5 business days after we receive the returned item.' },
            { title: 'Defective or Wrong Items', content: 'If you receive a defective or incorrect item, please contact us immediately. We will arrange a free return pickup and send a replacement or full refund at no extra cost. Photo evidence of the defect may be required.' },
            { title: 'Exchange Policy', content: 'Want a different size or color? You can exchange eligible items within the 7-day window. Contact us and we will arrange for the exchange. If the new item has a price difference, you will be charged or refunded the difference.' },
        ].map((section, i) => (
            <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '10px', color: 'var(--accent-light)' }}>{section.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.8 }}>{section.content}</p>
            </div>
        ))}
    </div></div>
);

export default ReturnPolicy;
