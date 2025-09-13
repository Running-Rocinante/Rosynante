import React, { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MarketTrendsView from './components/MarketTrendsView';
import SectorAnalysisView from './components/SectorAnalysisView';
import CompanyScreenerView from './components/CompanyScreenerView';
import KeywordTrendsView from './components/KeywordTrendsView';
import MomentumSignalView from './components/MomentumSignalView';
import StockDetailView from './components/StockDetailView';
import TopPicksView from './components/TopPicksView';
import VirtualInvestmentView from './components/VirtualInvestmentView';
import { ViewMode, type StockDetailInfo } from './types';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewMode>(ViewMode.TOP_PICKS);
  const [selectedStock, setSelectedStock] = useState<StockDetailInfo | null>(null);

  const handleStockSelect = (stockInfo: StockDetailInfo) => {
    setSelectedStock(stockInfo);
  };
  
  const handleBack = () => {
    setSelectedStock(null);
  }

  const renderContent = () => {
    const props = { onStockSelect: handleStockSelect };
    switch (activeView) {
      case ViewMode.TOP_PICKS:
        return <TopPicksView {...props} />;
      case ViewMode.TRENDS:
        return <MarketTrendsView {...props} />;
      case ViewMode.KEYWORD:
        return <KeywordTrendsView {...props} />;
      case ViewMode.MOMENTUM:
        return <MomentumSignalView {...props} />;
      case ViewMode.SECTOR:
        return <SectorAnalysisView {...props} />;
      case ViewMode.SCREENER:
        return <CompanyScreenerView {...props} />;
      case ViewMode.VIRTUAL_INVESTMENT:
        return <VirtualInvestmentView />;
      default:
        return <TopPicksView {...props} />;
    }
  };

  return (
    <div className="h-screen flex flex-col font-sans bg-gray-900 text-gray-100">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeView={activeView} setActiveView={setActiveView} />
        <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
          {selectedStock ? (
            <StockDetailView stock={selectedStock} onBack={handleBack} />
          ) : (
            renderContent()
          )}
        </main>
      </div>
    </div>
  );
};

export default App;