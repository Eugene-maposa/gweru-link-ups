
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Star, TrendingUp, Users, Briefcase, AlertTriangle } from "lucide-react";

interface AnalyticsSectionProps {
  stats: {
    totalWorkers: number;
    totalEmployers: number;
    activeJobs: number;
    completedJobs: number;
    totalJobs: number;
    totalUsers: number;
    pendingApprovals: number;
  };
  pendingUsersCount: number;
}

const AnalyticsSection = ({ stats, pendingUsersCount }: AnalyticsSectionProps) => {
  const jobCompletionRate = stats.totalJobs > 0 ? 
    Math.round((stats.completedJobs / stats.totalJobs) * 100) : 0;
  
  const userApprovalRate = stats.totalUsers > 0 ? 
    Math.round(((stats.totalUsers - pendingUsersCount) / stats.totalUsers) * 100) : 0;

  const workerToEmployerRatio = stats.totalEmployers > 0 ? 
    (stats.totalWorkers / stats.totalEmployers).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Job Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobCompletionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.completedJobs} of {stats.totalJobs} jobs completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Approval Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userApprovalRate}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalUsers - pendingUsersCount} approved users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Worker/Employer Ratio</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workerToEmployerRatio}:1</div>
            <p className="text-xs text-muted-foreground">
              Workers per employer
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Actions</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingUsersCount}</div>
            <p className="text-xs text-muted-foreground">
              Users awaiting approval
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              User Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Total Users:</span>
                <span className="font-semibold">{stats.totalUsers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Workers:</span>
                <span className="font-semibold text-green-600">{stats.totalWorkers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Employers:</span>
                <span className="font-semibold text-blue-600">{stats.totalEmployers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Pending Approvals:</span>
                <span className="font-semibold text-yellow-600">{pendingUsersCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Approval Rate:</span>
                <span className="font-semibold">{userApprovalRate}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="h-5 w-5 mr-2" />
              Job Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Total Jobs Posted:</span>
                <span className="font-semibold">{stats.totalJobs}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Active Jobs:</span>
                <span className="font-semibold text-green-600">{stats.activeJobs}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Completed Jobs:</span>
                <span className="font-semibold text-blue-600">{stats.completedJobs}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Completion Rate:</span>
                <span className="font-semibold">{jobCompletionRate}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Jobs per Employer:</span>
                <span className="font-semibold">
                  {stats.totalEmployers > 0 ? (stats.totalJobs / stats.totalEmployers).toFixed(1) : '0'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsSection;
