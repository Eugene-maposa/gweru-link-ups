
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BrowserRouter as Router, useNavigate } from "react-router-dom";
import { MapPin, Users, Briefcase, Star, Heart, Award, CheckCircle } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Briefcase className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">BulawayoJobs</h1>
            </div>
            <div className="space-x-4">
              <Button variant="outline" onClick={() => navigate('/auth')}>
                Sign In
              </Button>
              <Button onClick={() => navigate('/auth')}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Connecting General Hand Workers with Employers in Bulawayo
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Find the right job or hire skilled workers in your area. Our location-based matching system makes it easy to connect with opportunities nearby.
          </p>
          <div className="space-x-4">
            <Button size="lg" onClick={() => navigate('/auth')}>
              Find Work
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/auth')}>
              Hire Workers
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">Why Choose BulawayoJobs?</h3>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <MapPin className="h-12 w-12 text-blue-600 mb-4" />
              <CardTitle>Location-Based Matching</CardTitle>
              <CardDescription>
                Find work or workers near you with our smart location matching system
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Users className="h-12 w-12 text-green-600 mb-4" />
              <CardTitle>Verified Users</CardTitle>
              <CardDescription>
                All users are registered and verified for safe and reliable connections
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Star className="h-12 w-12 text-yellow-600 mb-4" />
              <CardTitle>Rating System</CardTitle>
              <CardDescription>
                Build your reputation with our rating and review system
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* About Us Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">About BulawayoJobs</h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Empowering Bulawayo's workforce through innovative job matching technology
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h4 className="text-2xl font-bold text-gray-900 mb-6">Our Mission</h4>
              <p className="text-gray-600 mb-6 leading-relaxed">
                At BulawayoJobs, we believe that everyone deserves access to meaningful work opportunities. 
                Founded in 2024, our platform was created specifically to bridge the gap between skilled 
                general hand workers and employers in Bulawayo City.
              </p>
              <p className="text-gray-600 mb-6 leading-relaxed">
                We understand the unique challenges faced by both job seekers and employers in our community. 
                That's why we've built a platform that prioritizes local connections, fair compensation, 
                and transparent communication.
              </p>
              <div className="flex items-center space-x-4">
                <Heart className="h-6 w-6 text-red-500" />
                <span className="text-gray-700 font-medium">Made with love for the Bulawayo community</span>
              </div>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="text-center">
                  <Award className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <CardTitle className="text-lg">Local Focus</CardTitle>
                  <CardDescription>
                    Built specifically for Bulawayo's unique job market and community needs
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <Card>
                <CardHeader className="text-center">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <CardTitle className="text-lg">Trust & Safety</CardTitle>
                  <CardDescription>
                    Comprehensive verification and rating systems ensure safe, reliable connections
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <Card>
                <CardHeader className="text-center">
                  <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                  <CardTitle className="text-lg">Community Driven</CardTitle>
                  <CardDescription>
                    Supporting local workers and businesses to grow together
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <Card>
                <CardHeader className="text-center">
                  <MapPin className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                  <CardTitle className="text-lg">Easy Access</CardTitle>
                  <CardDescription>
                    Simple, user-friendly platform accessible to everyone
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2024 BulawayoJobs. Connecting workers and employers in Bulawayo City.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
