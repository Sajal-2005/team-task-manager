import React, { useContext } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Layers, ShieldCheck, Zap, ArrowRight, Activity, Users } from 'lucide-react';

const Home = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;
  if (user) {
    return user.role === 'admin' ? <Navigate to="/admin/dashboard" /> : <Navigate to="/member/dashboard" />;
  }

  return (
    <div style={{ position: 'relative', overflow: 'hidden', minHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
      {/* Background Glowing Orbs */}
      <div className="bg-orb bg-orb-1"></div>
      <div className="bg-orb bg-orb-2"></div>

      {/* Hero Section */}
      <div className="animate-fade-in" style={{ textAlign: 'center', paddingTop: '6rem', paddingBottom: '5rem', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'inline-block', marginBottom: '1.5rem', padding: '0.5rem 1rem', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '99px', color: '#60a5fa', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.5px' }}>
          ✨ The Ultimate Workspace Solution
        </div>
        
        <h1 style={{ fontSize: 'clamp(3rem, 6vw, 4.5rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>
          Manage your team's work <br/>
          <span className="hero-gradient-text">effortlessly.</span>
        </h1>
        
        <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto 2.5rem', lineHeight: 1.6 }}>
          A premium, role-based task management platform designed to help admins orchestrate projects and empower members to crush their goals.
        </p>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', alignItems: 'center' }}>
          <Link to="/signup" className="btn btn-primary animate-float" style={{ padding: '1rem 2rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '12px' }}>
            Get Started <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="btn btn-outline animate-float-delayed" style={{ padding: '1rem 2rem', fontSize: '1.1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.03)' }}>
            Sign In
          </Link>
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="container animate-fade-in" style={{ paddingBottom: '6rem', position: 'relative', zIndex: 10, animationDelay: '0.2s', animationFillMode: 'both' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          
          <div className="glass-panel" style={{ padding: '2rem', transition: 'transform 0.3s ease', cursor: 'default' }}>
            <div className="feature-icon-wrapper">
              <ShieldCheck size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Secure Role Access</h3>
            <p style={{ fontSize: '0.95rem', lineHeight: 1.5 }}>
              Strict isolation between Admin and Member views ensures data privacy and clean workspaces tailored to your exact responsibilities.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '2rem', transition: 'transform 0.3s ease', cursor: 'default' }}>
            <div className="feature-icon-wrapper">
              <Activity size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Dynamic Dashboards</h3>
            <p style={{ fontSize: '0.95rem', lineHeight: 1.5 }}>
              Track real-time progress, overdue tasks, and project completion metrics instantly with our beautiful data visualization cards.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '2rem', transition: 'transform 0.3s ease', cursor: 'default' }}>
            <div className="feature-icon-wrapper">
              <Layers size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Organized Workflows</h3>
            <p style={{ fontSize: '0.95rem', lineHeight: 1.5 }}>
              Kanban-style project details and priority tagging make it incredibly simple to know exactly what needs to be done next.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Home;
