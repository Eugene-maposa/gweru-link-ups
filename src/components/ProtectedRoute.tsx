import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireApproval?: boolean;
  adminOnly?: boolean;
}

const ProtectedRoute = ({ 
  children, 
  requireApproval = false, 
  adminOnly = false 
}: ProtectedRouteProps) => {
  const { user, userProfile, loading } = useAuth();
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

      if (adminOnly && userProfile?.role !== 'admin') {
        navigate('/dashboard');
        return;
      }
    }
  }, [user, userProfile, loading, navigate, requireApproval, adminOnly]);

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

  if (adminOnly && userProfile?.role !== 'admin') {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;