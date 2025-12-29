
import './ContactModal.css'; // Reusing styles for consistency

function CookiesModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div className="contact-overlay" onClick={onClose}>
            <div className="contact-modal" style={{ maxHeight: '80vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
                <button className="contact-close" onClick={onClose}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                </button>

                <h2>Política de Cookies</h2>

                <div className="help-content" style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', color: '#666', textAlign: 'left', lineHeight: '1.6' }}>
                    <p>
                        En <strong>Solucions Socials Sostenibles</strong> utilizamos cookies propias y de terceros para mejorar nuestros servicios y mostrarle publicidad relacionada con sus preferencias mediante el análisis de sus hábitos de navegación.
                    </p>

                    <h3 style={{ color: 'var(--color-primary, #EE1566)', fontSize: '1.1rem', marginTop: '1rem' }}>¿Qué son las cookies?</h3>
                    <p>
                        Una cookie es un fichero que se descarga en su ordenador al acceder a determinadas páginas web. Las cookies permiten a una página web, entre otras cosas, almacenar y recuperar información sobre los hábitos de navegación de un usuario o de su equipo y, dependiendo de la información que contengan y de la forma en que utilice su equipo, pueden utilizarse para reconocer al usuario.
                    </p>

                    <h3 style={{ color: 'var(--color-primary, #EE1566)', fontSize: '1.1rem', marginTop: '1rem' }}>Tipos de cookies que utilizamos</h3>
                    <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <li><strong>Cookies técnicas:</strong> Son aquellas que permiten al usuario la navegación a través de una página web, plataforma o aplicación y la utilización de las diferentes opciones o servicios que en ella existan.</li>
                        <li><strong>Cookies de análisis:</strong> Son aquellas que nos permiten cuantificar el número de usuarios y así realizar la medición y análisis estadístico de la utilización que hacen los usuarios del servicio ofertado.</li>
                    </ul>

                    <p style={{ marginTop: '1rem' }}>
                        Puede usted permitir, bloquear o eliminar las cookies instaladas en su equipo mediante la configuración de las opciones del navegador instalado en su ordenador.
                    </p>

                    <button className="submit-btn" onClick={onClose} style={{ marginTop: '1rem' }}>
                        Entendido
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CookiesModal;
