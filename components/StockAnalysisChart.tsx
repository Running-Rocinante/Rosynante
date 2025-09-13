import React from 'react';
import type { TechnicalAnalysis } from '../types';

interface StockAnalysisChartProps {
  analysis: TechnicalAnalysis;
}

const StockAnalysisChart: React.FC<StockAnalysisChartProps> = ({ analysis }) => {
  const { chartData, entryPrice, targetPrice, stopLossPrice, keywords } = analysis;

  if (!chartData || chartData.length === 0) {
    return <div className="text-center text-gray-500">차트 데이터를 불러올 수 없습니다.</div>;
  }

  const parsePrice = (priceStr: string) => parseFloat(priceStr.replace(/[^0-9.]/g, ''));
  
  const numericEntry = parsePrice(entryPrice);
  const numericTarget = parsePrice(targetPrice);
  const numericStopLoss = parsePrice(stopLossPrice);

  const allValues = chartData.flatMap(d => [d.high, d.low]).concat([numericTarget, numericStopLoss]);
  const maxPrice = Math.max(...allValues);
  const minPrice = Math.min(...allValues);
  const priceRange = maxPrice - minPrice;

  const width = 500;
  const height = 250;
  const padding = { top: 20, right: 60, bottom: 30, left: 10 };
  
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const barWidth = chartWidth / (chartData.length * 1.5);

  const getX = (index: number) => padding.left + index * (chartWidth / (chartData.length - 1));
  const getY = (price: number) => padding.top + chartHeight - ((price - minPrice) / priceRange) * chartHeight;

  const keywordPositions = [
    { index: 2, yOffset: -10 },
    { index: 5, yOffset: 20 },
    { index: 8, yOffset: -15 },
    { index: 10, yOffset: 10 },
  ];

  return (
    <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
      <h3 className="text-lg font-semibold text-gray-200 mb-4">AI 분석 차트 (3개월 주간)</h3>
      <div className="relative">
        <svg width="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
          {/* Y-axis grid lines and labels */}
          {[...Array(5)].map((_, i) => {
            const price = minPrice + (priceRange / 4) * i;
            const y = getY(price);
            return (
              <g key={i}>
                <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#4A5568" strokeWidth="0.5" strokeDasharray="2 2" />
                <text x={width - padding.right + 5} y={y + 3} fill="#A0AEC0" fontSize="10">{price.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}</text>
              </g>
            );
          })}

          {/* Price lines */}
          {[
            { price: numericTarget, label: `목표가: ${targetPrice}`, color: '#48BB78' },
            { price: numericEntry, label: `진입가: ${entryPrice}`, color: '#4299E1' },
            { price: numericStopLoss, label: `손절가: ${stopLossPrice}`, color: '#F56565' },
          ].map(({ price, label, color }) => (
            <g key={label}>
              <line x1={padding.left} y1={getY(price)} x2={width - padding.right} y2={getY(price)} stroke={color} strokeWidth="1" strokeDasharray="4 2" />
              <text x={padding.left + 5} y={getY(price) - 4} fill={color} fontSize="10" fontWeight="bold">{label}</text>
            </g>
          ))}

          {/* Candlesticks */}
          {chartData.map((d, i) => {
            const x = getX(i);
            const yOpen = getY(d.open);
            const yClose = getY(d.close);
            const isBullish = d.close >= d.open;
            return (
              <g key={i}>
                <line x1={x} y1={getY(d.high)} x2={x} y2={getY(d.low)} stroke={isBullish ? '#48BB78' : '#F56565'} strokeWidth="1" />
                <rect
                  x={x - barWidth / 2}
                  y={isBullish ? yClose : yOpen}
                  width={barWidth}
                  height={Math.abs(yOpen - yClose)}
                  fill={isBullish ? '#48BB78' : '#F56565'}
                />
              </g>
            );
          })}
          
          {/* X-axis labels */}
          {chartData.map((d, i) => {
            if (i === 0 || i === Math.floor(chartData.length / 2) || i === chartData.length - 1) {
              return (
                <text key={i} x={getX(i)} y={height - 5} fill="#A0AEC0" fontSize="10" textAnchor="middle">{d.date.substring(5)}</text>
              );
            }
            return null;
          })}
        </svg>

        {/* Keywords */}
        {keywords.slice(0, 4).map((keyword, index) => {
           const pos = keywordPositions[index];
           if (!pos || chartData.length <= pos.index) return null;
           const candle = chartData[pos.index];
           const x = (getX(pos.index) / width) * 100;
           const yPrice = (candle.high + candle.low) / 2;
           const y = (getY(yPrice) / height) * 100 + pos.yOffset/height*100;

           return (
            <div
                key={index}
                className="absolute p-1.5 text-xs text-center text-cyan-200 bg-gray-900/80 rounded-md border border-gray-600 shadow-lg transform -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${x}%`, top: `${y}%` }}
            >
                {keyword}
            </div>
           )
        })}
      </div>
    </div>
  );
};

export default StockAnalysisChart;