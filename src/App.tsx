import React from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DemoTourBanner } from './components/layout/DemoTourBanner';
import { QuickSearchModal } from './components/layout/QuickSearchModal';
import { SandboxPage } from './pages/SandboxPage';
import { ObservabilityPage } from './pages/ObservabilityPage';
import { GovernancePage } from './pages/GovernancePage';
import { ReviewQueuePage } from './pages/ReviewQueuePage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { ArchitecturePage } from './pages/ArchitecturePage';
import { useControlPlane } from './context/ControlPlaneContext';

export const App: React.FC = () => {
  const { activeTab } = useControlPlane();

  const renderContent = () => {
    switch (activeTab) {
      case 'sandbox':
        return <SandboxPage />;
      case 'observability':
        return <ObservabilityPage />;
      case 'governance':
        return <GovernancePage />;
      case 'review':
        return <ReviewQueuePage />;
      case 'audit':
        return <AuditLogsPage />;
      case 'architecture':
        return <ArchitecturePage />;
      default:
        return <SandboxPage />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100 font-sans">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <DemoTourBanner />
        <main className="flex-1 overflow-y-auto bg-zinc-950">
          {renderContent()}
        </main>
      </div>

      {/* Global Quick Search Modal */}
      <QuickSearchModal />
    </div>
  );
};

export default App;
