import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Monitor, Smartphone } from 'lucide-react'
import './App.css'
import ContactModal from './ContactModal';
import HelpModal from './HelpModal';
import CookiesModal from './CookiesModal';
import PrivacyModal from './PrivacyModal';
import LoginModal from './LoginModal';
import AdminDashboard from './AdminDashboard';
import FichajePage from './FichajePage';
import FichajeCodigosAdmin from './FichajeCodigosAdmin';
import { supabase } from './supabaseClient';
import ReleaseNotesModal from './ReleaseNotesModal';
import { useGitHubRelease } from './hooks/useGitHubRelease';

function resolveDownloadUrl(release, { prefer, fallbackIndex }) {
  const assets = release?.assets;
  if (!Array.isArray(assets) || assets.length === 0) return '#';

  const preferred = assets.find((asset) => {
    const name = (asset.name || '').toLowerCase();
    return prefer.some((ext) => name.endsWith(ext));
  });

  return (
    preferred?.browser_download_url ||
    assets[fallbackIndex]?.browser_download_url ||
    assets[0]?.browser_download_url ||
    '#'
  );
}

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isCookiesOpen, setIsCookiesOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
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

  const [currentView, setCurrentView] = useState('home'); // 'home', 'dashboard', or 'fichaje'

  useEffect(() => {
    // Check active session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        supabase.from('user_profiles').select('role').eq('id', session.user.id).single()
          .then(({ data }) => {
            if (data) {
              setUser(session.user);
              setUserRole(data.role);
            } else {
              supabase.auth.signOut();
            }
          });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setUser(null);
        setUserRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const goHome = (anchor) => {
    setCurrentView('home');
    setIsMenuOpen(false);
    if (!anchor) return;
    setTimeout(() => {
      document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserRole(null);
    setCurrentView('home');
  };

  const apps = [
    {
      name: 'SSS Kronos Desktop',
      description: 'Aplicación de escritorio para la gestión integral.',
      icon: Monitor,
      link: resolveDownloadUrl(desktopRelease, { prefer: ['.exe', '.msi'], fallbackIndex: 1 }),
      docLink: null,
      isMobile: false,
      release: desktopRelease,
      loading: desktopLoading
    },
    {
      name: 'SSS Kronos Mobile',
      description: 'Solución móvil para conectividad en campo.',
      icon: Smartphone,
      link: resolveDownloadUrl(mobileRelease, { prefer: ['.apk', '.aab'], fallbackIndex: 0 }),
      docLink: 'https://docs.google.com/document/d/1VyEojHDf-NtNp4Ufff_hr-TpM_tW7enjEtEMNN7hdHk/edit?usp=sharing',
      isMobile: true,
      release: mobileRelease,
      loading: mobileLoading
    }
  ]

  return (
    <div className="container">
      <nav className={`navbar ${isMenuOpen ? 'menu-open' : ''}`}>
        <div className="navbar-inner">
          <div className="navbar-brand">
            <img src="/logo.png" alt="Solucions Socials Sostenibles" className="navbar-logo" />
            <h1>SSS INTERNAL</h1>
          </div>
          {!isMenuOpen && (
            <button className="hamburger" onClick={() => setIsMenuOpen(true)} aria-label="Menu">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
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
            <li>
              <a
                href="#inicio"
                className={currentView === 'home' ? 'active' : ''}
                onClick={(e) => { e.preventDefault(); goHome('inicio'); }}
              >
                Inicio
              </a>
            </li>
            <li>
              <a
                href="#descargas"
                onClick={(e) => { e.preventDefault(); goHome('descargas'); }}
              >
                Descargas
              </a>
            </li>
            <li>
              <button
                className={`nav-btn-link ${currentView === 'fichaje' ? 'active' : ''}`}
                onClick={() => { setCurrentView('fichaje'); setIsMenuOpen(false); }}
              >
                Fichaje
              </button>
            </li>
            <li>
              <button className="nav-btn-link" onClick={() => { setIsContactOpen(true); setIsMenuOpen(false); }}>
                Contacto
              </button>
            </li>
            {user && (
              <li>
                <button
                  className={`nav-btn-link ${currentView === 'codigos_fichaje' ? 'active' : ''}`}
                  onClick={() => { setCurrentView('codigos_fichaje'); setIsMenuOpen(false); }}
                >
                  Códigos fichaje
                </button>
              </li>
            )}
            {user ? (
              <>
                {userRole === 'admin' && (
                  <li>
                    <button
                      className={`nav-btn-link ${currentView === 'dashboard' ? 'active' : ''}`}
                      onClick={() => { setCurrentView('dashboard'); setIsMenuOpen(false); }}
                    >
                      Panel
                    </button>
                  </li>
                )}
                <li><button className="nav-logout-btn" onClick={handleLogout}>Cerrar sesión</button></li>
              </>
            ) : (
              <li><button className="login-btn" onClick={() => { setIsLoginOpen(true); setIsMenuOpen(false); }}>Iniciar sesión</button></li>
            )}
          </ul>
        </div>
      </nav>

      <div className="page">
        {currentView === 'dashboard' && user && userRole === 'admin' ? (
          <AdminDashboard onBack={() => setCurrentView('home')} />
        ) : currentView === 'fichaje' ? (
          <FichajePage onBack={() => setCurrentView('home')} userId={user?.id} />
        ) : currentView === 'codigos_fichaje' && user ? (
          <FichajeCodigosAdmin userId={user?.id} userRole={userRole} />
        ) : (
          <>
            <header className="header" id="inicio">
              <h2>Solucions Socials</h2>
              <p>Portal de descargas y herramientas internas</p>
              <div className="hero-actions">
                <a href="#descargas" className="download-btn" onClick={(e) => { e.preventDefault(); goHome('descargas'); }}>
                  Ver descargas
                </a>
                <button className="doc-btn" onClick={() => setCurrentView('fichaje')}>
                  Ir a fichaje
                </button>
              </div>
            </header>

            <main className="app-grid" id="descargas">
              {apps.map((app, index) => {
                const Icon = app.icon;
                return (
                  <motion.div
                    key={index}
                    className="app-card"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.26, delay: index * 0.08 }}
                  >
                    <div className="app-icon">
                      <Icon size={22} strokeWidth={1.75} />
                    </div>
                    <h2>{app.name}</h2>
                    <p>{app.description}</p>
                    {app.release?.tag_name && (
                      <span className="app-version">{app.release.tag_name}</span>
                    )}
                    <div className="card-actions">
                      {app.link && app.link !== '#' ? (
                        <a href={app.link} className="download-btn" style={{ textDecoration: 'none', textAlign: 'center' }} target={app.isMobile ? "_self" : "_blank"} rel="noopener noreferrer">
                          {app.loading ? 'Cargando...' : 'Descargar'}
                        </a>
                      ) : (
                        <button className="download-btn" disabled>
                          {app.loading ? 'Cargando...' : 'No disponible'}
                        </button>
                      )}
                      {app.docLink ? (
                        <a href={app.docLink} className="doc-btn" style={{ textDecoration: 'none', textAlign: 'center' }} target="_blank" rel="noopener noreferrer">Documentación</a>
                      ) : (
                        <button className="doc-btn" disabled style={{ opacity: 0.55, cursor: 'not-allowed' }}>Documentación</button>
                      )}
                      <button
                        className="history-btn"
                        onClick={() => {
                          setSelectedRelease(app.release);
                          setIsReleaseNotesOpen(true);
                        }}
                        disabled={!app.release}
                        style={!app.release ? { opacity: 0.55, cursor: 'not-allowed' } : {}}
                      >
                        Notas
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </main>
          </>
        )}
      </div>

      <footer className="footer">
        <div className="footer-links">
          <button className="nav-btn-link" onClick={() => setIsPrivacyOpen(true)}>Privacidad</button>
          <button className="nav-btn-link" onClick={() => setIsCookiesOpen(true)}>Cookies</button>
          <button className="nav-btn-link" onClick={() => setIsHelpOpen(true)}>Ayuda</button>
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
        onLoginSuccess={(user, role) => {
          setUser(user);
          setUserRole(role);
          setIsLoginOpen(false);
          setIsMenuOpen(false);
        }}
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
