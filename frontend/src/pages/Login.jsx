import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userData = await login(email, password);
      if (userData.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/member/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div className="animate-fade-in flex items-center justify-center min-h-[70vh] py-12">
      <Card className="w-full max-w-md bg-card/60 backdrop-blur-xl border-white/10 shadow-2xl">
        <CardHeader className="space-y-3 items-center text-center pb-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
            <LogIn className="w-8 h-8" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Welcome Back</CardTitle>
          <CardDescription className="text-base">Login to manage your tasks and projects</CardDescription>
        </CardHeader>
        
        <CardContent>
          {error && (
            <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-lg mb-6 text-sm font-medium border border-destructive/20 text-center">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email"
                type="email" 
                placeholder="you@example.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                className="bg-background/50 border-white/10 focus-visible:ring-primary h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password"
                type="password" 
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                className="bg-background/50 border-white/10 focus-visible:ring-primary h-11"
              />
            </div>
            <Button type="submit" className="w-full h-11 text-base font-semibold mt-2">
              Login
            </Button>
          </form>
        </CardContent>
        
        <CardFooter className="justify-center border-t border-white/5 pt-6 pb-6">
          <p className="text-sm text-muted-foreground">
            Don't have an account? <Link to="/signup" className="text-primary hover:underline font-medium">Sign up</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
