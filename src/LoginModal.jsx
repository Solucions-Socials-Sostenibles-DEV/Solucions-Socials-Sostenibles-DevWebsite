import { useState } from 'react';
import { supabase } from './supabaseClient';
import './ContactModal.css'; // Reusing styles

function LoginModal({ isOpen, onClose, onLoginSuccess }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // 1. Authenticate with Supabase
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) throw authError;

            if (authData.user) {
                // 2. Check User Role in 'user_profiles'
                const { data: profileData, error: profileError } = await supabase
                    .from('user_profiles')
                    .select('role')
                    .eq('id', authData.user.id)
                    .single();

                if (profileError) {
                    console.error('Error fetching profile:', profileError);
                    // If profile not found but auth succeeded, decided to deny access to be safe
                    // OR allow if you want basic users. But requirement is 'admin' only.
                    throw new Error('No se pudo verificar el perfil del usuario.');
                }

                if (profileData.role !== 'admin') {
                    // Not an admin, sign out immediately
                    await supabase.auth.signOut();
                    throw new Error('Acceso denegado. Solo administradores pueden entrar.');
                }

                // 3. Success
                onLoginSuccess(authData.user);
                onClose();
                setEmail('');
                setPassword('');
            }

        } catch (err) {
            console.error('Login error:', err);
            setError(err.message || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="contact-overlay" onClick={onClose}>
            <div className="contact-modal" onClick={e => e.stopPropagation()}>
                <button className="contact-close" onClick={onClose}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                </button>

                <h2>Iniciar Sesión</h2>
                <p className="contact-subtitle">Acceso restringido a administradores.</p>

                {error && (
                    <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '0.8rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="contact-form">
                    <div className="form-group">
                        <label htmlFor="email">Correo Electrónico</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loading}
                            placeholder="nombre@ejemplo.com"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Contraseña</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={loading}
                            placeholder="••••••••"
                        />
                    </div>

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Verificando...' : 'Entrar'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default LoginModal;
