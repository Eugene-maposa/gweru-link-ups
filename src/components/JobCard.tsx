
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface JobCardProps {
  job: {
    id: number;
    title: string;
    employer: string;
    location: string;
    distance: string;
    pay: string;
    duration: string;
    rating: number;
    posted: string;
    category: string;
    description: string;
  };
}

const JobCard = ({ job }: JobCardProps) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/job/${job.id}`);
  };

  const handleApplyNow = () => {
    navigate(`/job/${job.id}`);
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handleViewDetails}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">{job.title}</h3>
            <p className="text-gray-600 mb-2">{job.employer}</p>
            <p className="text-sm text-gray-700 mb-3">{job.description}</p>
          </div>
          <Badge variant="secondary" className="ml-4">{job.pay}</Badge>
        </div>
        
        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-1" />
            {job.location} • {job.distance}
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            {job.duration}
          </div>
          <div className="flex items-center">
            <Star className="h-4 w-4 mr-1 text-yellow-500" />
            {job.rating}
          </div>
          <Badge variant="outline">{job.category}</Badge>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Posted {job.posted}</span>
          <div className="space-x-2" onClick={(e) => e.stopPropagation()}>
            <Button variant="outline" size="sm" onClick={handleViewDetails}>
              View Details
            </Button>
            <Button size="sm" onClick={handleApplyNow}>
              Apply Now
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default JobCard;
