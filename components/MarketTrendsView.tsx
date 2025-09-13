import React, { useState, useCallback } from 'react';
import { getMarketTrends } from '../services/geminiService';
import type { Trend, StockDetailInfo } from '../types';
import LoadingSpinner from './LoadingSpinner';
import ErrorDisplay from './ErrorDisplay';

interface MarketTrendsViewProps {
  onStockSelect: (stock: StockDetailInfo) => void;
}

const MarketTrendsView: React.FC<MarketTrendsViewProps> = ({ onStockSelect }) => {
  const [trends, setTrends] = useState<Trend[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetchTrends = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setTrends([]);
    try {
      const data = await getMarketTrends();
      setTrends(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-100">시장 트렌드 분석</h2>
        <p className="mt-1 text-gray-400">AI를 통해 최신 시장 트렌드와 관련 유망 기업을 확인하세요.</p>
      </div>
      
      <button
        onClick={handleFetchTrends}
        disabled={isLoading}
        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {isLoading ? '분석 중...' : '최신 트렌드 분석하기'}
      </button>

      {isLoading && <div className="pt-10"><LoadingSpinner /></div>}
      {error && <ErrorDisplay message={error} />}
      
      {trends.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trends.map((trend, index) => (
            <div key={index} className="bg-gray-800/50 rounded-lg shadow-lg p-6 border border-gray-700 transform hover:-translate-y-1 transition-transform duration-300">
              <h3 className="text-xl font-semibold text-cyan-400">{trend.trendName}</h3>
              <p className="mt-2 text-gray-300">{trend.explanation}</p>
              <div className="mt-4">
                <h4 className="font-semibold text-gray-200">관련 기업:</h4>
                <ul className="mt-2 space-y-1">
                  {trend.companies.map((company, cIndex) => (
                    <li key={cIndex}>
                       <button onClick={() => onStockSelect({ name: company.name, ticker: company.ticker, context: `떠오르는 트렌드 '${trend.trendName}'의 관련주` })} className="w-full text-left p-2 rounded-md hover:bg-gray-700 transition-colors duration-200">
                        <div className="flex justify-between text-sm text-gray-400">
                           <span>{company.name}</span>
                           <span className="font-mono bg-gray-700 px-2 py-0.5 rounded text-cyan-300">{company.ticker}</span>
                        </div>
                       </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MarketTrendsView;
