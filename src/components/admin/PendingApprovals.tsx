
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, RefreshCw } from "lucide-react";

interface PendingApprovalsProps {
  pendingUsers: any[];
  onApproval: (userId: string, status: 'approved' | 'rejected') => Promise<void>;
  onRefresh?: () => Promise<void>;
  isRefreshing?: boolean;
}

const PendingApprovals = ({ pendingUsers, onApproval, onRefresh, isRefreshing }: PendingApprovalsProps) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Pending User Approvals</h3>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">{pendingUsers.length} Pending</Badge>
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center"
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          )}
        </div>
      </div>
      
      <div className="space-y-4">
        {pendingUsers.map((user) => (
          <Card key={user.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <h4 className="font-semibold">{user.full_name}</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Email:</span>
                      <p>{user.email}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Phone:</span>
                      <p>{user.phone}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">National ID:</span>
                      <p>{user.national_id}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Role:</span>
                      <Badge variant="secondary">{user.role}</Badge>
                    </div>
                    <div>
                      <span className="text-gray-600">Location:</span>
                      <p>{user.location}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Applied:</span>
                      <p>{new Date(user.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={() => onApproval(user.id, 'approved')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onApproval(user.id, 'rejected')}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {pendingUsers.length === 0 && (
        <div className="text-center py-12">
          <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500 opacity-50" />
          <h3 className="text-lg font-medium">No pending approvals</h3>
          <p className="text-gray-500">All users have been processed</p>
        </div>
      )}
    </div>
  );
};

export default PendingApprovals;
