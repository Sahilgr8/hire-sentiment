
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import FileUpload from "@/components/FileUpload";
import api, { submitJobApplication } from "@/lib/api";

interface JobApplicationFormProps {
  jobId: string;
  jobTitle: string;
  companyName: string;
  userId: string;
  onSuccess?: () => void;
}

const JobApplicationForm: React.FC<JobApplicationFormProps> = ({ 
  jobId, 
  jobTitle, 
  companyName,
  userId,
  onSuccess
}) => {
  const [coverLetter, setCoverLetter] = useState("");
  const [resumePath, setResumePath] = useState("");
  const [githubUsername, setGithubUsername] = useState("");
  const [leetcodeUsername, setLeetcodeUsername] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleFileUpload = (filePath: string) => {
    setResumePath(filePath);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resumePath) {
      toast({
        title: "Resume Required",
        description: "Please upload your resume before submitting.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post(`/api/applications/apply/${jobId}`, {
        applicantId: userId,
        resumePath,
        coverLetter,
        githubUsername: githubUsername.trim(),
        leetcodeUsername: leetcodeUsername.trim()
      });

      if (response.data.success) {
        toast({
          title: "Application Submitted",
          description: response.data.message || "Your application has been submitted successfully."
        });

        // Add analytics notice if profiles are being analyzed
        if (githubUsername || leetcodeUsername) {
          toast({
            title: "Profile Analysis",
            description: "Your GitHub and LeetCode profiles are being analyzed to highlight your skills to the recruiter.",
            duration: 6000
          });
        }

        // Call the success callback or navigate
        if (onSuccess) {
          onSuccess();
        } else {
          navigate("/applicant/applications");
        }
      }
    } catch (error: any) {
      console.error("Application submission error:", error);
      toast({
        title: "Submission Failed",
        description: error.response?.data?.message || "There was an error submitting your application. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Apply for {jobTitle}</CardTitle>
        <CardDescription>at {companyName}</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="resume">Resume</Label>
            <FileUpload 
              onFileUpload={handleFileUpload} 
              allowedTypes={['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']}
              maxSizeMB={5}
            />
            {resumePath && (
              <p className="text-sm text-green-600">
                Resume uploaded successfully
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="coverLetter">Cover Letter</Label>
            <Textarea
              id="coverLetter"
              placeholder="Tell us why you're a great fit for this role..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              rows={5}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div className="space-y-2">
              <Label htmlFor="github">
                GitHub Username (Optional)
                <span className="ml-1 text-xs text-muted-foreground">
                  For skill analysis
                </span>
              </Label>
              <Input
                id="github"
                placeholder="e.g. octocat"
                value={githubUsername}
                onChange={(e) => setGithubUsername(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                We'll analyze your public repositories to highlight relevant skills to the recruiter.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="leetcode">
                LeetCode Username (Optional)
                <span className="ml-1 text-xs text-muted-foreground">
                  For coding assessment
                </span>
              </Label>
              <Input
                id="leetcode"
                placeholder="e.g. leetcoder123"
                value={leetcodeUsername}
                onChange={(e) => setLeetcodeUsername(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                We'll analyze your LeetCode profile to showcase your problem-solving abilities.
              </p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Application"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default JobApplicationForm;
