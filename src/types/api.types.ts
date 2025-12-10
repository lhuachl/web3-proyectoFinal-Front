/**
 * api.types.ts
 * Tipos centralizados para respuestas de la API
 * Principio: DRY - Definir tipos una sola vez
 */

// Respuesta base de la API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

// Respuesta de autenticación
export interface AuthResponse {
  token: string;
  refreshToken?: string;
  expiresIn: number;
  user: UserDto;
}

// DTO de usuario
export interface UserDto {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt?: string;
}

// Roles de usuario
export type UserRole = 'cliente' | 'peluquera' | 'admin';

// DTOs de autenticación
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

// Servicio de peluquería
export interface ServiceDto {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  imageUrl?: string;
  isActive: boolean;
}

// Cita
export interface AppointmentDto {
  id: string;
  clientId: string;
  serviceId: string;
  stylistId: string;
  dateTime: string;
  duration: number;
  status: AppointmentStatus;
  notes?: string;
  totalPrice: number;
}

export type AppointmentStatus = 'pendiente' | 'confirmado' | 'completado' | 'cancelado';

// Estilista
export interface StylistDto {
  id: string;
  name: string;
  email: string;
  phone?: string;
  specialties: string[];
  bio?: string;
  rating: number;
  isActive: boolean;
  avatarUrl?: string;
}
