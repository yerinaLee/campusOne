import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { ReactNode } from 'react';

interface Props {
  allowedRoles?: string[];
  roles?: string[];       // alias for allowedRoles
  children?: ReactNode;  // optional child wrap (non-layout usage)
}

export function ProtectedRoute({ allowedRoles, roles, children }: Props) {
  const { isAuthenticated, user } = useAuthStore();
  const permitted = allowedRoles ?? roles;

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (permitted && user && !permitted.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // When wrapping children directly (App.tsx route element usage)
  if (children) return <>{children}</>;

  // When used as layout wrapper (renders nested <Outlet />)
  return <Outlet />;
}
