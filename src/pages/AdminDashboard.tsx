import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, RefreshCw } from "lucide-react";
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
    
    // Set up real-time listeners for data updates
    const usersChannel = supabase
      .channel('profiles-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        console.log('Profiles table changed, refreshing data...');
        fetchAllData();
      })
      .subscribe();

    const jobsChannel = supabase
      .channel('jobs-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs' }, () => {
        console.log('Jobs table changed, refreshing data...');
        fetchAllData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(usersChannel);
      supabase.removeChannel(jobsChannel);
    };
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Starting to fetch admin dashboard data...');
      
      // Fetch all data in parallel with comprehensive queries
      const [usersResult, jobsResult] = await Promise.all([
        fetchAllUsers(),
        fetchAllJobs()
      ]);

      // Calculate stats after fetching data
      if (usersResult && jobsResult) {
        calculateStats(usersResult, jobsResult);
      }
      
      console.log('Admin dashboard data fetched successfully');
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

  const fetchAllUsers = async () => {
    try {
      console.log('Fetching all users from profiles table...');
      
      // First, check if we can access the profiles table
      const { count, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        console.error('Error checking profiles table:', countError);
        throw countError;
      }

      console.log('Profiles table accessible, total count:', count);

      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          full_name,
          phone,
          national_id,
          role,
          location,
          approval_status,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }
      
      console.log('Users fetched successfully:', data?.length || 0);
      console.log('Sample user data:', data?.[0]);
      
      setAllUsers(data || []);
      
      // Filter pending users
      const pending = (data || []).filter(user => user.approval_status === 'pending');
      setPendingUsers(pending);
      console.log('Pending users:', pending.length);
      
      return data || [];
    } catch (error) {
      console.error('Failed to fetch users:', error);
      // Try to get users from auth.users as fallback (though this won't work in client)
      console.log('Attempting fallback user fetch...');
      return [];
    }
  };

  const fetchAllJobs = async () => {
    try {
      console.log('Fetching all jobs...');
      
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          id,
          title,
          description,
          location,
          pay_rate,
          pay_type,
          duration,
          skills_required,
          status,
          created_at,
          updated_at,
          employer_id,
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
      
      console.log('Jobs fetched successfully:', data?.length || 0);
      setAllJobs(data || []);
      return data || [];
    } catch (error) {
      console.error('Error fetching jobs:', error);
      return [];
    }
  };

  const calculateStats = (users: any[], jobs: any[]) => {
    try {
      console.log('Calculating stats with users:', users.length, 'jobs:', jobs.length);
      
      const totalUsers = users.length;
      const pendingApprovals = users.filter(user => user.approval_status === 'pending').length;
      const totalWorkers = users.filter(user => user.role === 'worker').length;
      const totalEmployers = users.filter(user => user.role === 'employer').length;
      
      const totalJobs = jobs.length;
      const activeJobs = jobs.filter(job => job.status === 'open').length;
      const completedJobs = jobs.filter(job => job.status === 'completed').length;

      const newStats = {
        totalUsers,
        pendingApprovals,
        totalJobs,
        totalWorkers,
        totalEmployers,
        activeJobs,
        completedJobs
      };

      console.log('Calculated stats:', newStats);
      setStats(newStats);
    } catch (error) {
      console.error('Error calculating stats:', error);
    }
  };

  const handleApproval = async (userId: string, status: 'approved' | 'rejected') => {
    try {
      console.log(`Updating user ${userId} status to ${status}`);
      
      const { error } = await supabase
        .from('profiles')
        .update({ 
          approval_status: status,
          updated_at: new Date().toISOString()
        })
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
      
      // Refresh data after approval
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
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
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
      
      // Refresh data after job status change
      await fetchAllData();
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg font-medium">Loading admin dashboard...</div>
          <div className="text-sm text-gray-500 mt-2">Fetching users, jobs, and statistics...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <div className="text-lg font-semibold text-gray-900 mb-2">Dashboard Error</div>
          <div className="text-gray-600 mb-4">{error}</div>
          <Button onClick={fetchAllData} className="inline-flex items-center">
            <RefreshCw className="h-4 w-4 mr-2" />
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
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <Button 
                variant="outline" 
                size="sm"
                onClick={fetchAllData}
                className="inline-flex items-center"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
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
        {/* Stats Cards */}
        <AdminStatsCards stats={stats} />

        {/* Main Content Tabs */}
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pending" className="relative">
              Pending Approvals 
              {stats.pendingApprovals > 0 && (
                <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                  {stats.pendingApprovals}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="users">
              All Users ({stats.totalUsers})
            </TabsTrigger>
            <TabsTrigger value="jobs">
              All Jobs ({stats.totalJobs})
            </TabsTrigger>
            <TabsTrigger value="analytics">
              Analytics
            </TabsTrigger>
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
              pendingUsersCount={stats.pendingApprovals} 
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
