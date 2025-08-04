
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Briefcase, MapPin, Star, ArrowRight, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import ApprovalStatus from "@/components/ApprovalStatus";

const Index = () => {
  const { user, userProfile } = useAuth();

  // Show approval status if user is logged in but not approved
  if (user && userProfile && userProfile.approval_status !== 'approved') {
    return <ApprovalStatus />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Briefcase className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">BulawayoJobs</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/auth">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link to="/auth">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Connect Workers & Employers
            <br />
            <span className="text-blue-600">in Bulawayo</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Join the leading platform that connects skilled workers with employers in Bulawayo. 
            Find work opportunities or hire trusted workers with verified credentials.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="w-full sm:w-auto">
                I'm Looking for Work
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                I Want to Hire Workers
                <Users className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShieldCheck className="h-6 w-6 text-green-600 mr-2" />
                Verified Workers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                All workers are verified with National ID and approved by our admin team for your security.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-6 w-6 text-blue-600 mr-2" />
                Local Focus
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Focused specifically on Bulawayo area, connecting local workers with local employers.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="h-6 w-6 text-yellow-600 mr-2" />
                Rating System
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Review and rate workers to help build a trusted community of reliable professionals.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">500+</div>
            <div className="text-gray-600">Registered Workers</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">200+</div>
            <div className="text-gray-600">Active Employers</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">1000+</div>
            <div className="text-gray-600">Jobs Completed</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">4.8★</div>
            <div className="text-gray-600">Average Rating</div>
          </div>
        </div>

        {/* Popular Categories */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-8">Popular Job Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              "Construction", "Domestic Work", "Gardening", "Plumbing", 
              "Electrical", "Painting", "Carpentry", "Security"
            ].map((category) => (
              <Badge key={category} variant="secondary" className="p-3 text-center justify-center">
                {category}
              </Badge>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <Card className="bg-blue-600 text-white">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-blue-100 mb-6">
                Join thousands of workers and employers already using BulawayoJobs
              </p>
              <Link to="/auth">
                <Button size="lg" variant="secondary">
                  Create Your Account
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
