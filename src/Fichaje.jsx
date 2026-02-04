import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import './ContactModal.css'; // Reusing standard styles

function Fichaje({ onBack, userId }) {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isCheckedIn, setIsCheckedIn] = useState(false);
    const [currentRecord, setCurrentRecord] = useState(null);

    useEffect(() => {
        fetchRecords();
    }, [userId]);

    const fetchRecords = async () => {
        try {
            setLoading(true);
            // Fetch user's time tracking records
            const { data, error } = await supabase
                .from('time_tracking')
                .select('*')
                .eq('user_id', userId)
                .order('check_in', { ascending: false })
                .limit(10);

            if (error) throw error;
            
            setRecords(data || []);
            
            // Check if there's an active check-in (no check_out)
            const activeRecord = data?.find(record => !record.check_out);
            if (activeRecord) {
                setIsCheckedIn(true);
                setCurrentRecord(activeRecord);
            }
        } catch (err) {
            console.error('Error fetching records:', err);
            setError('No se pudieron cargar los registros. ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckIn = async () => {
        try {
            const { data, error } = await supabase
                .from('time_tracking')
                .insert([
                    { 
                        user_id: userId,
                        check_in: new Date().toISOString()
                    }
                ])
                .select()
                .single();

            if (error) throw error;
            
            setIsCheckedIn(true);
            setCurrentRecord(data);
            await fetchRecords();
        } catch (err) {
            console.error('Error checking in:', err);
            setError('Error al fichar entrada: ' + err.message);
        }
    };

    const handleCheckOut = async () => {
        try {
            const { error } = await supabase
                .from('time_tracking')
                .update({ check_out: new Date().toISOString() })
                .eq('id', currentRecord.id);

            if (error) throw error;
            
            setIsCheckedIn(false);
            setCurrentRecord(null);
            await fetchRecords();
        } catch (err) {
            console.error('Error checking out:', err);
            setError('Error al fichar salida: ' + err.message);
        }
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('es-ES', {
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit', 
            minute: '2-digit'
        });
    };

    const calculateDuration = (checkIn, checkOut) => {
        if (!checkIn) return '-';
        const start = new Date(checkIn);
        const end = checkOut ? new Date(checkOut) : new Date();
        const diff = end - start;
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        return `${hours}h ${minutes}m`;
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', paddingTop: '100px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '1rem', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '700', margin: 0 }}>Sistema de Fichaje</h1>
                <button className="submit-btn" onClick={onBack} style={{ width: 'auto', padding: '0.8rem 1.5rem', backgroundColor: '#333', marginTop: 0 }}>
                    Volver a la Web
                </button>
            </div>

            {error && (
                <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                    {error}
                </div>
            )}

            {/* Check In/Out Controls */}
            <div className="features-grid" style={{ gridTemplateColumns: '1fr', marginBottom: '2rem' }}>
                <div className="feature-card" style={{ textAlign: 'center', cursor: 'default' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>Control de Jornada</h3>
                    <div style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: '#999' }}>
                        {isCheckedIn ? (
                            <>
                                <p style={{ marginBottom: '0.5rem' }}>✅ Fichado desde:</p>
                                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#EE1566' }}>
                                    {formatDateTime(currentRecord?.check_in)}
                                </p>
                                <p style={{ marginTop: '1rem', fontSize: '1rem' }}>
                                    Duración actual: {calculateDuration(currentRecord?.check_in, null)}
                                </p>
                            </>
                        ) : (
                            <p>⏸️ No has fichado hoy</p>
                        )}
                    </div>
                    <button 
                        className="submit-btn" 
                        onClick={isCheckedIn ? handleCheckOut : handleCheckIn}
                        style={{ 
                            width: 'auto', 
                            padding: '1rem 2rem', 
                            fontSize: '1.1rem',
                            backgroundColor: isCheckedIn ? '#c62828' : '#EE1566',
                            marginTop: 0
                        }}
                    >
                        {isCheckedIn ? '🚪 Fichar Salida' : '🚀 Fichar Entrada'}
                    </button>
                </div>
            </div>

            {/* Records History */}
            <div className="features-grid" style={{ gridTemplateColumns: '1fr' }}>
                <div className="feature-card" style={{ cursor: 'default' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ margin: 0 }}>Historial de Fichajes</h3>
                        <button className="submit-btn" onClick={fetchRecords} style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.8rem', marginTop: 0 }}>
                            Actualizar
                        </button>
                    </div>

                    {loading ? (
                        <p>Cargando registros...</p>
                    ) : records.length === 0 ? (
                        <p>No hay registros de fichajes.</p>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.1)' }}>
                                        <th style={{ padding: '1rem', color: '#999' }}>Entrada</th>
                                        <th style={{ padding: '1rem', color: '#999' }}>Salida</th>
                                        <th style={{ padding: '1rem', color: '#999' }}>Duración</th>
                                        <th style={{ padding: '1rem', color: '#999' }}>Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {records.map((record) => (
                                        <tr key={record.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td style={{ padding: '1rem', fontSize: '0.9rem' }}>{formatDateTime(record.check_in)}</td>
                                            <td style={{ padding: '1rem', fontSize: '0.9rem' }}>{formatDateTime(record.check_out)}</td>
                                            <td style={{ padding: '1rem', fontWeight: 'bold' }}>{calculateDuration(record.check_in, record.check_out)}</td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: '4px',
                                                    backgroundColor: record.check_out ? 'rgba(76, 175, 80, 0.2)' : 'rgba(238, 21, 102, 0.2)',
                                                    color: record.check_out ? '#4CAF50' : '#EE1566',
                                                    fontSize: '0.8rem'
                                                }}>
                                                    {record.check_out ? 'Completado' : 'En curso'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Fichaje;
