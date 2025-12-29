import { useState } from 'react';
import './ContactModal.css';

function ContactModal({ isOpen, onClose }) {
    const [formData, setFormData] = useState({
        name: '',
        subject: '',
        message: ''
    });

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const { name, subject, message } = formData;
        const mailtoLink = `mailto:comunicacio@solucionssocials.org?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Nombre: ${name}\n\nMensaje:\n${message}`)}`;
        window.location.href = mailtoLink;
        onClose();
    };

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

                <form onSubmit={handleSubmit} className="contact-form">
                    <div className="form-group">
                        <label htmlFor="name">Nombre</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="Tu nombre"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="subject">Asunto</label>
                        <input
                            type="text"
                            id="subject"
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            required
                            placeholder="Asunto del mensaje"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="message">Mensaje</label>
                        <textarea
                            id="message"
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            required
                            placeholder="Escribe tu mensaje aquí..."
                            rows="4"
                        />
                    </div>

                    <button type="submit" className="submit-btn">
                        Enviar Mensaje
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ContactModal;
