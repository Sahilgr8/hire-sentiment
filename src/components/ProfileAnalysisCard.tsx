import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Github,
  Code,
  BarChart2,
  Briefcase,
  Globe,
  Star,
  GitFork,
  Users,
  Award
} from "lucide-react";

interface OverallScore {
  github_activity: number;
  coding_skill: number;
  language_diversity: number;
  project_quality: number;
  experience: number;
  total: number;
}

interface Repository {
  name: string;
  description: string;
  stars: number;
  forks: number;
  language: string;
  url: string;
}

interface ProfileLanguage {
  github_count: number;
  leetcode_count: number;
  total_score: number;
}

interface ProfileAnalysis {
  github_username: string;
  leetcode_username: string;
  name: string;
  bio: string;
  location: string;
  email: string;
  company: string;
  github_followers: number;
  github_following: number;
  public_repos: number;
  total_stars: number;
  total_forks: number;
  contributions: number;
  experience_years: number;
  popularity_score: number;
  pinned_repos: Repository[];
  total_solved?: number;
  easy_solved?: number;
  medium_solved?: number;
  hard_solved?: number;
  streak_count?: number;
  coding_score?: number;
  languages: Record<string, ProfileLanguage>;
  skills: string[];
  overall_score: OverallScore;
  match_score?: {
    score: number;
    reasons: string[];
  };
  error?: string;
}

interface ProfileAnalysisCardProps {
  profileData: ProfileAnalysis | null;
  isLoading?: boolean;
}

