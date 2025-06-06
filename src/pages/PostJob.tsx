
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

const PostJob = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Job Posted Successfully!",
        description: "Your job posting is now live and workers in your area will be notified.",
      });
      navigate('/dashboard');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Post a Job</h1>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Create Job Posting</CardTitle>
            <CardDescription>
              Fill out the details below to find the right workers for your job.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Job Title</Label>
                <Input 
                  id="title" 
                  placeholder="e.g., Construction Helper, Garden Work, Moving Assistant"
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Job Description</Label>
                <Textarea 
                  id="description"
                  placeholder="Describe the work that needs to be done, requirements, and any special instructions..."
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Job Category</Label>
                  <Select required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="construction">Construction & Building</SelectItem>
                      <SelectItem value="gardening">Gardening & Landscaping</SelectItem>
                      <SelectItem value="cleaning">Cleaning & Maintenance</SelectItem>
                      <SelectItem value="moving">Moving & Delivery</SelectItem>
                      <SelectItem value="events">Event Setup</SelectItem>
                      <SelectItem value="warehouse">Warehouse & Loading</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="urgency">Urgency</Label>
                  <Select required>
                    <SelectTrigger>
                      <SelectValue placeholder="How urgent?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate (Today)</SelectItem>
                      <SelectItem value="this-week">This Week</SelectItem>
                      <SelectItem value="next-week">Next Week</SelectItem>
                      <SelectItem value="flexible">Flexible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pay">Pay Rate</Label>
                  <Input 
                    id="pay" 
                    placeholder="e.g., $10/day"
                    required 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Select required>
                    <SelectTrigger>
                      <SelectValue placeholder="How long?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="few-hours">Few Hours</SelectItem>
                      <SelectItem value="half-day">Half Day</SelectItem>
                      <SelectItem value="full-day">Full Day</SelectItem>
                      <SelectItem value="multiple-days">Multiple Days</SelectItem>
                      <SelectItem value="ongoing">Ongoing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Select required>
                  <SelectTrigger>
                    <SelectValue placeholder="Where is the job?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="city-center">City Center</SelectItem>
                    <SelectItem value="suburbs">Suburbs</SelectItem>
                    <SelectItem value="kumalo">Kumalo</SelectItem>
                    <SelectItem value="luveve">Luveve</SelectItem>
                    <SelectItem value="nkulumane">Nkulumane</SelectItem>
                    <SelectItem value="mpopoma">Mpopoma</SelectItem>
                    <SelectItem value="entumbane">Entumbane</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="workers-needed">Number of Workers Needed</Label>
                <Select required>
                  <SelectTrigger>
                    <SelectValue placeholder="How many workers?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Worker</SelectItem>
                    <SelectItem value="2">2 Workers</SelectItem>
                    <SelectItem value="3-5">3-5 Workers</SelectItem>
                    <SelectItem value="5+">5+ Workers</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="requirements">Special Requirements (Optional)</Label>
                <Textarea 
                  id="requirements"
                  placeholder="Any specific skills, tools, or experience required..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact">Contact Information</Label>
                <Input 
                  id="contact" 
                  placeholder="Phone number or preferred contact method"
                  defaultValue="+263 775 126 513"
                  required 
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Posting Job..." : "Post Job"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PostJob;
