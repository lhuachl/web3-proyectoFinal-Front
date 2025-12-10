/**
 * authApi.ts
 * API de autenticación - Capa de comunicación con el backend
 * Principio: SRP - Solo maneja llamadas de autenticación
 */

import { apiConfig } from '@/config/api.config';
import { httpClient } from '@/lib/httpClient';
import type { 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest, 
  UserDto 
} from '@/types/api.types';

export const authApi = {
  /**
   * Iniciar sesión
   */
  async login(credentials: LoginRequest): Promise<{ 
    success: boolean; 
    data?: AuthResponse; 
    message?: string; 
  }> {
    return httpClient.post<AuthResponse>(
      apiConfig.endpoints.auth.login,
      credentials
    );
  },

  /**
   * Registrar nuevo usuario
   */
  async register(data: RegisterRequest): Promise<{ 
    success: boolean; 
    data?: AuthResponse; 
    message?: string; 
  }> {
    return httpClient.post<AuthResponse>(
      apiConfig.endpoints.auth.register,
      data
    );
  },

  /**
   * Obtener usuario actual (validar token)
   */
  async getCurrentUser(): Promise<{ 
    success: boolean; 
    data?: UserDto; 
    message?: string; 
  }> {
    return httpClient.get<UserDto>(apiConfig.endpoints.auth.me);
  },

  /**
   * Refrescar token
   */
  async refreshToken(refreshToken: string): Promise<{ 
    success: boolean; 
    data?: AuthResponse; 
    message?: string; 
  }> {
    return httpClient.post<AuthResponse>(
      apiConfig.endpoints.auth.refresh,
      { refreshToken }
    );
  },
};
