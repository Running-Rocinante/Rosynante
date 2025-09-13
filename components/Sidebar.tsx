import React, { useState } from 'react';
import { ViewMode } from '../types';

interface SidebarProps {
  activeView: ViewMode;
  setActiveView: (view: ViewMode) => void;
}

const SidebarIcon: React.FC<{ mode: ViewMode | 'GROUP' | 'TOP_PICKS' | 'VIRTUAL_INVESTMENT', active: boolean, isOpen?: boolean }> = ({ mode, active, isOpen }) => {
    const baseClasses = "w-6 h-6 transition-colors duration-200";
    const activeClasses = "text-cyan-400";
    const inactiveClasses = "text-gray-400 group-hover:text-cyan-300";
    const iconClass = active ? activeClasses : inactiveClasses;

    switch (mode) {
        case 'TOP_PICKS':
            return <svg xmlns="http://www.w3.org/2000/svg" className={`${baseClasses} ${iconClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
        case 'GROUP':
            return <svg xmlns="http://www.w3.org/2000/svg" className={`${baseClasses} ${iconClass} transform transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
        case ViewMode.TRENDS:
            return <svg xmlns="http://www.w3.org/2000/svg" className={`${baseClasses} ${iconClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;
        case ViewMode.KEYWORD:
             return <svg xmlns="http://www.w3.org/2000/svg" className={`${baseClasses} ${iconClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
        case ViewMode.MOMENTUM:
            return <svg xmlns="http://www.w3.org/2000/svg" className={`${baseClasses} ${iconClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>;
        case ViewMode.SECTOR:
            return <svg xmlns="http://www.w3.org/2000/svg" className={`${baseClasses} ${iconClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
        case ViewMode.SCREENER:
            return <svg xmlns="http://www.w3.org/2000/svg" className={`${baseClasses} ${iconClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2zM13 10a1 1 0 011-1h6a1 1 0 011 1v2a1 1 0 01-1 1h-6a1 1 0 01-1-1v-2zM3 16a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" /></svg>;
        case ViewMode.VIRTUAL_INVESTMENT:
            return <svg xmlns="http://www.w3.org/2000/svg" className={`${baseClasses} ${iconClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>;
        default: return null;
    }
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  const [isDiscoveryOpen, setIsDiscoveryOpen] = useState(true);

  const discoveryItems = [
    { mode: ViewMode.TRENDS, label: '시장 트렌드 분석' },
    { mode: ViewMode.KEYWORD, label: '급상승 키워드' },
    { mode: ViewMode.MOMENTUM, label: '모멘텀 신호 탐색' },
    { mode: ViewMode.SECTOR, label: '섹터 심층 분석' },
    { mode: ViewMode.SCREENER, label: '맞춤 종목 스크리닝' },
  ];

  const isDiscoveryActive = discoveryItems.some(item => item.mode === activeView);

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 p-4 flex flex-col overflow-y-auto">
      <nav className="flex flex-col space-y-2">
        {/* Discovery Group */}
        <div>
          <button
            onClick={() => setIsDiscoveryOpen(!isDiscoveryOpen)}
            className={`group w-full flex items-center px-4 py-3 text-sm font-medium rounded-md transition-all duration-200 ${
              isDiscoveryActive
                ? 'bg-gray-800/60 text-white'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <SidebarIcon mode="GROUP" active={isDiscoveryActive} isOpen={isDiscoveryOpen} />
            <span className="ml-3">종목 발굴</span>
          </button>
          
          {isDiscoveryOpen && (
            <div className="mt-2 space-y-1 pl-4">
              {discoveryItems.map((item) => {
                const isActive = activeView === item.mode;
                return (
                  <button
                    key={item.mode}
                    onClick={() => setActiveView(item.mode)}
                    className={`group w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
                      isActive
                        ? 'bg-cyan-900/50 text-white'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <SidebarIcon mode={item.mode} active={isActive} />
                    <span className="ml-3">{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Picks */}
        <button
          onClick={() => setActiveView(ViewMode.TOP_PICKS)}
          className={`group flex items-center px-4 py-3 text-sm font-medium rounded-md transition-all duration-200 ${
            activeView === ViewMode.TOP_PICKS
              ? 'bg-cyan-900/50 text-white'
              : 'text-gray-400 hover:bg-gray-800 hover:text-white'
          }`}
        >
          <SidebarIcon mode="TOP_PICKS" active={activeView === ViewMode.TOP_PICKS} />
          <span className="ml-3">오늘의 Top Pick</span>
        </button>

        {/* Virtual Investment */}
        <button
          onClick={() => setActiveView(ViewMode.VIRTUAL_INVESTMENT)}
          className={`group flex items-center px-4 py-3 text-sm font-medium rounded-md transition-all duration-200 ${
            activeView === ViewMode.VIRTUAL_INVESTMENT
              ? 'bg-cyan-900/50 text-white'
              : 'text-gray-400 hover:bg-gray-800 hover:text-white'
          }`}
        >
          <SidebarIcon mode="VIRTUAL_INVESTMENT" active={activeView === ViewMode.VIRTUAL_INVESTMENT} />
          <span className="ml-3">가상투자 해보기</span>
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;