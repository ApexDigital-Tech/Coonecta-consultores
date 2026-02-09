import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Loader2, ShieldAlert } from 'lucide-react';

interface AuthGuardProps {
    children: React.ReactNode;
    requireAdmin?: boolean;
    fallback?: React.ReactNode;
    onUnauthorized?: () => void;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
    children,
    requireAdmin = false,
    fallback,
    onUnauthorized,
}) => {
    const { user, loading, isAdmin } = useAuth();

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Verificando acceso...</p>
                </div>
            </div>
        );
    }

    // Not authenticated
    if (!user) {
        if (fallback) return <>{fallback}</>;
        if (onUnauthorized) {
            onUnauthorized();
            return null;
        }

        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShieldAlert className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Acceso Denegado</h2>
                    <p className="text-gray-600 mb-6">
                        Debes iniciar sesión para acceder a esta sección.
                    </p>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-900 transition-colors"
                    >
                        Volver al inicio
                    </button>
                </div>
            </div>
        );
    }

    // Requires admin but user is not admin
    if (requireAdmin && !isAdmin) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShieldAlert className="w-8 h-8 text-yellow-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Permisos Insuficientes</h2>
                    <p className="text-gray-600 mb-6">
                        No tienes permisos de administrador para acceder a esta sección.
                    </p>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-900 transition-colors"
                    >
                        Volver al inicio
                    </button>
                </div>
            </div>
        );
    }

    // All checks passed
    return <>{children}</>;
};

export default AuthGuard;
