import React, { useState, useEffect } from 'react';
import { getTechnicalAnalysis } from '../services/geminiService';
import type { StockDetailInfo, TechnicalAnalysis } from '../types';
import LoadingSpinner from './LoadingSpinner';
import ErrorDisplay from './ErrorDisplay';
import StockAnalysisChart from './StockAnalysisChart';

interface StockDetailViewProps {
  stock: StockDetailInfo;
  onBack: () => void;
}

const StockDetailView: React.FC<StockDetailViewProps> = ({ stock, onBack }) => {
  const [analysis, setAnalysis] = useState<TechnicalAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getTechnicalAnalysis(stock);
        setAnalysis(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalysis();
  }, [stock]);

  const PriceCard: React.FC<{ title: string; price: string; colorClass: string }> = ({ title, price, colorClass }) => (
    <div className="bg-gray-800 p-4 rounded-lg text-center border border-gray-700">
      <p className="text-sm font-medium text-gray-400">{title}</p>
      <p className={`text-2xl font-bold ${colorClass}`}>{price}</p>
    </div>
  );


  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">{stock.name} <span className="text-lg text-gray-400 font-mono">({stock.ticker})</span></h2>
          <p className="mt-1 text-gray-400">AI 기반 기술적 분석 및 가격 제안</p>
        </div>
        <button
          onClick={onBack}
          className="flex items-center px-4 py-2 text-sm font-medium rounded-md bg-gray-700 hover:bg-gray-600 text-gray-200 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="http://www.w3.org/2000/svg" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          뒤로가기
        </button>
      </div>

      <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
        <p className="text-sm text-gray-400">추천 근거</p>
        <p className="mt-1 text-cyan-300 font-medium">{stock.context}</p>
      </div>

      {isLoading && <div className="pt-10"><LoadingSpinner /></div>}
      {error && <ErrorDisplay message={error} />}

      {analysis && (
        <div className="space-y-6">
            <div className="flex flex-col space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <PriceCard title="현재가" price={analysis.currentPrice} colorClass="text-white" />
                <PriceCard title="전일종가" price={analysis.previousClose} colorClass="text-gray-400" />
                <PriceCard title="이전 최고가" price={analysis.previousAllTimeHigh} colorClass="text-gray-400" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <PriceCard title="진입 추천가" price={analysis.entryPrice} colorClass="text-green-400" />
                <PriceCard title="목표가" price={analysis.targetPrice} colorClass="text-cyan-400" />
                <PriceCard title="손절가" price={analysis.stopLossPrice} colorClass="text-red-400" />
              </div>
            </div>

            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
                <h3 className="text-lg font-semibold text-gray-200">분석 요약</h3>
                <p className="mt-2 text-gray-300 whitespace-pre-wrap">{analysis.analysisSummary}</p>
            </div>

            <StockAnalysisChart analysis={analysis} />
            
            <div className="text-xs text-gray-500 text-center p-4">
                * 본 분석은 AI가 제공하는 정보이며 투자에 대한 최종 결정과 책임은 투자자 본인에게 있습니다.
            </div>
        </div>
      )}
    </div>
  );
};

export default StockDetailView;