import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import './ContactModal.css'; // Reusing standard styles

function AdminDashboard({ onBack }) {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('contact_messages')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setMessages(data || []);
        } catch (err) {
            console.error('Error fetching messages:', err);
            setError('No se pudieron cargar los mensajes. ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('es-ES', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', paddingTop: '100px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '700' }}>Panel de Administración</h1>
                <button className="submit-btn" onClick={onBack} style={{ width: 'auto', padding: '0.5rem 1.5rem', backgroundColor: '#333' }}>
                    Volver a la Web
                </button>
            </div>

            <div className="features-grid" style={{ gridTemplateColumns: '1fr' }}>
                <div className="feature-card" style={{ cursor: 'default' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ margin: 0 }}>Mensajes Recibidos</h3>
                        <button className="submit-btn" onClick={fetchMessages} style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                            Actualizar
                        </button>
                    </div>

                    {loading ? (
                        <p>Cargando mensajes...</p>
                    ) : error ? (
                        <p style={{ color: 'red' }}>{error}</p>
                    ) : messages.length === 0 ? (
                        <p>No hay mensajes nuevos.</p>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.1)' }}>
                                        <th style={{ padding: '1rem', color: '#999' }}>Fecha</th>
                                        <th style={{ padding: '1rem', color: '#999' }}>Nombre</th>
                                        <th style={{ padding: '1rem', color: '#999' }}>Asunto</th>
                                        <th style={{ padding: '1rem', color: '#999' }}>Mensaje</th>
                                        <th style={{ padding: '1rem', color: '#999' }}>Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {messages.map((msg) => (
                                        <tr key={msg.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td style={{ padding: '1rem', whiteSpace: 'nowrap', fontSize: '0.9rem' }}>{formatDate(msg.created_at)}</td>
                                            <td style={{ padding: '1rem', fontWeight: 'bold' }}>{msg.name}</td>
                                            <td style={{ padding: '1rem' }}>{msg.subject}</td>
                                            <td style={{ padding: '1rem', maxWidth: '300px', lineHeight: '1.5' }}>{msg.message}</td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: '4px',
                                                    backgroundColor: msg.status === 'nuevo' ? 'rgba(238, 21, 102, 0.2)' : 'rgba(255,255,255,0.1)',
                                                    color: msg.status === 'nuevo' ? '#EE1566' : '#999',
                                                    fontSize: '0.8rem'
                                                }}>
                                                    {msg.status || 'recibido'}
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

export default AdminDashboard;
