
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
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            {/* Employer-only routes */}
            <Route path="/post-job" element={
              <ProtectedRoute requireApproval allowedRoles={['employer']}>
                <PostJob />
              </ProtectedRoute>
            } />
            <Route path="/hire-workers" element={
              <ProtectedRoute requireApproval allowedRoles={['employer']}>
                <HireWorkers />
              </ProtectedRoute>
            } />
            
            {/* Worker-only routes */}
            <Route path="/find-work" element={
              <ProtectedRoute requireApproval allowedRoles={['worker']}>
                <FindWork />
              </ProtectedRoute>
            } />
            <Route path="/job/:id" element={
              <ProtectedRoute requireApproval allowedRoles={['worker']}>
                <JobDetails />
              </ProtectedRoute>
            } />
            <Route path="/post-services" element={
              <ProtectedRoute requireApproval allowedRoles={['worker']}>
                <PostServices />
              </ProtectedRoute>
            } />
            
            {/* Shared routes */}
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
