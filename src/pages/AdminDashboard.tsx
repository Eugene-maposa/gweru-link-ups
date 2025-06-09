
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Users, Briefcase, AlertCircle, TrendingUp, Calendar, Star } from "lucide-react";

const AdminDashboard = () => {
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [allJobs, setAllJobs] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingApprovals: 0,
    totalJobs: 0,
    totalWorkers: 0,
    totalEmployers: 0,
    activeJobs: 0,
    completedJobs: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      await Promise.all([
        fetchPendingUsers(),
        fetchAllJobs(),
        fetchAllUsers(),
        fetchStats()
      ]);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('approval_status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPendingUsers(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch pending users",
        variant: "destructive"
      });
    }
  };

  const fetchAllJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          profiles:employer_id (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAllJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAllUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const [usersResult, jobsResult, workersResult, employersResult, activeJobsResult, completedJobsResult] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('jobs').select('id', { count: 'exact' }),
        supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'worker'),
        supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'employer'),
        supabase.from('jobs').select('id', { count: 'exact' }).eq('status', 'open'),
        supabase.from('jobs').select('id', { count: 'exact' }).eq('status', 'completed')
      ]);

      setStats({
        totalUsers: usersResult.count || 0,
        pendingApprovals: pendingUsers.length,
        totalJobs: jobsResult.count || 0,
        totalWorkers: workersResult.count || 0,
        totalEmployers: employersResult.count || 0,
        activeJobs: activeJobsResult.count || 0,
        completedJobs: completedJobsResult.count || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleApproval = async (userId: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ approval_status: status })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: `User ${status}`,
        description: `The user has been successfully ${status}.`,
      });

      fetchAllData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive"
      });
    }
  };

  const toggleJobStatus = async (jobId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'open' ? 'closed' : 'open';
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ status: newStatus })
        .eq('id', jobId);

      if (error) throw error;

      toast({
        title: "Job Updated",
        description: `Job status changed to ${newStatus}.`,
      });

      fetchAllJobs();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update job status",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg">Loading admin dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => navigate('/dashboard')}>
                Main Dashboard
              </Button>
              <Button variant="outline" onClick={() => navigate('/auth')}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-500 mr-3" />
                <div>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                  <div className="text-sm text-gray-600">Total Users</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertCircle className="h-8 w-8 text-yellow-500 mr-3" />
                <div>
                  <div className="text-2xl font-bold">{pendingUsers.length}</div>
                  <div className="text-sm text-gray-600">Pending Approvals</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Briefcase className="h-8 w-8 text-green-500 mr-3" />
                <div>
                  <div className="text-2xl font-bold">{stats.totalJobs}</div>
                  <div className="text-sm text-gray-600">Total Jobs</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-purple-500 mr-3" />
                <div>
                  <div className="text-2xl font-bold">{stats.activeJobs}</div>
                  <div className="text-sm text-gray-600">Active Jobs</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList>
            <TabsTrigger value="pending">Pending Approvals</TabsTrigger>
            <TabsTrigger value="users">All Users</TabsTrigger>
            <TabsTrigger value="jobs">All Jobs</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Pending User Approvals</h3>
              <Badge variant="outline">{pendingUsers.length} Pending</Badge>
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
                          onClick={() => handleApproval(user.id, 'approved')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleApproval(user.id, 'rejected')}
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
          </TabsContent>
          
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
                <CardDescription>Manage all registered users</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.full_name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{user.role}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={user.approval_status === 'approved' ? 'default' : 
                                   user.approval_status === 'rejected' ? 'destructive' : 'secondary'}
                          >
                            {user.approval_status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="jobs">
            <Card>
              <CardHeader>
                <CardTitle>All Jobs</CardTitle>
                <CardDescription>Monitor and manage job postings</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Employer</TableHead>
                      <TableHead>Pay Rate</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Posted</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allJobs.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell className="font-medium">{job.title}</TableCell>
                        <TableCell>{job.profiles?.full_name || 'Unknown'}</TableCell>
                        <TableCell>${job.pay_rate} {job.pay_type}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={job.status === 'open' ? 'default' : 'secondary'}
                          >
                            {job.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(job.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleJobStatus(job.id, job.status)}
                          >
                            {job.status === 'open' ? 'Close' : 'Reopen'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    User Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total Workers:</span>
                      <span className="font-semibold">{stats.totalWorkers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Employers:</span>
                      <span className="font-semibold">{stats.totalEmployers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pending Approvals:</span>
                      <span className="font-semibold text-yellow-600">{pendingUsers.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="h-5 w-5 mr-2" />
                    Job Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Active Jobs:</span>
                      <span className="font-semibold text-green-600">{stats.activeJobs}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Completed Jobs:</span>
                      <span className="font-semibold">{stats.completedJobs}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Jobs Posted:</span>
                      <span className="font-semibold">{stats.totalJobs}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
