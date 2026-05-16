import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          TaskMaster
        </Link>
        <div className="flex items-center gap-6">
          {user ? (
            <>
              <Link to="/projects" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                Projects
              </Link>
              {user.role === 'admin' && (
                <Link to="/tasks" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                  Tasks
                </Link>
              )}
              <div className="flex items-center gap-2 ml-4 text-sm font-medium text-foreground">
                <UserIcon className="h-4 w-4" />
                <span>{user.name} ({user.role})</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center gap-2">
                <LogOut className="h-4 w-4" /> Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                Login
              </Link>
              <Link to="/signup">
                <Button>Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
