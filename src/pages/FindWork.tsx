
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Filter, Briefcase, ArrowLeft } from "lucide-react";
import JobCard from "@/components/JobCard";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import findworkBackground from "@/assets/findwork-background.jpg";

const FindWork = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          employer:profiles!jobs_employer_id_fkey(full_name)
        `)
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      console.log('Fetched jobs:', data);
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast({
        title: "Error",
        description: "Failed to load jobs. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    // In a real app, this would filter the jobs based on searchTerm, location, and category
    fetchJobs();
  };

  // Transform database jobs to match JobCard interface
  const transformedJobs = jobs.map(job => ({
    id: job.id,
    title: job.title,
    employer: job.employer?.full_name || 'Unknown Employer',
    location: job.location,
    distance: '0.5 km', // This would be calculated based on user location
    pay: `$${job.pay_rate}/${job.pay_type}`,
    duration: job.duration || 'Duration not specified',
    rating: 4.8, // This would come from employer ratings
    posted: new Date(job.created_at).toLocaleDateString(),
    category: 'General', // This would be a category field in the database
    description: job.description,
    status: job.status
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: `url(${findworkBackground})` }}
    >
      <div className="absolute inset-0 bg-white/90"></div>
      <div className="relative z-10">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center space-x-4 mb-2">
                <Button variant="ghost" onClick={() => navigate('/dashboard')}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-3xl font-bold text-gray-900">Find Work</h1>
              </div>
              <p className="text-gray-600 mt-1">
                Browse <span className="font-semibold text-green-600">available job listings</span> posted by employers in Gweru
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-sm">
                {transformedJobs.length} Jobs Available
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info Banner */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">For Job Seekers</h3>
              <p className="text-sm text-green-700 mt-1">
                These are <strong>job openings</strong> posted by employers. Apply to jobs that match your skills and experience.
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="h-5 w-5 mr-2" />
              Browse Job Openings
            </CardTitle>
            <CardDescription>Find jobs posted by employers looking to hire</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <Input
                  placeholder="Search jobs, skills, or companies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-full">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="construction">Construction</SelectItem>
                    <SelectItem value="cleaning">Cleaning</SelectItem>
                    <SelectItem value="gardening">Gardening</SelectItem>
                    <SelectItem value="delivery">Delivery</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleSearch} className="whitespace-nowrap">
                  Search
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Jobs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {transformedJobs.length > 0 ? (
            transformedJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Briefcase className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium">No jobs found</h3>
              <p className="text-gray-500">Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
};

export default FindWork;
