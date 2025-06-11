
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Star } from "lucide-react";

interface AnalyticsSectionProps {
  stats: {
    totalWorkers: number;
    totalEmployers: number;
    activeJobs: number;
    completedJobs: number;
    totalJobs: number;
  };
  pendingUsersCount: number;
}

const AnalyticsSection = ({ stats, pendingUsersCount }: AnalyticsSectionProps) => {
  return (
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
            <div className="flex justify-between">
              <span>Total Workers:</span>
              <span className="font-semibold">{stats.totalWorkers}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Employers:</span>
              <span className="font-semibold">{stats.totalEmployers}</span>
            </div>
            <div className="flex justify-between">
              <span>Pending Approvals:</span>
              <span className="font-semibold text-yellow-600">{pendingUsersCount}</span>
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
            <div className="flex justify-between">
              <span>Active Jobs:</span>
              <span className="font-semibold text-green-600">{stats.activeJobs}</span>
            </div>
            <div className="flex justify-between">
              <span>Completed Jobs:</span>
              <span className="font-semibold">{stats.completedJobs}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Jobs Posted:</span>
              <span className="font-semibold">{stats.totalJobs}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsSection;
