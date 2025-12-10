/**
 * stylistsApi.ts
 * API de estilistas
 * Principio: SRP - Solo maneja llamadas de estilistas
 */

import { apiConfig } from '@/config/api.config';
import { httpClient } from '@/lib/httpClient';
import type { StylistDto } from '@/types/api.types';

interface AvailabilitySlot {
  time: string;
  available: boolean;
}

interface StylistAvailability {
  date: string;
  slots: AvailabilitySlot[];
}

export const stylistsApi = {
  /**
   * Obtener todos los estilistas activos
   */
  async getAll(): Promise<{ 
    success: boolean; 
    data?: StylistDto[]; 
    message?: string; 
  }> {
    return httpClient.get<StylistDto[]>(apiConfig.endpoints.stylists);
  },

  /**
   * Obtener estilista por ID
   */
  async getById(id: string): Promise<{ 
    success: boolean; 
    data?: StylistDto; 
    message?: string; 
  }> {
    return httpClient.get<StylistDto>(`${apiConfig.endpoints.stylists}/${id}`);
  },

  /**
   * Obtener disponibilidad de un estilista
   */
  async getAvailability(stylistId: string, date: string): Promise<{ 
    success: boolean; 
    data?: StylistAvailability; 
    message?: string; 
  }> {
    return httpClient.get<StylistAvailability>(
      `${apiConfig.endpoints.stylists}/${stylistId}/availability?date=${date}`
    );
  },
};
