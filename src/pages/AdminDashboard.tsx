
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, RefreshCw, Clock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import AdminStatsCards from "@/components/admin/AdminStatsCards";
import PendingApprovals from "@/components/admin/PendingApprovals";
import UserManagement from "@/components/admin/UserManagement";
import JobManagement from "@/components/admin/JobManagement";
import AnalyticsSection from "@/components/admin/AnalyticsSection";

const AdminDashboard = () => {
  const { user, userProfile, loading: authLoading, signOut } = useAuth();
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
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAdminVerified, setIsAdminVerified] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    console.log('AdminDashboard useEffect triggered');
    console.log('Auth loading:', authLoading);
    console.log('User:', user?.id);
    console.log('User profile:', userProfile);

    // Wait for auth to complete
    if (authLoading) {
      console.log('Still loading auth, waiting...');
      return;
    }

    // Redirect if not authenticated
    if (!user) {
      console.log('No user found, redirecting to auth');
      navigate('/auth');
      return;
    }

    // Verify admin access and fetch data
    verifyAdminAccess();
  }, [user, userProfile, authLoading, navigate]);

  const verifyAdminAccess = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Verifying admin access for user:', user?.id);

      if (!user) {
        throw new Error('No authenticated user');
      }

      // First, check if user has a profile
      console.log('Checking user profile...');
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Profile check error:', profileError);
        throw new Error(`Profile check failed: ${profileError.message}`);
      }

      console.log('Profile found:', profile);

      // If no profile exists, create admin profile
      if (!profile) {
        console.log('No profile found, creating admin profile...');
        
        const { error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email || '',
            full_name: user.email?.split('@')[0] || 'Admin',
            phone: '',
            national_id: '',
            role: 'admin',
            location: '',
            approval_status: 'approved'
          });

        if (createError) {
          console.error('Failed to create admin profile:', createError);
          throw new Error(`Failed to create admin profile: ${createError.message}`);
        }

        console.log('Admin profile created successfully');
      } else if (profile.role !== 'admin') {
        console.log('User is not admin, role:', profile.role);
        throw new Error('Access denied: Admin role required');
      }

      setIsAdminVerified(true);
      console.log('Admin access verified, fetching data...');
      
      // Now fetch all data
      await fetchAllData();
    } catch (error: any) {
      console.error('Admin verification error:', error);
      setError(error.message || 'Failed to verify admin access');
      setIsAdminVerified(false);
      
      if (error.message.includes('Access denied')) {
        navigate('/auth');
      }
    } finally {
      setLoading(false);
    }
  };

  // Enhanced fetch function with refresh state management
  const fetchAllData = useCallback(async (showToast = false) => {
    try {
      setRefreshing(true);
      console.log('Starting fetchAllData...');

      // Fetch all users with simplified query
      console.log('Fetching users...');
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) {
        console.error('Error fetching users:', usersError);
        // Don't throw error, just log it and continue
        setAllUsers([]);
        setPendingUsers([]);
      } else {
        console.log('Users fetched successfully:', usersData?.length || 0);
        setAllUsers(usersData || []);
        
        // Filter pending users
        const pending = (usersData || []).filter(user => user.approval_status === 'pending');
        setPendingUsers(pending);
        console.log('Pending users:', pending.length);
      }

      // Fetch all jobs with simplified query
      console.log('Fetching jobs...');
      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select(`
          *,
          employer:profiles!jobs_employer_id_fkey (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (jobsError) {
        console.error('Error fetching jobs:', jobsError);
        // Don't throw error, just log it and continue
        setAllJobs([]);
      } else {
        console.log('Jobs fetched successfully:', jobsData?.length || 0);
        setAllJobs(jobsData || []);
      }

      // Calculate stats
      calculateStats(usersData || [], jobsData || []);
      setLastRefresh(new Date());

      console.log('All data fetched successfully');
      
      if (showToast) {
        toast({
          title: "Data Refreshed",
          description: "All dashboard data has been updated successfully.",
        });
      }
    } catch (error: any) {
      console.error('Error in fetchAllData:', error);
      toast({
        title: "Warning",
        description: "Some data could not be loaded, but you can still use the dashboard",
        variant: "destructive"
      });
    } finally {
      setRefreshing(false);
    }
  }, [toast]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh || !isAdminVerified) return;

    const interval = setInterval(() => {
      console.log('Auto-refreshing dashboard data...');
      fetchAllData();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, isAdminVerified, fetchAllData]);

  // Manual refresh handler
  const handleManualRefresh = useCallback(async () => {
    await fetchAllData(true);
  }, [fetchAllData]);

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

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'worker' | 'employer') => {
    try {
      console.log(`Updating user ${userId} role to ${newRole}`);
      
      const { error } = await supabase
        .from('profiles')
        .update({ 
          role: newRole,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        console.error('Error updating user role:', error);
        throw error;
      }

      toast({
        title: "Role Updated",
        description: `User role has been changed to ${newRole}.`,
      });

      // Refresh data
      await fetchAllData();
    } catch (error: any) {
      console.error('Failed to update user role:', error);
      toast({
        title: "Error",
        description: `Failed to update user role: ${error.message}`,
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

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // Show loading state while checking authentication
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg font-medium">
            {authLoading ? 'Checking admin access...' : 'Loading admin dashboard...'}
          </div>
          <div className="text-sm text-gray-500 mt-2">
            {authLoading ? 'Verifying credentials...' : 'Fetching users and jobs...'}
          </div>
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
          <div className="space-y-2">
            <Button onClick={verifyAdminAccess} className="inline-flex items-center">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <div>
              <Button variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
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
              
              {/* Refresh Controls */}
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleManualRefresh}
                  disabled={refreshing}
                  className="inline-flex items-center"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  {refreshing ? 'Refreshing...' : 'Refresh'}
                </Button>
                
                {/* Auto-refresh toggle */}
                <div className="flex items-center space-x-2 bg-white border rounded-lg px-3 py-2">
                  <Switch
                    id="auto-refresh"
                    checked={autoRefresh}
                    onCheckedChange={setAutoRefresh}
                  />
                  <Label htmlFor="auto-refresh" className="text-sm text-gray-600">
                    Auto-refresh (30s)
                  </Label>
                </div>
              </div>

              {/* Last refresh indicator */}
              {lastRefresh && (
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  <span>Last updated: {lastRefresh.toLocaleTimeString()}</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Welcome, {userProfile?.full_name || user?.email}
              </div>
              <Button variant="outline" onClick={() => navigate('/dashboard')}>
                Main Dashboard
              </Button>
              <Button variant="outline" onClick={handleSignOut}>
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
              onRefresh={handleManualRefresh}
              isRefreshing={refreshing}
            />
          </TabsContent>
          
          <TabsContent value="users">
            <UserManagement 
              allUsers={allUsers} 
              onApproval={handleApproval}
              onRoleChange={handleRoleChange}
              onRefresh={handleManualRefresh}
              isRefreshing={refreshing}
            />
          </TabsContent>

          <TabsContent value="jobs">
            <JobManagement 
              allJobs={allJobs} 
              onToggleJobStatus={toggleJobStatus} 
              onRefresh={handleManualRefresh}
              isRefreshing={refreshing}
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
