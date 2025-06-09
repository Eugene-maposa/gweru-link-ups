
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
import { ArrowLeft, Star, MapPin, Phone, Mail, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [workerProfile, setWorkerProfile] = useState<any>(null);
  const [profileData, setProfileData] = useState({
    full_name: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    availability: '',
    skills: [] as string[],
    hourly_rate: '',
    daily_rate: '',
    experience_years: ''
  });
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userProfile, user } = useAuth();

  useEffect(() => {
    if (userProfile) {
      setProfileData({
        full_name: userProfile.full_name || '',
        email: userProfile.email || '',
        phone: userProfile.phone || '',
        location: userProfile.location || '',
        bio: '',
        availability: '',
        skills: [],
        hourly_rate: '',
        daily_rate: '',
        experience_years: ''
      });
      
      if (userProfile.role === 'worker') {
        fetchWorkerProfile();
      }
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
        setProfileData(prev => ({
          ...prev,
          bio: data.bio || '',
          availability: data.availability || '',
          skills: data.skills || [],
          hourly_rate: data.hourly_rate?.toString() || '',
          daily_rate: data.daily_rate?.toString() || '',
          experience_years: data.experience_years?.toString() || ''
        }));
      }
    } catch (error) {
      console.error('Error fetching worker profile:', error);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Update main profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: profileData.full_name,
          phone: profileData.phone,
          location: profileData.location
        })
        .eq('id', userProfile?.id);
      
      if (profileError) throw profileError;
      
      // Update worker profile if user is a worker
      if (userProfile?.role === 'worker') {
        const workerData = {
          bio: profileData.bio,
          availability: profileData.availability,
          skills: profileData.skills,
          hourly_rate: profileData.hourly_rate ? parseFloat(profileData.hourly_rate) : null,
          daily_rate: profileData.daily_rate ? parseFloat(profileData.daily_rate) : null,
          experience_years: profileData.experience_years ? parseInt(profileData.experience_years) : null,
          user_id: userProfile.id
        };
        
        if (workerProfile) {
          // Update existing worker profile
          const { error: workerError } = await supabase
            .from('worker_profiles')
            .update(workerData)
            .eq('user_id', userProfile.id);
          
          if (workerError) throw workerError;
        } else {
          // Create new worker profile
          const { error: workerError } = await supabase
            .from('worker_profiles')
            .insert([workerData]);
          
          if (workerError) throw workerError;
        }
      }
      
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      
      // Refresh the data
      if (userProfile?.role === 'worker') {
        fetchWorkerProfile();
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkillAdd = (skill: string) => {
    if (skill && !profileData.skills.includes(skill)) {
      setProfileData(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
    }
  };

  const handleSkillRemove = (skillToRemove: string) => {
    setProfileData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
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
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Summary */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <div className="w-24 h-24 mx-auto bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4">
                  {userProfile?.full_name ? getInitials(userProfile.full_name) : <User className="h-8 w-8" />}
                </div>
                <CardTitle>{userProfile?.full_name || 'User Name'}</CardTitle>
                <CardDescription>{userProfile?.role?.charAt(0).toUpperCase() + userProfile?.role?.slice(1) || 'User'}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userProfile?.role === 'worker' && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Rating</span>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-500 mr-1" />
                          <span className="font-semibold">{workerProfile?.rating || '5.0'}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Jobs Completed</span>
                        <span className="font-semibold">{workerProfile?.total_jobs_completed || 0}</span>
                      </div>
                    </>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Member Since</span>
                    <span className="font-semibold">
                      {userProfile?.created_at ? new Date(userProfile.created_at).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {userProfile?.role === 'worker' && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {profileData.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="cursor-pointer">
                        {skill}
                        {isEditing && (
                          <button
                            onClick={() => handleSkillRemove(skill)}
                            className="ml-2 text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        )}
                      </Badge>
                    ))}
                    {profileData.skills.length === 0 && (
                      <span className="text-gray-500 text-sm">No skills added yet</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Profile Information</CardTitle>
                  <Button 
                    variant={isEditing ? "outline" : "default"}
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? "Cancel" : "Edit Profile"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSave} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input 
                      id="fullName" 
                      value={profileData.full_name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <Input 
                        id="email" 
                        type="email"
                        value={profileData.email}
                        disabled={true}
                        className="flex-1 bg-gray-100"
                      />
                    </div>
                    <p className="text-xs text-gray-500">Email cannot be changed</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <Input 
                        id="phone" 
                        value={profileData.phone}
                        onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                        disabled={!isEditing}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <Select 
                        value={profileData.location}
                        onValueChange={(value) => setProfileData(prev => ({ ...prev, location: value }))}
                        disabled={!isEditing}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="city-center">City Center</SelectItem>
                          <SelectItem value="suburbs">Suburbs</SelectItem>
                          <SelectItem value="kumalo">Kumalo</SelectItem>
                          <SelectItem value="luveve">Luveve</SelectItem>
                          <SelectItem value="nkulumane">Nkulumane</SelectItem>
                          <SelectItem value="mpopoma">Mpopoma</SelectItem>
                          <SelectItem value="entumbane">Entumbane</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {userProfile?.role === 'worker' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="bio">About Me</Label>
                        <Textarea 
                          id="bio"
                          placeholder="Tell potential employers about your experience and skills..."
                          value={profileData.bio}
                          onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                          disabled={!isEditing}
                          rows={4}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                          <Input 
                            id="hourlyRate"
                            type="number"
                            value={profileData.hourly_rate}
                            onChange={(e) => setProfileData(prev => ({ ...prev, hourly_rate: e.target.value }))}
                            disabled={!isEditing}
                            placeholder="0"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="dailyRate">Daily Rate ($)</Label>
                          <Input 
                            id="dailyRate"
                            type="number"
                            value={profileData.daily_rate}
                            onChange={(e) => setProfileData(prev => ({ ...prev, daily_rate: e.target.value }))}
                            disabled={!isEditing}
                            placeholder="0"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="experience">Years of Experience</Label>
                        <Input 
                          id="experience"
                          type="number"
                          value={profileData.experience_years}
                          onChange={(e) => setProfileData(prev => ({ ...prev, experience_years: e.target.value }))}
                          disabled={!isEditing}
                          placeholder="0"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="availability">Availability</Label>
                        <Select 
                          value={profileData.availability}
                          onValueChange={(value) => setProfileData(prev => ({ ...prev, availability: value }))}
                          disabled={!isEditing}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select availability" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="full-time">Full-time</SelectItem>
                            <SelectItem value="part-time">Part-time</SelectItem>
                            <SelectItem value="weekends">Weekends Only</SelectItem>
                            <SelectItem value="flexible">Flexible</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {isEditing && (
                        <div className="space-y-2">
                          <Label htmlFor="newSkill">Add Skills</Label>
                          <div className="flex space-x-2">
                            <Input 
                              id="newSkill"
                              placeholder="Type a skill and press Enter"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleSkillAdd(e.currentTarget.value);
                                  e.currentTarget.value = '';
                                }
                              }}
                            />
                          </div>
                          <p className="text-xs text-gray-500">Press Enter to add a skill</p>
                        </div>
                      )}
                    </>
                  )}

                  {isEditing && (
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
