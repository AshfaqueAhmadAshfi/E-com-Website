import { FiHelpCircle, FiMail, FiPhone, FiMessageSquare, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { useState } from 'react';

const faqs = [
    { q: 'How do I place an order?', a: 'Browse our products, select your desired size and color, add to cart, and proceed to checkout. Fill in your name, phone number, and delivery address, then confirm your order.' },
    { q: 'How can I track my order?', a: 'Once your order is confirmed and dispatched via Steadfast Courier, you will receive a tracking code. You can track your order from your Order History page or through the Steadfast website.' },
    { q: 'What payment methods do you accept?', a: 'We accept Cash on Delivery (COD), bKash, Nagad, Credit/Debit Cards, and SSLCommerz for all Bangladesh banks.' },
    { q: 'Can I cancel my order?', a: 'Yes, you can cancel your order if it is still in "Pending" or "Processing" status. Go to your Order History and click Cancel on the respective order.' },
    { q: 'How long does delivery take?', a: 'We deliver across Bangladesh within 2-5 business days depending on your location. Dhaka city deliveries are typically within 1-2 days.' },
    { q: 'What if I receive a defective product?', a: 'Please contact us within 7 days of receiving the product. We will arrange a return and send you a replacement or full refund.' },
    { q: 'Do you offer free shipping?', a: 'Yes! Orders over ৳5,000 qualify for free shipping. Orders below that amount have a flat shipping fee of ৳100.' },
    { q: 'How do I change my account details?', a: 'Log in to your account and go to the Profile page. You can update your name, phone number, and address from there.' },
];

const HelpCenter = () => {
    const [openIdx, setOpenIdx] = useState(null);

    return (
        <div className="page"><div className="container" style={{ maxWidth: '900px' }}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'linear-gradient(135deg, var(--accent), #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '1.5rem', color: '#fff' }}><FiHelpCircle /></div>
                <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Help Center</h1>
                <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Find answers to your questions or contact us directly</p>
            </div>

            {/* Contact Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '48px' }}>
                {[
                    { icon: <FiPhone />, title: 'Call Us', desc: '+88 01867-837855', sub: 'Sat-Thu, 10AM-8PM' },
                    { icon: <FiMessageSquare />, title: 'WhatsApp', desc: '01867-837855', sub: 'Live Chat Support' },
                    { icon: <FiMail />, title: 'Email Us', desc: 'support@x-look.com', sub: 'Reply within 24hrs' },
                    { icon: <FiMessageSquare />, title: 'Facebook', desc: 'facebook.com/xlookbd', sub: 'Message us anytime' },
                ].map((c, i) => (
                    <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px', textAlign: 'center', transition: 'all 0.3s', cursor: 'pointer' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                        <div style={{ fontSize: '1.5rem', color: 'var(--accent-light)', marginBottom: '12px' }}>{c.icon}</div>
                        <div style={{ fontWeight: 700, marginBottom: '4px' }}>{c.title}</div>
                        <div style={{ color: 'var(--accent-light)', fontSize: '0.9rem', fontWeight: 500 }}>{c.desc}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '4px' }}>{c.sub}</div>
                    </div>
                ))}
            </div>

            {/* FAQ */}
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '24px' }}>Frequently Asked Questions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {faqs.map((faq, i) => (
                    <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', transition: 'all 0.3s' }}>
                        <button onClick={() => setOpenIdx(openIdx === i ? null : i)} style={{ width: '100%', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9rem', textAlign: 'left' }}>
                            {faq.q}
                            {openIdx === i ? <FiChevronUp style={{ flexShrink: 0, color: 'var(--accent-light)' }} /> : <FiChevronDown style={{ flexShrink: 0, color: 'var(--text-muted)' }} />}
                        </button>
                        {openIdx === i && (
                            <div style={{ padding: '0 20px 16px', color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.7, animation: 'fadeIn 0.3s ease' }}>
                                {faq.a}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div></div>
    );
};

export default HelpCenter;