const ProfileAnalysisCard: React.FC<ProfileAnalysisCardProps> = ({
  profileData,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profile Analysis</CardTitle>
          <CardDescription>Loading profile data...</CardDescription>
        </CardHeader>
        <CardContent className="h-60 flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-12 rounded-full bg-muted mb-3"></div>
            <div className="h-4 w-48 bg-muted rounded mb-2"></div>
            <div className="h-3 w-32 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!profileData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profile Analysis</CardTitle>
          <CardDescription>No profile data available</CardDescription>
        </CardHeader>
        <CardContent>
          <p>No GitHub or LeetCode profiles were provided by the candidate.</p>
        </CardContent>
      </Card>
    );
  }

  if (profileData.error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profile Analysis Error</CardTitle>
          <CardDescription>Failed to analyze profiles</CardDescription>
        </CardHeader>
        <CardContent>
          <p>{profileData.error}</p>
        </CardContent>
      </Card>
    );
  }

  // Calculate top languages
  const topLanguages = Object.entries(profileData.languages || {})
    .sort(([, a], [, b]) => b.total_score - a.total_score)
    .slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Award className="mr-2 h-5 w-5" />
          Developer Profile Analysis
        </CardTitle>
        <CardDescription>
          {profileData.name ? `${profileData.name}'s Profile` : "Candidate Profile"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Profile Links */}
        <div className="mb-6 flex flex-wrap gap-3">
          {profileData.github_username && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Github className="h-3.5 w-3.5" />
              <a
                href={`https://github.com/${profileData.github_username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {profileData.github_username}
              </a>
            </Badge>
          )}
          {profileData.leetcode_username && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Code className="h-3.5 w-3.5" />
              <a
                href={`https://leetcode.com/${profileData.leetcode_username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {profileData.leetcode_username}
              </a>
            </Badge>
          )}
        </div>

        {/* Overall Score */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Overall Score</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Total Developer Score</span>
                <span className="text-sm font-medium">{profileData.overall_score.total}%</span>
              </div>
              <Progress value={profileData.overall_score.total} className="h-2" />
            </div>

            <div>
              {profileData.match_score && (
                <>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Job Match Score</span>
                    <span className="text-sm font-medium">{profileData.match_score.score}%</span>
                  </div>
                  <Progress value={profileData.match_score.score} className="h-2" />
                </>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Scores */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {profileData.overall_score.github_activity > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-sm">GitHub Activity</span>
                <span className="text-sm font-medium">{profileData.overall_score.github_activity}%</span>
              </div>
              <Progress value={profileData.overall_score.github_activity} className="h-1.5" />
            </div>
          )}

          {profileData.overall_score.coding_skill > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-sm">Coding Skill</span>
                <span className="text-sm font-medium">{profileData.overall_score.coding_skill}%</span>
              </div>
              <Progress value={profileData.overall_score.coding_skill} className="h-1.5" />
            </div>
          )}

          {profileData.overall_score.language_diversity > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-sm">Language Diversity</span>
                <span className="text-sm font-medium">{profileData.overall_score.language_diversity}%</span>
              </div>
              <Progress value={profileData.overall_score.language_diversity} className="h-1.5" />
            </div>
          )}

          {profileData.overall_score.project_quality > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-sm">Project Quality</span>
                <span className="text-sm font-medium">{profileData.overall_score.project_quality}%</span>
              </div>
              <Progress value={profileData.overall_score.project_quality} className="h-1.5" />
            </div>
          )}

          {profileData.overall_score.experience > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-sm">Experience</span>
                <span className="text-sm font-medium">{profileData.overall_score.experience}%</span>
              </div>
              <Progress value={profileData.overall_score.experience} className="h-1.5" />
            </div>
          )}
        </div>

        {/* GitHub Stats */}
        {profileData.github_username && (
          <div className="mb-6">
            <h3 className="text-md font-medium mb-3 flex items-center">
              <Github className="mr-2 h-4 w-4" />
              GitHub Statistics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex flex-col items-center p-2 rounded-lg bg-muted/50">
                <Users className="h-4 w-4 mb-1 text-muted-foreground" />
                <span className="text-xl font-semibold">{profileData.github_followers}</span>
                <span className="text-xs text-muted-foreground">Followers</span>
              </div>
              <div className="flex flex-col items-center p-2 rounded-lg bg-muted/50">
                <Star className="h-4 w-4 mb-1 text-muted-foreground" />
                <span className="text-xl font-semibold">{profileData.total_stars}</span>
                <span className="text-xs text-muted-foreground">Stars</span>
              </div>
              <div className="flex flex-col items-center p-2 rounded-lg bg-muted/50">
                <GitFork className="h-4 w-4 mb-1 text-muted-foreground" />
                <span className="text-xl font-semibold">{profileData.total_forks}</span>
                <span className="text-xs text-muted-foreground">Forks</span>
              </div>
              <div className="flex flex-col items-center p-2 rounded-lg bg-muted/50">
                <Briefcase className="h-4 w-4 mb-1 text-muted-foreground" />
                <span className="text-xl font-semibold">{profileData.experience_years}</span>
                <span className="text-xs text-muted-foreground">Years</span>
              </div>
            </div>
          </div>
        )}

        {/* LeetCode Stats */}
        {profileData.leetcode_username && (
          <div className="mb-6">
            <h3 className="text-md font-medium mb-3 flex items-center">
              <Code className="mr-2 h-4 w-4" />
              LeetCode Statistics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex flex-col items-center p-2 rounded-lg bg-muted/50">
                <span className="text-xs font-medium text-muted-foreground mb-1">Total</span>
                <span className="text-xl font-semibold">{profileData.total_solved || 0}</span>
                <span className="text-xs text-muted-foreground">Problems Solved</span>
              </div>
              <div className="flex flex-col items-center p-2 rounded-lg bg-muted/50">
                <span className="text-xs font-medium text-green-500 mb-1">Easy</span>
                <span className="text-xl font-semibold">{profileData.easy_solved || 0}</span>
                <span className="text-xs text-muted-foreground">Problems</span>
              </div>
              <div className="flex flex-col items-center p-2 rounded-lg bg-muted/50">
                <span className="text-xs font-medium text-amber-500 mb-1">Medium</span>
                <span className="text-xl font-semibold">{profileData.medium_solved || 0}</span>
                <span className="text-xs text-muted-foreground">Problems</span>
              </div>
              <div className="flex flex-col items-center p-2 rounded-lg bg-muted/50">
                <span className="text-xs font-medium text-red-500 mb-1">Hard</span>
                <span className="text-xl font-semibold">{profileData.hard_solved || 0}</span>
                <span className="text-xs text-muted-foreground">Problems</span>
              </div>
            </div>
          </div>
        )}

        {/* Languages */}
        {topLanguages.length > 0 && (
          <div className="mb-6">
            <h3 className="text-md font-medium mb-3 flex items-center">
              <Globe className="mr-2 h-4 w-4" />
              Top Programming Languages
            </h3>
            <div className="space-y-3">
              {topLanguages.map(([language, data]) => (
                <div key={language} className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm">{language}</span>
                    <span className="text-sm font-medium">
                      {data.github_count > 0 && `${data.github_count} repos`}
                      {data.github_count > 0 && data.leetcode_count > 0 && " • "}
                      {data.leetcode_count > 0 && `${data.leetcode_count} problems`}
                    </span>
                  </div>
                  <Progress value={Math.min(100, data.total_score * 10)} className="h-1.5" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {profileData.skills && profileData.skills.length > 0 && (
          <div>
            <h3 className="text-md font-medium mb-3">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {profileData.skills.map((skill, index) => (
                <Badge key={index} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileAnalysisCard;