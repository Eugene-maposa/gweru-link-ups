
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const ApprovalStatus = () => {
  const { userProfile, signOut } = useAuth();

  if (!userProfile) return null;

  const getStatusIcon = () => {
    switch (userProfile.approval_status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusMessage = () => {
    switch (userProfile.approval_status) {
      case 'approved':
        return "Your account has been approved! You can now access all features.";
      case 'rejected':
        return "Your account has been rejected. Please contact support for more information.";
      default:
        return "Your account is pending approval. Please wait for an administrator to review your application.";
    }
  };

  const getStatusVariant = () => {
    switch (userProfile.approval_status) {
      case 'approved':
        return "default";
      case 'rejected':
        return "destructive";
      default:
        return "default";
    }
  };

  if (userProfile.approval_status === 'approved') {
    return null; // Don't show anything if approved
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-4">
        <Alert variant={getStatusVariant()}>
          {getStatusIcon()}
          <AlertDescription className="ml-2">
            {getStatusMessage()}
          </AlertDescription>
        </Alert>
        
        <div className="text-center">
          <Button variant="outline" onClick={signOut}>
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ApprovalStatus;
