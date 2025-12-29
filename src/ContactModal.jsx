import ContactForm from './ContactForm';
import './ContactModal.css';

function ContactModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div className="contact-overlay" onClick={onClose}>
            <div className="contact-modal" onClick={e => e.stopPropagation()}>
                <button className="contact-close" onClick={onClose}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                </button>

                <h2>Contactar</h2>
                <p className="contact-subtitle">Envíanos un mensaje y te responderemos pronto.</p>

                <ContactForm onSuccess={onClose} />
            </div>
        </div>
    );
}

export default ContactModal;
