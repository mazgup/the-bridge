import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
// import { CVAudit } from './components/cv/CVAudit'; // Removed
import { UnifiedBuilder } from './components/cv/builder/UnifiedBuilder';
import { InterviewSimulationLab } from './components/simulation/InterviewSimulationLab';
import { KnowledgeBriefs } from './components/knowledge/KnowledgeBriefs';
import { OpportunityRadar } from './components/radar/OpportunityRadar';
import { About } from './components/About';
import { ReturnHub } from './components/return/ReturnHub';
import { TermsAndConditions } from './components/TermsAndConditions';
import { LinkedInSync } from './components/cv/LinkedInSync';
import { NAVIGATION_ITEMS, INITIAL_FEATURES, MOCK_USER } from './constants';
import { Menu } from 'lucide-react';
import { CVProfile, INITIAL_CV_PROFILE } from './components/cv/CVTypes';
import { AuthProvider, useAuth } from './context/AuthContext';

function AppContent() {
  const [activePath, setActivePath] = useState('/');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cvData, setCvData] = useState<CVProfile>(INITIAL_CV_PROFILE);
  const { user, loading } = useAuth(); // Access auth state

  const handleCVBuildComplete = (data: CVProfile) => {
    setCvData(data);
    setActivePath('/cv-builder'); // Stay on builder or go to dashboard to see it
  };

  // Simple routing logic based on activePath
  const renderContent = () => {
    switch (activePath) {
      case '/':
        // Pass real user data if available, otherwise fallback to mock
        const currentUser = user ? {
          name: user.displayName || 'User',
          email: user.email || '',
          avatarUrl: user.photoURL || MOCK_USER.avatarUrl,
          jobTitle: 'Professional'
        } : MOCK_USER;

        return <Dashboard user={currentUser} features={INITIAL_FEATURES} onNavigate={setActivePath} cvData={cvData} />;
      case '/cv-builder':
        return <UnifiedBuilder onNavigate={setActivePath} />;
      // case '/cv-audit': return <UnifiedBuilder ... />; // Removed
      case '/linkedin-sync':
        return <LinkedInSync cvData={cvData} onNavigate={setActivePath} />;
      case '/simulation':
        return <InterviewSimulationLab cvData={cvData} />;
      case '/knowledge':
        return <KnowledgeBriefs />;
      case '/radar':
        return <OpportunityRadar cvData={cvData} />;
      case '/return-hub':
        return <ReturnHub cvData={cvData} setCvData={setCvData} onNavigate={setActivePath} />;
      case '/terms':
        return <TermsAndConditions />;
      case '/about':
        return <About />;
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
