
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, Clock, Star, DollarSign, Calendar, User, Building, Phone, MessageSquare, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMessages } from "@/hooks/useMessages";
import { useAuth } from "@/hooks/useAuth";

const JobDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const { createConversation } = useMessages();
  const [isApplying, setIsApplying] = useState(false);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);

  // Mock job data - in a real app, this would come from an API
  const job = {
    id: parseInt(id || "1"),
    title: "Construction Helper Needed",
    employer: "ABC Construction",
    location: "City Center",
    distance: "0.5 km",
    pay: "$15/day",
    duration: "3 days",
    rating: 4.8,
    posted: "2 hours ago",
    category: "Construction",
    description: "Looking for reliable construction helper for building project. Must be physically fit and punctual.",
    fullDescription: `We are seeking a reliable and hardworking construction helper to join our team for a 3-day building project in the City Center. This is an excellent opportunity for someone looking to gain experience in the construction industry.

Key Responsibilities:
• Assist with general construction tasks
• Help with material handling and transportation
• Support skilled workers with various projects
• Maintain a clean and safe work environment
• Follow all safety protocols and guidelines

Requirements:
• Must be physically fit and able to lift heavy objects
• Punctual and reliable
• Willing to work in various weather conditions
• Basic understanding of construction safety
• Previous construction experience preferred but not required

What We Offer:
• Competitive daily rate of $15
• Safe working environment
• Opportunity to learn new skills
• Potential for future work opportunities`,
    requirements: [
      "Must be physically fit",
      "Punctual and reliable",
      "Basic safety knowledge",
      "Team player"
    ],
    benefits: [
      "Competitive pay",
      "Skill development",
      "Safe environment",
      "Future opportunities"
    ],
    contactInfo: {
      phone: "+263 775 126 513",
      whatsapp: "+263 775 126 513",
      email: "checkchirasha@gmail.com"
    }
  };

  const handleApply = async () => {
    setIsApplying(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: "Application Submitted!",
      description: "Your application has been sent to the employer. They will contact you soon.",
    });
    
    setIsApplying(false);
  };

  const handleContactEmployer = () => {
    // Open phone dialer
    window.open(`tel:${job.contactInfo.phone}`);
  };

  const handleContactWhatsapp = () => {
    // Open WhatsApp with the number
    window.open(`https://wa.me/${job.contactInfo.whatsapp.replace(/\s+/g, '')}`);
  };

  const handleContactEmail = () => {
    // Open email client
    window.open(`mailto:${job.contactInfo.email}`);
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

    setIsCreatingConversation(true);
    try {
      // For demo purposes, using mock employer ID
      // In real app, this would come from the job data
      const mockEmployerId = "employer-123";
      
      await createConversation(id || "1", user.id, mockEmployerId);
      
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
                <CardTitle className="text-2xl mb-2">{job.title}</CardTitle>
                <CardDescription className="text-lg mb-4">{job.employer}</CardDescription>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
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
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Posted {job.posted}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="text-lg px-3 py-1">
                    <DollarSign className="h-4 w-4 mr-1" />
                    {job.pay}
                  </Badge>
                  <Badge variant="outline">{job.category}</Badge>
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
              {job.fullDescription}
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
                {job.requirements.map((req, index) => (
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
                {job.benefits.map((benefit, index) => (
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
                <a href={`tel:${job.contactInfo.phone}`} className="text-blue-600 hover:underline">
                  {job.contactInfo.phone}
                </a>
              </div>
              <div className="flex items-center">
                <MessageSquare className="h-4 w-4 mr-2 text-gray-500" />
                <span className="font-medium mr-2">WhatsApp:</span>
                <a 
                  href={`https://wa.me/${job.contactInfo.whatsapp.replace(/\s+/g, '')}`} 
                  className="text-blue-600 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {job.contactInfo.whatsapp}
                </a>
              </div>
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-gray-500" />
                <span className="font-medium mr-2">Email:</span>
                <a href={`mailto:${job.contactInfo.email}`} className="text-blue-600 hover:underline">
                  {job.contactInfo.email}
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
