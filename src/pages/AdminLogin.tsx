
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Shield, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { createAdminAccount } from "@/utils/createAdmin";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const [adminData, setAdminData] = useState({
    fullName: "",
    phone: "",
    nationalId: "",
    location: ""
  });
  
  const { signInAsAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await signInAsAdmin(email, password);
      
      if (error) {
        toast({
          title: "Login Failed",
          description: error.message || "Invalid admin credentials",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "Successfully logged in as admin",
        });
        navigate('/admin');
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !adminData.fullName || !adminData.phone || !adminData.nationalId || !adminData.location) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await createAdminAccount(email, password, adminData);
      
      if (error) {
        toast({
          title: "Admin Creation Failed",
          description: error.message || "Failed to create admin account",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "Admin account created successfully. You can now log in.",
        });
        setIsCreatingAdmin(false);
        // Clear form
        setEmail("");
        setPassword("");
        setAdminData({
          fullName: "",
          phone: "",
          nationalId: "",
          location: ""
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-4 pb-6">
            <div className="flex justify-center">
              <div className="p-3 bg-blue-600 rounded-full">
                <Shield className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-900">
                {isCreatingAdmin ? "Create Admin Account" : "Admin Login"}
              </CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                {isCreatingAdmin 
                  ? "Set up a new administrator account" 
                  : "Access the administrative dashboard"
                }
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={isCreatingAdmin ? handleCreateAdmin : handleAdminLogin} className="space-y-4">
              {isCreatingAdmin && (
                <>
                  <div className="space-y-2">
                    <label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <Input
                      id="fullName"
                      type="text"
                      value={adminData.fullName}
                      onChange={(e) => setAdminData(prev => ({ ...prev, fullName: e.target.value }))}
                      placeholder="Enter full name"
                      required={isCreatingAdmin}
                      className="h-11"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-medium text-gray-700">
                      Phone Number
                    </label>
                    <Input
                      id="phone"
                      type="tel"
                      value={adminData.phone}
                      onChange={(e) => setAdminData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Enter phone number"
                      required={isCreatingAdmin}
                      className="h-11"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="nationalId" className="text-sm font-medium text-gray-700">
                      National ID
                    </label>
                    <Input
                      id="nationalId"
                      type="text"
                      value={adminData.nationalId}
                      onChange={(e) => setAdminData(prev => ({ ...prev, nationalId: e.target.value }))}
                      placeholder="Enter national ID"
                      required={isCreatingAdmin}
                      className="h-11"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="location" className="text-sm font-medium text-gray-700">
                      Location
                    </label>
                    <Input
                      id="location"
                      type="text"
                      value={adminData.location}
                      onChange={(e) => setAdminData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Enter location"
                      required={isCreatingAdmin}
                      className="h-11"
                    />
                  </div>
                </>
              )}
              
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Admin Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter admin email"
                  required
                  className="h-11"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {isCreatingAdmin ? "Creating Admin..." : "Signing in..."}
                  </div>
                ) : (
                  isCreatingAdmin ? "Create Admin Account" : "Sign In"
                )}
              </Button>
            </form>
            
            <div className="text-center space-y-3">
              <Button
                variant="outline"
                onClick={() => setIsCreatingAdmin(!isCreatingAdmin)}
                className="text-sm text-blue-600 hover:text-blue-700"
                disabled={loading}
              >
                {isCreatingAdmin ? "Back to Login" : "Create First Admin Account"}
              </Button>
              
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="w-full text-sm text-gray-600 hover:text-gray-700"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;
