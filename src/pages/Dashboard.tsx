
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { MapPin, Plus, Search, Star, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import ApprovalStatus from "@/components/ApprovalStatus";

const Dashboard = () => {
  const navigate = useNavigate();
  const { userProfile, signOut } = useAuth();
  const [nearbyJobs, setNearbyJobs] = useState<any[]>([]);
  const [myApplications, setMyApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userProfile?.approval_status === 'approved') {
      fetchJobs();
      if (userProfile.role === 'worker') {
        fetchApplications();
      }
    }
    setLoading(false);
  }, [userProfile]);

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
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setNearbyJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
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
            profiles:employer_id (
              full_name
            )
          )
        `)
        .eq('worker_id', userProfile?.id)
        .order('applied_at', { ascending: false });

      if (error) throw error;
      setMyApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  // Show approval status if not approved
  if (userProfile && userProfile.approval_status !== 'approved') {
    return <ApprovalStatus />;
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
          <Button className="w-full" onClick={() => navigate('/post-job')}>
            <Plus className="h-4 w-4 mr-2" />
            Post a Job
          </Button>
          <Button variant="outline" className="w-full" onClick={() => navigate('/hire-workers')}>
            <Search className="h-4 w-4 mr-2" />
            Hire Workers
          </Button>
          <Button variant="outline" className="w-full" onClick={() => navigate('/messages')}>
            Messages
          </Button>
        </>
      );
    } else {
      return (
        <>
          <Button className="w-full" onClick={() => navigate('/find-work')}>
            <Search className="h-4 w-4 mr-2" />
            Find Work
          </Button>
          <Button variant="outline" className="w-full" onClick={() => navigate('/messages')}>
            Messages
          </Button>
        </>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Dashboard - {userProfile?.role?.charAt(0).toUpperCase() + userProfile?.role?.slice(1)}
            </h1>
            <div className="flex items-center space-x-4">
              <Button onClick={() => navigate('/profile')}>Profile</Button>
              <Button variant="outline" onClick={signOut}>Logout</Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                <CardTitle className="text-lg">Your Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userProfile?.role === 'worker' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Jobs Completed</span>
                        <span className="font-semibold">23</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Rating</span>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-500 mr-1" />
                          <span className="font-semibold">4.8</span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Earned</span>
                        <span className="font-semibold text-green-600">$1,250</span>
                      </div>
                    </>
                  )}
                  {userProfile?.role === 'employer' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Jobs Posted</span>
                        <span className="font-semibold">8</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Workers Hired</span>
                        <span className="font-semibold">15</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Spent</span>
                        <span className="font-semibold text-blue-600">$2,450</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Response Rate</span>
                    <span className="font-semibold">95%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue={userProfile?.role === 'worker' ? 'nearby' : 'jobs'} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value={userProfile?.role === 'worker' ? 'nearby' : 'jobs'}>
                  {userProfile?.role === 'worker' ? 'Available Jobs' : 'My Jobs'}
                </TabsTrigger>
                <TabsTrigger value="applications">
                  {userProfile?.role === 'worker' ? 'My Applications' : 'Applications'}
                </TabsTrigger>
                <TabsTrigger value="activity">Recent Activity</TabsTrigger>
              </TabsList>

              <TabsContent value={userProfile?.role === 'worker' ? 'nearby' : 'jobs'} className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">
                    {userProfile?.role === 'worker' ? 'Jobs Available' : 'Recent Jobs'}
                  </h3>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => navigate('/find-work')}>
                      <Search className="h-4 w-4 mr-2" />
                      View All Jobs
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {nearbyJobs.map((job) => (
                    <Card key={job.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleJobClick(job.id)}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold text-lg">{job.title}</h4>
                            <p className="text-gray-600">{job.profiles?.full_name}</p>
                          </div>
                          <Badge variant="secondary" className="text-green-600 bg-green-50">
                            ${job.pay_rate}/{job.pay_type}
                          </Badge>
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
                          {userProfile?.role === 'worker' && (
                            <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                              <Button variant="outline" size="sm" onClick={() => handleJobClick(job.id)}>
                                View Details
                              </Button>
                              <Button size="sm" onClick={() => handleApplyNow(job.id)}>
                                Apply Now
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="applications" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">
                    {userProfile?.role === 'worker' ? 'My Job Applications' : 'Job Applications'}
                  </h3>
                  <Badge variant="outline">{myApplications.length} Applications</Badge>
                </div>
                <div className="space-y-4">
                  {myApplications.map((application) => (
                    <Card key={application.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">{application.jobs?.title}</h4>
                            <p className="text-gray-600">{application.jobs?.profiles?.full_name}</p>
                            <p className="text-sm text-gray-500">
                              Applied on {new Date(application.applied_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                            <Badge 
                              variant={application.status === 'accepted' ? 'default' : 'secondary'}
                              className={application.status === 'accepted' ? 'bg-green-500' : ''}
                            >
                              {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                            </Badge>
                            <Button variant="outline" size="sm">
                              View Application
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
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
                        <p className="text-xs text-gray-500">Welcome to BulawayoJobs!</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
