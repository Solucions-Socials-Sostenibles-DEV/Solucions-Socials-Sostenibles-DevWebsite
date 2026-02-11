import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, LogIn, LogOut, Coffee, Pause, Play, AlertCircle, CheckCircle, User, Calendar, RefreshCw, BarChart } from "lucide-react";
import fichajeService from "./services/fichajeService";
import fichajeSupabaseService from "./services/fichajeSupabaseService";
import fichajeCodigosService from "./services/fichajeCodigosService";
import { formatTimeMadrid, formatDateMadrid } from "./utils/timeUtils";
import { supabase } from './supabaseClient';
import './FichajePage.css';

const FichajePage = ({ onBack, userId }) => {
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
        setTimeout(() => setSuccess(""), 1500);
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

      // Recargar cada 60 segundos para evitar polling excesivo
      const interval = setInterval(() => {
        loadEstadoFichaje();
      }, 60000);

      return () => clearInterval(interval);
    }
  }, [empleadoId]);

  // Handlers de acciones - Simplificados
  const executeAction = async (actionFn, successMsg) => {
      setLoading(true);
      setError("");
      try {
          const resultado = await actionFn();
          if (resultado.success) {
              setSuccess(successMsg);
              setTimeout(() => setSuccess(""), 3000);
              await loadEstadoFichaje();
              if(successMsg.includes("Entrada") || successMsg.includes("Salida") || successMsg.includes("finalizada")) {
                  await loadHistorial();
              }
          } else {
              setError(resultado.error);
          }
      } catch (err) {
          setError("Error en la operación");
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
        <div className="login-container">
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="login-card"
            >
                <div className="login-icon">
                    <Clock size={28} color="#EE1566" />
                </div>
                
                <h2 className="login-title">Fichaje</h2>
                <p className="login-subtitle">Identifícate con tu código</p>

                <form onSubmit={validarCodigo}>
                    <input
                        type="password"
                        value={codigoFichaje}
                        onChange={(e) => setCodigoFichaje(e.target.value)}
                        placeholder="····"
                        className="login-input"
                        autoFocus
                    />

                    <AnimatePresence>
                        {error && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="alert-message alert-error" style={{marginBottom: '1rem'}}>
                                <AlertCircle size={14} /> {error}
                            </motion.div>
                        )}
                        {success && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="alert-message alert-success" style={{marginBottom: '1rem'}}>
                                <CheckCircle size={14} /> {success}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <button 
                        type="submit" 
                        disabled={validandoCodigo || !codigoFichaje}
                        className="login-btn"
                    >
                        {validandoCodigo ? 'Verificando...' : 'Acceder'}
                    </button>

                     <button type="button" onClick={onBack} className="back-btn">
                        Volver al inicio
                     </button>
                </form>
            </motion.div>
        </div>
      );
  }

  // Render Dashboard
  return (
    <div className="fichaje-container">
      <div className="fichaje-content">
        
        {/* Header Compacto */}
        <header className="fichaje-header">
            <div className="user-info">
                <div className="user-avatar">
                    {empleadoInfo?.nombreCompleto?.charAt(0)}
                </div>
                <div className="user-details">
                   <h2>{empleadoInfo?.nombreCompleto}</h2>
                   <span>ID: {empleadoInfo?.codigo}</span>
                </div>
            </div>
            <div>
                <button onClick={handleLogout} className="logout-btn">
                    <LogOut size={16} /> Salir
                </button>
            </div>
        </header>

        {/* Grid Principal */}
        <div className="fichaje-grid">
            
            {/* 1. Estado Actual */}
            <div className="fichaje-card centered">
                <div className="card-label">
                    <Clock size={16} /> ESTADO ACTUAL
                </div>
                
                {estadoFichaje?.fichaje?.hora_entrada && !estadoFichaje?.fichaje?.hora_salida ? (
                    <div>
                        <div className="time-display">
                            {formatTimeMadrid(estadoFichaje.fichaje.hora_entrada)}
                        </div>
                        <div className={`status-badge ${estadoFichaje.pausaActiva ? 'paused' : 'working'}`}>
                            {estadoFichaje.pausaActiva ? (
                                <><Pause size={14} /> EN PAUSA ({estadoFichaje.pausaActiva.tipo})</>
                            ) : (
                                <><Play size={14} /> TRABAJANDO</>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="no-activity">
                        <Clock size={40} style={{ marginBottom: '0.5rem', opacity: 0.3 }} />
                        <p style={{ margin: 0 }}>Sin actividad actual</p>
                    </div>
                )}
            </div>

            {/* 2. Panel de Acciones */}
            <div className="fichaje-card">
                <div className="actions-header">
                    <span className="actions-title">ACCIONES RÁPIDAS</span>
                    {loading && <RefreshCw size={16} className="spin" color="#EE1566" />}
                </div>

                <div className="actions-grid">
                    {estadoFichaje?.puedeFicharEntrada && (
                         <button 
                            onClick={() => executeAction(() => fichajeService.ficharEntrada(empleadoId, userId), "Entrada registrada")}
                            disabled={loading}
                            className="action-btn"
                            style={{ background: '#E8F5E9', color: '#1B5E20' }}
                         >
                            <LogIn size={20} /> <span>ENTRADA</span>
                         </button>
                    )}
                    
                    {estadoFichaje?.puedeFinalizarPausa && (
                         <button 
                            onClick={() => executeAction(() => fichajeService.finalizarPausa(empleadoId), "Pausa finalizada")}
                            disabled={loading}
                            className="action-btn full-width"
                            style={{ background: '#E3F2FD', color: '#0D47A1' }}
                         >
                            <Play size={20} /> <span>REANUDAR TRABAJO</span>
                         </button>
                    )}

                    {estadoFichaje?.puedeIniciarPausa && (
                         <button 
                            onClick={() => executeAction(() => fichajeService.iniciarPausa(empleadoId, 'descanso'), "Pausa iniciada")}
                            disabled={loading}
                            className="action-btn"
                            style={{ background: '#FFF3E0', color: '#E65100' }}
                         >
                            <Coffee size={20} /> <span>PAUSA</span>
                         </button>
                    )}
                    
                    {estadoFichaje?.puedeFicharSalida && (
                         <button 
                            onClick={() => executeAction(() => fichajeService.ficharSalida(empleadoId, userId), "Salida registrada")}
                            disabled={loading}
                            className="action-btn"
                            style={{ background: '#FFEBEE', color: '#B71C1C' }}
                         >
                            <LogOut size={20} /> <span>SALIDA</span>
                         </button>
                    )}

                    {/* Mensaje cuando no hay acciones disponibles */}
                    {estadoFichaje && !estadoFichaje.puedeFicharEntrada && !estadoFichaje.puedeFicharSalida && !estadoFichaje.puedeIniciarPausa && !estadoFichaje.puedeFinalizarPausa && !loading && (
                        <div className="action-btn full-width" style={{ background: '#F5F5F5', color: '#666', cursor: 'default' }}>
                            <CheckCircle size={24} style={{ marginBottom: '0.5rem', color: '#43A047' }} />
                            <div style={{ fontWeight: '600', marginBottom: '0.3rem' }}>Fichaje completado</div>
                            <div style={{ fontSize: '0.85rem' }}>Ya has registrado tu jornada para hoy</div>
                        </div>
                    )}

                    {!estadoFichaje && loading && <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: '1rem', color: '#999', fontSize: '0.9rem' }}>Cargando disponibilidad...</div>}
                </div>

                <AnimatePresence>
                    {error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="alert-message alert-error">{error}</motion.div>}
                    {success && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="alert-message alert-success">{success}</motion.div>}
                </AnimatePresence>
            </div>

            {/* 3. Resumen Rápido */}
            <div className="fichaje-card" style={{ gap: '1rem' }}>
                <span className="card-label">
                    <BarChart size={16} /> ESTE MES
                </span>
                
                {resumenMensual ? (
                    <>
                        <div className="summary-item">
                            <span className="summary-label">Horas Totales</span>
                            <span className="summary-value" style={{ color: '#EE1566' }}>{resumenMensual.totalHoras?.toFixed(1)}h</span>
                        </div>
                         <div className="summary-item">
                            <span className="summary-label">Días Trabajados</span>
                            <span className="summary-value">{resumenMensual.totalDias}</span>
                        </div>
                        <div className="summary-item">
                            <span className="summary-label">Turnos Completos</span>
                            <span className="summary-value" style={{ color: '#2E7D32' }}>{resumenMensual.diasCompletos}</span>
                        </div>
                    </>
                ) : (
                    <div style={{ textAlign: 'center', color: '#ccc', padding: '1rem' }}>Sin datos disponibles</div>
                )}
            </div>
        </div>

        <div className="fichaje-card history-card">
            <div className="history-header">
               <h3>Historial Reciente</h3>
            </div>
            <div className="table-container">
                <table className="history-table">
                    <thead>
                        <tr>
                            <th>FECHA</th>
                            <th>HORARIO</th>
                            <th>ESTADO</th>
                            <th style={{ textAlign: 'right' }}>TOTAL</th>
                        </tr>
                    </thead>
                    <tbody>
                         {historial.length === 0 ? (
                            <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>No tienes registros este mes.</td></tr>
                         ) : (
                            historial.map((f, i) => (
                                <tr key={f.id}>
                                    <td style={{ fontWeight: '500', whiteSpace: 'nowrap' }}>{formatDateMadrid(f.fecha)}</td>
                                    <td style={{ color: '#666', whiteSpace: 'nowrap' }}>
                                        {formatTimeMadrid(f.hora_entrada)} - {f.hora_salida ? formatTimeMadrid(f.hora_salida) : '...'}
                                    </td>
                                    <td>
                                         <span className="status-pill" style={{
                                            background: f.hora_salida ? '#E8F5E9' : '#FFF3E0',
                                            color: f.hora_salida ? '#2E7D32' : '#EF6C00'
                                        }}>
                                            {f.hora_salida ? 'COMPLETADO' : 'PENDIENTE'}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right', fontWeight: '600', color: '#333' }}>
                                        {f.horas_trabajadas ? `${Number(f.horas_trabajadas).toFixed(2)}h` : '-'}
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
