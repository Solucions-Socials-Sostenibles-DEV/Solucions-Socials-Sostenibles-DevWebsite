import { useState } from 'react';
import { supabase } from './supabaseClient';
import './ContactModal.css';

function ContactForm({ onSuccess }) {
    const [formData, setFormData] = useState({
        name: '',
        subject: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);

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
                        message: formData.message
                    }
                ]);

            if (error) throw error;

            alert('Mensaje enviado correctamente. Nos pondremos en contacto contigo pronto.');
            setFormData({ name: '', subject: '', message: '' });
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('Hubo un error al enviar el mensaje. Por favor, inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
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
    );
}

export default ContactForm;
