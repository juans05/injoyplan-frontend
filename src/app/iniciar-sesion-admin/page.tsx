"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import { useAuthStore } from '@/app/zustand/auth';
import Image from 'next/image';
import Link from 'next/link';

export default function AdminLoginPage() {
    const router = useRouter();
    const { login } = useAuthStore();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const result = await login({ email, password });

            if (result && !result.success) {
                setError(result.message || "Credenciales inválidas");
                setLoading(false);
                return;
            }

            // Same rule as the backend AdminGuard. auth/me always includes `role`
            // (older backends omit it from the login response)
            await useAuthStore.getState().me();
            if (useAuthStore.getState().auth?.role === 'ADMIN') {
                router.push('/admin');
            } else {
                setError('Acceso denegado. No tienes permisos de administrador.');
                setLoading(false);
            }
        } catch (err) {
            setError('Error al iniciar sesión. Por favor, intenta de nuevo.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMTIxMjEiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0aDRWMGgtNHYxNHptMCAzNmg0VjMwaC00djIwem0tMjAtMjBoNFYwaC00djMwem0wIDIwaDBWMzBoLTR2MjBoNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40"></div>

            {/* Login Card */}
            <div className="w-full max-w-md relative">
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 md:p-10">
                    {/* Lock Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                            <Icon icon="solar:lock-password-bold" className="text-slate-700 text-3xl" />
                        </div>
                    </div>

                    {/* Title */}
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-slate-800 mb-2">Acceso al Sistema</h1>
                        <p className="text-sm text-slate-500">Ingresa tus credenciales para continuar</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 animate-fadeIn">
                            <Icon icon="solar:danger-triangle-bold" className="text-red-500 text-xl flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">
                                Correo Electrónico
                            </label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                    <Icon icon="solar:user-bold" className="text-slate-400" width={20} />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-slate-600 focus:ring-2 focus:ring-slate-600/20 transition-all bg-white"
                                    placeholder="admin@ejemplo.com"
                                    required
                                    autoComplete="username"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">
                                Contraseña
                            </label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                    <Icon icon="solar:lock-password-bold" className="text-slate-400" width={20} />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-slate-600 focus:ring-2 focus:ring-slate-600/20 transition-all bg-white"
                                    placeholder="••••••••"
                                    required
                                    autoComplete="current-password"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-800 hover:bg-slate-900 text-white font-semibold py-3.5 rounded-lg shadow-lg hover:shadow-xl transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Icon icon="svg-spinners:ring-resize" width={20} />
                                    <span>Verificando...</span>
                                </>
                            ) : (
                                <>
                                    <Icon icon="solar:login-3-bold" width={20} />
                                    <span>Acceder</span>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-8 pt-6 border-t border-slate-200">
                        <p className="text-center text-xs text-slate-400">
                            Sistema de administración • Acceso restringido
                        </p>
                    </div>
                </div>

                {/* Subtle Home Link (for escape route if needed) */}
                <div className="mt-4 text-center">
                    <Link
                        href="/"
                        className="text-xs text-slate-400 hover:text-slate-300 transition-colors inline-flex items-center gap-1"
                    >
                        <Icon icon="solar:home-2-linear" width={14} />
                        Volver al inicio
                    </Link>
                </div>
            </div>
        </div>
    );
}
