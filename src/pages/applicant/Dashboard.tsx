
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { mockJobListings } from "@/data/mockData";
import { useNavigate } from "react-router-dom";
import { Briefcase, MapPin } from "lucide-react";

const ApplicantDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user || user.role !== "applicant") {
    return (
      <div className="container mx-auto py-10">
        <p>You don't have access to this page. Please login as an applicant.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Applicant Dashboard</h1>
        <p className="text-muted-foreground">Find and apply to jobs matching your skills</p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Complete Your Profile</CardTitle>
          <CardDescription>A complete profile increases your chances of being discovered by recruiters</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => navigate("/applicant/profile")}>
            Update Profile
          </Button>
        </CardContent>
      </Card>

      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Available Jobs</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mockJobListings.map((job) => (
          <Card key={job.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle>{job.title}</CardTitle>
              <CardDescription className="flex items-center mt-1">
                <Briefcase className="h-4 w-4 mr-1" />
                {job.company}
              </CardDescription>
              <CardDescription className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {job.location}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">{job.description.substring(0, 100)}...</p>
              <Button variant="outline" className="w-full" onClick={() => navigate(`/applicant/job/${job.id}`)}>
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ApplicantDashboard;
