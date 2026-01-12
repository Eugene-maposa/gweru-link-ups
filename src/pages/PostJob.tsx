
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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const PostJob = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    urgency: '',
    payRate: '',
    payType: 'daily',
    duration: '',
    location: '',
    workersNeeded: '',
    requirements: '',
    contact: ''
  });
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (!user) {
        throw new Error('You must be logged in to post a job');
      }

      // Parse pay rate and determine pay type
      const payRateMatch = formData.payRate.match(/(\d+(?:\.\d+)?)/);
      const payRate = payRateMatch ? parseFloat(payRateMatch[1]) : 0;
      
      // Create job data
      const jobData = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        pay_rate: payRate,
        pay_type: formData.payType,
        duration: formData.duration,
        status: 'open',
        skills_required: formData.requirements ? [formData.requirements] : [],
        employer_id: user.id
      };

      console.log('Creating job with data:', jobData);

      const { data, error } = await supabase
        .from('jobs')
        .insert([jobData])
        .select();

      if (error) {
        console.error('Error creating job:', error);
        throw error;
      }

      console.log('Job created successfully:', data);

      toast({
        title: "Job Posted Successfully!",
        description: "Your job posting is now live and workers in your area will be notified.",
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Failed to create job:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to post job. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
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
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., Construction Helper, Garden Work, Moving Assistant"
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Job Description</Label>
                <Textarea 
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe the work that needs to be done, requirements, and any special instructions..."
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Job Category</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)} required>
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
                  <Select value={formData.urgency} onValueChange={(value) => handleInputChange('urgency', value)} required>
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
                    value={formData.payRate}
                    onChange={(e) => handleInputChange('payRate', e.target.value)}
                    placeholder="e.g., 10"
                    required 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Select value={formData.duration} onValueChange={(value) => handleInputChange('duration', value)} required>
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
                <Select value={formData.location} onValueChange={(value) => handleInputChange('location', value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Where is the job?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="city-center">City Center</SelectItem>
                    <SelectItem value="mkoba">Mkoba</SelectItem>
                    <SelectItem value="mambo">Mambo</SelectItem>
                    <SelectItem value="senga">Senga</SelectItem>
                    <SelectItem value="mtapa">Mtapa</SelectItem>
                    <SelectItem value="ascot">Ascot</SelectItem>
                    <SelectItem value="southdowns">Southdowns</SelectItem>
                    <SelectItem value="kopje">Kopje</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="workers-needed">Number of Workers Needed</Label>
                <Select value={formData.workersNeeded} onValueChange={(value) => handleInputChange('workersNeeded', value)} required>
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
                  value={formData.requirements}
                  onChange={(e) => handleInputChange('requirements', e.target.value)}
                  placeholder="Any specific skills, tools, or experience required..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact">Contact Information</Label>
                <Input 
                  id="contact" 
                  value={formData.contact}
                  onChange={(e) => handleInputChange('contact', e.target.value)}
                  placeholder="Phone number or preferred contact method"
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
