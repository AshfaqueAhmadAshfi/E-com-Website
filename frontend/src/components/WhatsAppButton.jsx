import { FaWhatsapp } from 'react-icons/fa';

const WhatsAppButton = () => {
    const phoneNumber = '01867837855';
    const message = 'Hello X-Look, I would like to inquire about your products.';
    const whatsappUrl = `https://wa.me/88${phoneNumber}?text=${encodeURIComponent(message)}`;

    return (
        <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="whatsapp-float"
            title="Chat with us on WhatsApp"
        >
            <FaWhatsapp size={32} />
            <span className="tooltip">Live Chat</span>
        </a>
    );
};

export default WhatsAppButton;
