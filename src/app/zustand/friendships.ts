import { create } from 'zustand';
import { del, get, patch, post } from '../utils/fetch';
import type { UserDTO } from '../interfaces/user';

export type FriendshipStatus = 'NONE' | 'PENDING_SENT' | 'PENDING_RECEIVED' | 'FRIENDS';

export interface SearchedUser extends UserDTO {
  friendshipId?: string;
  friendshipStatus: FriendshipStatus;
}

export interface PendingRequest {
  id: string;
  userId: string;
  friendId: string;
  status: string;
  createdAt: string;
  user: UserDTO;
}

export interface Friend {
  id: string;
  userId: string;
  friendId: string;
  status: string;
  user: UserDTO;
  friend: UserDTO;
}

export interface IFriendshipsState {
  searchResults: SearchedUser[];
  friends: Friend[];
  pendingRequests: PendingRequest[];
  isLoading: boolean;
  error: string | null;

  searchUsers: (q: string) => Promise<void>;
  inviteByEmail: (email: string) => Promise<{ success: boolean; message?: string }>;
  sendRequest: (friendId: string) => Promise<boolean>;
  acceptRequest: (friendshipId: string) => Promise<boolean>;
  rejectRequest: (friendshipId: string) => Promise<boolean>;
  removeFriend: (friendshipId: string) => Promise<boolean>;
  getFriends: () => Promise<void>;
  getPendingRequests: () => Promise<void>;
}

export const useFriendshipsStore = create<IFriendshipsState>((set, _get) => ({
  searchResults: [],
  friends: [],
  pendingRequests: [],
  isLoading: false,
  error: null,

  searchUsers: async (q: string) => {
    if (!q || q.trim().length < 2) {
      set({ searchResults: [] });
      return;
    }
    try {
      set({ isLoading: true, error: null });
      const resp: any = await get(`users/search?q=${encodeURIComponent(q)}`);
      set({ searchResults: Array.isArray(resp?.data) ? resp.data : [] });
    } catch (e: any) {
      set({ searchResults: [], error: e?.message || 'Error al buscar usuarios' });
    } finally {
      set({ isLoading: false });
    }
  },

  inviteByEmail: async (email: string) => {
    try {
      set({ isLoading: true, error: null });
      const resp: any = await post(`friendships/invite`, { email });
      if (resp?.message && !resp?.statusCode) {
        return { success: true, message: resp.message };
      }
      return { success: false, message: resp?.message || 'No se pudo enviar la invitación' };
    } catch (e: any) {
      return { success: false, message: e?.message || 'No se pudo enviar la invitación' };
    } finally {
      set({ isLoading: false });
    }
  },

  sendRequest: async (friendId: string) => {
    try {
      await post(`friendships/request`, { friendId });
      set((state) => ({
        searchResults: state.searchResults.map((u) =>
          u.id === friendId ? { ...u, friendshipStatus: 'PENDING_SENT' } : u,
        ),
      }));
      return true;
    } catch (e: any) {
      set({ error: e?.message || 'Error al enviar solicitud' });
      return false;
    }
  },

  acceptRequest: async (friendshipId: string) => {
    try {
      await patch(`friendships/${friendshipId}/accept`, {});
      set((state) => ({ pendingRequests: state.pendingRequests.filter((r) => r.id !== friendshipId) }));
      await _get().getFriends();
      return true;
    } catch (e: any) {
      set({ error: e?.message || 'Error al aceptar solicitud' });
      return false;
    }
  },

  rejectRequest: async (friendshipId: string) => {
    try {
      await patch(`friendships/${friendshipId}/reject`, {});
      set((state) => ({ pendingRequests: state.pendingRequests.filter((r) => r.id !== friendshipId) }));
      return true;
    } catch (e: any) {
      set({ error: e?.message || 'Error al rechazar solicitud' });
      return false;
    }
  },

  removeFriend: async (friendshipId: string) => {
    try {
      await del(`friendships/${friendshipId}`);
      set((state) => ({ friends: state.friends.filter((f) => f.id !== friendshipId) }));
      return true;
    } catch (e: any) {
      set({ error: e?.message || 'Error al eliminar amistad' });
      return false;
    }
  },

  getFriends: async () => {
    try {
      set({ isLoading: true, error: null });
      const resp: any = await get(`friendships`);
      set({ friends: Array.isArray(resp) ? resp : [] });
    } catch (e: any) {
      set({ friends: [], error: e?.message || 'Error al cargar amigos' });
    } finally {
      set({ isLoading: false });
    }
  },

  getPendingRequests: async () => {
    try {
      const resp: any = await get(`friendships/pending`);
      set({ pendingRequests: Array.isArray(resp) ? resp : [] });
    } catch (e: any) {
      set({ pendingRequests: [], error: e?.message || 'Error al cargar solicitudes' });
    }
  },
}));
