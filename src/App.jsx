import { useState } from 'react'
import './App.css'

function App() {
  const apps = [
    {
      name: 'SSS KRONOS DESKTOP',
      description: 'Aplicación de escritorio para la gestión integral.',
      icon: '🖥️' // Placeholder icon
    },
    {
      name: 'SSS KRONOS MOBILE',
      description: 'Solución móvil para conectividad en cualquier lugar.',
      icon: '📱' // Placeholder icon
    },
    {
      name: 'IDONI RECETAS',
      description: 'Gestión y consulta de recetas corporativas.',
      icon: '🍳' // Placeholder icon
    }
  ]

  return (
    <div className="container">
      <header className="header">
        <h1>IDONI BONCOR</h1>
        <p>Portal de Descargas Corporativo</p>
      </header>

      <main className="app-grid">
        {apps.map((app, index) => (
          <div key={index} className="app-card">
            <div className="app-icon">{app.icon}</div>
            <h2>{app.name}</h2>
            <p>{app.description}</p>
            <button className="download-btn">Descargar</button>
          </div>
        ))}
      </main>
      
      <footer className="footer">
        <p>© {new Date().getFullYear()} IDONI BONCOR. Todos los derechos reservados.</p>
      </footer>
    </div>
  )
}

export default App
