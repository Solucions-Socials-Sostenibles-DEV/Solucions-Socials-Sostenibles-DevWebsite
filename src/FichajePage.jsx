
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, LogIn, LogOut, Coffee, Pause, Play, AlertCircle, CheckCircle, User, Calendar } from "lucide-react";
import fichajeService from "./services/fichajeService";
import fichajeSupabaseService from "./services/fichajeSupabaseService";
import fichajeCodigosService from "./services/fichajeCodigosService";
import { formatTimeMadrid, formatDateMadrid } from "./utils/timeUtils";
import { supabase } from './supabaseClient'; // Direct import since AuthContext might not exist or be standard

const FichajePage = ({ onBack, userId }) => { // Receiving userId props from App
  // Estados principales
  const [empleadoId, setEmpleadoId] = useState(null);
  const [empleadoInfo, setEmpleadoInfo] = useState(null);
  const [codigoFichaje, setCodigoFichaje] = useState("");
  const [validandoCodigo, setValidandoCodigo] = useState(false);
  const [estadoFichaje, setEstadoFichaje] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Historial
  const [historial, setHistorial] = useState([]);
  const [resumenMensual, setResumenMensual] = useState(null);

  // Validar código de fichaje
  const validarCodigo = async (e) => {
    e?.preventDefault();
    if (!codigoFichaje || !codigoFichaje.trim()) {
      setError("Por favor, introduce un código");
      return;
    }

    setValidandoCodigo(true);
    setError("");

    try {
      const resultado =
        await fichajeCodigosService.buscarEmpleadoPorCodigo(codigoFichaje);

      if (resultado.success) {
        setEmpleadoId(resultado.data.empleadoId);
        setEmpleadoInfo({
          id: resultado.data.empleadoId,
          nombreCompleto: resultado.data.descripcion || "Empleado",
          codigo: resultado.data.codigo,
        });
        setSuccess("Código válido");
        setTimeout(() => setSuccess(""), 2000);
      } else {
        setError(resultado.error || "Código no válido");
        setEmpleadoId(null);
        setEmpleadoInfo(null);
      }
    } catch (err) {
      console.error("Error validando código:", err);
      setError("Error al validar el código");
      setEmpleadoId(null);
      setEmpleadoInfo(null);
    } finally {
      setValidandoCodigo(false);
    }
  };

  // Cargar estado del fichaje
  const loadEstadoFichaje = async () => {
    if (!empleadoId) return;

    setLoading(true);
    try {
      const resultado = await fichajeService.obtenerEstadoFichaje(empleadoId);

      if (resultado.success) {
        setEstadoFichaje(resultado.data);
      } else {
        setError(resultado.error);
      }
    } catch (err) {
      console.error("Error al cargar el estado del fichaje:", err);
      setError("Error al cargar el estado del fichaje");
    } finally {
      setLoading(false);
    }
  };

  // Cargar historial mensual
  const loadHistorial = async () => {
    if (!empleadoId) return;

    try {
      const hoy = new Date();
      const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);

      const resultado = await fichajeSupabaseService.obtenerFichajesEmpleado(
        empleadoId,
        primerDia,
        ultimoDia,
      );

      if (resultado.success) {
        setHistorial(resultado.data || []);

        const resumen = resultado.data.reduce(
          (acc, fichaje) => {
            acc.totalDias++;
            acc.totalHoras += fichaje.horas_trabajadas || 0;
            if (fichaje.hora_salida) acc.diasCompletos++;
            else acc.diasIncompletos++;
            return acc;
          },
          { totalDias: 0, totalHoras: 0, diasCompletos: 0, diasIncompletos: 0 },
        );

        setResumenMensual(resumen);
      }
    } catch (err) {
      console.error("Error cargando historial:", err);
    }
  };

  useEffect(() => {
    if (empleadoId) {
      loadEstadoFichaje();
      loadHistorial();

      // Recargar cada 30 segundos
      const interval = setInterval(() => {
        loadEstadoFichaje();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [empleadoId]);

  // Handlers de acciones
  const handleFicharEntrada = async () => {
    setLoading(true);
    setError("");
    try {
      const resultado = await fichajeService.ficharEntrada(
        empleadoId,
        userId,
      );

      if (resultado.success) {
        setSuccess("Entrada registrada correctamente");
        setTimeout(() => setSuccess(""), 3000);
        await loadEstadoFichaje();
        await loadHistorial();
      } else {
        setError(resultado.error);
      }
    } catch (err) {
      setError("Error al registrar la entrada");
    } finally {
      setLoading(false);
    }
  };

  const handleFicharSalida = async () => {
    setLoading(true);
    setError("");
    try {
      const resultado = await fichajeService.ficharSalida(empleadoId, userId);
      if (resultado.success) {
        setSuccess("Salida registrada correctamente");
        setTimeout(() => setSuccess(""), 3000);
        await loadEstadoFichaje();
        await loadHistorial();
      } else {
        setError(resultado.error);
      }
    } catch (err) {
      setError("Error al registrar la salida");
    } finally {
      setLoading(false);
    }
  };

  const handleIniciarPausa = async (tipo = "descanso") => {
    setLoading(true);
    setError("");
    try {
      const resultado = await fichajeService.iniciarPausa(empleadoId, tipo);
      if (resultado.success) {
        setSuccess(resultado.message);
        setTimeout(() => setSuccess(""), 3000);
        await loadEstadoFichaje();
      } else {
        setError(resultado.error);
      }
    } catch (err) {
      setError("Error al iniciar la pausa");
    } finally {
      setLoading(false);
    }
  };

  const handleFinalizarPausa = async () => {
    setLoading(true);
    setError("");
    try {
      const resultado = await fichajeService.finalizarPausa(empleadoId);
      if (resultado.success) {
        setSuccess(resultado.message);
        setTimeout(() => setSuccess(""), 3000);
        await loadEstadoFichaje();
        await loadHistorial();
      } else {
        setError(resultado.error);
      }
    } catch (err) {
      setError("Error al finalizar la pausa");
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogout = () => {
      setEmpleadoId(null);
      setEmpleadoInfo(null);
      setCodigoFichaje("");
      setHistorial([]);
      setEstadoFichaje(null);
  };

  // Render Login View
  if (!empleadoId) {
      return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', paddingTop: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '700', margin: 0 }}>Fichaje Empleados</h1>
                <button className="submit-btn" onClick={onBack} style={{ width: 'auto', padding: '0.8rem 1.5rem', backgroundColor: '#333', marginTop: 0 }}>
                    Volver
                </button>
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="contact-modal" 
                style={{ position: 'relative', width: '100%', maxWidth: '400px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{ textAlign: 'center' }}>
                    <div style={{ background: 'rgba(238, 21, 102, 0.1)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                        <Clock size={32} color="#EE1566" />
                    </div>
                    <h2>Identificación</h2>
                    <p style={{ color: '#666' }}>Introduce tu código personal para acceder</p>
                </div>

                <form onSubmit={validarCodigo}>
                    <div className="form-group">
                        <label>Código de Empleado</label>
                        <input
                            type="password"
                            value={codigoFichaje}
                            onChange={(e) => setCodigoFichaje(e.target.value)}
                            placeholder="Introduce tu código..."
                            style={{ fontSize: '1.2rem',  textAlign: 'center', letterSpacing: '4px' }}
                            autoFocus
                        />
                    </div>

                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }} 
                            animate={{ opacity: 1, height: 'auto' }}
                            style={{ color: '#c62828', background: '#ffebee', padding: '0.8rem', borderRadius: '8px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            <AlertCircle size={16} />
                            {error}
                        </motion.div>
                    )}

                     {success && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }} 
                            animate={{ opacity: 1, height: 'auto' }}
                            style={{ color: '#2e7d32', background: '#e8f5e9', padding: '0.8rem', borderRadius: '8px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            <CheckCircle size={16} />
                            {success}
                        </motion.div>
                    )}

                    <button 
                        type="submit" 
                        className="submit-btn" 
                        disabled={validandoCodigo || !codigoFichaje}
                        style={{ marginTop: '1rem' }}
                    >
                        {validandoCodigo ? 'Verificando...' : 'Acceder'}
                    </button>
                </form>
            </motion.div>
        </div>
      );
  }

  // Render Dashboard
  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto", paddingTop: '100px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: '#EE1566', color: 'white', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                {empleadoInfo?.nombreCompleto?.charAt(0) || 'E'}
            </div>
            <div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>Hola, {empleadoInfo?.nombreCompleto}</h1>
                <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>Código: {empleadoInfo?.codigo}</p>
            </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="submit-btn" onClick={handleLogout} style={{ width: 'auto', padding: '0.6rem 1.2rem', backgroundColor: '#666', marginTop: 0 }}>
                Cerrar Sesión
            </button>
            <button className="submit-btn" onClick={onBack} style={{ width: 'auto', padding: '0.6rem 1.2rem', backgroundColor: '#333', marginTop: 0 }}>
                Volver
            </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          
          {/* Status Card */}
          <div className="feature-card" style={{ cursor: 'default', background: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={20} color="#EE1566" />
                    Estado Actual
                </h3>
                <span style={{ 
                    padding: '0.4rem 0.8rem', 
                    borderRadius: '20px', 
                    fontSize: '0.8rem', 
                    fontWeight: 'bold',
                    background: estadoFichaje?.pausaActiva ? '#FFF3E0' : estadoFichaje?.tieneFichaje && !estadoFichaje?.fichaje?.hora_salida ? '#E8F5E9' : '#ECEFF1',
                    color: estadoFichaje?.pausaActiva ? '#F57C00' : estadoFichaje?.tieneFichaje && !estadoFichaje?.fichaje?.hora_salida ? '#2E7D32' : '#546E7A'
                }}>
                    {estadoFichaje?.pausaActiva ? '⏸ EN PAUSA' : estadoFichaje?.tieneFichaje && !estadoFichaje?.fichaje?.hora_salida ? '🟢 TRABAJANDO' : '⚪️ FUERA'}
                </span>
            </div>
            
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                {estadoFichaje?.fichaje?.hora_entrada && !estadoFichaje?.fichaje?.hora_salida ? (
                    <>
                         <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Entrada registrada a las</p>
                         <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#333', margin: 0 }}>
                             {formatTimeMadrid(estadoFichaje.fichaje.hora_entrada)}
                         </p>
                         {estadoFichaje.pausaActiva && (
                             <div style={{ marginTop: '1rem', padding: '0.8rem', background: '#FFF3E0', borderRadius: '8px' }}>
                                 <p style={{ margin: 0, color: '#EF6C00', fontSize: '0.9rem' }}>
                                     Pausa iniciada: {formatTimeMadrid(estadoFichaje.pausaActiva.inicio)}
                                 </p>
                                 <p style={{ margin: 0, fontWeight: 'bold', color: '#EF6C00' }}>
                                     {estadoFichaje.pausaActiva.tipo?.toUpperCase()}
                                 </p>
                             </div>
                         )}
                    </>
                ) : (
                    <div style={{ padding: '1rem', color: '#999' }}>
                        <p>No tienes ningún turno activo en este momento.</p>
                    </div>
                )}
            </div>
          </div>

          {/* Actions Card */}
          <div className="feature-card" style={{ cursor: 'default', background: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
             <h3 style={{ margin: '0 0 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Play size={20} color="#EE1566" />
                Acciones
             </h3>

             {error && (
                <div style={{ color: '#c62828', background: '#ffebee', padding: '0.8rem', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <AlertCircle size={16} />
                    {error}
                </div>
             )}
             
             {success && (
                <div style={{ color: '#2e7d32', background: '#e8f5e9', padding: '0.8rem', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle size={16} />
                    {success}
                </div>
             )}

             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                 {estadoFichaje?.puedeFicharEntrada && (
                     <button 
                        className="submit-btn" 
                        onClick={handleFicharEntrada}
                        disabled={loading}
                        style={{ background: '#2E7D32', margin: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1.5rem' }}
                     >
                        <LogIn size={24} />
                        ENTRADA
                     </button>
                 )}
                 
                 {estadoFichaje?.puedeFinalizarPausa && (
                      <button 
                        className="submit-btn" 
                        onClick={handleFinalizarPausa}
                        disabled={loading}
                        style={{ background: '#1565C0', margin: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1.5rem', gridColumn: 'span 2' }}
                     >
                        <Play size={24} />
                         REANUDAR
                     </button>
                 )}

                 {estadoFichaje?.puedeIniciarPausa && (
                      <button 
                        className="submit-btn" 
                        onClick={() => handleIniciarPausa('descanso')}
                        disabled={loading}
                        style={{ background: '#FF9800', margin: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1.5rem' }}
                     >
                        <Coffee size={24} />
                         PAUSA
                     </button>
                 )}
                 
                 {estadoFichaje?.puedeFicharSalida && (
                      <button 
                        className="submit-btn" 
                        onClick={handleFicharSalida}
                        disabled={loading}
                        style={{ background: '#C62828', margin: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1.5rem' }}
                     >
                        <LogOut size={24} />
                         SALIDA
                     </button>
                 )}
                 
                 {!estadoFichaje && loading && (
                     <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: '1rem' }}>
                         Cargando acciones...
                     </div>
                 )}
             </div>
          </div>
      </div>

       {/* Monthly Summary */}
       {resumenMensual && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              <div className="feature-card" style={{ padding: '1rem', textAlign: 'center', background: '#f8f9fa' }}>
                  <p style={{ margin: '0 0 0.5rem', color: '#666', fontSize: '0.8rem' }}>DÍAS TRABAJADOS</p>
                  <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>{resumenMensual.totalDias}</p>
              </div>
              <div className="feature-card" style={{ padding: '1rem', textAlign: 'center', background: '#f8f9fa' }}>
                  <p style={{ margin: '0 0 0.5rem', color: '#666', fontSize: '0.8rem' }}>HORAS TOTALES</p>
                  <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: '#1565C0' }}>{resumenMensual.totalHoras?.toFixed(1)}h</p>
              </div>
              <div className="feature-card" style={{ padding: '1rem', textAlign: 'center', background: '#f8f9fa' }}>
                  <p style={{ margin: '0 0 0.5rem', color: '#666', fontSize: '0.8rem' }}>DÍAS COMPLETOS</p>
                  <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: '#2E7D32' }}>{resumenMensual.diasCompletos}</p>
              </div>
          </div>
       )}

      {/* History Table */}
      <div className="features-grid" style={{ gridTemplateColumns: '1fr' }}>
        <div className="feature-card" style={{ cursor: 'default' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calendar size={20} color="#EE1566" />
                    Historial Reciente
                </h3>
                <button className="submit-btn" onClick={loadHistorial} style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.8rem', marginTop: 0 }}>
                    Actualizar
                </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid rgba(0,0,0,0.05)' }}>
                            <th style={{ padding: '1rem', color: '#999', fontSize: '0.8rem' }}>DIA</th>
                            <th style={{ padding: '1rem', color: '#999', fontSize: '0.8rem' }}>ENTRADA</th>
                            <th style={{ padding: '1rem', color: '#999', fontSize: '0.8rem' }}>SALIDA</th>
                            <th style={{ padding: '1rem', color: '#999', fontSize: '0.8rem' }}>HORAS</th>
                            <th style={{ padding: '1rem', color: '#999', fontSize: '0.8rem' }}>ESTADO</th>
                        </tr>
                    </thead>
                    <tbody>
                        {historial.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ padding: '1.5rem', textAlign: 'center', color: '#999' }}>No se encontraron registros.</td>
                            </tr>
                        ) : (
                            historial.map((fichaje) => (
                                <tr key={fichaje.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                                    <td style={{ padding: '1rem', fontWeight: 'bold' }}>{formatDateMadrid(fichaje.fecha)}</td>
                                    <td style={{ padding: '1rem' }}>{formatTimeMadrid(fichaje.hora_entrada)}</td>
                                    <td style={{ padding: '1rem' }}>{fichaje.hora_salida ? formatTimeMadrid(fichaje.hora_salida) : '-'}</td>
                                    <td style={{ padding: '1rem' }}>{fichaje.horas_trabajadas ? `${fichaje.horas_trabajadas}h` : '-'}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '4px',
                                            backgroundColor: fichaje.hora_salida ? 'rgba(76, 175, 80, 0.1)' : 'rgba(238, 21, 102, 0.1)',
                                            color: fichaje.hora_salida ? '#2E7D32' : '#EE1566',
                                            fontSize: '0.75rem',
                                            fontWeight: 'bold'
                                        }}>
                                            {fichaje.hora_salida ? 'COMPLETADO' : 'PENDIENTE'}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  );
};

export default FichajePage;
