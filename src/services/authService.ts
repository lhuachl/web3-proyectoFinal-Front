/**
 * authService.ts
 * Servicio desacoplado de autenticación
 * Maneja solo la lógica de login/logout
 * La validación de credenciales viene de un validador externo
 */

import type { User } from '@/utility/schemas/auth';

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ValidationResult {
  success: boolean;
  token?: string;
  user?: User;
  error?: string;
}

/**
 * Realiza el login sin validar credenciales
 * La validación viene del validador inyectado
 */
export const authService = {
  /**
   * Login con validador inyectado
   * @param email - Email del usuario
   * @param password - Contraseña del usuario
   * @param validator - Función que valida las credenciales contra la API/DB
   * @returns Promise con token y usuario si es exitoso
   */
  async login(
    email: string,
    password: string,
    validator: (email: string, password: string) => Promise<ValidationResult>
  ): Promise<AuthResponse> {
    try {
      // Delegar validación al validador inyectado
      const result = await validator(email, password);

      if (!result.success) {
        throw new Error(result.error || 'Validación fallida');
      }

      if (!result.token || !result.user) {
        throw new Error('Token o usuario no recibido');
      }

      return {
        token: result.token,
        user: result.user,
      };
    } catch (error) {
      throw error;
    }
  },

  /**
   * Signup con validador inyectado
   * @param name - Nombre del usuario
   * @param email - Email del usuario
   * @param password - Contraseña del usuario
   * @param validator - Función que registra el usuario en la API/DB
   * @returns Promise con token y usuario si es exitoso
   */
  async signup(
    name: string,
    email: string,
    password: string,
    validator: (
      name: string,
      email: string,
      password: string
    ) => Promise<ValidationResult>
  ): Promise<AuthResponse> {
    try {
      const result = await validator(name, email, password);

      if (!result.success) {
        throw new Error(result.error || 'Registro fallido');
      }

      if (!result.token || !result.user) {
        throw new Error('Token o usuario no recibido');
      }

      return {
        token: result.token,
        user: result.user,
      };
    } catch (error) {
      throw error;
    }
  },

  /**
   * Verifica si el token es válido
   * @param token - Token a validar
   * @param validator - Función que valida el token en la API/DB
   * @returns Promise con el usuario si el token es válido
   */
  async verifyToken(
    token: string,
    validator: (token: string) => Promise<ValidationResult>
  ): Promise<User> {
    try {
      const result = await validator(token);

      if (!result.success) {
        throw new Error(result.error || 'Token inválido');
      }

      if (!result.user) {
        throw new Error('Usuario no encontrado');
      }

      return result.user;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Logout (solo limpia datos locales)
   */
  logout(): void {
    // La lógica de logout es simple: limpiar datos locales
    // El backend debería invalidar el token si es necesario
  },
};
