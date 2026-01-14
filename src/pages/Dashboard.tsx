import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { MapPin, Plus, Search, Star, Clock, DollarSign, Users, Briefcase, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import ApprovalStatus from "@/components/ApprovalStatus";
import { useToast } from "@/hooks/use-toast";
import dashboardBackground from "@/assets/dashboard-background.jpg";

const Dashboard = () => {
  const navigate = useNavigate();
  const { userProfile, signOut, loading: authLoading, user } = useAuth();
  const { toast } = useToast();
  const [nearbyJobs, setNearbyJobs] = useState<any[]>([]);
  const [myApplications, setMyApplications] = useState<any[]>([]);
  const [receivedApplications, setReceivedApplications] = useState<any[]>([]);
  const [myJobs, setMyJobs] = useState<any[]>([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalJobs: 0,
    totalApplications: 0,
    totalEarned: 0,
    completedJobs: 0,
    averageRating: 0
  });
  const [loading, setLoading] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      console.log('User not authenticated, redirecting to auth');
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!authLoading && userProfile) {
      if (userProfile.approval_status === 'approved') {
        fetchDashboardData();
      } else {
        setLoading(false);
      }
    } else if (!authLoading && user && !userProfile) {
      // User exists but no profile, might be incomplete signup
      setLoading(false);
      toast({
        title: "Profile incomplete",
        description: "Please complete your profile setup or wait for admin approval.",
        variant: "destructive"
      });
    }
  }, [userProfile, authLoading, user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      if (userProfile?.role === 'worker') {
        await Promise.all([
          fetchJobs(),
          fetchApplications(),
          fetchWorkerStats()
        ]);
      } else if (userProfile?.role === 'employer') {
        await Promise.all([
          fetchMyJobs(),
          fetchReceivedApplications(),
          fetchEmployerStats()
        ]);
      } else if (userProfile?.role === 'admin') {
        await fetchJobs();
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error loading dashboard",
        description: "Failed to load dashboard data. Please try refreshing the page.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          profiles:employer_id (
            full_name
          )
        `)
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching jobs:', error);
        return;
      }
      setNearbyJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const fetchMyJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          job_applications(
            id,
            status,
            profiles:worker_id (
              full_name
            )
          )
        `)
        .eq('employer_id', userProfile?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching my jobs:', error);
        return;
      }
      setMyJobs(data || []);
    } catch (error) {
      console.error('Error fetching my jobs:', error);
    }
  };

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          *,
          jobs (
            title,
            pay_rate,
            pay_type,
            profiles:employer_id (
              full_name
            )
          )
        `)
        .eq('worker_id', userProfile?.id)
        .order('applied_at', { ascending: false });

      if (error) {
        console.error('Error fetching applications:', error);
        return;
      }
      setMyApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const fetchReceivedApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          *,
          profiles:worker_id (
            full_name
          ),
          jobs!inner (
            id,
            title,
            pay_rate,
            pay_type,
            employer_id
          )
        `)
        .eq('jobs.employer_id', userProfile?.id)
        .order('applied_at', { ascending: false });

      if (error) {
        console.error('Error fetching received applications:', error);
        return;
      }
      setReceivedApplications(data || []);
    } catch (error) {
      console.error('Error fetching received applications:', error);
    }
  };

  const fetchWorkerStats = async () => {
    try {
      // Get worker profile data
      const { data: workerData, error: workerError } = await supabase
        .from('worker_profiles')
        .select('*')
        .eq('user_id', userProfile?.id)
        .maybeSingle();

      if (workerError && workerError.code !== 'PGRST116') {
        console.error('Error fetching worker stats:', workerError);
      }

      // Get application count
      const { count: applicationCount } = await supabase
        .from('job_applications')
        .select('*', { count: 'exact', head: true })
        .eq('worker_id', userProfile?.id);

      setDashboardStats({
        totalJobs: workerData?.total_jobs_completed || 0,
        totalApplications: applicationCount || 0,
        totalEarned: (workerData?.total_jobs_completed || 0) * 50,
        completedJobs: workerData?.total_jobs_completed || 0,
        averageRating: workerData?.rating || 5.0
      });
    } catch (error) {
      console.error('Error fetching worker stats:', error);
    }
  };

  const fetchEmployerStats = async () => {
    try {
      // Get job count
      const { count: jobCount } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('employer_id', userProfile?.id);

      // Get application count for employer's jobs
      const { count: applicationCount } = await supabase
        .from('job_applications')
        .select(`
          *,
          jobs!inner(employer_id)
        `, { count: 'exact', head: true })
        .eq('jobs.employer_id', userProfile?.id);

      setDashboardStats({
        totalJobs: jobCount || 0,
        totalApplications: applicationCount || 0,
        totalEarned: 0,
        completedJobs: 0,
        averageRating: 0
      });
    } catch (error) {
      console.error('Error fetching employer stats:', error);
    }
  };

  // Show loading while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  // Show approval status if user exists but not approved
  if (user && userProfile && userProfile.approval_status !== 'approved') {
    return <ApprovalStatus />;
  }

  // Show message if user exists but no profile
  if (user && !userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Profile Setup Required</CardTitle>
            <CardDescription>
              Your account needs to be set up. Please contact support or try signing up again.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button onClick={() => navigate('/auth')} className="w-full">
                Go to Sign Up
              </Button>
              <Button variant="outline" onClick={signOut} className="w-full">
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  const handleJobClick = (jobId: string) => {
    navigate(`/job/${jobId}`);
  };

  const handleApplyNow = (jobId: string) => {
    navigate(`/job/${jobId}`);
  };

  // Show quick actions based on user role
  const getQuickActions = () => {
    if (userProfile?.role === 'admin') {
      return (
        <>
          <Button className="w-full" onClick={() => navigate('/admin')}>
            <Plus className="h-4 w-4 mr-2" />
            Admin Panel
          </Button>
          <Button variant="outline" className="w-full" onClick={() => navigate('/hire-workers')}>
            <Search className="h-4 w-4 mr-2" />
            View Workers
          </Button>
          <Button variant="outline" className="w-full" onClick={() => navigate('/post-job')}>
            <Plus className="h-4 w-4 mr-2" />
            Post Job
          </Button>
        </>
      );
    } else if (userProfile?.role === 'employer') {
      return (
        <>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
            <p className="text-xs text-blue-700 font-medium">As an Employer, you can:</p>
            <p className="text-xs text-blue-600">• Post jobs for workers to apply</p>
            <p className="text-xs text-blue-600">• Browse job seekers looking for work</p>
          </div>
          <Button className="w-full" onClick={() => navigate('/post-job')}>
            <Plus className="h-4 w-4 mr-2" />
            Post a Job
          </Button>
          <Button variant="outline" className="w-full" onClick={() => navigate('/hire-workers')}>
            <Search className="h-4 w-4 mr-2" />
            Browse Job Seekers
          </Button>
          <Button variant="outline" className="w-full" onClick={() => navigate('/messages')}>
            Messages
          </Button>
        </>
      );
    } else {
      return (
        <>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-2">
            <p className="text-xs text-green-700 font-medium">As a Worker, you can:</p>
            <p className="text-xs text-green-600">• Create your profile for employers to find</p>
            <p className="text-xs text-green-600">• Browse and apply for available jobs</p>
          </div>
          <Button className="w-full" onClick={() => navigate('/post-services')}>
            <Plus className="h-4 w-4 mr-2" />
            Create My Worker Profile
          </Button>
          <Button variant="outline" className="w-full" onClick={() => navigate('/find-work')}>
            <Search className="h-4 w-4 mr-2" />
            Browse Available Jobs
          </Button>
          <Button variant="outline" className="w-full" onClick={() => navigate('/messages')}>
            Messages
          </Button>
        </>
      );
    }
  };

  // Show stats cards based on user role
  const getStatsCards = () => {
    if (userProfile?.role === 'worker') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Jobs Completed</p>
                  <p className="text-2xl font-bold">{dashboardStats.completedJobs}</p>
                </div>
                <Briefcase className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Applications</p>
                  <p className="text-2xl font-bold">{dashboardStats.totalApplications}</p>
                </div>
                <Users className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Earned</p>
                  <p className="text-2xl font-bold">${dashboardStats.totalEarned}</p>
                </div>
                <DollarSign className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Rating</p>
                  <p className="text-2xl font-bold">{dashboardStats.averageRating}</p>
                </div>
                <Star className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      );
    } else if (userProfile?.role === 'employer') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Jobs Posted</p>
                  <p className="text-2xl font-bold">{dashboardStats.totalJobs}</p>
                </div>
                <Briefcase className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Applications Received</p>
                  <p className="text-2xl font-bold">{dashboardStats.totalApplications}</p>
                </div>
                <Users className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Response Rate</p>
                  <p className="text-2xl font-bold">95%</p>
                </div>
                <Star className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }
    return null;
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: `url(${dashboardBackground})` }}
    >
      <div className="absolute inset-0 bg-white/90"></div>
      <div className="relative z-10">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate('/')}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">
                My Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={() => navigate('/profile')}>Profile</Button>
              <Button variant="outline" onClick={signOut}>Logout</Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {getStatsCards()}

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {getQuickActions()}
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Profile Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-center">
                  <div className="w-16 h-16 mx-auto bg-blue-500 rounded-full flex items-center justify-center text-white text-lg font-bold">
                    {userProfile?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="font-semibold">{userProfile?.full_name}</p>
                    <p className="text-sm text-gray-600 capitalize">{userProfile?.role}</p>
                    <p className="text-xs text-gray-500">{userProfile?.location}</p>
                  </div>
                  <Badge 
                    variant={userProfile?.approval_status === 'approved' ? 'default' : 'secondary'}
                    className={userProfile?.approval_status === 'approved' ? 'bg-green-500' : ''}
                  >
                    {userProfile?.approval_status?.charAt(0).toUpperCase() + userProfile?.approval_status?.slice(1)}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue={userProfile?.role === 'worker' ? 'findJobs' : 'jobs'} className="w-full">
              <TabsList className={`grid w-full ${userProfile?.role === 'worker' ? 'grid-cols-3' : 'grid-cols-3'}`}>
                {userProfile?.role === 'worker' && (
                  <TabsTrigger value="findJobs">Find Jobs</TabsTrigger>
                )}
                <TabsTrigger value={userProfile?.role === 'worker' ? 'applications' : 'jobs'}>
                  {userProfile?.role === 'worker' ? 'My Applications' : 'My Jobs'}
                </TabsTrigger>
                {userProfile?.role === 'employer' && (
                  <TabsTrigger value="applications">Applications Received</TabsTrigger>
                )}
                <TabsTrigger value="activity">Recent Activity</TabsTrigger>
              </TabsList>

              <TabsContent value="findJobs" className="space-y-4">
                <div className="mb-6">
                  <Button 
                    onClick={() => navigate('/find-work')} 
                    className="w-full"
                    size="lg"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Browse All Jobs in Find Work Section
                  </Button>
                </div>
                
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Quick Job Preview</h3>
                </div>
                
                <div className="space-y-4">
                  {nearbyJobs.slice(0, 5).map((job) => (
                    <Card key={job.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleJobClick(job.id)}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold text-lg">{job.title}</h4>
                            <p className="text-gray-600">{job.profiles?.full_name}</p>
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                            <Badge variant="secondary" className="text-green-600 bg-green-50">
                              ${job.pay_rate}/{job.pay_type}
                            </Badge>
                            <Badge variant={job.status === 'open' ? 'default' : 'secondary'}>
                              {job.status}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {job.location}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {job.duration || 'Not specified'}
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-700 mb-3">{job.description.substring(0, 150)}...</p>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">
                            Posted {new Date(job.created_at).toLocaleDateString()}
                          </span>
                          <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                            <Button variant="outline" size="sm" onClick={() => handleJobClick(job.id)}>
                              View Details
                            </Button>
                            <Button size="sm" onClick={() => handleApplyNow(job.id)}>
                              Apply Now
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {nearbyJobs.length === 0 && (
                    <Card>
                      <CardContent className="p-6 text-center">
                        <p className="text-gray-500">
                          No jobs available at the moment. Check back later!
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {nearbyJobs.length > 5 && (
                    <Card className="border-dashed">
                      <CardContent className="p-6 text-center">
                        <p className="text-gray-600 mb-4">
                          Showing 5 of {nearbyJobs.length} available jobs
                        </p>
                        <Button onClick={() => navigate('/find-work')}>
                          <Search className="h-4 w-4 mr-2" />
                          View All {nearbyJobs.length} Jobs
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="jobs" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">My Posted Jobs</h3>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => navigate('/post-job')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Post New Job
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {myJobs.map((job) => (
                    <Card key={job.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleJobClick(job.id)}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold text-lg">{job.title}</h4>
                            <p className="text-gray-600">
                              {job.job_applications?.length || 0} applications
                            </p>
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                            <Badge variant="secondary" className="text-green-600 bg-green-50">
                              ${job.pay_rate}/{job.pay_type}
                            </Badge>
                            <Badge variant={job.status === 'open' ? 'default' : 'secondary'}>
                              {job.status}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {job.location}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {job.duration || 'Not specified'}
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-700 mb-3">{job.description.substring(0, 150)}...</p>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">
                            Posted {new Date(job.created_at).toLocaleDateString()}
                          </span>
                          <Button variant="outline" size="sm" onClick={(e) => {
                            e.stopPropagation();
                            handleJobClick(job.id);
                          }}>
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {myJobs.length === 0 && (
                    <Card>
                      <CardContent className="p-6 text-center">
                        <p className="text-gray-500">
                          No jobs posted yet. Create your first job posting!
                        </p>
                        <Button className="mt-4" onClick={() => navigate('/post-job')}>
                          <Plus className="h-4 w-4 mr-2" />
                          Post Your First Job
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="applications" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">
                    {userProfile?.role === 'worker' ? 'My Job Applications' : 'Applications Received'}
                  </h3>
                  <Badge variant="outline">
                    {userProfile?.role === 'worker' ? myApplications.length : receivedApplications.length} Applications
                  </Badge>
                </div>
                <div className="space-y-4">
                  {(userProfile?.role === 'worker' ? myApplications : receivedApplications).map((application) => (
                    <Card key={application.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg">{application.jobs?.title}</h4>
                            <p className="text-gray-600 mb-2">
                              {userProfile?.role === 'worker' 
                                ? `Employer: ${application.jobs?.profiles?.full_name || 'Unknown'}` 
                                : `Applicant: ${application.profiles?.full_name || 'Unknown'}`
                              }
                            </p>
                            <div className="space-y-1">
                              <p className="text-sm text-gray-500">
                                Applied on {new Date(application.applied_at).toLocaleDateString()}
                              </p>
                              {application.jobs?.pay_rate && (
                                <p className="text-sm font-medium text-green-600">
                                  Pay: ${application.jobs.pay_rate}/{application.jobs.pay_type}
                                </p>
                              )}
                              {application.jobs?.location && (
                                <p className="text-sm text-gray-600 flex items-center">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {application.jobs.location}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end space-y-2 ml-4">
                            <Badge 
                              variant={
                                application.status === 'accepted' ? 'default' : 
                                application.status === 'rejected' ? 'destructive' : 
                                'secondary'
                              }
                              className={
                                application.status === 'accepted' ? 'bg-green-500' : 
                                application.status === 'rejected' ? 'bg-red-500' : ''
                              }
                            >
                              {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                            </Badge>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleJobClick(application.job_id)}
                            >
                              View Job
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {(userProfile?.role === 'worker' ? myApplications : receivedApplications).length === 0 && (
                    <Card>
                      <CardContent className="p-6 text-center">
                        <Briefcase className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-500 mb-4">
                          {userProfile?.role === 'worker' 
                            ? 'No applications yet. Start applying to jobs!' 
                            : 'No applications received yet for your job postings.'
                          }
                        </p>
                        {userProfile?.role === 'worker' && (
                          <Button onClick={() => navigate('/find-work')}>
                            <Search className="h-4 w-4 mr-2" />
                            Browse Jobs
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="activity" className="space-y-4">
                <h3 className="text-lg font-semibold">Recent Activity</h3>
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="border-l-4 border-blue-500 pl-4">
                        <p className="font-medium">Profile approved</p>
                        <p className="text-sm text-gray-600">Your account has been approved by the admin</p>
                        <p className="text-xs text-gray-500">Welcome to GweruJobs!</p>
                      </div>
                      {userProfile?.role === 'worker' && dashboardStats.totalApplications > 0 && (
                        <div className="border-l-4 border-green-500 pl-4">
                          <p className="font-medium">Applications submitted</p>
                          <p className="text-sm text-gray-600">You have {dashboardStats.totalApplications} active job applications</p>
                          <p className="text-xs text-gray-500">Keep checking for updates!</p>
                        </div>
                      )}
                      {userProfile?.role === 'employer' && dashboardStats.totalJobs > 0 && (
                        <div className="border-l-4 border-purple-500 pl-4">
                          <p className="font-medium">Jobs posted</p>
                          <p className="text-sm text-gray-600">You have posted {dashboardStats.totalJobs} jobs</p>
                          <p className="text-xs text-gray-500">Great work connecting with workers!</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Dashboard;
