import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "@/hooks/use-toast";
import { loginUser, registerUser } from "@/lib/api";

type UserRole = "applicant" | "recruiter";

interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for fallback/development
const MOCK_USERS: User[] = [
  { id: "1", email: "recruiter@example.com", name: "Demo Recruiter", role: "recruiter" },
  { id: "2", email: "applicant@example.com", name: "Demo Applicant", role: "applicant" },
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for saved user in localStorage
    const savedUser = localStorage.getItem("user");
    const token = localStorage.getItem("authToken");
    
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string, role: UserRole) => {
    setLoading(true);
    
    try {
      // Call the real API endpoint
      const response = await loginUser({ email, password });
      
      if (response.data.success) {
        const loggedInUser = response.data.user;
        setUser(loggedInUser);
        localStorage.setItem("user", JSON.stringify(loggedInUser));
        
        // Store the token for API authorization
        if (response.data.token) {
          localStorage.setItem("authToken", response.data.token);
        }
        
        toast({
          title: "Login successful",
          description: `Welcome back${loggedInUser.name ? ', ' + loggedInUser.name : ''}!`,
        });
      } else {
        throw new Error(response.data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);

      // Fallback to mock data for development (remove in production)
      if (process.env.NODE_ENV !== 'production') {
        const foundUser = MOCK_USERS.find(u => u.email === email && u.role === role);
        if (foundUser) {
          setUser(foundUser);
          localStorage.setItem("user", JSON.stringify(foundUser));
          
          // Create a simple mock token that our modified middleware can read
          // Format: mock_token_userId_role
          const mockToken = `mock_token_${foundUser.id}_${foundUser.role}`;
          localStorage.setItem("authToken", mockToken);
          
          toast({
            title: "Login successful (MOCK)",
            description: `Welcome back, ${foundUser.name}!`,
          });
          setLoading(false);
          return;
        }
      }

      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole) => {
    setLoading(true);
    
    try {
      // Call the real API endpoint
      const response = await registerUser({ email, password, role });
      
      if (response.data.success) {
        const newUser = response.data.user;

        // Add name to user object since our backend doesn't store names at registration
        const userWithName = { ...newUser, name };
        
        setUser(userWithName);
        localStorage.setItem("user", JSON.stringify(userWithName));
        
        // Store the token for API authorization
        if (response.data.token) {
          localStorage.setItem("authToken", response.data.token);
        }
        
        toast({
          title: "Registration successful",
          description: `Welcome, ${name}!`,
        });
      } else {
        throw new Error(response.data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("authToken"); // Also remove the auth token when logging out
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
