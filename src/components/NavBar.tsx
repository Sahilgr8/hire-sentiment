
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

const NavBar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="border-b">
      <div className="container mx-auto flex justify-between items-center py-4">
        <Link to="/" className="text-xl font-bold text-primary">HireSentiment</Link>
        
        <div className="flex gap-4 items-center">
          {user ? (
            <>
              <span className="text-sm">
                Logged in as <span className="font-medium">{user.name}</span> ({user.role})
              </span>
              <Button variant="outline" onClick={logout} size="sm">Logout</Button>
            </>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/register">Register</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
