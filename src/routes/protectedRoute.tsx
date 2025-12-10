/**
 * ProtectedRoute.tsx
 * Componente para proteger rutas que requieren autenticación
 * Principio: SRP - Solo maneja la lógica de protección de rutas
 */

import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string; // Opcional: requerir un rol específico
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { token, user, initialized, isLoading } = useAuthStore();

  // Evitar redirecciones mientras se hidrata el estado
  if (!initialized || isLoading) {
    return null; // Reemplazar por <Loader /> si lo deseas
  }

  // No autenticado
  if (!token || !user) {
    return <Navigate to="/auth/signin" replace />;
  }

  // Verificar rol si es requerido
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
