
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="p-4 bg-gray-900/80 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-10">
      <h1 className="text-xl md:text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
        마라톤 투자자 로시난테의 AI투자
      </h1>
    </header>
  );
};

export default Header;