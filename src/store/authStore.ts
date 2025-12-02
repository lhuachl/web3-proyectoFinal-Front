import { create } from 'zustand';
import type { User } from '../utility/schemas/auth';
import { authService } from '@/services/authService';
import { createCredentialValidator } from '@/services/credentialValidator';

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  initialized: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setError: (error: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  hydrate: () => Promise<void>;
}

/**
 * Obtener URL de la API desde variables de entorno
 * Fallback a http://localhost:3001 (JSON Server local)
 */
const getApiUrl = (): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  return 'http://localhost:3001';
};

/**
 * Crear validador basado en la URL de la API
 */
const validator = createCredentialValidator({
  apiUrl: getApiUrl(),
  timeout: 5000,
});

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('authToken') : null,
  isLoading: false,
  error: null,
  initialized: false,

  setUser: (user) => set({ user }),

  setToken: (token) => {
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('authToken', token);
      } else {
        localStorage.removeItem('authToken');
      }
    }
    set({ token });
  },

  setError: (error) => set({ error }),

  /**
   * Login usando el servicio desacoplado
   * El validador se inyecta como parámetro
   */
  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.login(
        email,
        password,
        validator.validateLogin
      );

      set({
        user: response.user,
        token: response.token,
        isLoading: false,
      });

      // Persistir token
      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', response.token);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error de login';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  /**
   * Signup usando el servicio desacoplado
   */
  signup: async (name: string, email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.signup(
        name,
        email,
        password,
        validator.validateSignup
      );

      set({
        user: response.user,
        token: response.token,
        isLoading: false,
      });

      // Persistir token
      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', response.token);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error de signup';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  logout: () => {
    set({ user: null, token: null, error: null });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
  },

  /**
   * Hidratación: restaurar sesión desde token en localStorage
   */
  hydrate: async () => {
    set({ isLoading: true });
    try {
      const token =
        typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

      if (token) {
        // Validar el token contra la API
        const user = await authService.verifyToken(
          token,
          validator.validateToken
        );

        set({
          user,
          token,
          isLoading: false,
          initialized: true,
        });
      } else {
        set({
          token: null,
          user: null,
          isLoading: false,
          initialized: true,
        });
      }
    } catch {
      // Token inválido, limpiar
      set({
        token: null,
        user: null,
        isLoading: false,
        initialized: true,
      });

      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
      }
    }
  },
}));
