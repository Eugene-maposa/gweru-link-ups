
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Briefcase, RefreshCw } from "lucide-react";

interface JobManagementProps {
  allJobs: any[];
  onToggleJobStatus: (jobId: string, currentStatus: string) => Promise<void>;
  onRefresh?: () => Promise<void>;
  isRefreshing?: boolean;
}

const JobManagement = ({ allJobs, onToggleJobStatus, onRefresh, isRefreshing }: JobManagementProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>All Jobs</CardTitle>
            <CardDescription>Monitor and manage job postings</CardDescription>
          </div>
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center"
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Employer</TableHead>
              <TableHead>Pay Rate</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Posted</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allJobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell className="font-medium">{job.title}</TableCell>
                <TableCell>{job.employer?.full_name || 'Unknown'}</TableCell>
                <TableCell>${job.pay_rate} {job.pay_type}</TableCell>
                <TableCell>
                  <Badge 
                    variant={job.status === 'open' ? 'default' : 'secondary'}
                  >
                    {job.status}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(job.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onToggleJobStatus(job.id, job.status)}
                  >
                    {job.status === 'open' ? 'Close' : 'Reopen'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {allJobs.length === 0 && (
          <div className="text-center py-12">
            <Briefcase className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium">No jobs found</h3>
            <p className="text-gray-500">No jobs have been posted yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default JobManagement;
