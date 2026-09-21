import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import './ContactModal.css';

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
        <div className="admin-page">
            <div className="admin-header">
                <h1>Panel de administración</h1>
                <button className="doc-btn" onClick={onBack}>
                    Volver
                </button>
            </div>

            <div className="admin-card">
                <div className="admin-header" style={{ marginBottom: '1rem' }}>
                    <h3>Mensajes recibidos</h3>
                    <button className="download-btn compact" onClick={fetchMessages}>
                        Actualizar
                    </button>
                </div>

                {loading ? (
                    <p>Cargando mensajes...</p>
                ) : error ? (
                    <p style={{ color: 'var(--error)' }}>{error}</p>
                ) : messages.length === 0 ? (
                    <p>No hay mensajes nuevos.</p>
                ) : (
                    <div style={{ overflowX: 'auto', width: '100%' }}>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Nombre</th>
                                    <th>Asunto</th>
                                    <th>Mensaje</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {messages.map((msg) => (
                                    <tr key={msg.id}>
                                        <td style={{ whiteSpace: 'nowrap' }}>{formatDate(msg.created_at)}</td>
                                        <td style={{ fontWeight: 700 }}>{msg.name}</td>
                                        <td>{msg.subject}</td>
                                        <td style={{ minWidth: '200px', lineHeight: 1.5 }}>{msg.message}</td>
                                        <td>
                                            <span className={msg.status === 'nuevo' ? 'status-nuevo' : 'status-recibido'}>
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
    );
}

export default AdminDashboard;
