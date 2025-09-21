
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    github: "",
    linkedin: "",
    leetcode: "",
    researchProfile: "",
    skills: "",
    experience: "",
    education: "",
  });

  if (!user || user.role !== "applicant") {
    return (
      <div className="container mx-auto py-10">
        <p>You don't have access to this page. Please login as an applicant.</p>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      
      navigate("/applicant/dashboard");
    } catch (error) {
      toast({
        title: "Failed to update profile",
        description: "There was an error updating your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">Update Your Profile</h1>
      
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your personal and professional details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  name="name" 
                  value={profileData.name} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email"
                  value={profileData.email} 
                  onChange={handleChange} 
                  required 
                  disabled
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="skills">Skills (comma separated)</Label>
              <Input 
                id="skills" 
                name="skills" 
                value={profileData.skills} 
                onChange={handleChange} 
                required 
                placeholder="JavaScript, React, Node.js, Python, etc."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="experience">Experience</Label>
              <Textarea 
                id="experience" 
                name="experience" 
                value={profileData.experience} 
                onChange={handleChange} 
                required 
                placeholder="List your work experience (company, position, dates, responsibilities)" 
                rows={4}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="education">Education</Label>
              <Textarea 
                id="education" 
                name="education" 
                value={profileData.education} 
                onChange={handleChange} 
                required 
                placeholder="List your educational background (institution, degree, dates)" 
                rows={3}
              />
            </div>
            
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-medium">Online Profiles</h3>
              
              <div className="space-y-2">
                <Label htmlFor="github">GitHub URL</Label>
                <Input 
                  id="github" 
                  name="github" 
                  value={profileData.github} 
                  onChange={handleChange} 
                  placeholder="https://github.com/yourusername"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn URL</Label>
                <Input 
                  id="linkedin" 
                  name="linkedin" 
                  value={profileData.linkedin} 
                  onChange={handleChange} 
                  placeholder="https://linkedin.com/in/yourusername"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="leetcode">LeetCode URL</Label>
                <Input 
                  id="leetcode" 
                  name="leetcode" 
                  value={profileData.leetcode} 
                  onChange={handleChange} 
                  placeholder="https://leetcode.com/yourusername"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="researchProfile">Research Profile URL (if applicable)</Label>
                <Input 
                  id="researchProfile" 
                  name="researchProfile" 
                  value={profileData.researchProfile} 
                  onChange={handleChange} 
                  placeholder="https://scholar.google.com/yourusername"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => navigate("/applicant/dashboard")}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Save Profile"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Profile;
