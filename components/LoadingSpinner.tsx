
import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
        <p className="text-cyan-300 font-medium">AI가 분석 중입니다...</p>
    </div>
  );
};

export default LoadingSpinner;
