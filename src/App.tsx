import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';

// Views
import { ExecutiveOverview } from './components/views/ExecutiveOverview';
import { AudienceIntelligence } from './components/views/AudienceIntelligence';
import { ContentIntelligence } from './components/views/ContentIntelligence';
import { Personalization } from './components/views/Personalization';
import { AiInsights } from './components/views/AiInsights';
import { Experimentation } from './components/views/Experimentation';
import { DataProducts } from './components/views/DataProducts';
import { DataQuality } from './components/views/DataQuality';
import { ModelHealth } from './components/views/ModelHealth';
import { AgentWorkspace } from './components/views/AgentWorkspace';

// Drawers
import { CustomerDrawer } from './components/drawers/CustomerDrawer';
import { ContentDrawer } from './components/drawers/ContentDrawer';
import { DataProductDrawer } from './components/drawers/DataProductDrawer';
import { QualityIncidentDrawer } from './components/drawers/QualityIncidentDrawer';

const AppContent: React.FC = () => {
  const { activeView } = useApp();

  const renderView = () => {
    switch (activeView) {
      case 'executive':
        return <ExecutiveOverview />;
      case 'audience':
        return <AudienceIntelligence />;
      case 'content':
        return <ContentIntelligence />;
      case 'personalization':
        return <Personalization />;
      case 'ai_insights':
        return <AiInsights />;
      case 'experimentation':
        return <Experimentation />;
      case 'data_products':
        return <DataProducts />;
      case 'data_quality':
        return <DataQuality />;
      case 'model_health':
        return <ModelHealth />;
      case 'agent_workspace':
        return <AgentWorkspace />;
      default:
        return <ExecutiveOverview />;
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#080c14] text-slate-100 font-sans select-none antialiased">
      {/* Top Header */}
      <Header />

      {/* Main Container: Sidebar + Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Navigation Sidebar */}
        <Sidebar />

        {/* Scrollable View Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-gradient-to-b from-[#0a0f1c] via-[#080c14] to-[#06090f]">
          <div className="max-w-7xl mx-auto">{renderView()}</div>
        </main>
      </div>

      {/* Deep Dive Slide-Over Drawers */}
      <CustomerDrawer />
      <ContentDrawer />
      <DataProductDrawer />
      <QualityIncidentDrawer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
