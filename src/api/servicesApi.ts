/**
 * servicesApi.ts
 * API de servicios de peluquería
 * Principio: SRP - Solo maneja llamadas de servicios
 */

import { apiConfig } from '@/config/api.config';
import { httpClient } from '@/lib/httpClient';
import type { ServiceDto } from '@/types/api.types';

export const servicesApi = {
  /**
   * Obtener todos los servicios activos
   */
  async getAll(): Promise<{ 
    success: boolean; 
    data?: ServiceDto[]; 
    message?: string; 
  }> {
    return httpClient.get<ServiceDto[]>(apiConfig.endpoints.services);
  },

  /**
   * Obtener servicio por ID
   */
  async getById(id: string): Promise<{ 
    success: boolean; 
    data?: ServiceDto; 
    message?: string; 
  }> {
    return httpClient.get<ServiceDto>(`${apiConfig.endpoints.services}/${id}`);
  },

  /**
   * Obtener servicios por categoría
   */
  async getByCategory(category: string): Promise<{ 
    success: boolean; 
    data?: ServiceDto[]; 
    message?: string; 
  }> {
    return httpClient.get<ServiceDto[]>(
      `${apiConfig.endpoints.services}?category=${encodeURIComponent(category)}`
    );
  },
};
