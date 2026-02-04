
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, LogIn, LogOut, Coffee, Pause, Play, AlertCircle, CheckCircle, User, Calendar, RefreshCw, BarChart } from "lucide-react";
import fichajeService from "./services/fichajeService";
import fichajeSupabaseService from "./services/fichajeSupabaseService";
import fichajeCodigosService from "./services/fichajeCodigosService";
import { formatTimeMadrid, formatDateMadrid } from "./utils/timeUtils";
import { supabase } from './supabaseClient';

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
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ background: 'white', padding: '2.5rem', borderRadius: '24px', border: '1px solid rgba(0,0,0,0.03)', width: '100%', maxWidth: '360px', textAlign: 'center' }}
            >
                <div style={{ background: '#FFF0F5', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                    <Clock size={28} color="#EE1566" />
                </div>
                
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', margin: '0 0 0.5rem', color: '#1a1a1a' }}>Fichaje</h2>
                <p style={{ color: '#888', fontSize: '0.95rem', margin: '0 0 2rem' }}>Identifícate con tu código</p>

                <form onSubmit={validarCodigo}>
                    <input
                        type="password"
                        value={codigoFichaje}
                        onChange={(e) => setCodigoFichaje(e.target.value)}
                        placeholder="····"
                        style={{ 
                            width: '100%', 
                            padding: '0.8rem', 
                            fontSize: '1.5rem', 
                            textAlign: 'center', 
                            letterSpacing: '8px',
                            border: '1px solid #eee',
                            borderRadius: '12px',
                            marginBottom: '1.5rem',
                            outline: 'none',
                            background: '#fafafa',
                            transition: 'all 0.2s'
                        }}
                        onFocus={(e) => e.target.style.background = 'white'}
                        onBlur={(e) => e.target.style.background = '#fafafa'}
                        autoFocus
                    />

                    <AnimatePresence>
                        {error && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ color: '#E53935', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                                <AlertCircle size={14} /> {error}
                            </motion.div>
                        )}
                        {success && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ color: '#43A047', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                                <CheckCircle size={14} /> {success}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <button 
                        type="submit" 
                        disabled={validandoCodigo || !codigoFichaje}
                        style={{ 
                            width: '100%', 
                            padding: '1rem', 
                            background: validandoCodigo ? '#ccc' : '#EE1566', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '12px', 
                            fontWeight: '600',
                            fontSize: '1rem',
                            cursor: validandoCodigo ? 'not-allowed' : 'pointer',
                            transition: 'background 0.2s'
                        }}
                    >
                        {validandoCodigo ? 'Verificando...' : 'Acceder'}
                    </button>

                     <button type="button" onClick={onBack} style={{ marginTop: '1rem', background: 'transparent', border: 'none', color: '#999', fontSize: '0.9rem', cursor: 'pointer' }}>
                        Volver al inicio
                     </button>
                </form>
            </motion.div>
        </div>
      );
  }

  // Render Dashboard
  const cardStyle = { background: 'white', borderRadius: '20px', padding: '1.5rem', border: '1px solid rgba(0,0,0,0.03)' };
  const actionBtnStyle = (color, bg) => ({
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
      padding: '1.2rem', borderRadius: '16px', border: 'none', cursor: 'pointer',
      background: bg, color: color, transition: 'transform 0.1s', width: '100%', height: '100%'
  });

  return (
    <div style={{ width: '100%', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Header Compacto */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', background: 'white', padding: '1rem 1.5rem', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '40px', height: '40px', background: '#EE1566', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                    {empleadoInfo?.nombreCompleto?.charAt(0)}
                </div>
                <div>
                   <h2 style={{ fontSize: '1.1rem', margin: 0, fontWeight: '700' }}>{empleadoInfo?.nombreCompleto}</h2>
                   <span style={{ fontSize: '0.8rem', color: '#888' }}>ID: {empleadoInfo?.codigo}</span>
                </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={handleLogout} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #eee', background: 'transparent', color: '#666', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <LogOut size={16} /> Salir
                </button>
            </div>
        </header>

        {/* Grid Principal */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem', width: '100%' }}>
            
            {/* 1. Estado Actual */}
            <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                <div style={{ marginBottom: '0.5rem', color: '#888', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Clock size={16} /> ESTADO ACTUAL
                </div>
                
                {estadoFichaje?.fichaje?.hora_entrada && !estadoFichaje?.fichaje?.hora_salida ? (
                    <div>
                        <div style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: '800', lineHeight: 1, marginBottom: '0.5rem', color: '#1a1a1a' }}>
                            {formatTimeMadrid(estadoFichaje.fichaje.hora_entrada)}
                        </div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.8rem', borderRadius: '20px', background: estadoFichaje.pausaActiva ? '#FFF3E0' : '#E8F5E9', color: estadoFichaje.pausaActiva ? '#EF6C00' : '#2E7D32', fontSize: '0.85rem', fontWeight: '600' }}>
                            {estadoFichaje.pausaActiva ? (
                                <><Pause size={14} /> EN PAUSA ({estadoFichaje.pausaActiva.tipo})</>
                            ) : (
                                <><Play size={14} /> TRABAJANDO</>
                            )}
                        </div>
                    </div>
                ) : (
                    <div style={{ color: '#aaa', padding: '1rem' }}>
                        <Clock size={40} style={{ marginBottom: '0.5rem', opacity: 0.3 }} />
                        <p style={{ margin: 0 }}>Sin actividad actual</p>
                    </div>
                )}
            </div>

            {/* 2. Panel de Acciones */}
            <div style={{ ...cardStyle }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#444' }}>ACCIONES RÁPIDAS</span>
                    {loading && <RefreshCw size={16} className="spin" color="#EE1566" />}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.8rem' }}>
                    {estadoFichaje?.puedeFicharEntrada && (
                         <button 
                            onClick={() => executeAction(() => fichajeService.ficharEntrada(empleadoId, userId), "Entrada registrada")}
                            disabled={loading}
                            style={actionBtnStyle('#1B5E20', '#E8F5E9')}
                         >
                            <LogIn size={20} /> <span style={{ fontWeight: '600', fontSize: 'clamp(0.8rem, 2vw, 1rem)' }}>ENTRADA</span>
                         </button>
                    )}
                    
                    {estadoFichaje?.puedeFinalizarPausa && (
                         <button 
                            onClick={() => executeAction(() => fichajeService.finalizarPausa(empleadoId), "Pausa finalizada")}
                            disabled={loading}
                            style={{ ...actionBtnStyle('#0D47A1', '#E3F2FD'), gridColumn: 'span 2' }}
                         >
                            <Play size={20} /> <span style={{ fontWeight: '600', fontSize: 'clamp(0.8rem, 2vw, 1rem)' }}>REANUDAR TRABAJO</span>
                         </button>
                    )}

                    {estadoFichaje?.puedeIniciarPausa && (
                         <button 
                            onClick={() => executeAction(() => fichajeService.iniciarPausa(empleadoId, 'descanso'), "Pausa iniciada")}
                            disabled={loading}
                            style={actionBtnStyle('#E65100', '#FFF3E0')}
                         >
                            <Coffee size={20} /> <span style={{ fontWeight: '600', fontSize: 'clamp(0.8rem, 2vw, 1rem)' }}>PAUSA</span>
                         </button>
                    )}
                    
                    {estadoFichaje?.puedeFicharSalida && (
                         <button 
                            onClick={() => executeAction(() => fichajeService.ficharSalida(empleadoId, userId), "Salida registrada")}
                            disabled={loading}
                            style={actionBtnStyle('#B71C1C', '#FFEBEE')}
                         >
                            <LogOut size={20} /> <span style={{ fontWeight: '600', fontSize: 'clamp(0.8rem, 2vw, 1rem)' }}>SALIDA</span>
                         </button>
                    )}

                    {!estadoFichaje && loading && <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: '1rem', color: '#999', fontSize: '0.9rem' }}>Cargando disponibilidad...</div>}
                </div>

                <AnimatePresence>
                    {error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ marginTop: '0.8rem', padding: '0.5rem', borderRadius: '8px', background: '#FFEBEE', color: '#C62828', fontSize: '0.8rem', textAlign: 'center' }}>{error}</motion.div>}
                    {success && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ marginTop: '0.8rem', padding: '0.5rem', borderRadius: '8px', background: '#E8F5E9', color: '#2E7D32', fontSize: '0.8rem', textAlign: 'center' }}>{success}</motion.div>}
                </AnimatePresence>
            </div>

            {/* 3. Resumen Rápido */}
            <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#444', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <BarChart size={16} /> ESTE MES
                </span>
                
                {resumenMensual ? (
                    <>
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0', paddingBottom: '0.5rem' }}>
                            <span style={{ color: '#888', fontSize: '0.9rem' }}>Horas Totales</span>
                            <span style={{ fontSize: '1.2rem', fontWeight: '700', color: '#EE1566' }}>{resumenMensual.totalHoras?.toFixed(1)}h</span>
                        </div>
                         <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0', paddingBottom: '0.5rem' }}>
                            <span style={{ color: '#888', fontSize: '0.9rem' }}>Días Trabajados</span>
                            <span style={{ fontSize: '1.1rem', fontWeight: '600' }}>{resumenMensual.totalDias}</span>
                        </div>
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ color: '#888', fontSize: '0.9rem' }}>Turnos Completos</span>
                            <span style={{ fontSize: '1.1rem', fontWeight: '600', color: '#2E7D32' }}>{resumenMensual.diasCompletos}</span>
                        </div>
                    </>
                ) : (
                    <div style={{ textAlign: 'center', color: '#ccc', padding: '1rem' }}>Sin datos disponibles</div>
                )}
            </div>
        </div>

        <div style={{ ...cardStyle, padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #f0f0f0' }}>
               <h3 style={{ margin: 0, fontSize: '1rem', color: '#444' }}>Historial Reciente</h3>
            </div>
            <div style={{ overflowX: 'auto', width: '100%' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', minWidth: '500px' }}>
                    <thead style={{ background: '#fafafa', color: '#888' }}>
                        <tr>
                            <th style={{ padding: '0.8rem 1rem', textAlign: 'left', fontWeight: '600', fontSize: '0.8rem' }}>FECHA</th>
                            <th style={{ padding: '0.8rem 1rem', textAlign: 'left', fontWeight: '600', fontSize: '0.8rem' }}>HORARIO</th>
                            <th style={{ padding: '0.8rem 1rem', textAlign: 'left', fontWeight: '600', fontSize: '0.8rem' }}>ESTADO</th>
                            <th style={{ padding: '0.8rem 1rem', textAlign: 'right', fontWeight: '600', fontSize: '0.8rem' }}>TOTAL</th>
                        </tr>
                    </thead>
                    <tbody>
                         {historial.length === 0 ? (
                            <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>No tienes registros este mes.</td></tr>
                         ) : (
                            historial.map((f, i) => (
                                <tr key={f.id} style={{ borderBottom: i !== historial.length -1 ? '1px solid #f5f5f5' : 'none' }}>
                                    <td style={{ padding: '0.8rem 1rem', fontWeight: '500', whiteSpace: 'nowrap' }}>{formatDateMadrid(f.fecha)}</td>
                                    <td style={{ padding: '0.8rem 1rem', color: '#666', whiteSpace: 'nowrap' }}>
                                        {formatTimeMadrid(f.hora_entrada)} - {f.hora_salida ? formatTimeMadrid(f.hora_salida) : '...'}
                                    </td>
                                    <td style={{ padding: '0.8rem 1rem' }}>
                                         <span style={{
                                            padding: '0.2rem 0.6rem',             
                                            borderRadius: '12px',
                                            fontSize: '0.7rem',
                                            fontWeight: '600',
                                            display: 'inline-block',
                                            whiteSpace: 'nowrap',
                                            background: f.hora_salida ? '#E8F5E9' : '#FFF3E0',
                                            color: f.hora_salida ? '#2E7D32' : '#EF6C00'
                                        }}>
                                            {f.hora_salida ? 'COMPLETADO' : 'PENDIENTE'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '0.8rem 1rem', textAlign: 'right', fontWeight: '600', color: '#333' }}>
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
      
      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default FichajePage;
