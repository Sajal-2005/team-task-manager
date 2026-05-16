import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'member'
  });
  const [error, setError] = useState('');
  const { signup } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    try {
      const userData = await signup(formData.name, formData.email, formData.password, formData.role);
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
            <UserPlus className="w-8 h-8" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Create Account</CardTitle>
          <CardDescription className="text-base">Join TaskMaster today</CardDescription>
        </CardHeader>
        
        <CardContent>
          {error && (
            <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-lg mb-6 text-sm font-medium border border-destructive/20 text-center">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name"
                type="text" 
                name="name" 
                placeholder="John Doe" 
                value={formData.name} 
                onChange={handleChange} 
                required 
                className="bg-background/50 border-white/10 focus-visible:ring-primary h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email"
                type="email" 
                name="email" 
                placeholder="john@example.com" 
                value={formData.email} 
                onChange={handleChange} 
                required 
                className="bg-background/50 border-white/10 focus-visible:ring-primary h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password"
                type="password" 
                name="password" 
                placeholder="••••••••" 
                minLength="6" 
                value={formData.password} 
                onChange={handleChange} 
                required 
                className="bg-background/50 border-white/10 focus-visible:ring-primary h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <select 
                id="role"
                name="role" 
                value={formData.role} 
                onChange={handleChange}
                className="flex h-11 w-full rounded-md border border-white/10 bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <Button type="submit" className="w-full h-11 text-base font-semibold mt-4">
              Sign Up
            </Button>
          </form>
        </CardContent>
        
        <CardFooter className="justify-center border-t border-white/5 pt-6 pb-6">
          <p className="text-sm text-muted-foreground">
            Already have an account? <Link to="/login" className="text-primary hover:underline font-medium">Login</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Signup;
