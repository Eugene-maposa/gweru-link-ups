
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";
import { useEffect } from "react";

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [signUpData, setSignUpData] = useState({
    fullName: '',
    email: '',
    phone: '',
    nationalId: '',
    role: '',
    location: '',
    password: ''
  });
  const [signInData, setSignInData] = useState({
    email: '',
    password: ''
  });

  const navigate = useNavigate();
  const { toast } = useToast();
  const { signUp, signIn, user, userProfile } = useAuth();

  // Redirect if already authenticated and approved
  useEffect(() => {
    if (user && userProfile?.approval_status === 'approved') {
      if (userProfile?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, userProfile, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMessage('');
    
    if (!signInData.email || !signInData.password) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }
    
    const { error } = await signIn(signInData.email, signInData.password);
    
    if (error) {
      let errorMessage = error.message;
      if (error.message.includes('Email not confirmed')) {
        errorMessage = "Please check your email and click the confirmation link before signing in.";
      } else if (error.message.includes('Invalid login credentials')) {
        errorMessage = "Invalid email or password. Please check your credentials.";
      }
      
      toast({
        title: "Sign in failed",
        description: errorMessage,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
      // Redirect will be handled by useEffect when userProfile loads
    }
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMessage('');
    
    // Validate all fields are filled
    if (!signUpData.fullName || !signUpData.email || !signUpData.phone || 
        !signUpData.nationalId || !signUpData.role || !signUpData.location || 
        !signUpData.password) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }
    
    // Validate password strength
    if (signUpData.password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(signUpData.email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }
    
    const { error } = await signUp(signUpData.email, signUpData.password, signUpData);
    
    if (error) {
      let errorMessage = error.message;
      if (error.message.includes('already registered') || error.message.includes('User already registered')) {
        errorMessage = "An account with this email already exists. Please sign in instead.";
      } else if (error.message.includes('national_id')) {
        errorMessage = "This National ID is already registered. Please check your ID number.";
      } else if (error.message.includes('duplicate key value')) {
        errorMessage = "This email or National ID is already registered. Please use different credentials.";
      }
      
      toast({
        title: "Sign up failed",
        description: errorMessage,
        variant: "destructive"
      });
    } else {
      setSuccessMessage("Account created successfully! Please check your email for a confirmation link, then wait for admin approval.");
      setSignUpData({
        fullName: '',
        email: '',
        phone: '',
        nationalId: '',
        role: '',
        location: '',
        password: ''
      });
      
      // Show success for a few seconds then suggest sign in
      setTimeout(() => {
        toast({
          title: "Next steps",
          description: "You can now sign in after confirming your email address.",
        });
      }, 3000);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">BulawayoJobs</CardTitle>
          <CardDescription>Join our community of workers and employers</CardDescription>
        </CardHeader>
        <CardContent>
          {successMessage && (
            <Alert className="mb-4">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                {successMessage}
              </AlertDescription>
            </Alert>
          )}
          
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input 
                    id="signin-email" 
                    type="email" 
                    placeholder="your@email.com" 
                    value={signInData.email}
                    onChange={(e) => setSignInData({...signInData, email: e.target.value})}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input 
                    id="signin-password" 
                    type="password" 
                    value={signInData.password}
                    onChange={(e) => setSignInData({...signInData, password: e.target.value})}
                    required 
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <Alert className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  All new accounts require admin approval before access is granted. Please provide your National ID for verification.
                </AlertDescription>
              </Alert>
              
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input 
                    id="fullName" 
                    placeholder="John Doe" 
                    value={signUpData.fullName}
                    onChange={(e) => setSignUpData({...signUpData, fullName: e.target.value})}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="your@email.com" 
                    value={signUpData.email}
                    onChange={(e) => setSignUpData({...signUpData, email: e.target.value})}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input 
                    id="phone" 
                    type="tel" 
                    placeholder="+263..." 
                    value={signUpData.phone}
                    onChange={(e) => setSignUpData({...signUpData, phone: e.target.value})}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nationalId">National ID *</Label>
                  <Input 
                    id="nationalId" 
                    placeholder="63-123456-A-12" 
                    value={signUpData.nationalId}
                    onChange={(e) => setSignUpData({...signUpData, nationalId: e.target.value})}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="userType">I am a... *</Label>
                  <Select value={signUpData.role} onValueChange={(value) => setSignUpData({...signUpData, role: value})} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="worker">Worker</SelectItem>
                      <SelectItem value="employer">Employer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Area in Bulawayo *</Label>
                  <Select value={signUpData.location} onValueChange={(value) => setSignUpData({...signUpData, location: value})} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your area" />
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
                  <Label htmlFor="password">Password * (min 6 characters)</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    value={signUpData.password}
                    onChange={(e) => setSignUpData({...signUpData, password: e.target.value})}
                    required 
                    minLength={6}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
