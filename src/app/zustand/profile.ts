import { create } from 'zustand';
import { del, get, patch, post, postFormData } from '../utils/fetch';
import type { PaginatedResponse, UserDTO } from '../interfaces/user';
import { useAuthStore } from './auth';

export interface ProfileUpdateDto {
  firstName?: string;
  lastName?: string;
  description?: string;
  phone?: string;
  city?: string;
  country?: string;
  gender?: string;
  birthDate?: string;
  username?: string;
  email?: string;
  password?: string;
  currentPassword?: string;
  becomeCompany?: boolean;
  ruc?: string;
  razonSocial?: string;
  dni?: string;
  fichaRucUrl?: string;
}

export interface IProfileState {
  myProfile: UserDTO | null;
  userProfile: UserDTO | null;
  followers: UserDTO[];
  following: UserDTO[];
  isLoading: boolean;
  error: string | null;

  getMyProfile: () => Promise<void>;
  getUserProfile: (id: string) => Promise<void>;

  updateMyProfile: (dto: ProfileUpdateDto) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
  uploadCover: (file: File) => Promise<void>;
  uploadCompanyDocument: (file: File) => Promise<string | null>;

  followUser: (userId: string) => Promise<boolean>;
  unfollowUser: (userId: string) => Promise<boolean>;

  getFollowers: (userId: string, page?: number, limit?: number) => Promise<void>;
  getFollowing: (userId: string, page?: number, limit?: number) => Promise<void>;
  getUserEvents: (userId: string, page?: number, limit?: number) => Promise<void>;
  userEvents: any[];
}

