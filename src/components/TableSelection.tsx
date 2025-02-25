
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TableSelectionProps {
  barId: string;
  onTableSelect: (tableId: string) => void;
}

const TableSelection: React.FC<TableSelectionProps> = ({ barId, onTableSelect }) => {
  const [tableNumber, setTableNumber] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tableNumber.trim()) {
      onTableSelect(tableNumber);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-md bg-gradient-to-b from-gray-900/90 to-black/90 backdrop-blur-lg rounded-xl shadow-xl p-8 space-y-6 border border-primary/20">
        <h2 className="text-center text-2xl font-bold text-primary">
          Informe sua Mesa
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="tableNumber" className="text-bar-text text-sm">
              Número da Mesa
            </Label>
            <Input
              type="text"
              id="tableNumber"
              placeholder="Digite o número da sua mesa"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              className="mt-1 bg-black/50 border-primary/20 text-bar-text placeholder:text-gray-500"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Confirmar
          </Button>
        </form>
      </div>
    </div>
  );
};

export default TableSelection;
