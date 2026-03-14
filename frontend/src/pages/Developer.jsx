import { FiPhone, FiMail, FiGlobe, FiCode, FiLayers, FiZap, FiArrowLeft, FiHeart, FiExternalLink } from 'react-icons/fi';
import { FaFacebookF, FaGithub, FaLinkedinIn, FaWhatsapp } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Developer = () => {
    return (
        <div className="page" style={{ 
            background: '#000',
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            position: 'relative',
            overflow: 'hidden',
            fontFamily: "'Inter', sans-serif"
        }}>
            {/* Background elements minimal */}
            <div style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', background: 'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.02), transparent 70%)', pointerEvents: 'none' }} />
            
            <Link to="/" style={{ 
                position: 'absolute', 
                top: '15px', 
                left: '15px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px', 
                color: 'rgba(255,255,255,0.3)', 
                textDecoration: 'none', 
                fontWeight: 600, 
                fontSize: '0.75rem',
                zIndex: 10, 
                padding: '5px 12px',
                borderRadius: '50px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)'
            }}>
                <FiArrowLeft /> Back
            </Link>

            <div className="container" style={{ maxWidth: '850px', position: 'relative', zIndex: 1 }}>
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '280px 1fr', 
                    background: '#080808',
                    borderRadius: '24px',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                    overflow: 'hidden'
                }}>
                    {/* Left Column */}
                    <div style={{ padding: '20px', background: 'rgba(255, 255, 255, 0.01)', borderRight: '1px solid rgba(255, 255, 255, 0.03)' }}>
                        <div style={{ 
                            width: '100%', 
                            aspectRatio: '1/1',
                            borderRadius: '16px', 
                            marginBottom: '15px',
                            background: '#000',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <img 
                                src="/pp.png" 
                                alt="Ashfaque Ahmad Ashfi" 
                                style={{ 
                                    width: '100%', 
                                    height: '100%', 
                                    objectFit: 'cover'
                                }} 
                                onError={(e) => {
                                    e.target.src = 'https://ui-avatars.com/api/?name=Ashfaque+Ahmad+Ashfi&background=111&color=fff&size=512&bold=true';
                                }}
                            />
                            <div style={{ 
                                position: 'absolute', 
                                bottom: '8px', 
                                right: '8px', 
                                background: '#10b981', 
                                color: '#fff', 
                                padding: '3px 8px', 
                                borderRadius: '50px', 
                                fontSize: '0.6rem', 
                                fontWeight: 800, 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '3px'
                            }}>
                                <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#fff', animation: 'pulse 1.5s infinite' }} />
                                LIVE
                            </div>
                        </div>
                        
                        <div style={{ textAlign: 'left' }}>
                            <h1 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '2px', color: '#fff' }}>Ashfaque Ahmad Ashfi</h1>
                            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem', marginBottom: '15px' }}>Full Stack Developer</p>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <a href="tel:01531817299" style={{ 
                                    background: '#fff', 
                                    color: '#000', 
                                    textDecoration: 'none', 
                                    padding: '10px', 
                                    borderRadius: '10px', 
                                    fontSize: '0.8rem', 
                                    fontWeight: 800, 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    gap: '6px'
                                }}>
                                    <FiPhone /> 01531817299
                                </a>
                                
                                <div style={{ display: 'flex', gap: '6px' }}>
                                    <a href="https://wa.me/8801867837855" target="_blank" rel="noopener noreferrer" style={{ flex: 1, background: '#25D366', color: '#fff', textDecoration: 'none', padding: '8px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', transition: 'transform 0.2s' }} onMouseOver={e => e.target.style.transform = 'translateY(-2px)'} onMouseOut={e => e.target.style.transform = 'translateY(0)'} title="WhatsApp"><FaWhatsapp /></a>
                                    <a href="https://www.facebook.com/ashfak.ashfi" target="_blank" rel="noopener noreferrer" style={{ flex: 1, background: '#1877F2', color: '#fff', textDecoration: 'none', padding: '8px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', transition: 'transform 0.2s' }} onMouseOver={e => e.target.style.transform = 'translateY(-2px)'} onMouseOut={e => e.target.style.transform = 'translateY(0)'} title="Facebook"><FaFacebookF /></a>
                                    <a href="https://github.com/AshfaqueAhmadAshfi" target="_blank" rel="noopener noreferrer" style={{ flex: 1, background: '#333', color: '#fff', textDecoration: 'none', padding: '8px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', border: '1px solid rgba(255,255,255,0.1)', transition: 'transform 0.2s' }} onMouseOver={e => e.target.style.transform = 'translateY(-2px)'} onMouseOut={e => e.target.style.transform = 'translateY(0)'} title="GitHub"><FaGithub /></a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div style={{ padding: '30px' }}>
                        <div style={{ marginBottom: '25px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                                <div style={{ width: '15px', height: '1px', background: 'var(--accent)' }} />
                                <span style={{ color: 'var(--accent)', fontWeight: 800, fontSize: '0.6rem', letterSpacing: '1px' }}>PROFILE</span>
                            </div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '10px', color: '#fff', letterSpacing: '-0.5px' }}>Innovative Web Architect.</h2>
                            <p style={{ color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, fontSize: '0.85rem' }}>
                                I build premium digital experiences with a focus on high-performance MERN applications. Ensuring your project is technically robust and aesthetically superior.
                            </p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '25px' }}>
                            <div style={{ background: 'rgba(255,255,255,0.01)', padding: '15px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.02)' }}>
                                <FiCode style={{ color: 'var(--accent)', marginBottom: '8px', fontSize: '1rem' }} />
                                <h4 style={{ color: '#fff', marginBottom: '4px', fontSize: '0.85rem', fontWeight: 700 }}>Coding</h4>
                                <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', lineHeight: 1.4 }}>MERN Stack expert.</p>
                            </div>
                            <div style={{ background: 'rgba(255, 255, 255, 0.01)', padding: '15px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.02)' }}>
                                <FiZap style={{ color: '#f59e0b', marginBottom: '8px', fontSize: '1rem' }} />
                                <h4 style={{ color: '#fff', marginBottom: '4px', fontSize: '0.85rem', fontWeight: 700 }}>Speed</h4>
                                <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', lineHeight: 1.4 }}>Optimized performance.</p>
                            </div>
                        </div>

                        <div style={{ 
                            padding: '15px', 
                            background: '#050505', 
                            borderRadius: '15px', 
                            border: '1px solid rgba(255,255,255,0.02)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <div>
                                <h4 style={{ color: '#fff', fontSize: '0.8rem', fontWeight: 700 }}>Availability</h4>
                                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem' }}>Available for new projects.</p>
                            </div>
                            <FiHeart style={{ color: 'rgba(239, 68, 68, 0.5)' }} />
                        </div>
                    </div>
                </div>
                
                <p style={{ textAlign: 'center', marginTop: '20px', color: '#fff', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '1px' }}>
                    © 2026 ASHFAQUE AHMAD ASHFI • PRECISE & POWERFUL
                </p>
            </div>

            <style>{`
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.5); opacity: 0; }
                    100% { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default Developer;
