import { useState } from 'react'
import './App.css'
import ContactModal from './ContactModal';
import HelpModal from './HelpModal';
import CookiesModal from './CookiesModal';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isCookiesOpen, setIsCookiesOpen] = useState(false);
  const apps = [
    {
      name: 'SSS KRONOS DESKTOP',
      description: 'Aplicación de escritorio para la gestión integral.',
      icon: '🖥️'
    },
    {
      name: 'SSS KRONOS MOBILE',
      description: 'Solución móvil para conectividad en cualquier lugar.',
      icon: '📱'
    },
    {
      name: 'IDONI TIENDA',
      description: 'Gestión y consulta de elementos relacionados con la tienda',
      icon: '🍳'
    }
  ]

  return (
    <div className="container">
      <nav className="navbar">
        <div className="navbar-brand">
          <img src="/logo.png" alt="Logo" className="navbar-logo" />
          <h1>SOLUCIONS SOCIALS INTERNAL</h1>
          <button className="hamburger" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        <div className={`navbar-overlay ${isMenuOpen ? 'open' : ''}`} onClick={() => setIsMenuOpen(false)}></div>
        <ul className={`navbar-links ${isMenuOpen ? 'active' : ''}`}>
          <li className="mobile-only-header">
            <span className="menu-title">MENU</span>
            <button className="close-btn" onClick={() => setIsMenuOpen(false)} aria-label="Close">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 18L18 6M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </li>
          <li><a href="#inicio" onClick={() => setIsMenuOpen(false)}>INICIO</a></li>
          <li><button className="nav-btn-link" onClick={() => { setIsContactOpen(true); setIsMenuOpen(false); }}>CONTACTO</button></li>
          <li><button className="login-btn">INICIAR SESION</button></li>
        </ul>
      </nav>

      <header className="header" id="inicio">
        <h2>SOLUCIONS SOCIALS</h2>
        <p>Portal de Descargas Corporativo</p>
      </header>

      <main className="app-grid">
        {apps.map((app, index) => (
          <div key={index} className="app-card">
            <div className="app-icon">{app.icon}</div>
            <h2>{app.name}</h2>
            <p>{app.description}</p>
            <div className="card-actions">
              <button className="download-btn">Descargar</button>
              <button className="doc-btn">Documentación</button>
              <button className="history-btn">Notas de Versión</button>
            </div>
          </div>
        ))}
      </main>

      <footer className="footer">
        <div className="footer-links">
          <a href="#privacidad">Privacidad</a>
          <button className="nav-btn-link" style={{ fontSize: '0.8rem', color: '#666' }} onClick={() => setIsCookiesOpen(true)}>Cookies</button>
          <button className="nav-btn-link" style={{ fontSize: '0.8rem', color: '#666' }} onClick={() => setIsHelpOpen(true)}>Centro de ayuda</button>
        </div>
        <p>© {new Date().getFullYear()} IDONI BONCOR. Todos los derechos reservados.</p>
      </footer>
      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        onOpenContact={() => setIsContactOpen(true)}
      />
      <CookiesModal isOpen={isCookiesOpen} onClose={() => setIsCookiesOpen(false)} />
    </div>
  )
}

export default App
