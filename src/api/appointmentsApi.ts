/**
 * appointmentsApi.ts
 * API de citas
 * Principio: SRP - Solo maneja llamadas de citas
 */

import { apiConfig } from '@/config/api.config';
import { httpClient } from '@/lib/httpClient';
import type { AppointmentDto } from '@/types/api.types';

interface CreateAppointmentRequest {
  serviceId: string;
  stylistId: string;
  dateTime: string;
  notes?: string;
}

interface UpdateAppointmentRequest {
  dateTime?: string;
  notes?: string;
  status?: 'confirmado' | 'cancelado';
}

export const appointmentsApi = {
  /**
   * Obtener citas del usuario actual
   */
  async getMyAppointments(): Promise<{ 
    success: boolean; 
    data?: AppointmentDto[]; 
    message?: string; 
  }> {
    return httpClient.get<AppointmentDto[]>(apiConfig.endpoints.appointments);
  },

  /**
   * Obtener cita por ID
   */
  async getById(id: string): Promise<{ 
    success: boolean; 
    data?: AppointmentDto; 
    message?: string; 
  }> {
    return httpClient.get<AppointmentDto>(
      `${apiConfig.endpoints.appointments}/${id}`
    );
  },

  /**
   * Crear nueva cita
   */
  async create(data: CreateAppointmentRequest): Promise<{ 
    success: boolean; 
    data?: AppointmentDto; 
    message?: string; 
  }> {
    return httpClient.post<AppointmentDto>(
      apiConfig.endpoints.appointments,
      data
    );
  },

  /**
   * Actualizar cita
   */
  async update(id: string, data: UpdateAppointmentRequest): Promise<{ 
    success: boolean; 
    data?: AppointmentDto; 
    message?: string; 
  }> {
    return httpClient.patch<AppointmentDto>(
      `${apiConfig.endpoints.appointments}/${id}`,
      data
    );
  },

  /**
   * Cancelar cita
   */
  async cancel(id: string): Promise<{ 
    success: boolean; 
    message?: string; 
  }> {
    return httpClient.patch<void>(
      `${apiConfig.endpoints.appointments}/${id}`,
      { status: 'cancelado' }
    );
  },
};
