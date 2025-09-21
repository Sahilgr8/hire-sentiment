import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { mockJobListings } from "@/data/mockData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import FileUpload from "@/components/FileUpload";
import { submitJobApplication, getJobById } from "@/lib/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const applicationSchema = z.object({
  githubUrl: z.string().url({ message: "Please enter a valid GitHub URL" }).optional().or(z.literal('')),
  leetcodeUrl: z.string().url({ message: "Please enter a valid LeetCode URL" }).optional().or(z.literal('')),
  coverLetter: z.string().optional(),
});

const JobDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const form = useForm<z.infer<typeof applicationSchema>>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      githubUrl: "",
      leetcodeUrl: "",
      coverLetter: "",
    },
  });

  useEffect(() => {
    const subscription = form.watch(() => {
      if (validationErrors.length > 0) {
        setValidationErrors([]);
      }
    });

    return () => subscription.unsubscribe();
  }, [form, validationErrors]);

  useEffect(() => {
    if (resumeFile && validationErrors.includes("Resume is required")) {
      setValidationErrors(prevErrors =>
        prevErrors.filter(err => err !== "Resume is required")
      );
    }
  }, [resumeFile, validationErrors]);

  useEffect(() => {
    const fetchJobDetails = async () => {
      if (!id) return;

      try {
        const response = await getJobById(id);
        setJob(response.data.job);
      } catch (err) {
        console.log("Falling back to mock data");
        const mockJob = mockJobListings.find(job => job.id === id);
        if (mockJob) {
          setJob(mockJob);
        } else {
          setError("Job not found");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [id]);

  if (!user || user.role !== "applicant") {
    return (
      <div className="container mx-auto py-10">
        <p>You don't have access to this page. Please login as an applicant.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <p>Loading job details...</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="container mx-auto py-10">
        <p>{error || "Job not found."}</p>
      </div>
    );
  }

  const validateForm = (values: z.infer<typeof applicationSchema>): boolean => {
    const errors: string[] = [];

    if (!resumeFile) {
      errors.push("Resume is required");
    }

    if (values.githubUrl && !values.githubUrl.includes('github.com')) {
      errors.push("GitHub URL must be from github.com");
    }

    if (values.leetcodeUrl && !values.leetcodeUrl.includes('leetcode.com')) {
      errors.push("LeetCode URL must be from leetcode.com");
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const onSubmit = async (values: z.infer<typeof applicationSchema>) => {
    setValidationErrors([]);

    if (!validateForm(values)) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const githubUsername = values.githubUrl ?
        values.githubUrl.replace(/https?:\/\/github\.com\//, '').split('/')[0] : '';
      const leetcodeUsername = values.leetcodeUrl ?
        values.leetcodeUrl.replace(/https?:\/\/leetcode\.com\//, '').split('/')[0] : '';

      const formData = new FormData();
      formData.append('resumeFile', resumeFile!);
      formData.append('applicantId', user.id);
      formData.append('coverLetter', values.coverLetter || '');
      formData.append('githubUsername', githubUsername);
      formData.append('leetcodeUsername', leetcodeUsername);

      const response = await submitJobApplication(id!, formData);

      toast({
        title: "Application Submitted!",
        description: "Your application for " + job.title + " has been submitted successfully.",
      });

      form.reset();
      setResumeFile(null);

      setTimeout(() => {
        navigate('/applicant/applications');
      }, 2000);

    } catch (error: any) {
      console.error("Error submitting application:", error);

      if (error.response?.data?.message) {
        toast({
          title: "Submission Error",
          description: error.response.data.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Failed to Submit Application",
          description: "There was an error submitting your application. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (file: File) => {
    setResumeFile(file);
  };

  return (
    <div className="container mx-auto py-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{job.title}</CardTitle>
                  <CardDescription className="text-base">
                    {job.company} • {job.location}
                  </CardDescription>
                </div>
                <Badge variant="outline" className="mt-1">{job.type || 'Full-time'}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div>
                  <h3 className="text-sm font-semibold">Salary</h3>
                  <p className="text-md">{job.salary || 'Competitive'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Experience</h3>
                  <p className="text-md">{job.experience || 'Not specified'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Posted</h3>
                  <p className="text-md">{job.postedDate}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Description</h3>
                  <p className="text-base whitespace-pre-line">{job.description}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Requirements</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {job.requirements.map((req: string, index: number) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {(job.skills || []).map((skill: string, index: number) => (
                      <Badge key={index} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Apply for this position</CardTitle>
              <CardDescription>
                Complete the form below to submit your application
              </CardDescription>
            </CardHeader>
            <CardContent>
              {validationErrors.length > 0 && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Errors</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc pl-5 mt-2">
                      {validationErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="resume" className="text-base">Resume *</Label>
                      <div className="mt-1.5">
                        <FileUpload
                          onFileUpload={handleFileUpload}
                          onClear={() => setResumeFile(null)}
                          allowedTypes={[
                            'application/pdf',
                            'application/msword',
                            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                            'image/png',
                            'image/jpeg'
                          ]}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1.5">
                        Upload your resume in PDF, DOC, PNG, or JPEG format
                      </p>
                      {!resumeFile && validationErrors.includes("Resume is required") && (
                        <p className="text-sm text-red-500 mt-1">Resume is required</p>
                      )}
                    </div>

                    <FormField
                      control={form.control}
                      name="githubUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>GitHub URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://github.com/yourusername" {...field} />
                          </FormControl>
                          <FormDescription>
                            If provided, we'll analyze your public GitHub repositories
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="leetcodeUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>LeetCode URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://leetcode.com/yourusername" {...field} />
                          </FormControl>
                          <FormDescription>
                            If provided, we'll analyze your LeetCode problem-solving skills
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="coverLetter"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cover Letter</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Tell us why you're interested in this position..."
                              className="min-h-[120px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Optional, but recommended
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting Application..." : "Submit Application"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