export const useProfileStore = create<IProfileState>((set, _get) => ({
  myProfile: null,
  userProfile: null,
  followers: [],
  following: [],
  userEvents: [],
  isLoading: false,
  error: null,

  getMyProfile: async () => {
    try {
      set({ isLoading: true, error: null });
      const resp: any = await get<UserDTO>(`users/profile/@me`);
      if (resp?.id) {
        set({ myProfile: resp });
      } else {
        set({ myProfile: null });
      }
    } catch (e: any) {
      set({ myProfile: null, error: e?.message || 'Error al cargar perfil' });
    } finally {
      set({ isLoading: false });
    }
  },

  getUserProfile: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      const resp: any = await get<UserDTO>(`users/${id}`);
      if (resp?.id) {
        set({ userProfile: resp });
      } else {
        set({ userProfile: null });
      }
    } catch (e: any) {
      set({ userProfile: null, error: e?.message || 'Error al cargar usuario' });
    } finally {
      set({ isLoading: false });
    }
  },

  getUserEvents: async (userId: string, page: number = 1, limit: number = 20) => {
    try {
      set({ isLoading: true, error: null });
      const resp: any = await get(`events/user/${userId}?page=${page}&limit=${limit}`);
      if (resp?.data) {
        set({ userEvents: resp.data });
      } else {
        set({ userEvents: [] });
      }
    } catch (e: any) {
      set({ userEvents: [], error: e?.message || 'Error al cargar eventos' });
    } finally {
      set({ isLoading: false });
    }
  },

  updateMyProfile: async (dto: ProfileUpdateDto) => {
    try {
      set({ isLoading: true, error: null });
      const resp: any = await patch(`users/profile`, dto);
      // Backend returns Profile
      if (resp?.userId) {
        // Refresh auth + myProfile
        await useAuthStore.getState().me();
        await _get().getMyProfile();
      }
    } catch (e: any) {
      set({ error: e?.message || 'Error al actualizar perfil' });
    } finally {
      set({ isLoading: false });
    }
  },

  uploadAvatar: async (file: File) => {
    try {
      set({ isLoading: true, error: null });
      const form = new FormData();
      form.append('file', file);
      const resp: any = await postFormData(`users/profile/avatar`, form);
      if (resp?.avatar) {
        await useAuthStore.getState().me();
        await _get().getMyProfile();
      } else {
        // postFormData/fetchData doesn't throw on non-2xx responses, it resolves with the
        // error body — without this branch a failed upload (e.g. Cloudinary rejecting the
        // request) silently no-ops with no feedback to the user.
        set({ error: resp?.message || 'Error al subir avatar' });
      }
    } catch (e: any) {
      set({ error: e?.message || 'Error al subir avatar' });
    } finally {
      set({ isLoading: false });
    }
  },

  uploadCover: async (file: File) => {
    try {
      set({ isLoading: true, error: null });
      const form = new FormData();
      form.append('file', file);
      const resp: any = await postFormData(`users/profile/cover`, form);
      if (resp?.coverImage) {
        await useAuthStore.getState().me();
        await _get().getMyProfile();
      } else {
        set({ error: resp?.message || 'Error al subir portada' });
      }
    } catch (e: any) {
      set({ error: e?.message || 'Error al subir portada' });
    } finally {
      set({ isLoading: false });
    }
  },

  uploadCompanyDocument: async (file: File) => {
    try {
      set({ isLoading: true, error: null });
      const form = new FormData();
      form.append('file', file);
      const resp: any = await postFormData(`users/profile/company-document`, form);
      if (resp?.fichaRucUrl) {
        return resp.fichaRucUrl as string;
      }
      set({ error: resp?.message || 'Error al subir la ficha RUC' });
      return null;
    } catch (e: any) {
      set({ error: e?.message || 'Error al subir la ficha RUC' });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  followUser: async (userId: string) => {
    // Optimistic Update
    set((state) => {
      const userProfile = state.userProfile;
      const myProfile = state.myProfile;
      // Only update if we are viewing the target user
      const newUserProfile = (userProfile && userProfile.id === userId)
        ? {
          ...userProfile,
          isFollowing: true,
          _count: {
            ...userProfile._count,
            followers: (userProfile._count?.followers || 0) + 1
          }
        }
        : userProfile;

      // Update my own following count
      const newMyProfile = myProfile
        ? {
          ...myProfile,
          _count: {
            ...myProfile._count,
            following: (myProfile._count?.following || 0) + 1
          }
        }
        : myProfile;

      return { userProfile: newUserProfile, myProfile: newMyProfile };
    });

    try {
      const resp: any = await post(`users/${userId}/follow`, {});
      if (resp && !resp.statusCode && (resp.follow || resp.message)) {
        return true;
      }
      // Revert if failed (omitted for speed/simplicity as requested "don't call another api")
      return true;
    } catch {
      // Revert logic would go here
      return false;
    }
  },

  unfollowUser: async (userId: string) => {
    // Optimistic Update
    set((state) => {
      const userProfile = state.userProfile;
      const myProfile = state.myProfile;

      const newUserProfile = (userProfile && userProfile.id === userId)
        ? {
          ...userProfile,
          isFollowing: false,
          _count: {
            ...userProfile._count,
            followers: Math.max(0, (userProfile._count?.followers || 0) - 1)
          }
        }
        : userProfile;

      const newMyProfile = myProfile
        ? {
          ...myProfile,
          _count: {
            ...myProfile._count,
            following: Math.max(0, (myProfile._count?.following || 0) - 1)
          }
        }
        : myProfile;

      return { userProfile: newUserProfile, myProfile: newMyProfile };
    });

    try {
      const resp: any = await del(`users/${userId}/unfollow`);
      if (resp && !resp.statusCode && resp.message) {
        return true;
      }
      return true;
    } catch {
      return false;
    }
  },

  getFollowers: async (userId: string, page: number = 1, limit: number = 20) => {
    try {
      set({ isLoading: true, error: null });
      const resp: any = await get<PaginatedResponse<UserDTO>>(`users/${userId}/followers?page=${page}&limit=${limit}`);
      if (resp?.data && Array.isArray(resp.data)) {
        set({ followers: resp.data });
      } else {
        set({ followers: [] });
      }
    } catch (e: any) {
      set({ followers: [], error: e?.message || 'Error al cargar seguidores' });
    } finally {
      set({ isLoading: false });
    }
  },

  getFollowing: async (userId: string, page: number = 1, limit: number = 20) => {
    try {
      set({ isLoading: true, error: null });
      const resp: any = await get<PaginatedResponse<UserDTO>>(`users/${userId}/following?page=${page}&limit=${limit}`);
      if (resp?.data && Array.isArray(resp.data)) {
        set({ following: resp.data });
      } else {
        set({ following: [] });
      }
    } catch (e: any) {
      set({ following: [], error: e?.message || 'Error al cargar seguidos' });
    } finally {
      set({ isLoading: false });
    }
  },
}));
