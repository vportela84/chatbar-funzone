
import React from 'react';

interface TableChatLayoutProps {
  children: React.ReactNode;
  barName?: string;
  tableNumber?: string;
}

const TableChatLayout: React.FC<TableChatLayoutProps> = ({ 
  children, 
  barName, 
  tableNumber 
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-bar-bg to-black text-primary p-6">
      {barName && tableNumber && (
        <header className="py-4 border-b border-primary/20 mb-6">
          <div className="container mx-auto">
            <h1 className="text-2xl font-bold text-primary">{barName}</h1>
            <p className="text-sm text-primary opacity-70">Mesa {tableNumber}</p>
          </div>
        </header>
      )}
      
      <main className="flex-1 container mx-auto">
        {children}
      </main>
    </div>
  );
};

export default TableChatLayout;
