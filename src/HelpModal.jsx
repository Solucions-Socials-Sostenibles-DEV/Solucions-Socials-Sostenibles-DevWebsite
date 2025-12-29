import ContactForm from './ContactForm';
import './ContactModal.css'; // Reusing styles

function HelpModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div className="contact-overlay" onClick={onClose}>
            <div className="contact-modal" style={{ maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
                <button className="contact-close" onClick={onClose}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                </button>

                <h2>Centro de Ayuda</h2>

                <div className="help-content" style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <p style={{ lineHeight: '1.6', color: '#666', fontSize: '1rem' }}>
                        En caso de dudas, errores o problemas con la plataforma, por favor póngase en contacto con nosotros a través del siguiente correo electrónico:
                    </p>

                    <a
                        href="mailto:comunicacio@solucionssocials.org"
                        style={{
                            color: 'var(--color-primary, #EE1566)',
                            fontWeight: 600,
                            fontSize: '1.1rem',
                            textDecoration: 'none',
                            display: 'block',
                            textAlign: 'center',
                            padding: '1rem',
                            background: 'rgba(238, 21, 102, 0.05)',
                            borderRadius: '12px'
                        }}
                    >
                        comunicacio@solucionssocials.org
                    </a>

                    <div style={{ borderTop: '1px solid #eee', paddingTop: '1.5rem' }}>
                        <p style={{ lineHeight: '1.6', color: '#666', fontSize: '1rem', marginBottom: '1rem' }}>
                            O rellene este formulario ahora mismo:
                        </p>
                        <ContactForm onSuccess={onClose} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HelpModal;
