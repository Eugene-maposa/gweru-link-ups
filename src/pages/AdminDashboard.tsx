
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle } from "lucide-react";
import AdminStatsCards from "@/components/admin/AdminStatsCards";
import PendingApprovals from "@/components/admin/PendingApprovals";
import UserManagement from "@/components/admin/UserManagement";
import JobManagement from "@/components/admin/JobManagement";
import AnalyticsSection from "@/components/admin/AnalyticsSection";

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
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setError(null);
      console.log('Starting to fetch admin data...');
      
      await Promise.all([
        fetchPendingUsers(),
        fetchAllJobs(),
        fetchAllUsers(),
        fetchStats()
      ]);
      
      console.log('All admin data fetched successfully');
    } catch (error) {
      console.error('Error fetching admin data:', error);
      setError('Failed to load dashboard data. Please try again.');
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingUsers = async () => {
    try {
      console.log('Fetching pending users...');
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('approval_status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching pending users:', error);
        throw error;
      }
      
      console.log('Pending users fetched:', data?.length || 0);
      setPendingUsers(data || []);
    } catch (error) {
      console.error('Failed to fetch pending users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch pending users",
        variant: "destructive"
      });
    }
  };

  const fetchAllJobs = async () => {
    try {
      console.log('Fetching all jobs...');
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

      if (error) {
        console.error('Error fetching jobs:', error);
        throw error;
      }
      
      console.log('Jobs fetched:', data?.length || 0);
      setAllJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const fetchAllUsers = async () => {
    try {
      console.log('Fetching all users...');
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }
      
      console.log('Users fetched:', data?.length || 0);
      setAllUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchStats = async () => {
    try {
      console.log('Fetching stats...');
      
      const results = await Promise.allSettled([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('jobs').select('id', { count: 'exact' }),
        supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'worker'),
        supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'employer'),
        supabase.from('jobs').select('id', { count: 'exact' }).eq('status', 'open'),
        supabase.from('jobs').select('id', { count: 'exact' }).eq('status', 'completed')
      ]);

      const [usersResult, jobsResult, workersResult, employersResult, activeJobsResult, completedJobsResult] = results;

      setStats({
        totalUsers: usersResult.status === 'fulfilled' ? (usersResult.value.count || 0) : 0,
        pendingApprovals: pendingUsers.length,
        totalJobs: jobsResult.status === 'fulfilled' ? (jobsResult.value.count || 0) : 0,
        totalWorkers: workersResult.status === 'fulfilled' ? (workersResult.value.count || 0) : 0,
        totalEmployers: employersResult.status === 'fulfilled' ? (employersResult.value.count || 0) : 0,
        activeJobs: activeJobsResult.status === 'fulfilled' ? (activeJobsResult.value.count || 0) : 0,
        completedJobs: completedJobsResult.status === 'fulfilled' ? (completedJobsResult.value.count || 0) : 0
      });
      
      console.log('Stats calculated successfully');
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleApproval = async (userId: string, status: 'approved' | 'rejected') => {
    try {
      console.log(`Updating user ${userId} status to ${status}`);
      
      const { error } = await supabase
        .from('profiles')
        .update({ approval_status: status })
        .eq('id', userId);

      if (error) {
        console.error('Error updating user status:', error);
        throw error;
      }

      toast({
        title: `User ${status}`,
        description: `The user has been successfully ${status}.`,
      });

      console.log(`User ${userId} ${status} successfully`);
      
      await fetchAllData();
    } catch (error) {
      console.error('Failed to update user status:', error);
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
      console.log(`Updating job ${jobId} status from ${currentStatus} to ${newStatus}`);
      
      const { error } = await supabase
        .from('jobs')
        .update({ status: newStatus })
        .eq('id', jobId);

      if (error) {
        console.error('Error updating job status:', error);
        throw error;
      }

      toast({
        title: "Job Updated",
        description: `Job status changed to ${newStatus}.`,
      });

      console.log(`Job ${jobId} status updated to ${newStatus}`);
      
      await fetchAllJobs();
      await fetchStats();
    } catch (error) {
      console.error('Failed to update job status:', error);
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
          <div className="text-sm text-gray-500 mt-2">Fetching users, jobs, and statistics...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <div className="text-lg font-semibold text-gray-900 mb-2">Dashboard Error</div>
          <div className="text-gray-600 mb-4">{error}</div>
          <Button onClick={fetchAllData}>
            Try Again
          </Button>
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
        <AdminStatsCards stats={stats} />

        <Tabs defaultValue="pending" className="w-full">
          <TabsList>
            <TabsTrigger value="pending">Pending Approvals ({pendingUsers.length})</TabsTrigger>
            <TabsTrigger value="users">All Users ({allUsers.length})</TabsTrigger>
            <TabsTrigger value="jobs">All Jobs ({allJobs.length})</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending" className="space-y-4">
            <PendingApprovals 
              pendingUsers={pendingUsers} 
              onApproval={handleApproval} 
            />
          </TabsContent>
          
          <TabsContent value="users">
            <UserManagement 
              allUsers={allUsers} 
              onApproval={handleApproval} 
            />
          </TabsContent>

          <TabsContent value="jobs">
            <JobManagement 
              allJobs={allJobs} 
              onToggleJobStatus={toggleJobStatus} 
            />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsSection 
              stats={stats} 
              pendingUsersCount={pendingUsers.length} 
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
