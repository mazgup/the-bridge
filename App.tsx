import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { UnifiedBuilder } from './components/cv/builder/UnifiedBuilder';
import { OpportunityRadar } from './components/radar/OpportunityRadar';
import { LinkedInSync } from './components/cv/LinkedInSync';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AccessDenied } from './components/AccessDenied';
import { InviteLanding } from './components/InviteLanding';
import { FeedbackButton } from './components/FeedbackButton';
import { NAVIGATION_ITEMS, INITIAL_FEATURES, MOCK_USER } from './constants';
import { Menu } from 'lucide-react';
import { CVProfile, INITIAL_CV_PROFILE } from './components/cv/CVTypes';
import { AuthProvider, useAuth } from './context/AuthContext';

function AppContent() {
  const [activePath, setActivePath] = useState(() => {
    // Check if the URL is an invite link
    const path = window.location.pathname;
    if (path.startsWith('/invite/')) {
      return path; // e.g. /invite/abc123
    }
    return '/';
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [cvData, setCvData] = useState<CVProfile>(INITIAL_CV_PROFILE);
  const { user, loading, isAuthorized, isAdmin, accessDenied } = useAuth();

  const handleCVBuildComplete = (data: CVProfile) => {
    setCvData(data);
    setActivePath('/cv-builder');
  };

  // Handle invite links
  if (activePath.startsWith('/invite/')) {
    const inviteId = activePath.replace('/invite/', '');
    return <InviteLanding inviteId={inviteId} onNavigate={setActivePath} />;
  }

  // Show Access Denied for authenticated but unauthorized users
  if (user && accessDenied) {
    return <AccessDenied />;
  }

  // Show sign-in prompt for unauthenticated users
  if (!user) {
    return <SignInPage />;
  }

  // User is authenticated but not yet verified — rare loading state
  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center h-screen text-bridge-slate font-serif">
        Verifying access...
      </div>
    );
  }

  // Simple routing logic based on activePath
  const renderContent = () => {
    switch (activePath) {
      case '/':
        const currentUser = {
          name: user.displayName || 'User',
          email: user.email || '',
          avatarUrl: user.photoURL || MOCK_USER.avatarUrl,
          jobTitle: 'Professional'
        };
        return <Dashboard user={currentUser} features={INITIAL_FEATURES} onNavigate={setActivePath} cvData={cvData} isAdmin={isAdmin} />;
      case '/cv-builder':
        return <UnifiedBuilder onNavigate={setActivePath} />;
      case '/linkedin-sync':
        return <LinkedInSync cvData={cvData} onNavigate={setActivePath} />;
      case '/radar':
        return <OpportunityRadar cvData={cvData} />;
      case '/admin':
        if (isAdmin) {
          return <AdminDashboard onNavigate={setActivePath} />;
        }
        return null;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <h2 className="text-3xl font-serif text-slate-400 mb-2">Coming Soon</h2>
            <p className="text-slate-400">This sanctuary is under construction.</p>
          </div>
        );
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen text-bridge-slate font-serif">Loading Sanctuary...</div>;
  }

  return (
    <div className="flex h-screen overflow-hidden font-sans selection:bg-bridge-sage selection:text-bridge-slate">

      {/* Sidebar Navigation */}
      <Sidebar
        navItems={NAVIGATION_ITEMS}
        activePath={activePath}
        onNavigate={setActivePath}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        isCollapsed={sidebarCollapsed}
        setIsCollapsed={setSidebarCollapsed}
        isAdmin={isAdmin}
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden relative scroll-smooth bg-[#F5F5F0]">
        {/* Mobile Header Trigger */}
        <div className="lg:hidden p-6 flex justify-between items-center sticky top-0 z-30 bg-white/20 backdrop-blur-md">
          <h1 className="font-serif text-xl text-bridge-slate">The Bridge</h1>
          <button onClick={() => setSidebarOpen(true)} className="p-2 text-slate-600">
            <Menu size={24} />
          </button>
        </div>

        <div className="max-w-[1400px] mx-auto p-4 md:p-8 lg:p-10 h-full">
          {renderContent()}
        </div>
      </main>

      {/* Global Feedback Button */}
      <FeedbackButton currentPage={activePath} />
    </div>
  );
}

// Sign-in page for unauthenticated users
function SignInPage() {
  const { signInWithGoogle } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5F0]">
      <div className="max-w-md w-full text-center px-6">
        <div className="mb-8">
          <h1 className="text-5xl font-serif text-[#1a1a2e] mb-3 tracking-tight">The Bridge</h1>
          <p className="text-slate-500 text-lg font-light">Your Professional Sanctuary</p>
        </div>
        <button
          onClick={signInWithGoogle}
          className="inline-flex items-center gap-3 px-8 py-4 bg-[#1a1a2e] text-white rounded-xl text-sm font-bold hover:bg-slate-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Sign In with Google
        </button>
        <p className="text-xs text-slate-400 mt-6">Invite-only access. Contact admin for an invite link.</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
