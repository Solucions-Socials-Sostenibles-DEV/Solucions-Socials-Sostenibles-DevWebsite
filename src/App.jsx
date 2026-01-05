import { useState, useEffect } from 'react'
import './App.css'
import ContactModal from './ContactModal';
import HelpModal from './HelpModal';
import CookiesModal from './CookiesModal';
import PrivacyModal from './PrivacyModal';
import LoginModal from './LoginModal';
import AdminDashboard from './AdminDashboard';
import { supabase } from './supabaseClient';
import ReleaseNotesModal from './ReleaseNotesModal';
import { useGitHubRelease } from './hooks/useGitHubRelease';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isCookiesOpen, setIsCookiesOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isReleaseNotesOpen, setIsReleaseNotesOpen] = useState(false);
  const [selectedRelease, setSelectedRelease] = useState(null);

  const { release: mobileRelease, loading: mobileLoading } = useGitHubRelease(
    'Solucions-Socials-Sostenibles-DEV',
    'Solucions-Socials-Sostenibles-Kronos-Mobile'
  );

  const { release: desktopRelease, loading: desktopLoading } = useGitHubRelease(
    'cr4zyp4y4n',
    'Solucions-Socials-Sostenibles-Kronos'
  );

  const [currentView, setCurrentView] = useState('home'); // 'home' or 'dashboard'

  useEffect(() => {
    // Check active session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        supabase.from('user_profiles').select('role').eq('id', session.user.id).single()
          .then(({ data }) => {
            if (data && data.role === 'admin') {
              setUser(session.user);
            } else {
              supabase.auth.signOut();
            }
          });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setUser(null);
      }
    });

    // Fetch latest versions
    return () => subscription.unsubscribe();
  }, []);




  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCurrentView('home');
  };
  const apps = [
    {
      name: 'SSS KRONOS DESKTOP',
      description: 'Aplicación de escritorio para la gestión integral.',
      icon: '🖥️',
      link: desktopRelease?.assets?.[1]?.browser_download_url || '#', // Assuming .exe is the second asset or safely defaults
      docLink: null,
      isMobile: false,
      release: desktopRelease,
      loading: desktopLoading
    },
    {
      name: 'SSS KRONOS MOBILE',
      description: 'Solución móvil para conectividad en cualquier lugar.',
      icon: '📱',
      link: mobileRelease?.assets?.[0]?.browser_download_url || '#',
      docLink: 'https://docs.google.com/document/d/1VyEojHDf-NtNp4Ufff_hr-TpM_tW7enjEtEMNN7hdHk/edit?usp=sharing',
      isMobile: true,
      release: mobileRelease,
      loading: mobileLoading
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
          <li>
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button className="nav-btn-link" onClick={() => { setCurrentView('dashboard'); setIsMenuOpen(false); }}>PANEL</button>
                <button className="login-btn" onClick={handleLogout}>CERRAR</button>
              </div>
            ) : (
              <button className="login-btn" onClick={() => setIsLoginOpen(true)}>INICIAR SESION</button>
            )}
          </li>
        </ul>
      </nav>

      {currentView === 'dashboard' && user ? (
        <AdminDashboard onBack={() => setCurrentView('home')} />
      ) : (
        <>
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
                  {app.link && app.link !== '#' ? (
                    <a href={app.link} className="download-btn" style={{ textDecoration: 'none', textAlign: 'center' }} target={app.isMobile ? "_self" : "_blank"} rel="noopener noreferrer">
                      {app.loading ? 'Cargando...' : 'Descargar'}
                    </a>
                  ) : (
                    <button className="download-btn" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                      {app.loading ? 'Cargando...' : 'No disponible'}
                    </button>
                  )}
                  {app.docLink ? (
                    <a href={app.docLink} className="doc-btn" style={{ textDecoration: 'none', textAlign: 'center' }} target="_blank" rel="noopener noreferrer">Documentación</a>
                  ) : (
                    <button className="doc-btn">Documentación</button>
                  )}
                  <button
                    className="history-btn"
                    onClick={() => {
                      setSelectedRelease(app.release);
                      setIsReleaseNotesOpen(true);
                    }}
                    disabled={!app.release}
                    style={!app.release ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                  >
                    Notas de Versión
                  </button>
                </div>
              </div>
            ))}
          </main>
        </>
      )}

      <footer className="footer">
        <div className="footer-links">
          <button className="nav-btn-link" style={{ fontSize: '0.8rem', color: '#666' }} onClick={() => setIsPrivacyOpen(true)}>Privacidad</button>
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
      <PrivacyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={(user) => setUser(user)}
      />
      <ReleaseNotesModal
        isOpen={isReleaseNotesOpen}
        onClose={() => setIsReleaseNotesOpen(false)}
        releaseNotes={selectedRelease?.body}
        tagName={selectedRelease?.tag_name}
      />
    </div>
  )
}

export default App
