import { FiShield } from 'react-icons/fi';

const PrivacyPolicy = () => (
    <div className="page"><div className="container" style={{ maxWidth: '900px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'linear-gradient(135deg, var(--accent), #ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '1.5rem', color: '#fff' }}><FiShield /></div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Privacy Policy</h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Your privacy is important to us. Last updated: February 2026</p>
        </div>

        {[
            { title: 'Information We Collect', content: 'We collect information you provide when creating an account, placing an order, or contacting support. This includes: your name, email address, phone number, delivery address, and payment information. We do not store credit card details on our servers.' },
            { title: 'How We Use Your Information', content: 'We use your personal information to: process and fulfill your orders, communicate order updates and shipping status, send promotional offers (with your consent), improve our products and services, and provide customer support.' },
            { title: 'Order & Shipping Data', content: 'When you place an order, your name, phone number, and delivery address are shared with our courier partner (Steadfast Courier) solely for the purpose of delivering your order. This data is not used for any other purpose.' },
            { title: 'Data Security', content: 'We implement industry-standard security measures to protect your personal information. All data transmission is encrypted using SSL technology. We use secure password hashing and do not store raw passwords. Access to personal data is restricted to authorized personnel only.' },
            { title: 'Cookies & Local Storage', content: 'We use cookies and local storage to keep you logged in, store your shopping cart, and remember your preferences. These are essential for the website to function properly. We do not use tracking cookies for advertising purposes.' },
            { title: 'Third-Party Services', content: 'We may share data with the following third-party services: Steadfast Courier (for delivery), payment processors (bKash, Nagad, SSLCommerz) for payment processing. We do not sell or rent your personal information to any third parties.' },
            { title: 'Your Rights', content: 'You have the right to: access your personal data, correct inaccurate information, request deletion of your account and data, opt out of marketing communications, and withdraw consent at any time. To exercise these rights, contact us at support@x-look.com.' },
            { title: 'Data Retention', content: 'We retain your personal data for as long as your account is active or as needed to provide services. Order data is retained for up to 3 years for accounting and legal purposes. You may request deletion of your account at any time.' },
            { title: 'Changes to This Policy', content: 'We may update this privacy policy from time to time. Any changes will be posted on this page with an updated revision date. We encourage you to review this policy periodically.' },
            { title: 'Contact Us', content: 'If you have questions about this privacy policy or your personal data, contact us at: Email: support@x-look.com, Phone: +880 1531-817299, Facebook: facebook.com/xlookbd' },
        ].map((section, i) => (
            <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '10px', color: 'var(--accent-light)' }}>{section.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.8 }}>{section.content}</p>
            </div>
        ))}
    </div></div>
);

export default PrivacyPolicy;
