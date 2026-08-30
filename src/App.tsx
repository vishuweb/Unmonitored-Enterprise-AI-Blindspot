import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { QuickSearchModal } from './components/layout/QuickSearchModal';
import { KeyboardShortcutsModal } from './components/layout/KeyboardShortcutsModal';
import { SandboxPage } from './pages/SandboxPage';
import { ObservabilityPage } from './pages/ObservabilityPage';
import { GovernancePage } from './pages/GovernancePage';
import { ReviewQueuePage } from './pages/ReviewQueuePage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { ArchitecturePage } from './pages/ArchitecturePage';
import { useControlPlane } from './context/ControlPlaneContext';
import { useKeyboardShortcuts, getGlobalShortcuts } from './hooks/useKeyboardShortcuts';

export const App: React.FC = () => {
  const { activeTab, setActiveTab, setIsSearchOpen, approveAllLowRisk } = useControlPlane();
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [pageKey, setPageKey] = useState(activeTab);

  // Trigger re-mount animation on tab change
  useEffect(() => {
    setPageKey(activeTab);
  }, [activeTab]);

  useKeyboardShortcuts({
    shortcuts: getGlobalShortcuts({
      onOpenSearch: () => setIsSearchOpen(true),
      onNavigateSandbox: () => setActiveTab('sandbox'),
      onNavigateGovernance: () => setActiveTab('governance'),
      onApproveAll: () => {
        if (window.confirm('Approve all low-risk review items?')) {
          approveAllLowRisk?.();
        }
      },
      onHelp: () => setShowKeyboardHelp(true),
    }),
  });

  const renderContent = () => {
    switch (activeTab) {
      case 'sandbox':       return <SandboxPage />;
      case 'observability': return <ObservabilityPage />;
      case 'governance':    return <GovernancePage />;
      case 'review':        return <ReviewQueuePage />;
      case 'audit':         return <AuditLogsPage />;
      case 'architecture':  return <ArchitecturePage />;
      default:              return <SandboxPage />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100 font-sans relative">
      {/* Animated background layer */}
      <div className="bg-grid" aria-hidden />
      <div className="bg-orb-1" aria-hidden />
      <div className="bg-orb-2" aria-hidden />
      <div className="bg-orb-3" aria-hidden />
      <div className="scan-overlay" aria-hidden />

      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        <Header />
        <main className="flex-1 overflow-y-auto bg-transparent">
          <div key={pageKey} className="page-enter h-full">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Global Quick Search Modal */}
      <QuickSearchModal />

      {/* Keyboard Shortcuts Help Modal */}
      <KeyboardShortcutsModal isOpen={showKeyboardHelp} onClose={() => setShowKeyboardHelp(false)} />
    </div>
  );
};

export default App;
