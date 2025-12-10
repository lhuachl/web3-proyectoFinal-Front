/**
 * api.config.ts
 * Configuración centralizada de la API
 * Principio: KISS - Una sola fuente de verdad para la configuración
 */

interface ApiConfig {
  baseUrl: string;
  timeout: number;
  endpoints: {
    auth: {
      login: string;
      register: string;
      me: string;
      refresh: string;
    };
    services: string;
    appointments: string;
    stylists: string;
  };
}

const getApiConfig = (): ApiConfig => {
  const baseUrl = import.meta.env.VITE_API_URL || 'https://localhost:7001/api';

  return {
    baseUrl,
    timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 10000,
    endpoints: {
      auth: {
        login: `${baseUrl}/auth/login`,
        register: `${baseUrl}/auth/register`,
        me: `${baseUrl}/auth/me`,
        refresh: `${baseUrl}/auth/refresh`,
      },
      services: `${baseUrl}/services`,
      appointments: `${baseUrl}/appointments`,
      stylists: `${baseUrl}/stylists`,
    },
  };
};

export const apiConfig = getApiConfig();
