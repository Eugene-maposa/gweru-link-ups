
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, Users, RefreshCw } from "lucide-react";

interface UserManagementProps {
  allUsers: any[];
  onApproval: (userId: string, status: 'approved' | 'rejected') => Promise<void>;
  onRoleChange: (userId: string, newRole: 'admin' | 'worker' | 'employer') => Promise<void>;
  onRefresh?: () => Promise<void>;
  isRefreshing?: boolean;
}

const UserManagement = ({ allUsers, onApproval, onRoleChange, onRefresh, isRefreshing }: UserManagementProps) => {
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    filterAndSortUsers();
  }, [allUsers, searchTerm, statusFilter, roleFilter, sortBy]);

  const filterAndSortUsers = () => {
    let filtered = [...allUsers];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.national_id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.approval_status === statusFilter);
    }

    // Apply role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.roles?.includes(roleFilter));
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case 'name':
        filtered.sort((a, b) => (a.full_name || '').localeCompare(b.full_name || ''));
        break;
      case 'pending-first':
        filtered.sort((a, b) => {
          if (a.approval_status === 'pending' && b.approval_status !== 'pending') return -1;
          if (a.approval_status !== 'pending' && b.approval_status === 'pending') return 1;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
        break;
    }

    setFilteredUsers(filtered);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>All Users</CardTitle>
            <CardDescription>Manage all registered users with advanced filtering and sorting</CardDescription>
          </div>
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
        
        {/* Filters and Search */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>

          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="worker">Worker</SelectItem>
              <SelectItem value="employer">Employer</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="name">Name A-Z</SelectItem>
              <SelectItem value="pending-first">Pending First</SelectItem>
            </SelectContent>
          </Select>

          <div className="text-sm text-gray-500">
            Showing {filteredUsers.length} of {allUsers.length} users
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.full_name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {user.roles?.map((role: string) => (
                      <Badge key={role} variant="outline">{role}</Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={user.approval_status === 'approved' ? 'default' : 
                           user.approval_status === 'rejected' ? 'destructive' : 'secondary'}
                  >
                    {user.approval_status}
                  </Badge>
                </TableCell>
                <TableCell>{user.location}</TableCell>
                <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex flex-col space-y-1">
                    {user.approval_status === 'pending' && (
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onApproval(user.id, 'approved')}
                          className="text-green-600 hover:bg-green-50"
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onApproval(user.id, 'rejected')}
                          className="text-red-600 hover:bg-red-50"
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                    {user.approval_status === 'approved' && !user.roles?.includes('admin') && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onRoleChange(user.id, 'admin')}
                        className="text-blue-600 hover:bg-blue-50"
                      >
                        Make Admin
                      </Button>
                    )}
                    {user.roles?.includes('admin') && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onRoleChange(user.id, user.roles?.includes('worker') ? 'employer' : 'worker')}
                        className="text-orange-600 hover:bg-orange-50"
                      >
                        Remove Admin
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium">No users found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserManagement;
