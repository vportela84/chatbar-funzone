
import React from 'react';

interface BarHeaderProps {
  barName: string;
  tableNumber: string;
}

const BarHeader: React.FC<BarHeaderProps> = ({ barName, tableNumber }) => {
  return (
    <header className="py-4 border-b border-primary/20 mb-6">
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold text-primary">{barName}</h1>
        <p className="text-sm text-primary opacity-70">Mesa {tableNumber}</p>
      </div>
    </header>
  );
};

export default BarHeader;
