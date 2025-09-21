
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { createJob } from "@/lib/api";

const PostJob = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [jobData, setJobData] = useState({
    title: "",
    company: "",
    location: "",
    description: "",
    requirements: "",
  });

  if (!user || user.role !== "recruiter") {
    return (
      <div className="container mx-auto py-10">
        <p>You don't have access to this page. Please login as a recruiter.</p>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setJobData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Call the API to create the job
      const response = await createJob(jobData);
      
      console.log("Job creation response:", response);
      
      toast({
        title: "Job Posted Successfully",
        description: "Your job listing has been published.",
      });
      
      navigate("/recruiter/dashboard");
    } catch (error) {
      console.error("Error posting job:", error);
      toast({
        title: "Failed to post job",
        description: "There was an error posting your job. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Post a New Job</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title</Label>
              <Input 
                id="title" 
                name="title" 
                value={jobData.title} 
                onChange={handleChange} 
                required 
                placeholder="e.g. Senior Frontend Developer"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input 
                id="company" 
                name="company" 
                value={jobData.company} 
                onChange={handleChange} 
                required 
                placeholder="e.g. Acme Inc."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input 
                id="location" 
                name="location" 
                value={jobData.location} 
                onChange={handleChange} 
                required 
                placeholder="e.g. Remote, New York, NY"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Job Description</Label>
              <Textarea 
                id="description" 
                name="description" 
                value={jobData.description} 
                onChange={handleChange} 
                required 
                placeholder="Describe the role, responsibilities, and ideal candidate..." 
                rows={6}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="requirements">Requirements (one per line)</Label>
              <Textarea 
                id="requirements" 
                name="requirements" 
                value={jobData.requirements} 
                onChange={handleChange} 
                required 
                placeholder="5+ years of experience in frontend development
Experience with React, TypeScript
Knowledge of state management libraries" 
                rows={5}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => navigate("/recruiter/dashboard")}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Posting..." : "Post Job"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default PostJob;
