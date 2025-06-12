
import { Card, CardContent } from "@/components/ui/card";
import { Users, AlertCircle, Briefcase, TrendingUp, UserCheck, Building } from "lucide-react";

interface AdminStatsCardsProps {
  stats: {
    totalUsers: number;
    pendingApprovals: number;
    totalJobs: number;
    activeJobs: number;
    totalWorkers: number;
    totalEmployers: number;
    completedJobs: number;
  };
}

const AdminStatsCards = ({ stats }: AdminStatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <div className="text-sm text-gray-600">Total Users</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 text-yellow-500 mr-3" />
            <div>
              <div className="text-2xl font-bold">{stats.pendingApprovals}</div>
              <div className="text-sm text-gray-600">Pending Approvals</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center">
            <UserCheck className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <div className="text-2xl font-bold">{stats.totalWorkers}</div>
              <div className="text-sm text-gray-600">Workers</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center">
            <Building className="h-8 w-8 text-purple-500 mr-3" />
            <div>
              <div className="text-2xl font-bold">{stats.totalEmployers}</div>
              <div className="text-sm text-gray-600">Employers</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center">
            <Briefcase className="h-8 w-8 text-indigo-500 mr-3" />
            <div>
              <div className="text-2xl font-bold">{stats.totalJobs}</div>
              <div className="text-sm text-gray-600">Total Jobs</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-emerald-500 mr-3" />
            <div>
              <div className="text-2xl font-bold">{stats.activeJobs}</div>
              <div className="text-sm text-gray-600">Active Jobs</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminStatsCards;
