
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import PostJob from "./pages/PostJob";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import FindWork from "./pages/FindWork";
import JobDetails from "./pages/JobDetails";
import HireWorkers from "./pages/HireWorkers";
import PostServices from "./pages/PostServices";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            
            <Route path="/dashboard" element={
              <ProtectedRoute requireApproval>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/post-job" element={
              <ProtectedRoute requireApproval>
                <PostJob />
              </ProtectedRoute>
            } />
            <Route path="/messages" element={
              <ProtectedRoute requireApproval>
                <Messages />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute requireApproval>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/find-work" element={
              <ProtectedRoute requireApproval>
                <FindWork />
              </ProtectedRoute>
            } />
            <Route path="/job/:id" element={
              <ProtectedRoute requireApproval>
                <JobDetails />
              </ProtectedRoute>
            } />
            <Route path="/hire-workers" element={
              <ProtectedRoute requireApproval>
                <HireWorkers />
              </ProtectedRoute>
            } />
            <Route path="/post-services" element={
              <ProtectedRoute requireApproval>
                <PostServices />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
