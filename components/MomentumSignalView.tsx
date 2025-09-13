import React, { useState, useCallback } from 'react';
import { findMomentumStocks } from '../services/geminiService';
import type { MomentumStock, StockDetailInfo } from '../types';
import LoadingSpinner from './LoadingSpinner';
import ErrorDisplay from './ErrorDisplay';
import { MARKETS } from '../constants';

interface MomentumSignalViewProps {
  onStockSelect: (stock: StockDetailInfo) => void;
}

const MomentumSignalView: React.FC<MomentumSignalViewProps> = ({ onStockSelect }) => {
  const [selectedMarket, setSelectedMarket] = useState<string>(MARKETS[0]);
  const [results, setResults] = useState<MomentumStock[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetchMomentumStocks = useCallback(async () => {
    if (!selectedMarket) return;
    setIsLoading(true);
    setError(null);
    setResults([]);
    try {
      const data = await findMomentumStocks(selectedMarket);
      setResults(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [selectedMarket]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-100">모멘텀 신호 탐색</h2>
        <p className="mt-1 text-gray-400">AI가 기술적 분석을 통해 상승 모멘텀이 포착된 종목을 시장별로 탐색합니다.</p>
      </div>

      <div className="flex items-center space-x-4">
        <select
          value={selectedMarket}
          onChange={(e) => setSelectedMarket(e.target.value)}
          className="block w-full md:w-1/3 px-4 py-3 text-base text-gray-100 bg-gray-800 border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
        >
          {MARKETS.map(market => <option key={market} value={market}>{market}</option>)}
        </select>
        <button
          onClick={handleFetchMomentumStocks}
          disabled={isLoading || !selectedMarket}
          className="px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isLoading ? '탐색 중...' : '모멘텀 종목 탐색하기'}
        </button>
      </div>

      {isLoading && <div className="pt-10"><LoadingSpinner /></div>}
      {error && <ErrorDisplay message={error} />}

      {results.length > 0 && (
        <div className="space-y-4">
          {results.map((stock, index) => (
            <div 
              key={index} 
              className="bg-gray-800/50 rounded-lg shadow-lg p-5 border border-gray-700 transition-all hover:border-cyan-500 cursor-pointer"
              onClick={() => onStockSelect({ name: stock.name, ticker: stock.ticker, context: stock.signal })}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-white">{stock.name}</h3>
                </div>
                <span className="font-mono bg-gray-700 px-2.5 py-1 rounded text-cyan-300 text-sm">{stock.ticker}</span>
              </div>
              <div className="mt-3 flex items-start space-x-3">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <p className="text-gray-300"><span className="font-semibold text-green-400">포착된 신호:</span> {stock.signal}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MomentumSignalView;
