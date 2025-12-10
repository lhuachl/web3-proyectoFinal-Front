/**
 * authStore.ts
 * Store de autenticación con Zustand
 * Principios:
 * - SRP: Solo maneja estado de autenticación
 * - KISS: Interfaz simple y directa
 * - DRY: Usa la API centralizada
 */

import { create } from 'zustand';
import { authApi } from '@/api/authApi';
import type { UserDto } from '@/types/api.types';

interface AuthStore {
  user: UserDto | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  initialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  hydrate: () => Promise<void>;
  clearError: () => void;
}

// Helpers para localStorage
const storage = {
  getToken: () => typeof window !== 'undefined' ? localStorage.getItem('authToken') : null,
  setToken: (token: string) => typeof window !== 'undefined' && localStorage.setItem('authToken', token),
  removeToken: () => typeof window !== 'undefined' && localStorage.removeItem('authToken'),
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: storage.getToken(),
  isLoading: false,
  error: null,
  initialized: false,

  clearError: () => set({ error: null }),

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.login({ email, password });

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Error de login');
      }

      const { token, user } = response.data;
      storage.setToken(token);
      set({ user, token, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error de login';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  signup: async (name: string, email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.register({ name, email, password });

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Error de registro');
      }

      const { token, user } = response.data;
      storage.setToken(token);
      set({ user, token, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error de registro';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  logout: () => {
    storage.removeToken();
    set({ user: null, token: null, error: null });
  },

  hydrate: async () => {
    set({ isLoading: true });
    try {
      const token = storage.getToken();

      if (!token) {
        set({ token: null, user: null, isLoading: false, initialized: true });
        return;
      }

      const response = await authApi.getCurrentUser();

      if (!response.success || !response.data) {
        storage.removeToken();
        set({ token: null, user: null, isLoading: false, initialized: true });
        return;
      }

      set({ user: response.data, token, isLoading: false, initialized: true });
    } catch {
      storage.removeToken();
      set({ token: null, user: null, isLoading: false, initialized: true });
    }
  },
}));
