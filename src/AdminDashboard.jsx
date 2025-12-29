import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import './ContactModal.css'; // Reusing standard styles

function AdminDashboard({ onBack }) {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Upload State
    const [uploading, setUploading] = useState(false);
    const [uploadApp, setUploadApp] = useState('SSS KRONOS DESKTOP');
    const [uploadVersion, setUploadVersion] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadMessage, setUploadMessage] = useState(null);

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

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!selectedFile || !uploadVersion) return;

        // Validate extension
        const fileName = selectedFile.name.toLowerCase();
        const isDesktop = uploadApp === 'SSS KRONOS DESKTOP';
        const requiredExt = isDesktop ? '.exe' : '.apk';

        if (!fileName.endsWith(requiredExt)) {
            setUploadMessage({ type: 'error', text: `El archivo debe ser ${requiredExt} para ${uploadApp}` });
            return;
        }

        setUploading(true);
        setUploadMessage(null);

        try {
            // 1. Upload to Storage
            // Path: apps/DESKTOP/1.0.0/filename.exe
            const filePath = `${uploadApp}/${uploadVersion}/${selectedFile.name}`;

            const { error: uploadError } = await supabase.storage
                .from('app-releases')
                .upload(filePath, selectedFile, {
                    cacheControl: '3600',
                    upsert: true
                });

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('app-releases')
                .getPublicUrl(filePath);

            // 3. Save to Database
            const { error: dbError } = await supabase
                .from('app_versions')
                .insert([
                    {
                        app_name: uploadApp,
                        version: uploadVersion,
                        file_url: publicUrl
                    }
                ]);

            if (dbError) throw dbError;

            setUploadMessage({ type: 'success', text: `Versión ${uploadVersion} subida correctamente!` });
            setUploadVersion('');
            setSelectedFile(null);
            // Reset file input manually if needed using ref, but simpler for now

        } catch (err) {
            console.error('Upload error:', err);
            setUploadMessage({ type: 'error', text: 'Error al subir archivo: ' + err.message });
        } finally {
            setUploading(false);
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '1rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '700', margin: 0 }}>Panel de Administración</h1>
                <button className="submit-btn" onClick={onBack} style={{ width: 'auto', padding: '0.8rem 1.5rem', backgroundColor: '#333', marginTop: 0 }}>
                    Volver a la Web
                </button>
            </div>

            <div className="features-grid" style={{ gridTemplateColumns: '1fr', gap: '2rem' }}>

                {/* UPLOAD SECTION */}
                <div className="feature-card" style={{ cursor: 'default' }}>
                    <h3 style={{ marginTop: 0, marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Subir Nueva Versión</h3>

                    <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '600px' }}>
                        <div className="form-group">
                            <label>Aplicación</label>
                            <select
                                value={uploadApp}
                                onChange={(e) => setUploadApp(e.target.value)}
                                style={{ padding: '0.8rem', borderRadius: '12px', border: '2px solid #eee', background: '#f9f9f9', fontSize: '1rem' }}
                            >
                                <option value="SSS KRONOS DESKTOP">SSS KRONOS DESKTOP (.exe)</option>
                                <option value="SSS KRONOS MOBILE">SSS KRONOS MOBILE (.apk)</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Versión (Ej: 1.0.5)</label>
                            <input
                                type="text"
                                value={uploadVersion}
                                onChange={(e) => setUploadVersion(e.target.value)}
                                placeholder="1.0.0"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Archivo ({uploadApp === 'SSS KRONOS DESKTOP' ? '.exe' : '.apk'})</label>
                            <input
                                type="file"
                                onChange={handleFileChange}
                                accept={uploadApp === 'SSS KRONOS DESKTOP' ? '.exe' : '.apk'}
                                required
                            />
                        </div>

                        {uploadMessage && (
                            <div style={{
                                padding: '1rem',
                                borderRadius: '8px',
                                backgroundColor: uploadMessage.type === 'error' ? 'rgba(255,0,0,0.1)' : 'rgba(0,255,0,0.1)',
                                color: uploadMessage.type === 'error' ? '#ff4444' : '#00cc00',
                                fontSize: '0.9rem'
                            }}>
                                {uploadMessage.text}
                            </div>
                        )}

                        <button type="submit" className="submit-btn" disabled={uploading}>
                            {uploading ? 'Subiendo...' : 'Publicar Versión'}
                        </button>
                    </form>
                </div>

                {/* MESSAGES SECTION */}
                <div className="feature-card" style={{ cursor: 'default' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ margin: 0 }}>Mensajes Recibidos</h3>
                        <button className="submit-btn" onClick={fetchMessages} style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.8rem', marginTop: 0 }}>
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
