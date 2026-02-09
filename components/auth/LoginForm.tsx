import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { X, Mail, Lock, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';

interface LoginFormProps {
    onClose: () => void;
    onSuccess: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onClose, onSuccess }) => {
    const { signIn, resetPassword } = useAuth();

    const [mode, setMode] = useState<'login' | 'forgot'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const { error } = await signIn(email, password);

        setLoading(false);

        if (error) {
            // Traducir errores comunes
            if (error.message.includes('Invalid login')) {
                setError('Email o contraseña incorrectos');
            } else if (error.message.includes('Email not confirmed')) {
                setError('Por favor confirma tu email antes de iniciar sesión');
            } else {
                setError(error.message);
            }
            return;
        }

        onSuccess();
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const { error } = await resetPassword(email);

        setLoading(false);

        if (error) {
            setError(error.message);
            return;
        }

        setSuccess('Te hemos enviado un email para restablecer tu contraseña');
    };

    return (
        <div className="min-h-screen bg-dark flex items-center justify-center p-4 relative">
            <button
                onClick={onClose}
                className="absolute top-8 right-8 text-gray-400 hover:text-white transition-colors"
                aria-label="Cerrar"
            >
                <X size={32} />
            </button>

            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md animate-fade-in">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-primary">
                        {mode === 'login' ? 'Acceso Administrativo' : 'Recuperar Contraseña'}
                    </h2>
                    <p className="text-gray-500 mt-2">
                        {mode === 'login'
                            ? 'Ingresa tus credenciales para acceder al CRM'
                            : 'Te enviaremos un enlace para restablecer tu contraseña'}
                    </p>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 animate-fade-in">
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                {/* Success Alert */}
                {success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg animate-fade-in">
                        <p className="text-sm text-green-700">{success}</p>
                    </div>
                )}

                {/* Login Form */}
                {mode === 'login' && (
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    required
                                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                    placeholder="admin@conectaconsultores.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Contraseña
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="password"
                                    required
                                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="current-password"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-blue-900 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Verificando...
                                </>
                            ) : (
                                'Ingresar'
                            )}
                        </button>

                        <div className="flex justify-between items-center pt-2">
                            <button
                                type="button"
                                onClick={() => setMode('forgot')}
                                className="text-sm text-gray-500 hover:text-primary transition-colors"
                            >
                                ¿Olvidaste tu contraseña?
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                Volver al sitio
                            </button>
                        </div>
                    </form>
                )}

                {/* Forgot Password Form */}
                {mode === 'forgot' && (
                    <form onSubmit={handleForgotPassword} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    required
                                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                    placeholder="tu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-secondary text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Enviando...
                                </>
                            ) : (
                                'Enviar Email de Recuperación'
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => { setMode('login'); setError(null); setSuccess(null); }}
                            className="w-full flex items-center justify-center gap-2 text-gray-500 hover:text-primary transition-colors py-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Volver al login
                        </button>
                    </form>
                )}

                {/* Footer */}
                <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                    <p className="text-xs text-gray-400">
                        Protegido con autenticación segura
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;
