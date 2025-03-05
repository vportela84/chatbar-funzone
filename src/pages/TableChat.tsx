
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const TableChat = () => {
  const { barId, tableId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [barInfo, setBarInfo] = useState<{barId: string, barName: string, tableNumber: string} | null>(null);
  
  useEffect(() => {
    // Retrieve the bar information from sessionStorage
    const storedBarInfo = sessionStorage.getItem('currentBar');
    if (storedBarInfo) {
      setBarInfo(JSON.parse(storedBarInfo));
    } else {
      // If no stored info, use the URL params
      setBarInfo({
        barId: barId || '',
        barName: 'Bar',
        tableNumber: tableId || ''
      });
    }
  }, [barId, tableId]);

  const handleLeaveTable = () => {
    toast({
      title: "Mesa desconectada",
      description: "Você saiu da mesa",
    });
    navigate('/');
  };

  if (!barInfo) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-bar-bg to-black text-primary p-6">
        Carregando...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-bar-bg to-black text-primary p-6">
      <header className="py-4 border-b border-primary/20 mb-6">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">{barInfo.barName}</h1>
          <p className="text-sm opacity-70">Mesa {barInfo.tableNumber}</p>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto">
        <Card className="bg-bar-bg border-primary/20 mb-6">
          <CardHeader>
            <CardTitle className="text-primary">Bem-vindo à Mesa {barInfo.tableNumber}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">A funcionalidade de chat será implementada em breve.</p>
            <p className="text-sm opacity-70">Neste espaço você poderá interagir com outras pessoas na mesma mesa.</p>
          </CardContent>
        </Card>
        
        <div className="text-center">
          <Button
            onClick={handleLeaveTable}
            variant="outline"
          >
            Sair da Mesa
          </Button>
        </div>
      </main>
    </div>
  );
};

export default TableChat;
