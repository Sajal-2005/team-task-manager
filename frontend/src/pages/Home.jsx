import React, { useContext } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Layers, ShieldCheck, Activity, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Home = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;
  if (user) {
    return user.role === 'admin' ? <Navigate to="/admin/dashboard" /> : <Navigate to="/member/dashboard" />;
  }

  return (
    <div className="relative overflow-hidden min-h-[80vh] flex flex-col">
      {/* Background Glowing Orbs */}
      <div className="bg-orb bg-orb-1"></div>
      <div className="bg-orb bg-orb-2"></div>

      {/* Hero Section */}
      <div className="animate-fade-in text-center pt-24 pb-20 relative z-10">
        <div className="inline-block mb-6 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm font-semibold tracking-wide">
          ✨ The Ultimate Workspace Solution
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 tracking-tight">
          Manage your team's work <br/>
          <span className="hero-gradient-text">effortlessly.</span>
        </h1>
        
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          A premium, role-based task management platform designed to help admins orchestrate projects and empower members to crush their goals.
        </p>
        
        <div className="flex gap-4 justify-center items-center">
          <Link to="/signup" className="animate-float">
            <Button size="lg" className="rounded-xl px-8 text-base gap-2">
              Get Started <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          <Link to="/login" className="animate-float-delayed">
            <Button size="lg" variant="outline" className="rounded-xl px-8 text-base bg-white/5">
              Sign In
            </Button>
          </Link>
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="container animate-fade-in pb-24 relative z-10 [animation-delay:200ms] [animation-fill-mode:both]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <Card className="bg-card/50 backdrop-blur-sm border-white/10 transition-transform duration-300 hover:scale-[1.02] cursor-default">
            <CardHeader>
              <div className="feature-icon-wrapper w-12 h-12 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 mb-4 text-primary transition-all">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <CardTitle>Secure Role Access</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Strict isolation between Admin and Member views ensures data privacy and clean workspaces tailored to your exact responsibilities.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-white/10 transition-transform duration-300 hover:scale-[1.02] cursor-default">
            <CardHeader>
              <div className="feature-icon-wrapper w-12 h-12 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 mb-4 text-primary transition-all">
                <Activity className="w-6 h-6" />
              </div>
              <CardTitle>Dynamic Dashboards</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Track real-time progress, overdue tasks, and project completion metrics instantly with our beautiful data visualization cards.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-white/10 transition-transform duration-300 hover:scale-[1.02] cursor-default">
            <CardHeader>
              <div className="feature-icon-wrapper w-12 h-12 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 mb-4 text-primary transition-all">
                <Layers className="w-6 h-6" />
              </div>
              <CardTitle>Organized Workflows</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Kanban-style project details and priority tagging make it incredibly simple to know exactly what needs to be done next.
              </CardDescription>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default Home;
