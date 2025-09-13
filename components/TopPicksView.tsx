import React, { useState, useCallback } from 'react';
import { getTopPicks } from '../services/geminiService';
import type { TopPicksAnalysis, TopPickStock, StockDetailInfo } from '../types';
import LoadingSpinner from './LoadingSpinner';
import ErrorDisplay from './ErrorDisplay';

interface TopPicksViewProps {
  onStockSelect: (stock: StockDetailInfo) => void;
}

const TopPicksView: React.FC<TopPicksViewProps> = ({ onStockSelect }) => {
  const [picks, setPicks] = useState<TopPicksAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetchPicks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setPicks(null);
    try {
      const data = await getTopPicks();
      setPicks(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const StockCard: React.FC<{ stock: TopPickStock }> = ({ stock }) => (
    <div 
      className="bg-gray-800/50 rounded-lg shadow-lg p-5 border border-gray-700 transition-all hover:border-cyan-500 hover:-translate-y-1 cursor-pointer"
      onClick={() => onStockSelect({ name: stock.name, ticker: stock.ticker, context: stock.rationale })}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-white">{stock.name}</h3>
        </div>
        <span className="font-mono bg-gray-700 px-2.5 py-1 rounded text-cyan-300 text-sm flex-shrink-0">{stock.ticker}</span>
      </div>
      <p className="mt-3 text-sm text-gray-300">{stock.rationale}</p>
    </div>
  );

  const CategorySection: React.FC<{ title: string; subtitle: string; stocks: TopPickStock[]; icon: JSX.Element }> = ({ title, subtitle, stocks, icon }) => (
    <div>
      <div className="flex items-center mb-4">
        <div className="mr-3 text-cyan-400">{icon}</div>
        <div>
          <h3 className="text-xl font-bold text-gray-100">{title}</h3>
          <p className="text-sm text-gray-400">{subtitle}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stocks.map(stock => <StockCard key={stock.ticker} stock={stock} />)}
      </div>
    </div>
  );
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-100">마라톤투자자 로시난테의 오늘의 Top Pick</h2>
        <p className="mt-1 text-gray-400">AI 투자 전문가가 다양한 분석을 통해 엄선한 추천 종목입니다.</p>
      </div>
      
      <button
        onClick={handleFetchPicks}
        disabled={isLoading}
        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {isLoading ? '분석 중...' : '오늘의 추천 종목 받기'}
      </button>

      {isLoading && <div className="pt-10"><LoadingSpinner /></div>}
      {error && <ErrorDisplay message={error} />}
      
      {picks && (
        <div className="space-y-8 mt-4">
          <CategorySection 
            title="고수익 성장주" 
            subtitle="높은 성장 잠재력에 투자합니다." 
            stocks={picks.highGrowth} 
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
          />
          <CategorySection 
            title="중위험 중수익주" 
            subtitle="안정성과 성장의 균형을 추구합니다." 
            stocks={picks.mediumRisk} 
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
          />
          <CategorySection 
            title="안전 투자주" 
            subtitle="가치와 안정성에 중점을 둡니다." 
            stocks={picks.safe}
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
        </div>
      )}
    </div>
  );
};

export default TopPicksView;
