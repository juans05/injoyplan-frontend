import { create } from 'zustand';
import { get, post } from '../utils/fetch';
import { IEmail, IResponse } from '../interfaces/auth';
import { IUser } from '../interfaces/auth';
import useAlertStore from './alert';

export interface IAuthState {
    signIn: (data: any) => Promise<any>;
    auth: IUser | null;
    me: () => Promise<void>;
    logout: () => void;
    login: (data: any) => Promise<{ success: boolean; message?: string }>;
    sendEmail: (email: IEmail) => Promise<void>
    verifyCode: (email: string, code: string) => Promise<boolean>;
    forgotPassword: (email: string) => Promise<{ success: boolean; message?: string }>;
    resetPassword: (data: any) => Promise<{ success: boolean; message?: string }>;
    success: boolean
}

export const useAuthStore = create<IAuthState>((set, _get) => ({
    success: false,
    auth: null,
    login: async (data: any) => {
        try {
            const resp: any = await post(`auth/login`, data);
            console.log(resp)
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
        } catch (error: any) {
            return { success: false, message: error?.message || "El usuario o contraseña son incorrectas" };
        }
    },
    signIn: async (data: any) => {
        try {
            const resp: any = await post(`auth/register`, data);
            console.log(resp)
            if (resp.userId) {
                // Return response to allow component to handle step change
                return resp;
            }
        } catch (error: any) {
            useAlertStore.getState().alert(error?.message || "Error al registrar usuario", "error");
            throw error;
        }
    },
    me: async () => {
        try {
            const user: any = await get(`auth/me`);
            console.log(user)
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
            const resp: any = await post(`newsletter/subscribe`, email);
            console.log(resp)
            if (resp.message) {
                useAlertStore.getState().alert(resp.message, "success");
            }
        } catch (error: any) {
            useAlertStore.getState().alert(error?.message || "Error al suscribir", "error");
        }
    },
    verifyCode: async (email: string, code: string) => {
        try {
            const resp: any = await post(`auth/verify-code`, { email, code });

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
        } catch (error: any) {
            useAlertStore.getState().alert(error?.message || "Código inválido", "error");
            throw error;
        }
    },
    forgotPassword: async (email: string) => {
        try {
            const resp: any = await post(`auth/forgot-password`, { email });
            return { success: true, message: resp.message };
        } catch (error: any) {
            useAlertStore.getState().alert(error?.message || "Error al solicitar recuperación", "error");
            return { success: false, message: error?.message };
        }
    },
    resetPassword: async (data: any) => {
        try {
            const resp: any = await post(`auth/reset-password`, data);
            useAlertStore.getState().alert(resp.message || "Contraseña restablecida", "success");
            return { success: true };
        } catch (error: any) {
            useAlertStore.getState().alert(error?.message || "Error al restablecer contraseña", "error");
            return { success: false, message: error?.message };
        }
    },
    logout: () => {
        if (typeof window !== "undefined") {
            localStorage.removeItem("token");
            set({ auth: null, success: false });
        }
    },
}));
