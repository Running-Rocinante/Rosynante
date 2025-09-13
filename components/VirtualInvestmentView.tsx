import React, { useState, useEffect, useCallback } from 'react';
import { getInvestmentProjection } from '../services/geminiService';
import type { VirtualInvestment, InvestmentProjection } from '../types';
import LoadingSpinner from './LoadingSpinner';
import ErrorDisplay from './ErrorDisplay';

const VirtualInvestmentView: React.FC = () => {
    const [investments, setInvestments] = useState<VirtualInvestment[]>([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isProjectionModalOpen, setIsProjectionModalOpen] = useState(false);
    const [isCalcModalOpen, setIsCalcModalOpen] = useState(false);
    const [selectedInvestment, setSelectedInvestment] = useState<VirtualInvestment | null>(null);
    const [currentPriceInput, setCurrentPriceInput] = useState('');
    const [projection, setProjection] = useState<InvestmentProjection | null>(null);
    const [isLoadingProjection, setIsLoadingProjection] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [newInvestment, setNewInvestment] = useState({
        name: '',
        ticker: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        quantity: '',
        avgPrice: ''
    });
    
    useEffect(() => {
        try {
            const savedInvestmentsJSON = localStorage.getItem('virtualInvestments');
            const savedInvestments = savedInvestmentsJSON ? JSON.parse(savedInvestmentsJSON) : [];
            setInvestments(savedInvestments);
        } catch (error) {
            console.error("Failed to load investments from localStorage", error);
        }
    }, []);

    const saveInvestmentsToStorage = (updatedInvestments: VirtualInvestment[]) => {
        try {
            localStorage.setItem('virtualInvestments', JSON.stringify(updatedInvestments));
        } catch (error) {
            console.error("Failed to save investments to localStorage", error);
        }
    };
    
    const handleAddInvestment = () => {
        if (!newInvestment.name || !newInvestment.ticker || !newInvestment.quantity || !newInvestment.avgPrice) {
            alert("모든 필드를 입력해주세요.");
            return;
        }
        const investmentToAdd: VirtualInvestment = {
            id: Date.now().toString(),
            name: newInvestment.name,
            ticker: newInvestment.ticker.toUpperCase(),
            purchaseDate: newInvestment.purchaseDate,
            quantity: parseFloat(newInvestment.quantity),
            avgPrice: parseFloat(newInvestment.avgPrice)
        };
        const updatedInvestments = [...investments, investmentToAdd];
        setInvestments(updatedInvestments);
        saveInvestmentsToStorage(updatedInvestments);
        setIsAddModalOpen(false);
        setNewInvestment({ name: '', ticker: '', purchaseDate: new Date().toISOString().split('T')[0], quantity: '', avgPrice: '' });
    };

    const handleDeleteInvestment = (id: string) => {
        if (window.confirm("정말로 이 투자 내역을 삭제하시겠습니까?")) {
            const updatedInvestments = investments.filter(inv => inv.id !== id);
            setInvestments(updatedInvestments);
            saveInvestmentsToStorage(updatedInvestments);
        }
    };

    const handleFetchProjection = useCallback(async (investment: VirtualInvestment) => {
        setSelectedInvestment(investment);
        setIsProjectionModalOpen(true);
        setIsLoadingProjection(true);
        setError(null);
        setProjection(null);
        try {
            const data = await getInvestmentProjection(investment);
            setProjection(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoadingProjection(false);
        }
    }, []);
    
    const handleOpenCalcModal = (investment: VirtualInvestment) => {
        setSelectedInvestment(investment);
        setCurrentPriceInput('');
        setIsCalcModalOpen(true);
    };

    const formatCurrency = (value: number) => new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(value);
    
    const renderAddModal = () => (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center z-50">
            <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md border border-gray-700">
                <h3 className="text-xl font-semibold mb-4 text-white">가상 투자 추가</h3>
                <div className="space-y-4">
                    <input type="text" placeholder="종목명 (예: 삼성전자)" value={newInvestment.name} onChange={(e) => setNewInvestment({...newInvestment, name: e.target.value})} className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white" />
                    <input type="text" placeholder="티커 (예: 005930)" value={newInvestment.ticker} onChange={(e) => setNewInvestment({...newInvestment, ticker: e.target.value})} className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white" />
                    <input type="date" value={newInvestment.purchaseDate} onChange={(e) => setNewInvestment({...newInvestment, purchaseDate: e.target.value})} className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white" />
                    <input type="number" placeholder="수량" value={newInvestment.quantity} onChange={(e) => setNewInvestment({...newInvestment, quantity: e.target.value})} className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white" />
                    <input type="number" placeholder="평균 단가" value={newInvestment.avgPrice} onChange={(e) => setNewInvestment({...newInvestment, avgPrice: e.target.value})} className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white" />
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                    <button onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 bg-gray-600 rounded text-white hover:bg-gray-500">취소</button>
                    <button onClick={handleAddInvestment} className="px-4 py-2 bg-cyan-600 rounded text-white hover:bg-cyan-500">추가</button>
                </div>
            </div>
        </div>
    );
    
    const renderCalcModal = () => {
        if (!selectedInvestment) return null;

        const purchaseValue = selectedInvestment.quantity * selectedInvestment.avgPrice;
        const currentPrice = parseFloat(currentPriceInput);
        let currentValue = 0;
        let gainLoss = 0;
        let returnRate = 0;
        let calculationResult = null;

        if (!isNaN(currentPrice) && currentPrice > 0) {
            currentValue = selectedInvestment.quantity * currentPrice;
            gainLoss = currentValue - purchaseValue;
            returnRate = purchaseValue === 0 ? 0 : (gainLoss / purchaseValue) * 100;
            const returnColor = gainLoss > 0 ? 'text-green-400' : gainLoss < 0 ? 'text-red-400' : 'text-gray-400';
            
            calculationResult = (
                <div className="mt-4 pt-4 border-t border-gray-600 grid grid-cols-3 gap-4 text-center">
                    <div>
                        <p className="text-sm text-gray-400">평가금액</p>
                        <p className="font-medium text-white text-lg">{formatCurrency(currentValue)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-400">평가손익</p>
                        <p className={`font-medium ${returnColor} text-lg`}>{formatCurrency(gainLoss)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-400">수익률</p>
                        <p className={`font-medium ${returnColor} text-lg`}>{returnRate.toFixed(2)}%</p>
                    </div>
                </div>
            );
        }

        return (
            <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center z-50">
                <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md border border-gray-700">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-white">{selectedInvestment.name} 손익 계산</h3>
                        <button onClick={() => setIsCalcModalOpen(false)} className="text-gray-400 hover:text-white">&times;</button>
                    </div>
                    <div className="space-y-4">
                        <div className="bg-gray-700/50 p-3 rounded-md text-sm">
                            <p className="text-gray-400">
                                {selectedInvestment.quantity}주 &middot; 평단 {formatCurrency(selectedInvestment.avgPrice)}
                            </p>
                        </div>
                        <div>
                             <label htmlFor="currentPrice" className="block text-sm font-medium text-gray-300 mb-1">현재가 입력</label>
                            <input
                                id="currentPrice"
                                type="number"
                                placeholder="현재 시장가를 입력하세요"
                                value={currentPriceInput}
                                onChange={(e) => setCurrentPriceInput(e.target.value)}
                                className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white focus:ring-cyan-500 focus:border-cyan-500"
                            />
                        </div>
                        {calculationResult}
                    </div>
                </div>
            </div>
        );
    };

    const renderProjectionModal = () => (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center z-50">
            <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg border border-gray-700">
                <div className="flex justify-between items-center mb-4">
                     <h3 className="text-xl font-semibold text-white">{selectedInvestment?.name} ({selectedInvestment?.ticker}) 수익 예측 리포트</h3>
                    <button onClick={() => setIsProjectionModalOpen(false)} className="text-gray-400 hover:text-white">&times;</button>
                </div>
                {isLoadingProjection && <LoadingSpinner />}
                {error && <ErrorDisplay message={error} />}
                {projection && (
                    <div className="space-y-4 text-gray-300">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-700/50 p-4 rounded-lg">
                                <p className="text-sm text-gray-400">현재 추정 가치</p>
                                <p className="text-2xl font-bold text-white">{formatCurrency(projection.currentValue)}</p>
                            </div>
                            <div className="bg-gray-700/50 p-4 rounded-lg">
                                <p className="text-sm text-gray-400">6개월 후 예상 가치</p>
                                <p className="text-2xl font-bold text-cyan-400">{formatCurrency(projection.projectedValue6M)}</p>
                            </div>
                        </div>
                        <div className="bg-gray-700/50 p-4 rounded-lg">
                                <p className="text-sm text-gray-400">6개월 후 목표 주가</p>
                                <p className="text-xl font-bold text-cyan-300">{formatCurrency(projection.targetPrice6M)}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-200">AI 분석 근거</h4>
                            <p className="mt-2 text-sm whitespace-pre-wrap">{projection.rationale}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {isAddModalOpen && renderAddModal()}
            {isCalcModalOpen && renderCalcModal()}
            {isProjectionModalOpen && renderProjectionModal()}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-100">가상투자 해보기</h2>
                    <p className="mt-1 text-gray-400">나의 투자 아이디어를 등록하고, 현재 손익을 계산하거나 AI의 미래 예측을 확인해보세요.</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-5 py-2.5 text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                >
                    가상 투자 추가
                </button>
            </div>
             {error && !isProjectionModalOpen && <ErrorDisplay message={error} />}

            {investments.length === 0 ? (
                <div className="text-center py-10 bg-gray-800/50 rounded-lg border border-dashed border-gray-700">
                    <p className="text-gray-400">아직 등록된 투자 내역이 없습니다.</p>
                    <p className="text-sm text-gray-500 mt-1">'가상 투자 추가' 버튼을 눌러 시작해보세요.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {investments.map(inv => (
                        <div key={inv.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                             <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-lg text-white">{inv.name} <span className="font-mono text-sm text-gray-400">({inv.ticker})</span></p>
                                    <p className="text-sm text-gray-400">
                                        {inv.quantity}주 &middot; 평단 {formatCurrency(inv.avgPrice)} &middot; {inv.purchaseDate}
                                    </p>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <button
                                        onClick={() => handleOpenCalcModal(inv)}
                                        className="px-4 py-2 text-sm font-medium rounded-md text-cyan-200 bg-gray-700 hover:bg-gray-600 transition-colors"
                                    >
                                        손익 계산
                                    </button>
                                    <button
                                        onClick={() => handleFetchProjection(inv)}
                                        className="px-4 py-2 text-sm font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-500 transition-colors"
                                    >
                                        AI 수익 예측
                                    </button>
                                    <button onClick={() => handleDeleteInvestment(inv.id)} className="text-gray-500 hover:text-red-400 p-2">
                                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default VirtualInvestmentView;
