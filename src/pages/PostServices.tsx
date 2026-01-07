
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Briefcase, MapPin, Clock, DollarSign, Plus, X, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const skillOptions = [
  "Construction", "Gardening", "Cleaning", "Moving", "Maintenance",
  "Painting", "Plumbing", "Electrical", "Carpentry", "Welding",
  "Driving", "Cooking", "Childcare", "Elder Care", "Security",
  "Landscaping", "Masonry", "Roofing", "Tiling", "General Labor"
];

const PostServices = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [workerProfile, setWorkerProfile] = useState<any>(null);
  const [hasExistingProfile, setHasExistingProfile] = useState(false);
  const [formData, setFormData] = useState({
    bio: '',
    availability: '',
    skills: [] as string[],
    hourly_rate: '',
    daily_rate: '',
    experience_years: '',
    service_title: '',
    service_description: ''
  });
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userProfile, user } = useAuth();

  useEffect(() => {
    if (userProfile?.roles?.includes('worker')) {
      fetchWorkerProfile();
    }
  }, [userProfile]);

  const fetchWorkerProfile = async () => {
    if (!userProfile?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('worker_profiles')
        .select('*')
        .eq('user_id', userProfile.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching worker profile:', error);
        return;
      }
      
      if (data) {
        setWorkerProfile(data);
        setHasExistingProfile(true);
        setFormData({
          bio: data.bio || '',
          availability: data.availability || '',
          skills: data.skills || [],
          hourly_rate: data.hourly_rate?.toString() || '',
          daily_rate: data.daily_rate?.toString() || '',
          experience_years: data.experience_years?.toString() || '',
          service_title: '',
          service_description: ''
        });
      }
    } catch (error) {
      console.error('Error fetching worker profile:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userProfile?.roles?.includes('worker')) {
      toast({
        title: "Access Denied",
        description: "Only workers can post services.",
        variant: "destructive"
      });
      return;
    }

    if (formData.skills.length === 0) {
      toast({
        title: "Skills Required",
        description: "Please add at least one skill.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.bio.trim()) {
      toast({
        title: "Description Required",
        description: "Please add a description about yourself and your services.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const workerData = {
        bio: formData.bio.trim(),
        availability: formData.availability,
        skills: formData.skills,
        hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : null,
        daily_rate: formData.daily_rate ? parseFloat(formData.daily_rate) : null,
        experience_years: formData.experience_years ? parseInt(formData.experience_years) : null,
        user_id: userProfile.id
      };
      
      if (workerProfile) {
        const { error } = await supabase
          .from('worker_profiles')
          .update(workerData)
          .eq('user_id', userProfile.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('worker_profiles')
          .insert([workerData]);
        
        if (error) throw error;
      }
      
      toast({
        title: "Services Posted!",
        description: "Your services are now visible to employers looking for workers.",
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error posting services:', error);
      toast({
        title: "Failed to Post",
        description: error.message || "Failed to post your services. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkillToggle = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleCustomSkillAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const skill = e.currentTarget.value.trim();
      if (skill && !formData.skills.includes(skill)) {
        setFormData(prev => ({
          ...prev,
          skills: [...prev.skills, skill]
        }));
        e.currentTarget.value = '';
      }
    }
  };

  if (!userProfile?.roles?.includes('worker')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Workers Only</CardTitle>
            <CardDescription>
              Only users with a worker role can post services.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Post Your Services</h1>
              <p className="text-sm text-gray-600">Let employers know what work you can do</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {hasExistingProfile && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">You already have a worker profile! Update it below.</span>
              </div>
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6">
            {/* About Your Services */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  About Your Services
                </CardTitle>
                <CardDescription>
                  Describe yourself and the work you offer to potential employers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bio">About Me & My Services *</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell employers about your experience, what services you offer, and why they should hire you. Be specific about your expertise and past work..."
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    rows={5}
                    className="resize-none"
                  />
                  <p className="text-xs text-gray-500">
                    Include details about your experience, types of work you've done, and what makes you a great hire
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience">Years of Experience</Label>
                  <Input
                    id="experience"
                    type="number"
                    min="0"
                    max="50"
                    placeholder="e.g., 5"
                    value={formData.experience_years}
                    onChange={(e) => setFormData(prev => ({ ...prev, experience_years: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle>Skills & Services *</CardTitle>
                <CardDescription>
                  Select the types of work you can do (select all that apply)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {skillOptions.map((skill) => (
                    <Badge
                      key={skill}
                      variant={formData.skills.includes(skill) ? "default" : "outline"}
                      className="cursor-pointer hover:bg-primary/80 transition-colors"
                      onClick={() => handleSkillToggle(skill)}
                    >
                      {formData.skills.includes(skill) && <CheckCircle className="h-3 w-3 mr-1" />}
                      {skill}
                    </Badge>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customSkill">Add Custom Skill</Label>
                  <Input
                    id="customSkill"
                    placeholder="Type a skill and press Enter"
                    onKeyDown={handleCustomSkillAdd}
                  />
                </div>

                {formData.skills.length > 0 && (
                  <div className="space-y-2">
                    <Label>Selected Skills ({formData.skills.length})</Label>
                    <div className="flex flex-wrap gap-2">
                      {formData.skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="gap-1">
                          {skill}
                          <X
                            className="h-3 w-3 cursor-pointer hover:text-destructive"
                            onClick={() => handleSkillToggle(skill)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Rates & Availability */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Rates & Availability
                </CardTitle>
                <CardDescription>
                  Set your pricing and when you're available to work
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                    <Input
                      id="hourlyRate"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="e.g., 15"
                      value={formData.hourly_rate}
                      onChange={(e) => setFormData(prev => ({ ...prev, hourly_rate: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dailyRate">Daily Rate ($)</Label>
                    <Input
                      id="dailyRate"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="e.g., 100"
                      value={formData.daily_rate}
                      onChange={(e) => setFormData(prev => ({ ...prev, daily_rate: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="availability">Availability</Label>
                  <Select
                    value={formData.availability}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, availability: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full-time (Available anytime)</SelectItem>
                      <SelectItem value="part-time">Part-time (Limited hours)</SelectItem>
                      <SelectItem value="weekends">Weekends Only</SelectItem>
                      <SelectItem value="evenings">Evenings Only</SelectItem>
                      <SelectItem value="flexible">Flexible Schedule</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Location Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-red-500" />
                  Your Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">
                    {userProfile?.location || 'Location not set'}
                  </span>
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="ml-auto"
                    type="button"
                    onClick={() => navigate('/profile')}
                  >
                    Update in Profile
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Employers will see your location to find workers near them
                </p>
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => navigate('/dashboard')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading ? "Posting..." : hasExistingProfile ? "Update My Services" : "Post My Services"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostServices;
