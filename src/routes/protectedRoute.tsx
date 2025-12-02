import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { token, user, initialized, isLoading } = useAuthStore();

  // Evitar redirecciones mientras se hidrata el estado (p. e
  // comprobación de token en localStorage)
  if (!initialized || isLoading) {
    return null; // Reemplazar por un componente <Loader /> si lo deseas
  }

  if (!token || !user) {
    return <Navigate to="/auth/signin" replace />;
  }

  return <>{children}</>;
};
