import { useState } from 'react'
import './App.css'

function App() {
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
        </div>
        <ul className="navbar-links">
          <li><a href="#inicio">INICIO</a></li>
          <li><a href="#contacto">CONTACTO</a></li>
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
          <a href="#cookies">Cookies</a>
          <a href="#ayuda">Centro de ayuda</a>
        </div>
        <p>© {new Date().getFullYear()} IDONI BONCOR. Todos los derechos reservados.</p>
      </footer>
    </div>
  )
}

export default App
