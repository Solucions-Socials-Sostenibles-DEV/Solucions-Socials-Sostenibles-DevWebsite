
import './ContactModal.css'; // Reusing styles

function PrivacyModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div className="contact-overlay" onClick={onClose}>
            <div className="contact-modal" style={{ maxHeight: '80vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
                <button className="contact-close" onClick={onClose}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                </button>

                <h2>Política de Privacidad</h2>

                <div className="help-content" style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', color: '#666', textAlign: 'left', lineHeight: '1.6' }}>
                    <p>
                        En <strong>Solucions Socials Sostenibles</strong> nos tomamos muy en serio la privacidad de sus datos. Esta Política de Privacidad describe cómo recopilamos, utilizamos y protegemos su información personal.
                    </p>

                    <h3 style={{ color: 'var(--color-primary, #EE1566)', fontSize: '1.1rem', marginTop: '1rem' }}>Responsable del tratamiento</h3>
                    <p>
                        El responsable del tratamiento de sus datos es Solucions Socials Sostenibles. Puede contactar con nosotros para cualquier cuestión relacionada con la privacidad en: <a href="mailto:comunicacio@solucionssocials.org" style={{ color: 'var(--color-primary, #EE1566)', textDecoration: 'none' }}>comunicacio@solucionssocials.org</a>.
                    </p>

                    <h3 style={{ color: 'var(--color-primary, #EE1566)', fontSize: '1.1rem', marginTop: '1rem' }}>Finalidad del tratamiento</h3>
                    <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <li>Gestionar sus consultas y solicitudes enviadas a través de nuestro formulario de contacto.</li>
                        <li>Mejorar nuestros servicios y experiencia de usuario.</li>
                        <li>En caso de suscripción, enviarle comunicaciones relacionadas con nuestros productos y novedades.</li>
                    </ul>

                    <h3 style={{ color: 'var(--color-primary, #EE1566)', fontSize: '1.1rem', marginTop: '1rem' }}>Derechos del usuario</h3>
                    <p>
                        Usted tiene derecho a acceder, rectificar, suprimir, oponerse, limitar el tratamiento y portar sus datos. Para ejercer estos derechos, envíe una solicitud a nuestro correo electrónico de contacto.
                    </p>

                    <button className="submit-btn" onClick={onClose} style={{ marginTop: '1rem' }}>
                        Entendido
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PrivacyModal;
