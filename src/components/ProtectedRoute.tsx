import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireApproval?: boolean;
  adminOnly?: boolean;
  allowedRoles?: ('worker' | 'employer' | 'admin')[];
}

const ProtectedRoute = ({ 
  children, 
  requireApproval = false, 
  adminOnly = false,
  allowedRoles
}: ProtectedRouteProps) => {
  const { user, userProfile, hasRole, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/auth');
        return;
      }

      if (requireApproval && userProfile?.approval_status !== 'approved') {
        navigate('/');
        return;
      }

      if (adminOnly && !hasRole('admin')) {
        navigate('/dashboard');
        return;
      }

      // Check role-based access
      if (allowedRoles && allowedRoles.length > 0 && userProfile?.role) {
        const hasAllowedRole = allowedRoles.includes(userProfile.role) || hasRole('admin');
        if (!hasAllowedRole) {
          navigate('/dashboard');
          return;
        }
      }
    }
  }, [user, userProfile, hasRole, loading, navigate, requireApproval, adminOnly, allowedRoles]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (requireApproval && userProfile?.approval_status !== 'approved') {
    return null;
  }

  if (adminOnly && !hasRole('admin')) {
    return null;
  }

  // Check role-based access
  if (allowedRoles && allowedRoles.length > 0 && userProfile?.role) {
    const hasAllowedRole = allowedRoles.includes(userProfile.role) || hasRole('admin');
    if (!hasAllowedRole) {
      return null;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
