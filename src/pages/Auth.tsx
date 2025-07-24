
import { useState, useEffect } from "react";
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
import { AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react";

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("signin");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
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
  const { signUp, signIn, resetPassword, user, userProfile } = useAuth();

  // Check for email verification and password reset
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('verified') === 'true') {
      setIsVerified(true);
      setSuccessMessage('Email verified successfully! You can now sign in.');
      setActiveTab('signin');
    }
    if (urlParams.get('reset') === 'true') {
      setSuccessMessage('Please enter your new password.');
      setActiveTab('signin');
    }
  }, []);

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
    
    if (!signInData.email.trim() || !signInData.password) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(signInData.email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    setSuccessMessage('');
    
    const { error } = await signIn(signInData.email.trim(), signInData.password);
    
    if (error) {
      let errorMessage = error.message;
      if (error.message.includes('Email not confirmed')) {
        errorMessage = "Please check your email and click the confirmation link before signing in.";
      } else if (error.message.includes('Invalid login credentials')) {
        errorMessage = "Invalid email or password. Please check your credentials.";
      } else if (error.message.includes('Too many requests')) {
        errorMessage = "Too many login attempts. Please wait a moment before trying again.";
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
      // Clear form on success
      setSignInData({ email: '', password: '' });
    }
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields are filled and trimmed
    const trimmedData = {
      fullName: signUpData.fullName.trim(),
      email: signUpData.email.trim(),
      phone: signUpData.phone.trim(),
      nationalId: signUpData.nationalId.trim(),
      role: signUpData.role,
      location: signUpData.location,
      password: signUpData.password
    };
    
    if (!trimmedData.fullName || !trimmedData.email || !trimmedData.phone || 
        !trimmedData.nationalId || !trimmedData.role || !trimmedData.location || 
        !trimmedData.password) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // Validate full name (at least 2 characters)
    if (trimmedData.fullName.length < 2) {
      toast({
        title: "Invalid name",
        description: "Full name must be at least 2 characters long",
        variant: "destructive"
      });
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedData.email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    // Validate phone number (basic validation)
    if (trimmedData.phone.length < 10) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid phone number",
        variant: "destructive"
      });
      return;
    }

    // Validate National ID format (basic validation)
    if (trimmedData.nationalId.length < 8) {
      toast({
        title: "Invalid National ID",
        description: "Please enter a valid National ID",
        variant: "destructive"
      });
      return;
    }
    
    // Validate password strength
    if (trimmedData.password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    setSuccessMessage('');
    
    const { error } = await signUp(trimmedData.email, trimmedData.password, trimmedData);
    
    if (error) {
      let errorMessage = error.message;
      if (error.message.includes('already registered') || error.message.includes('User already registered')) {
        errorMessage = "An account with this email already exists. Please sign in instead.";
      } else if (error.message.includes('national_id')) {
        errorMessage = "This National ID is already registered. Please check your ID number.";
      } else if (error.message.includes('duplicate key value')) {
        errorMessage = "This email or National ID is already registered. Please use different credentials.";
      } else if (error.message.includes('Password should be at least 6 characters')) {
        errorMessage = "Password must be at least 6 characters long.";
      }
      
      toast({
        title: "Sign up failed",
        description: errorMessage,
        variant: "destructive"
      });
    } else {
      setSuccessMessage("Account created successfully! Please check your email for a confirmation link. After confirming your email, wait for admin approval before signing in.");
      setSignUpData({
        fullName: '',
        email: '',
        phone: '',
        nationalId: '',
        role: '',
        location: '',
        password: ''
      });
      
      toast({
        title: "Registration successful!",
        description: "Please check your email and click the confirmation link.",
      });
    }
    setIsLoading(false);
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetEmail.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive"
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(resetEmail)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    const { error } = await resetPassword(resetEmail.trim());
    
    if (error) {
      toast({
        title: "Reset failed",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Reset link sent!",
        description: "Please check your email for a password reset link.",
      });
      setResetEmail('');
      setShowForgotPassword(false);
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
          
          {showForgotPassword ? (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-medium">Reset Password</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Enter your email address and we'll send you a reset link
                </p>
              </div>
              
              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email</Label>
                  <Input 
                    id="reset-email" 
                    type="email" 
                    placeholder="your@email.com" 
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Sending..." : "Send Reset Link"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setShowForgotPassword(false)}
                  >
                    Back to Sign In
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
                  <div className="relative">
                    <Input 
                      id="signin-password" 
                      type={showPassword ? "text" : "password"}
                      value={signInData.password}
                      onChange={(e) => setSignInData({...signInData, password: e.target.value})}
                      required 
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
                <div className="text-center">
                  <Button 
                    type="button" 
                    variant="link" 
                    className="text-sm"
                    onClick={() => setShowForgotPassword(true)}
                  >
                    Forgot your password?
                  </Button>
                </div>
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
                  <div className="relative">
                    <Input 
                      id="password" 
                      type={showSignUpPassword ? "text" : "password"}
                      value={signUpData.password}
                      onChange={(e) => setSignUpData({...signUpData, password: e.target.value})}
                      required 
                      minLength={6}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                    >
                      {showSignUpPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
