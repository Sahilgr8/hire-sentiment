import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Search, Users, Briefcase, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { testDbConnection } from "@/lib/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Index = () => {
  const { user } = useAuth();
  const [showConnectionTest, setShowConnectionTest] = useState(false);

  const { data: connectionData, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['testConnection'],
    queryFn: testDbConnection,
    enabled: showConnectionTest, // Only run when user clicks the button
  });

  const redirectToDashboard = () => {
    if (user) {
      if (user.role === "recruiter") {
        return "/recruiter/dashboard";
      } else {
        return "/applicant/dashboard";
      }
    }
    return "/login";
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto py-4 px-4 md:px-6 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-primary">HireSentiment</Link>
          
          <div className="flex gap-4">
            {user ? (
              <Button asChild>
                <Link to={redirectToDashboard()}>
                  Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button variant="outline" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">Register</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>
      
      <main className="flex-1">
        <section className="py-20 md:py-32 bg-accent">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Simplify Hiring with <span className="text-primary">Natural Language</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Find the perfect candidates or your dream job with our AI-powered job platform that understands what you're looking for.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/register?role=recruiter">
                  I'm a Recruiter
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/register?role=applicant">
                  I'm a Job Seeker
                </Link>
              </Button>
            </div>

            {/* Backend Connection Test */}
            <div className="mt-8 flex flex-col items-center">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setShowConnectionTest(true);
                  if (showConnectionTest) refetch();
                }}
              >
                {isLoading ? "Testing..." : "Test Backend Connection"}
              </Button>
              
              {showConnectionTest && !isLoading && (
                <div className="mt-4 w-full max-w-lg">
                  {isError ? (
                    <Alert variant="destructive">
                      <AlertTitle>Connection Failed</AlertTitle>
                      <AlertDescription>
                        Could not connect to the backend server. Error: {(error as Error)?.message || "Unknown error"}
                      </AlertDescription>
                    </Alert>
                  ) : connectionData ? (
                    <Alert variant="success" className="bg-green-50 border-green-200">
                      <AlertTitle>Connection Successful!</AlertTitle>
                      <AlertDescription>
                        Successfully connected to the backend server at: {new Date(connectionData.data.timestamp).toLocaleString()}
                      </AlertDescription>
                    </Alert>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </section>
        
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">How It Works</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center p-6 rounded-lg bg-card border">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Search className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Natural Language Search</h3>
                <p className="text-muted-foreground">
                  Simply describe what you're looking for in plain language, and our AI will find the perfect matches.
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center p-6 rounded-lg bg-card border">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Profile Intelligence</h3>
                <p className="text-muted-foreground">
                  We analyze profiles holistically, considering skills, experience, and code repositories to find the best matches.
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center p-6 rounded-lg bg-card border">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Briefcase className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Job Intelligence</h3>
                <p className="text-muted-foreground">
                  Intelligent job matching ensures applicants find positions that align with their skills and career goals.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-accent">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">Ready to Get Started?</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join HireSentiment today and experience a new way to hire or get hired.
            </p>
            <Button size="lg" asChild>
              <Link to="/register">
                Create Your Account
              </Link>
            </Button>
          </div>
        </section>
      </main>
      
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <p className="text-muted-foreground">
            &copy; {new Date().getFullYear()} HireSentiment. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
