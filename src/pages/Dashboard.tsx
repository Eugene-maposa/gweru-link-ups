
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { MapPin, Plus, Search, Star, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const [userType] = useState("worker"); // This would come from auth context

  const nearbyJobs = [
    {
      id: 1,
      title: "Construction Helper Needed",
      employer: "ABC Construction",
      location: "City Center",
      distance: "0.5 km",
      pay: "$15/day",
      duration: "3 days",
      rating: 4.8,
      posted: "2 hours ago"
    },
    {
      id: 2,
      title: "Garden Maintenance",
      employer: "Green Spaces Ltd",
      location: "Suburbs",
      distance: "1.2 km",
      pay: "$8/day",
      duration: "1 day",
      rating: 4.5,
      posted: "5 hours ago"
    },
    {
      id: 3,
      title: "Moving Assistant",
      employer: "Sarah Johnson",
      location: "Kumalo",
      distance: "2.1 km",
      pay: "$12/day",
      duration: "1 day",
      rating: 4.9,
      posted: "1 day ago"
    },
    {
      id: 4,
      title: "Warehouse Loading",
      employer: "StoreCorp",
      location: "City Center",
      distance: "0.8 km",
      pay: "$10/day",
      duration: "Ongoing",
      rating: 4.6,
      posted: "2 days ago"
    },
    {
      id: 5,
      title: "Event Setup Helper",
      employer: "Events Plus",
      location: "Nkulumane",
      distance: "3.2 km",
      pay: "$14/day",
      duration: "2 days",
      rating: 4.7,
      posted: "3 days ago"
    }
  ];

  const myApplications = [
    {
      id: 1,
      title: "Warehouse Helper",
      employer: "StoreCorp",
      status: "pending",
      appliedDate: "2024-01-10"
    },
    {
      id: 2,
      title: "Event Setup",
      employer: "Events Plus",
      status: "accepted",
      appliedDate: "2024-01-08"
    }
  ];

  const handleJobClick = (jobId: number) => {
    navigate(`/job/${jobId}`);
  };

  const handleApplyNow = (jobId: number) => {
    navigate(`/job/${jobId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <div className="flex items-center space-x-4">
              <Button onClick={() => navigate('/profile')}>Profile</Button>
              <Button variant="outline" onClick={() => navigate('/')}>Logout</Button>
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
                <Button className="w-full" onClick={() => navigate('/post-job')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Post a Job
                </Button>
                <Button variant="outline" className="w-full" onClick={() => navigate('/find-work')}>
                  <Search className="h-4 w-4 mr-2" />
                  Find Work
                </Button>
                <Button variant="outline" className="w-full" onClick={() => navigate('/messages')}>
                  Messages
                </Button>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Your Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
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
                    <span className="text-sm text-gray-600">Response Rate</span>
                    <span className="font-semibold">95%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Earned</span>
                    <span className="font-semibold text-green-600">$1,250</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="nearby" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="nearby">Nearby Jobs</TabsTrigger>
                <TabsTrigger value="applications">My Applications</TabsTrigger>
                <TabsTrigger value="activity">Recent Activity</TabsTrigger>
              </TabsList>

              <TabsContent value="nearby" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Jobs Near You</h3>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => navigate('/find-work')}>
                      <Search className="h-4 w-4 mr-2" />
                      View All Jobs
                    </Button>
                    <Button variant="outline" size="sm">
                      <MapPin className="h-4 w-4 mr-2" />
                      Update Location
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
                            <p className="text-gray-600">{job.employer}</p>
                          </div>
                          <Badge variant="secondary" className="text-green-600 bg-green-50">{job.pay}</Badge>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {job.location} • {job.distance}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {job.duration}
                          </div>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 mr-1 text-yellow-500" />
                            {job.rating}
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Posted {job.posted}</span>
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
                </div>
              </TabsContent>

              <TabsContent value="applications" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">My Job Applications</h3>
                  <Badge variant="outline">{myApplications.length} Applications</Badge>
                </div>
                <div className="space-y-4">
                  {myApplications.map((application) => (
                    <Card key={application.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">{application.title}</h4>
                            <p className="text-gray-600">{application.employer}</p>
                            <p className="text-sm text-gray-500">Applied on {application.appliedDate}</p>
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
                        <p className="font-medium">New job posted near you</p>
                        <p className="text-sm text-gray-600">Construction Helper in City Center - $15/day</p>
                        <p className="text-xs text-gray-500">2 hours ago</p>
                      </div>
                      <div className="border-l-4 border-green-500 pl-4">
                        <p className="font-medium">Application accepted</p>
                        <p className="text-sm text-gray-600">Event Setup job by Events Plus - $14/day</p>
                        <p className="text-xs text-gray-500">1 day ago</p>
                      </div>
                      <div className="border-l-4 border-yellow-500 pl-4">
                        <p className="font-medium">New message received</p>
                        <p className="text-sm text-gray-600">From ABC Construction about Construction Helper role</p>
                        <p className="text-xs text-gray-500">2 days ago</p>
                      </div>
                      <div className="border-l-4 border-purple-500 pl-4">
                        <p className="font-medium">Profile viewed</p>
                        <p className="text-sm text-gray-600">Green Spaces Ltd viewed your profile</p>
                        <p className="text-xs text-gray-500">3 days ago</p>
                      </div>
                      <div className="border-l-4 border-indigo-500 pl-4">
                        <p className="font-medium">Job completed</p>
                        <p className="text-sm text-gray-600">Moving Assistant job completed - Earned $12</p>
                        <p className="text-xs text-gray-500">1 week ago</p>
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
