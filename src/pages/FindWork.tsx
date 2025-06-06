
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Filter } from "lucide-react";
import JobCard from "@/components/JobCard";

const FindWork = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const jobs = [
    {
      id: 1,
      title: "Construction Helper Needed",
      employer: "ABC Construction",
      location: "City Center",
      distance: "0.5 km",
      pay: "$15/day",
      duration: "3 days",
      rating: 4.8,
      posted: "2 hours ago",
      category: "Construction",
      description: "Looking for reliable construction helper for building project. Must be physically fit and punctual."
    },
    {
      id: 2,
      title: "Garden Maintenance Work",
      employer: "Green Spaces Ltd",
      location: "Suburbs",
      distance: "1.2 km",
      pay: "$8/day",
      duration: "1 day",
      rating: 4.5,
      posted: "5 hours ago",
      category: "Gardening",
      description: "Need someone to help with lawn mowing, weeding, and general garden cleanup."
    },
    {
      id: 3,
      title: "Moving Assistant Required",
      employer: "Sarah Johnson",
      location: "Kumalo",
      distance: "2.1 km",
      pay: "$12/day",
      duration: "1 day",
      rating: 4.9,
      posted: "1 day ago",
      category: "Moving",
      description: "Help needed with packing and moving household items to new location."
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
      posted: "2 days ago",
      category: "Warehouse",
      description: "Loading and unloading goods at warehouse. Physical work required."
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
      posted: "3 days ago",
      category: "Events",
      description: "Setting up chairs, tables, and decorations for wedding event."
    },
    {
      id: 6,
      title: "House Cleaning Service",
      employer: "Clean & Shine",
      location: "Luveve",
      distance: "4.1 km",
      pay: "$6/day",
      duration: "Half day",
      rating: 4.3,
      posted: "4 days ago",
      category: "Cleaning",
      description: "Deep cleaning of residential property. Experience with cleaning supplies preferred."
    },
    {
      id: 7,
      title: "Delivery Driver Helper",
      employer: "Fast Delivery Co",
      location: "Mpopoma",
      distance: "2.8 km",
      pay: "$9/day",
      duration: "1 day",
      rating: 4.4,
      posted: "1 week ago",
      category: "Delivery",
      description: "Assist delivery driver with loading, unloading, and navigating routes."
    }
  ];

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.employer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || selectedCategory === "all" || job.category === selectedCategory;
    const matchesLocation = !selectedLocation || selectedLocation === "all" || job.location === selectedLocation;
    
    return matchesSearch && matchesCategory && matchesLocation;
  });

  // Sort jobs based on selected criteria
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    switch (sortBy) {
      case "pay":
        return parseInt(b.pay.replace(/[^\d]/g, '')) - parseInt(a.pay.replace(/[^\d]/g, ''));
      case "rating":
        return b.rating - a.rating;
      case "distance":
        return parseFloat(a.distance) - parseFloat(b.distance);
      default: // newest
        return new Date(b.posted).getTime() - new Date(a.posted).getTime();
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Find Work</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="h-5 w-5 mr-2" />
              Search Jobs
            </CardTitle>
            <CardDescription>
              Find jobs that match your skills and location preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="md:col-span-2">
                <Input
                  placeholder="Search jobs or employers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Construction">Construction</SelectItem>
                  <SelectItem value="Gardening">Gardening</SelectItem>
                  <SelectItem value="Moving">Moving</SelectItem>
                  <SelectItem value="Warehouse">Warehouse</SelectItem>
                  <SelectItem value="Events">Events</SelectItem>
                  <SelectItem value="Cleaning">Cleaning</SelectItem>
                  <SelectItem value="Delivery">Delivery</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="City Center">City Center</SelectItem>
                  <SelectItem value="Suburbs">Suburbs</SelectItem>
                  <SelectItem value="Kumalo">Kumalo</SelectItem>
                  <SelectItem value="Luveve">Luveve</SelectItem>
                  <SelectItem value="Nkulumane">Nkulumane</SelectItem>
                  <SelectItem value="Mpopoma">Mpopoma</SelectItem>
                  <SelectItem value="Entumbane">Entumbane</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="pay">Highest Pay</SelectItem>
                  <SelectItem value="rating">Best Rating</SelectItem>
                  <SelectItem value="distance">Closest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold">
            {sortedJobs.length} Job{sortedJobs.length !== 1 ? 's' : ''} Found
          </h2>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            More Filters
          </Button>
        </div>

        {/* Job Listings */}
        <div className="space-y-4">
          {sortedJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>

        {sortedJobs.length === 0 && (
          <Card className="text-center py-8">
            <CardContent>
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
              <p className="text-gray-600">
                Try adjusting your search criteria or check back later for new opportunities.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default FindWork;
