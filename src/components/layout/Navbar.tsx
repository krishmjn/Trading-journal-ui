import { useAuth } from "@/common/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ThemeSwitcher } from "./ThemeSwitcher";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-card border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold">
            TradeJournal
          </Link>
          <div className="flex items-center space-x-4">
            <ThemeSwitcher />
            {user && (
              <>
                <span>Welcome, {user.username}</span>
                <Button variant="ghost" onClick={logout}>
                  Logout
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;