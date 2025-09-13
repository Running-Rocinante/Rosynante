import React, { useState, useCallback } from 'react';
import { analyzeSector } from '../services/geminiService';
import type { SectorAnalysis, StockDetailInfo } from '../types';
import LoadingSpinner from './LoadingSpinner';
import ErrorDisplay from './ErrorDisplay';
import { SECTORS } from '../constants';

interface SectorAnalysisViewProps {
  onStockSelect: (stock: StockDetailInfo) => void;
}

const SectorAnalysisView: React.FC<SectorAnalysisViewProps> = ({ onStockSelect }) => {
  const [selectedSector, setSelectedSector] = useState<string>(SECTORS[0]);
  const [analysis, setAnalysis] = useState<SectorAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyzeSector = useCallback(async () => {
    if (!selectedSector) return;
    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    try {
      const data = await analyzeSector(selectedSector);
      setAnalysis(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [selectedSector]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-100">섹터 심층 분석</h2>
        <p className="mt-1 text-gray-400">관심 있는 산업 섹터를 선택하여 AI의 심층 분석 리포트를 받아보세요.</p>
      </div>
      
      <div className="flex items-center space-x-4">
        <select
          value={selectedSector}
          onChange={(e) => setSelectedSector(e.target.value)}
          className="block w-full md:w-1/3 px-4 py-3 text-base text-gray-100 bg-gray-800 border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
        >
          {SECTORS.map(sector => <option key={sector} value={sector}>{sector}</option>)}
        </select>
        <button
          onClick={handleAnalyzeSector}
          disabled={isLoading || !selectedSector}
          className="px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isLoading ? '분석 중...' : '섹터 분석하기'}
        </button>
      </div>

      {isLoading && <div className="pt-10"><LoadingSpinner /></div>}
      {error && <ErrorDisplay message={error} />}

      {analysis && (
        <div className="bg-gray-800/50 rounded-lg shadow-lg p-6 border border-gray-700 space-y-6">
          <h3 className="text-2xl font-semibold text-cyan-400">{selectedSector} 분석 리포트</h3>
          
          <div>
            <h4 className="text-lg font-semibold text-gray-200">섹터 개요</h4>
            <p className="mt-2 text-gray-300">{analysis.sectorOverview}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-semibold text-gray-200">주요 성장 동력</h4>
              <ul className="mt-2 list-disc list-inside space-y-1 text-gray-300">
                {analysis.growthDrivers.map((driver, i) => <li key={i}>{driver}</li>)}
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-red-400">잠재적 리스크</h4>
              <ul className="mt-2 list-disc list-inside space-y-1 text-gray-300">
                {analysis.risks.map((risk, i) => <li key={i}>{risk}</li>)}
              </ul>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-gray-200">유망 기업</h4>
            <div className="mt-2 space-y-4">
              {analysis.promisingCompanies.map((company, i) => (
                <div key={i} className="p-4 bg-gray-700/50 rounded-md cursor-pointer hover:bg-gray-700 transition-colors" onClick={() => onStockSelect({ name: company.name, ticker: company.ticker, context: company.rationale })}>
                  <div className="flex justify-between items-center">
                    <p className="font-bold text-cyan-300">{company.name}</p>
                    <span className="font-mono bg-gray-900 px-2 py-1 rounded text-cyan-300 text-sm">{company.ticker}</span>
                  </div>
                  <p className="mt-2 text-sm text-gray-400">{company.rationale}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default SectorAnalysisView;
