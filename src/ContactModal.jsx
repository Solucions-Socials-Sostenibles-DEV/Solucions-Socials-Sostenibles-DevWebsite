import { useState } from 'react';
import { supabase } from './supabaseClient';
import './ContactModal.css';

function ContactModal({ isOpen, onClose }) {
    const [formData, setFormData] = useState({
        name: '',
        subject: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase
                .from('contact_messages')
                .insert([
                    {
                        name: formData.name,
                        subject: formData.subject,
                        message: formData.message,
                        created_at: new Date()
                    }
                ]);

            if (error) throw error;

            alert('Mensaje enviado correctamente. Nos pondremos en contacto contigo pronto.');
            setFormData({ name: '', subject: '', message: '' });
            onClose();
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('Hubo un error al enviar el mensaje. Por favor, inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
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
                            disabled={loading}
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
                            disabled={loading}
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
                            disabled={loading}
                            placeholder="Escribe tu mensaje aquí..."
                            rows="4"
                        />
                    </div>

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Enviando...' : 'Enviar Mensaje'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ContactModal;
