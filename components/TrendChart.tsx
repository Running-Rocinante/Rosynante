import React from 'react';

interface TrendChartProps {
  data: number[];
}

const TrendChart: React.FC<TrendChartProps> = ({ data }) => {
  if (!data || data.length < 2) {
    return null;
  }

  const width = 100;
  const height = 30;
  const maxVal = Math.max(...data);
  const minVal = Math.min(...data);
  const range = maxVal - minVal;

  // Avoid division by zero if all data points are the same
  const normalizedData = range === 0 
    ? data.map(() => height / 2)
    : data.map(d => height - ((d - minVal) / range) * (height - 4) + 2); // +2, -4 for padding

  const points = normalizedData
    .map((point, i) => {
      const x = (i / (data.length - 1)) * width;
      return `${x},${point}`;
    })
    .join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-12 mt-3" preserveAspectRatio="none">
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
        className="text-cyan-400"
      />
    </svg>
  );
};

export default TrendChart;
