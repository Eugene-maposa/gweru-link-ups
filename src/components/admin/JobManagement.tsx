
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Briefcase } from "lucide-react";

interface JobManagementProps {
  allJobs: any[];
  onToggleJobStatus: (jobId: string, currentStatus: string) => Promise<void>;
}

const JobManagement = ({ allJobs, onToggleJobStatus }: JobManagementProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>All Jobs</CardTitle>
        <CardDescription>Monitor and manage job postings</CardDescription>
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
                <TableCell>{job.profiles?.full_name || 'Unknown'}</TableCell>
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
