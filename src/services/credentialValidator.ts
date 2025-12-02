/**
 * credentialValidator.ts
 * Validadores de credenciales desacoplados
 * Pueden conectarse a diferentes fuentes: API real, JSON Server, Mock DB
 */

import type { ValidationResult } from './authService';
import type { User } from '@/utility/schemas/auth';

/**
 * Configuración del validador
 */
export interface ValidatorConfig {
  apiUrl: string;
  timeout?: number;
}

/**
 * Factory para crear validadores según la configuración
 */
export const createCredentialValidator = (config: ValidatorConfig) => {
  const baseUrl = config.apiUrl.replace(/\/$/, ''); // Remover trailing slash
  const timeout = config.timeout || 5000;

  /**
   * Valida login contra API/JSON Server/DB local
   */
  const validateLogin = async (
    email: string,
    password: string
  ): Promise<ValidationResult> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        return {
          success: false,
          error: error.message || `Error ${response.status}`,
        };
      }

      const data = await response.json();

      // Validar que la respuesta tenga los campos requeridos
      if (!data.token || !data.user) {
        return {
          success: false,
          error: 'Respuesta inválida del servidor',
        };
      }

      return {
        success: true,
        token: data.token,
        user: data.user as User,
      };
    } catch (error) {
      if (error instanceof TypeError && error.name === 'AbortError') {
        return {
          success: false,
          error: `Timeout después de ${timeout}ms`,
        };
      }

      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Error de conexión',
      };
    }
  };

  /**
   * Valida signup contra API/JSON Server/DB local
   */
  const validateSignup = async (
    name: string,
    email: string,
    password: string
  ): Promise<ValidationResult> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(`${baseUrl}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        return {
          success: false,
          error: error.message || `Error ${response.status}`,
        };
      }

      const data = await response.json();

      if (!data.token || !data.user) {
        return {
          success: false,
          error: 'Respuesta inválida del servidor',
        };
      }

      return {
        success: true,
        token: data.token,
        user: data.user as User,
      };
    } catch (error) {
      if (error instanceof TypeError && error.name === 'AbortError') {
        return {
          success: false,
          error: `Timeout después de ${timeout}ms`,
        };
      }

      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Error de conexión',
      };
    }
  };

  /**
   * Valida token contra API/JSON Server/DB local
   */
  const validateToken = async (token: string): Promise<ValidationResult> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(`${baseUrl}/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return {
          success: false,
          error: 'Token inválido o expirado',
        };
      }

      const data = await response.json();

      if (!data.user) {
        return {
          success: false,
          error: 'Usuario no encontrado',
        };
      }

      return {
        success: true,
        user: data.user as User,
      };
    } catch (error) {
      if (error instanceof TypeError && error.name === 'AbortError') {
        return {
          success: false,
          error: `Timeout después de ${timeout}ms`,
        };
      }

      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Error de conexión',
      };
    }
  };

  return {
    validateLogin,
    validateSignup,
    validateToken,
  };
};

/**
 * Tipos exportados para usar en otros lugares
 */
export type CredentialValidator = ReturnType<
  typeof createCredentialValidator
>;
