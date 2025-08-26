import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, Clock, Star, DollarSign, Calendar, User, Building, Phone, MessageSquare, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMessages } from "@/hooks/useMessages";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const JobDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const { createConversation } = useMessages();
  const [isApplying, setIsApplying] = useState(false);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch job data from database
  useEffect(() => {
    const fetchJob = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      
      try {
        console.log('Fetching job with ID:', id);
        
        const { data, error } = await supabase
          .from('jobs')
          .select(`
            *,
            employer:profiles!jobs_employer_id_fkey(full_name, phone)
          `)
          .eq('id', id)
          .maybeSingle(); // Use maybeSingle instead of single to handle no results

        if (error) {
          console.error('Error fetching job:', error);
          throw error;
        }
        
        console.log('Fetched job data:', data);
        setJob(data);
      } catch (error) {
        console.error('Error fetching job:', error);
        toast({
          title: "Error",
          description: "Failed to load job details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id, toast]);

  const handleApply = async () => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to apply for jobs.",
        variant: "destructive",
      });
      return;
    }

    setIsApplying(true);
    
    try {
      // Check if user has already applied
      const { data: existingApplication, error: checkError } = await supabase
        .from('job_applications')
        .select('id')
        .eq('job_id', job.id)
        .eq('worker_id', user.id)
        .single();

      if (existingApplication) {
        toast({
          title: "Already Applied",
          description: "You have already applied for this job.",
          variant: "destructive",
        });
        setIsApplying(false);
        return;
      }

      // Create job application
      const { error } = await supabase
        .from('job_applications')
        .insert({
          job_id: job.id,
          worker_id: user.id,
          status: 'pending'
        });

      if (error) {
        throw error;
      }
      
      toast({
        title: "Application Submitted!",
        description: "Your application has been sent to the employer. They will contact you soon.",
      });
    } catch (error) {
      console.error('Error applying for job:', error);
      toast({
        title: "Application Failed",
        description: "Failed to submit your application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsApplying(false);
    }
  };

  const handleContactEmployer = () => {
    if (!job?.employer?.phone) return;
    window.open(`tel:${job.employer.phone}`);
  };

  const handleContactWhatsapp = () => {
    if (!job?.employer?.phone) return;
    window.open(`https://wa.me/${job.employer.phone.replace(/\s+/g, '')}`);
  };

  const handleContactEmail = () => {
    window.open(`mailto:checkchirasha@gmail.com`);
  };

  const handleMessageEmployer = async () => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to message the employer.",
        variant: "destructive",
      });
      return;
    }

    if (!job?.employer_id) {
      toast({
        title: "Error",
        description: "Unable to find employer information.",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingConversation(true);
    try {
      await createConversation(job.id, user.id, job.employer_id);
      
      toast({
        title: "Conversation Started",
        description: "You can now message the employer about this job.",
      });
      
      navigate('/messages');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start conversation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingConversation(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h2>
          <p className="text-gray-600 mb-4">The job you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/find-work')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Button>
        </div>
      </div>
    );
  }

  // Use real job data with proper formatting
  const displayJob = {
    ...job,
    employer: job.employer?.full_name || 'Unknown Employer',
    location: job.location || 'Location not specified',
    distance: '0.5 km', // This would need to be calculated based on user location
    pay: `$${job.pay_rate}/${job.pay_type}`,
    duration: job.duration || 'Duration not specified',
    rating: 4.8, // This would come from employer ratings in a real app
    posted: new Date(job.created_at).toLocaleDateString(),
    category: 'General', // This would be a category field in the database
    fullDescription: job.description,
    requirements: job.skills_required || ['No specific requirements listed'],
    benefits: ['Competitive pay', 'Skill development'],
    contactInfo: {
      phone: job.employer?.phone || "+263 775 126 513",
      whatsapp: job.employer?.phone || "+263 775 126 513",
      email: "checkchirasha@gmail.com"
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate('/find-work')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Job Details</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Job Info */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2">{displayJob.title}</CardTitle>
                <CardDescription className="text-lg mb-4">{displayJob.employer}</CardDescription>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {displayJob.location} • {displayJob.distance}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {displayJob.duration}
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 mr-1 text-yellow-500" />
                    {displayJob.rating}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Posted {displayJob.posted}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="text-lg px-3 py-1">
                    <DollarSign className="h-4 w-4 mr-1" />
                    {displayJob.pay}
                  </Badge>
                  <Badge variant="outline">{displayJob.category}</Badge>
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-wrap gap-2">
                <Button 
                  size="lg" 
                  onClick={handleApply}
                  disabled={isApplying}
                  className="flex-1 md:flex-none"
                >
                  {isApplying ? "Applying..." : "Apply Now"}
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={handleMessageEmployer}
                  disabled={isCreatingConversation}
                  className="flex-1 md:flex-none"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  {isCreatingConversation ? "Starting..." : "Message Employer"}
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={handleContactEmployer}
                  className="flex-1 md:flex-none"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Job Description */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Job Description</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-line text-gray-700 leading-relaxed">
              {displayJob.fullDescription}
            </div>
          </CardContent>
        </Card>

        {/* Requirements and Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {displayJob.requirements.map((req, index) => (
                  <li key={index} className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-gray-700">{req}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Benefits</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {displayJob.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="h-5 w-5 mr-2" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-gray-500" />
                <span className="font-medium mr-2">Phone:</span>
                <a href={`tel:${displayJob.contactInfo.phone}`} className="text-blue-600 hover:underline">
                  {displayJob.contactInfo.phone}
                </a>
              </div>
              <div className="flex items-center">
                <MessageSquare className="h-4 w-4 mr-2 text-gray-500" />
                <span className="font-medium mr-2">WhatsApp:</span>
                <a 
                  href={`https://wa.me/${displayJob.contactInfo.whatsapp.replace(/\s+/g, '')}`} 
                  className="text-blue-600 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {displayJob.contactInfo.whatsapp}
                </a>
              </div>
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-gray-500" />
                <span className="font-medium mr-2">Email:</span>
                <a href={`mailto:${displayJob.contactInfo.email}`} className="text-blue-600 hover:underline">
                  {displayJob.contactInfo.email}
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JobDetails;
