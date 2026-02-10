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
        <div className="min-h-screen bg-dark flex items-center justify-center p-6 relative overflow-hidden font-display">
            {/* Background elements */}
            <div className="absolute inset-0 mesh-gradient opacity-30" />
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary/10 blur-[120px] rounded-full animate-pulse" />

            <button
                onClick={onClose}
                className="absolute top-10 right-10 text-white/40 hover:text-white transition-all hover:scale-110 z-50 p-2 bg-white/5 rounded-full backdrop-blur-md border border-white/10"
                aria-label="Cerrar"
            >
                <X size={28} />
            </button>

            <div className="glass-dark p-12 rounded-[3.5rem] shadow-premium w-full max-w-lg animate-zoom-in relative z-10 border border-white/10">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="mb-8 md:mb-10 p-6 md:p-8 glass rounded-[2.5rem] shadow-premium animate-float ring-1 ring-white/30 inline-block">
                        <img
                            src="/conecta-logo.png"
                            alt="COONECTA"
                            className="w-40 md:w-48 h-auto object-contain brightness-0 invert"
                        />
                    </div>
                    <h2 className="text-3xl font-black text-white tracking-tighter italic uppercase">
                        {mode === 'login' ? 'Acceso Premium' : 'Restablecer'}
                    </h2>
                    <p className="text-white/50 mt-4 font-medium">
                        {mode === 'login'
                            ? 'Gestión estratégica de impacto social'
                            : 'Recupera tu acceso al panel de control'}
                    </p>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="mb-8 p-5 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
                        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-200 font-bold">{error}</p>
                    </div>
                )}

                {/* Success Alert */}
                {success && (
                    <div className="mb-8 p-5 bg-secondary/10 border border-secondary/30 rounded-2xl animate-in fade-in slide-in-from-top-4 duration-300">
                        <p className="text-sm text-secondary font-black uppercase tracking-widest">{success}</p>
                    </div>
                )}

                {/* Login Form */}
                {mode === 'login' && (
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-white/40 uppercase tracking-[0.3em] ml-4">
                                Credencial Digital
                            </label>
                            <div className="relative group">
                                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-accent transition-colors" />
                                <input
                                    type="email"
                                    required
                                    className="w-full h-16 pl-14 pr-6 bg-white/5 border border-white/10 rounded-2xl text-white font-bold outline-none focus:ring-4 ring-accent/20 transition-all shadow-inner-premium placeholder:text-white/10"
                                    placeholder="admin@coonecta.org"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-white/40 uppercase tracking-[0.3em] ml-4">
                                Clave de Acceso
                            </label>
                            <div className="relative group">
                                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-accent transition-colors" />
                                <input
                                    type="password"
                                    required
                                    className="w-full h-16 pl-14 pr-6 bg-white/5 border border-white/10 rounded-2xl text-white font-bold outline-none focus:ring-4 ring-accent/20 transition-all shadow-inner-premium placeholder:text-white/10"
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
                            className="w-full h-20 bg-primary text-white font-black uppercase tracking-[0.2em] rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-primary/20 text-lg italic flex items-center justify-center gap-4 disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-6 h-6 animate-spin text-accent" />
                                    Validando...
                                </>
                            ) : (
                                'Iniciar Sesión'
                            )}
                        </button>

                        <div className="flex flex-col gap-4 text-center pt-4">
                            <button
                                type="button"
                                onClick={() => setMode('forgot')}
                                className="text-xs font-black text-white/30 hover:text-white uppercase tracking-widest transition-colors"
                            >
                                ¿Problemas de acceso?
                            </button>
                        </div>
                    </form>
                )}

                {/* Forgot Password Form */}
                {mode === 'forgot' && (
                    <form onSubmit={handleForgotPassword} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-white/40 uppercase tracking-[0.3em] ml-4">
                                Email de Recuperación
                            </label>
                            <div className="relative group">
                                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-accent transition-colors" />
                                <input
                                    type="email"
                                    required
                                    className="w-full h-16 pl-14 pr-6 bg-white/5 border border-white/10 rounded-2xl text-white font-bold outline-none focus:ring-4 ring-accent/20 transition-all shadow-inner-premium placeholder:text-white/10"
                                    placeholder="tu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-20 bg-secondary text-white font-black uppercase tracking-[0.2em] rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-secondary/20 text-lg italic flex items-center justify-center gap-4 disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                    Enviando...
                                </>
                            ) : (
                                'Enviar Enlace'
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => { setMode('login'); setError(null); setSuccess(null); }}
                            className="w-full flex items-center justify-center gap-2 text-white/30 hover:text-white font-black uppercase tracking-widest transition-colors text-xs py-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Regresar
                        </button>
                    </form>
                )}

                {/* Footer */}
                <div className="mt-12 pt-8 border-t border-white/5 text-center">
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">
                        SISTEMA DE SEGURIDAD COONECTA 2026
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;
