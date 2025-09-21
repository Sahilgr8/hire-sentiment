import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Briefcase, Calendar, ChevronLeft, Download, Mail, User } from "lucide-react";
import { format } from "date-fns";
import ProfileAnalysisCard from "@/components/ProfileAnalysisCard";
import api from "@/lib/api";

interface Application {
  id: string;
  job_id: string;
  applicant_id: string;
  resume_path: string;
  cover_letter: string;
  status: string;
  created_at: string;
  updated_at: string;
  profile_data?: string;
  job_title: string;
  company_name: string;
  job_description: string;
  job_requirements: string[];
  email: string;
  github_url?: string;
  leetcode_url?: string;
  linkedin_url?: string;
  profile_image_url?: string;
}

const ApplicationDetails: React.FC = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const [application, setApplication] = useState<Application | null>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const statusColors: Record<string, string> = {
    pending: "bg-gray-200 text-gray-800",
    reviewing: "bg-blue-200 text-blue-800",
    shortlisted: "bg-green-200 text-green-800",
    rejected: "bg-red-200 text-red-800",
    interviewing: "bg-purple-200 text-purple-800",
    offered: "bg-amber-200 text-amber-800",
    hired: "bg-emerald-200 text-emerald-800",
  };

  useEffect(() => {
    const fetchApplicationDetails = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/api/applications/${applicationId}`);
        
        if (response.data.success) {
          setApplication(response.data.application);
          
          // Parse profile data if available
          if (response.data.application.profile_data) {
            try {
              const parsedData = JSON.parse(response.data.application.profile_data);
              setProfileData(parsedData);
            } catch (error) {
              console.error("Error parsing profile data:", error);
              setProfileData(null);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching application:", error);
        toast({
          title: "Error",
          description: "Failed to load application details",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (applicationId) {
      fetchApplicationDetails();
    }
  }, [applicationId, toast]);

  const updateApplicationStatus = async (status: string) => {
    try {
      setIsUpdating(true);
      const response = await api.put(`/api/applications/${applicationId}/status`, { 
        status 
      });
      
      if (response.data.success) {
        setApplication((prev) => prev ? { ...prev, status } : null);
        
        toast({
          title: "Status Updated",
          description: "Application status has been updated successfully",
        });
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update application status",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>Application Not Found</CardTitle>
            <CardDescription>
              The application you're looking for doesn't exist or has been removed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate(-1)}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Applications
        </Button>
        
        <div className="flex items-center space-x-4">
          <span className="text-sm text-muted-foreground">Application Status:</span>
          <Select
            value={application.status}
            onValueChange={updateApplicationStatus}
            disabled={isUpdating}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="reviewing">Reviewing</SelectItem>
              <SelectItem value="shortlisted">Shortlisted</SelectItem>
              <SelectItem value="interviewing">Interviewing</SelectItem>
              <SelectItem value="offered">Offered</SelectItem>
              <SelectItem value="hired">Hired</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          
          <Badge className={statusColors[application.status] || "bg-gray-200"}>
            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="cover-letter">Cover Letter</TabsTrigger>
              <TabsTrigger value="analysis">Skills Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="mr-2 h-5 w-5" />
                    Candidate Profile
                  </CardTitle>
                  <CardDescription>
                    Basic information about the applicant
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Email</p>
                      <div className="flex items-center">
                        <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                        <p>{application.email}</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Applied On</p>
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        <p>
                          {format(new Date(application.created_at), "PPP")}
                        </p>
                      </div>
                    </div>
                  </div>

                  {application.resume_path && (
                    <div className="pt-4">
                      <p className="text-sm font-medium mb-2">Resume</p>
                      <Button variant="outline" className="w-full flex items-center justify-center" 
                              onClick={() => window.open(`/uploads/${application.resume_path}`, '_blank')}>
                        <Download className="mr-2 h-4 w-4" />
                        Download Resume
                      </Button>
                    </div>
                  )}

                  <div className="pt-4 space-y-2">
                    <p className="text-sm font-medium">Online Profiles</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {application.github_url && (
                        <a
                          href={application.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center p-2 rounded-md hover:bg-muted/50 transition-colors"
                        >
                          <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                          </svg>
                          View GitHub
                        </a>
                      )}
                      {application.leetcode_url && (
                        <a
                          href={application.leetcode_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center p-2 rounded-md hover:bg-muted/50 transition-colors"
                        >
                          <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z" />
                          </svg>
                          View LeetCode
                        </a>
                      )}
                      {application.linkedin_url && (
                        <a
                          href={application.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center p-2 rounded-md hover:bg-muted/50 transition-colors"
                        >
                          <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                          </svg>
                          View LinkedIn
                        </a>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="cover-letter">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Briefcase className="mr-2 h-5 w-5" />
                    Cover Letter
                  </CardTitle>
                  <CardDescription>
                    The applicant's cover letter for {application.job_title}
                  </CardDescription>
                </CardHeader>
                <CardContent className="whitespace-pre-wrap">
                  {application.cover_letter || "No cover letter provided"}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis">
              <ProfileAnalysisCard
                profileData={profileData}
                isLoading={false}
              />
            </TabsContent>
          </Tabs>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Briefcase className="mr-2 h-5 w-5" />
                Job Details
              </CardTitle>
              <CardDescription>
                {application.job_title} at {application.company_name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Description</h3>
                <p className="text-sm text-muted-foreground">
                  {application.job_description}
                </p>
              </div>

              {application.job_requirements && application.job_requirements.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Requirements</h3>
                  <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                    {application.job_requirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetails;
