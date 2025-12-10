/**
 * httpClient.ts
 * Cliente HTTP genérico y reutilizable
 * Principios: 
 * - SRP: Solo maneja peticiones HTTP
 * - DRY: Lógica centralizada de headers y manejo de errores
 * - KISS: Interfaz simple y directa
 */

import { apiConfig } from '@/config/api.config';
import type { ApiResponse } from '@/types/api.types';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface RequestOptions {
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

class HttpClient {
  private getAuthToken(): string | null {
    return typeof window !== 'undefined' 
      ? localStorage.getItem('authToken') 
      : null;
  }

  private buildHeaders(customHeaders?: Record<string, string>): Headers {
    const headers = new Headers({
      'Content-Type': 'application/json',
      ...customHeaders,
    });

    const token = this.getAuthToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    // Manejar 401 - Token expirado
    if (response.status === 401) {
      this.handleUnauthorized();
      return { success: false, message: 'Sesión expirada' };
    }

    // Manejar respuestas sin contenido
    if (response.status === 204) {
      return { success: true };
    }

    try {
      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          message: data.message || `Error ${response.status}`,
          errors: data.errors,
        };
      }

      return { success: true, data };
    } catch {
      return { 
        success: false, 
        message: 'Error al procesar la respuesta' 
      };
    }
  }

  private handleUnauthorized(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      window.location.href = '/auth/signin';
    }
  }

  async request<T>(
    url: string,
    method: HttpMethod,
    body?: unknown,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), apiConfig.timeout);

    try {
      const response = await fetch(url, {
        method,
        headers: this.buildHeaders(options?.headers),
        body: body ? JSON.stringify(body) : undefined,
        signal: options?.signal || controller.signal,
      });

      clearTimeout(timeoutId);
      return this.handleResponse<T>(response);
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === 'AbortError') {
        return { success: false, message: 'Tiempo de espera agotado' };
      }

      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Error de conexión' 
      };
    }
  }

  // Métodos de conveniencia
  get<T>(url: string, options?: RequestOptions) {
    return this.request<T>(url, 'GET', undefined, options);
  }

  post<T>(url: string, body?: unknown, options?: RequestOptions) {
    return this.request<T>(url, 'POST', body, options);
  }

  put<T>(url: string, body?: unknown, options?: RequestOptions) {
    return this.request<T>(url, 'PUT', body, options);
  }

  patch<T>(url: string, body?: unknown, options?: RequestOptions) {
    return this.request<T>(url, 'PATCH', body, options);
  }

  delete<T>(url: string, options?: RequestOptions) {
    return this.request<T>(url, 'DELETE', undefined, options);
  }
}

// Singleton - una sola instancia
export const httpClient = new HttpClient();
