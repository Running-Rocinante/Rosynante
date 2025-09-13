import React, { useState, useCallback } from 'react';
import { getKeywordTrends } from '../services/geminiService';
import type { KeywordTrend, StockDetailInfo } from '../types';
import LoadingSpinner from './LoadingSpinner';
import ErrorDisplay from './ErrorDisplay';
import TrendChart from './TrendChart';

interface KeywordTrendsViewProps {
  onStockSelect: (stock: StockDetailInfo) => void;
}

const KeywordTrendsView: React.FC<KeywordTrendsViewProps> = ({ onStockSelect }) => {
  const [keywords, setKeywords] = useState<KeywordTrend[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetchKeywords = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setKeywords([]);
    try {
      const data = await getKeywordTrends();
      setKeywords(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-100">급상승 키워드 분석</h2>
        <p className="mt-1 text-gray-400">시장의 다음 테마를 예측하기 위해 AI가 포착한 최신 인기 키워드를 확인하세요.</p>
      </div>
      
      <button
        onClick={handleFetchKeywords}
        disabled={isLoading}
        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {isLoading ? '분석 중...' : '최신 키워드 분석하기'}
      </button>

      {isLoading && <div className="pt-10"><LoadingSpinner /></div>}
      {error && <ErrorDisplay message={error} />}
      
      {keywords.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {keywords.map((item, index) => (
            <div key={index} className="bg-gray-800/50 rounded-lg shadow-lg p-6 border border-gray-700 transform hover:-translate-y-1 transition-transform duration-300 flex flex-col">
              <h3 className="text-xl font-semibold text-cyan-400">{item.keyword}</h3>
              <div className="flex-grow">
                 <TrendChart data={item.trendData} />
              </div>
              <p className="mt-2 text-gray-300 text-sm">{item.reason}</p>

              {item.companies && item.companies.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-700/50">
                  <h4 className="font-semibold text-gray-200 text-sm mb-2">관련 종목</h4>
                  <ul className="space-y-1">
                    {item.companies.map((company, cIndex) => (
                      <li key={cIndex}>
                         <button onClick={() => onStockSelect({ name: company.name, ticker: company.ticker, context: `급상승 키워드 '${item.keyword}' 관련주` })} className="w-full text-left p-1.5 rounded-md hover:bg-gray-700 transition-colors duration-200">
                          <div className="flex justify-between text-sm text-gray-400">
                             <span>{company.name}</span>
                             <span className="font-mono bg-gray-900 px-2 py-0.5 rounded text-cyan-300">{company.ticker}</span>
                          </div>
                         </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default KeywordTrendsView;