
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import AdminStatsCards from "@/components/admin/AdminStatsCards";
import PendingApprovals from "@/components/admin/PendingApprovals";
import UserManagement from "@/components/admin/UserManagement";
import JobManagement from "@/components/admin/JobManagement";
import AnalyticsSection from "@/components/admin/AnalyticsSection";

const AdminDashboard = () => {
  const { user, userProfile, loading: authLoading } = useAuth();
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

  // Check if user is admin
  const isAdmin = userProfile?.role === 'admin';

  useEffect(() => {
    console.log('AdminDashboard useEffect triggered');
    console.log('Auth loading:', authLoading);
    console.log('User:', user?.id);
    console.log('User profile:', userProfile);
    console.log('Is admin:', isAdmin);

    // Wait for auth to complete
    if (authLoading) {
      console.log('Still loading auth, waiting...');
      return;
    }

    // Redirect if not authenticated
    if (!user) {
      console.log('No user found, redirecting to admin login');
      navigate('/admin-login');
      return;
    }

    // If we have a user but no profile yet, wait a bit more
    if (!userProfile) {
      console.log('User exists but no profile yet, waiting...');
      return;
    }

    // Check if user is admin
    if (!isAdmin) {
      console.log('User is not admin, redirecting to login');
      navigate('/admin-login');
      return;
    }

    // If all checks pass, fetch data
    console.log('All checks passed, fetching admin data...');
    fetchAllData();
  }, [user, userProfile, isAdmin, authLoading, navigate]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Starting fetchAllData...');

      // Test basic connection first
      console.log('Testing basic database connection...');
      const { data: testData, error: testError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);

      if (testError) {
        console.error('Basic connection test failed:', testError);
        throw new Error(`Database connection failed: ${testError.message}`);
      }

      console.log('Basic connection successful, fetching all data...');

      // Fetch users
      console.log('Fetching users...');
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) {
        console.error('Error fetching users:', usersError);
        throw new Error(`Failed to fetch users: ${usersError.message}`);
      }

      console.log('Users fetched:', usersData?.length || 0);
      setAllUsers(usersData || []);
      
      // Filter pending users
      const pending = (usersData || []).filter(user => user.approval_status === 'pending');
      setPendingUsers(pending);
      console.log('Pending users:', pending.length);

      // Fetch jobs
      console.log('Fetching jobs...');
      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select(`
          *,
          profiles:employer_id (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (jobsError) {
        console.error('Error fetching jobs:', jobsError);
        // Don't throw error for jobs, just log it
        setAllJobs([]);
      } else {
        console.log('Jobs fetched:', jobsData?.length || 0);
        setAllJobs(jobsData || []);
      }

      // Calculate stats
      calculateStats(usersData || [], jobsData || []);

      console.log('All data fetched successfully');
    } catch (error: any) {
      console.error('Error in fetchAllData:', error);
      setError(error.message || 'Failed to load dashboard data');
      toast({
        title: "Error",
        description: error.message || 'Failed to load dashboard data',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (users: any[], jobs: any[]) => {
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

      // Refresh data
      await fetchAllData();
    } catch (error: any) {
      console.error('Failed to update user status:', error);
      toast({
        title: "Error",
        description: `Failed to update user status: ${error.message}`,
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

      // Refresh data
      await fetchAllData();
    } catch (error: any) {
      console.error('Failed to update job status:', error);
      toast({
        title: "Error",
        description: `Failed to update job status: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg font-medium">Checking admin access...</div>
        </div>
      </div>
    );
  }

  // Show loading state while fetching data
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg font-medium">Loading admin dashboard...</div>
          <div className="text-sm text-gray-500 mt-2">Fetching users and jobs...</div>
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
              <div className="text-sm text-gray-600">
                Welcome, {userProfile?.full_name || user?.email}
              </div>
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
