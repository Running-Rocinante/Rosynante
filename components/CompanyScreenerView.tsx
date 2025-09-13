import React, { useState, useCallback } from 'react';
import { screenCompanies } from '../services/geminiService';
import type { ScreenedCompany, ScreeningCriteria, StockDetailInfo } from '../types';
import LoadingSpinner from './LoadingSpinner';
import ErrorDisplay from './ErrorDisplay';

interface CompanyScreenerViewProps {
  onStockSelect: (stock: StockDetailInfo) => void;
}

const CompanyScreenerView: React.FC<CompanyScreenerViewProps> = ({ onStockSelect }) => {
  const [criteria, setCriteria] = useState<ScreeningCriteria>({
    marketCap: '대형주 (100억 달러 이상)',
    peRatio: '낮음 (15 미만)',
    growthPotential: '높음 (연 15% 이상 성장)',
  });
  const [results, setResults] = useState<ScreenedCompany[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleScreenCompanies = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setResults([]);
    try {
      const data = await screenCompanies(criteria);
      setResults(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [criteria]);
  
  const handleCriteriaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCriteria(prev => ({...prev, [name]: value}));
  };

  const CriterionInput: React.FC<{ label: string; name: keyof ScreeningCriteria; options: string[] }> = ({ label, name, options }) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-300">{label}</label>
      <select
        id={name}
        name={name}
        value={criteria[name]}
        onChange={handleCriteriaChange}
        className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-gray-800 border-gray-700 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm rounded-md"
      >
        {options.map(opt => <option key={opt}>{opt}</option>)}
      </select>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-100">맞춤 종목 스크리닝</h2>
        <p className="mt-1 text-gray-400">원하는 투자 기준을 설정하여 AI가 추천하는 종목을 찾아보세요.</p>
      </div>

      <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CriterionInput 
            label="시가총액" 
            name="marketCap"
            options={['소형주 (20억 달러 미만)', '중형주 (20억-100억 달러)', '대형주 (100억 달러 이상)']}
          />
          <CriterionInput 
            label="주가수익비율 (P/E)"
            name="peRatio"
            options={['매우 낮음 (10 미만)', '낮음 (15 미만)', '적정 (15-25)', '높음 (25 이상)']}
          />
          <CriterionInput 
            label="성장 잠재력 (매출)"
            name="growthPotential"
            options={['안정적 (연 5% 미만)', '보통 (연 5-15%)', '높음 (연 15% 이상 성장)']}
          />
        </div>
        <div className="mt-6 text-right">
          <button
            onClick={handleScreenCompanies}
            disabled={isLoading}
            className="px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? '검색 중...' : '조건에 맞는 종목 찾기'}
          </button>
        </div>
      </div>
      
      {isLoading && <div className="pt-10"><LoadingSpinner /></div>}
      {error && <ErrorDisplay message={error} />}

      {results.length > 0 && (
        <div className="overflow-x-auto">
            <div className="min-w-full inline-block align-middle">
                <div className="overflow-hidden border border-gray-700 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-800">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">회사명 (티커)</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">사업 개요</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">선정 이유</th>
                            </tr>
                        </thead>
                        <tbody className="bg-gray-800/50 divide-y divide-gray-700">
                            {results.map((company, index) => (
                                <tr 
                                  key={index} 
                                  className="hover:bg-gray-700/50 cursor-pointer"
                                  onClick={() => onStockSelect({ name: company.name, ticker: company.ticker, context: company.justification })}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-white">{company.name}</div>
                                        <div className="text-sm text-gray-400 font-mono">{company.ticker}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-pre-wrap text-sm text-gray-300 w-1/3">{company.summary}</td>
                                    <td className="px-6 py-4 whitespace-pre-wrap text-sm text-gray-300 w-1/3">{company.justification}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default CompanyScreenerView;
