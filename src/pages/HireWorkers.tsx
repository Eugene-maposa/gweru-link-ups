
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Star, Phone, Mail, Search, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import hireBackground from "@/assets/hire-background.jpg";

const HireWorkers = () => {
  const [workers, setWorkers] = useState<any[]>([]);
  const [filteredWorkers, setFilteredWorkers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [skillFilter, setSkillFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchWorkers();
  }, []);

  useEffect(() => {
    filterWorkers();
  }, [workers, searchTerm, locationFilter, skillFilter]);

  const fetchWorkers = async () => {
    try {
      const { data, error } = await supabase
        .from('worker_profiles')
        .select(`
          *,
          profiles:user_id (
            full_name,
            phone,
            location,
            approval_status
          )
        `)
        .eq('profiles.approval_status', 'approved');

      if (error) throw error;
      setWorkers(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch workers",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterWorkers = () => {
    let filtered = workers;

    if (searchTerm) {
      filtered = filtered.filter(worker => 
        worker.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        worker.skills?.some((skill: string) => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (locationFilter !== "all") {
      filtered = filtered.filter(worker => worker.profiles?.location === locationFilter);
    }

    if (skillFilter !== "all") {
      filtered = filtered.filter(worker => 
        worker.skills?.includes(skillFilter)
      );
    }

    setFilteredWorkers(filtered);
  };

  const handleContactWorker = (worker: any) => {
    toast({
      title: "Contact Worker",
      description: `Contact ${worker.profiles?.full_name} at ${worker.profiles?.phone}`,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg">Loading workers...</div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: `url(${hireBackground})` }}
    >
      <div className="absolute inset-0 bg-white/90"></div>
      <div className="relative z-10">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Hire Workers</h1>
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filter Workers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                  <Input
                    placeholder="Search by name or skills..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    <SelectItem value="city-center">City Center</SelectItem>
                    <SelectItem value="mkoba">Mkoba</SelectItem>
                    <SelectItem value="mambo">Mambo</SelectItem>
                    <SelectItem value="senga">Senga</SelectItem>
                    <SelectItem value="mtapa">Mtapa</SelectItem>
                    <SelectItem value="ascot">Ascot</SelectItem>
                    <SelectItem value="southdowns">Southdowns</SelectItem>
                    <SelectItem value="kopje">Kopje</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Skills</label>
                <Select value={skillFilter} onValueChange={setSkillFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Skills</SelectItem>
                    <SelectItem value="Construction">Construction</SelectItem>
                    <SelectItem value="Gardening">Gardening</SelectItem>
                    <SelectItem value="Cleaning">Cleaning</SelectItem>
                    <SelectItem value="Moving">Moving</SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Workers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkers.map((worker) => (
            <Card key={worker.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{worker.profiles?.full_name}</CardTitle>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                    <span className="text-sm font-medium">{worker.rating || 'New'}</span>
                  </div>
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span className="text-sm">{worker.profiles?.location}</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {worker.skills?.map((skill: string) => (
                        <Badge key={skill} variant="secondary">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Experience:</span>
                      <p className="font-medium">{worker.experience_years || 0} years</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Daily Rate:</span>
                      <p className="font-medium text-green-600">${worker.daily_rate || 'Negotiable'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-gray-600">Jobs Completed:</span>
                    <p className="font-medium">{worker.total_jobs_completed}</p>
                  </div>
                  
                  {worker.bio && (
                    <div>
                      <span className="text-gray-600">About:</span>
                      <p className="text-sm mt-1">{worker.bio}</p>
                    </div>
                  )}
                  
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleContactWorker(worker)}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Contact
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(`mailto:checkchirasha@gmail.com?subject=Job Inquiry for ${worker.profiles?.full_name}`)}
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {filteredWorkers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium">No workers found</h3>
              <p>Try adjusting your search criteria</p>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default HireWorkers;
