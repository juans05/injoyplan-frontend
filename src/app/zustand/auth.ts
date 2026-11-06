import { create } from 'zustand';
import { get, post } from '../utils/fetch';
import { IEmail, IUser, LoginInput, LoginResponse, RegisterInput, ResetPasswordInput } from '../interfaces/auth';
import useAlertStore from './alert';

export interface IAuthState {
    signIn: (data: RegisterInput) => Promise<{ userId?: string; email?: string; message?: string } | undefined>;
    auth: IUser | null;
    me: () => Promise<void>;
    logout: () => void;
    login: (data: LoginInput) => Promise<{ success: boolean; message?: string }>;
    sendEmail: (email: IEmail) => Promise<void>
    verifyCode: (email: string, code: string) => Promise<boolean>;
    forgotPassword: (email: string) => Promise<{ success: boolean; message?: string }>;
    resetPassword: (data: ResetPasswordInput) => Promise<{ success: boolean; message?: string }>;
    success: boolean
    // Global login/register modal (rendered by the Header) so any page can request it
    authModal: { open: boolean; register: boolean }
    openAuthModal: (register?: boolean) => void
    closeAuthModal: () => void
}

export const useAuthStore = create<IAuthState>((set, _get) => ({
    success: false,
    auth: null,
    authModal: { open: false, register: false },
    openAuthModal: (register = false) => set({ authModal: { open: true, register } }),
    closeAuthModal: () => set({ authModal: { open: false, register: false } }),
    login: async (data) => {
        try {
            const resp = await post<LoginResponse>(`auth/login`, data);
            if (resp.accessToken && resp.user) {
                localStorage.setItem("token", resp.accessToken);
                if (resp.refreshToken) {
                    localStorage.setItem("refreshToken", resp.refreshToken);
                }
                set({ auth: resp.user, success: true });
                return { success: true };
            } else {
                set({ auth: null })
                return { success: false, message: resp?.message || "La contraseña o el usuario son incorrectos" };
            }
        } catch (error) {
            return { success: false, message: (error as Error)?.message || "El usuario o contraseña son incorrectas" };
        }
    },
    signIn: async (data) => {
        try {
            const resp = await post<{ userId?: string; email?: string; message?: string }>(`auth/register`, data);
            if (resp.userId) {
                // Return response to allow component to handle step change
                return resp;
            }
        } catch (error) {
            useAlertStore.getState().alert((error as Error)?.message || "Error al registrar usuario", "error");
            throw error;
        }
    },
    me: async () => {
        try {
            const user = await get<IUser>(`auth/me`);
            if (user && user.id) {
                set({ auth: user });
            } else {
                set({ auth: null })
            }
        } catch (error) {
            set({ auth: null })
        }
    },
    sendEmail: async (email: IEmail) => {
        try {
            const resp = await post<{ message?: string }>(`newsletter/subscribe`, email);
            if (resp.message) {
                useAlertStore.getState().alert(resp.message, "success");
            }
        } catch (error) {
            useAlertStore.getState().alert((error as Error)?.message || "Error al suscribir", "error");
        }
    },
    verifyCode: async (email: string, code: string) => {
        try {
            const resp = await post<LoginResponse>(`auth/verify-code`, { email, code });

            // Backend returns { accessToken, refreshToken } on success, no "user" object
            if (resp.accessToken) {
                localStorage.setItem("token", resp.accessToken);
                if (resp.refreshToken) {
                    localStorage.setItem("refreshToken", resp.refreshToken);
                }

                // Fetch user profile immediately
                await _get().me();

                set({ success: true });
                return true;
            }
            return false;
        } catch (error) {
            useAlertStore.getState().alert((error as Error)?.message || "Código inválido", "error");
            throw error;
        }
    },
    forgotPassword: async (email: string) => {
        try {
            const resp = await post<{ message?: string }>(`auth/forgot-password`, { email });
            return { success: true, message: resp.message };
        } catch (error) {
            useAlertStore.getState().alert((error as Error)?.message || "Error al solicitar recuperación", "error");
            return { success: false, message: (error as Error)?.message };
        }
    },
    resetPassword: async (data) => {
        try {
            const resp = await post<{ message?: string }>(`auth/reset-password`, data);
            useAlertStore.getState().alert(resp.message || "Contraseña restablecida", "success");
            return { success: true };
        } catch (error) {
            useAlertStore.getState().alert((error as Error)?.message || "Error al restablecer contraseña", "error");
            return { success: false, message: (error as Error)?.message };
        }
    },
    logout: () => {
        if (typeof window !== "undefined") {
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            set({ auth: null, success: false });
        }
    },
}));
