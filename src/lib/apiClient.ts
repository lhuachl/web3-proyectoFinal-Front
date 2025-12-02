// src/lib/apiClient.ts
/**
 * Cliente HTTP centralizado con manejo automático de tokens
 * Recomendado para evitar repetir headers en cada request
 */

interface ApiClientOptions extends RequestInit {
  headers?: Record<string, string>;
}

export const apiClient = async (
  url: string,
  options: ApiClientOptions = {}
): Promise<Response> => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Manejar token expirado
    if (response.status === 401) {
      // Token expirado - limpiar y redirigir a login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        window.location.href = '/auth/signin';
      }
    }

    return response;
  } catch (error) {
    throw new Error(`API Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const apiGet = (url: string, options?: ApiClientOptions) =>
  apiClient(url, { ...options, method: 'GET' });

export const apiPost = (url: string, data?: unknown, options?: ApiClientOptions) =>
  apiClient(url, {
    ...options,
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });

export const apiPut = (url: string, data?: unknown, options?: ApiClientOptions) =>
  apiClient(url, {
    ...options,
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });

export const apiDelete = (url: string, options?: ApiClientOptions) =>
  apiClient(url, { ...options, method: 'DELETE' });
