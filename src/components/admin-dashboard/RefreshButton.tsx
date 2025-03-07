
import React from 'react';
import { Button } from "@/components/ui/button";
import { RefreshCcw } from 'lucide-react';

interface RefreshButtonProps {
  isLoading: boolean;
  onClick: () => void;
}

const RefreshButton = ({ isLoading, onClick }: RefreshButtonProps) => {
  return (
    <Button 
      onClick={onClick} 
      variant="outline" 
      size="sm"
      className="ml-auto bg-primary text-black hover:bg-primary/80"
      disabled={isLoading}
    >
      <RefreshCcw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> 
      {isLoading ? 'Atualizando...' : 'Atualizar'}
    </Button>
  );
};

export default RefreshButton;
