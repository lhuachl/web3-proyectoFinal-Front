import type { RouteObject } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { SignIn } from '@/components/SignIn';
import { SignUp } from '@/components/SignUp';
import { Dashboard } from '@/pages/Dashboard';
import { ProtectedRoute } from './protectedRoute.tsx';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Navigate to="/auth/signin" />,
  },
  {
    path: '/auth',
    children: [
      {
        path: 'signin',
        element: <SignIn />,
      },
      {
        path: 'signup',
        element: <SignUp />,
      },
    ],
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/auth/signin" />,
  },
];
