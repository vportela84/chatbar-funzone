
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const JoinBar = () => {
  const { barId } = useParams();
  const [tableNumber, setTableNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [barName, setBarName] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Here you would fetch the bar details using the barId from your database
    // For now we'll simulate with a timeout
    setTimeout(() => {
      setBarName(`Bar #${barId}`);
    }, 500);
  }, [barId]);

  const handleJoinTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableNumber.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, insira o número da mesa",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate joining a table
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Mesa conectada!",
        description: `Você entrou na mesa ${tableNumber} do ${barName}`,
      });
      // In a real app, you'd redirect to the chat or main experience
      // navigate(`/bar/${barId}/table/${tableNumber}`);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-bar-bg to-black text-bar-text p-6">
      <main className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4">Bar Match</h1>
          <p className="text-xl text-primary">{barName || 'Carregando...'}</p>
        </div>

        <Card className="bg-bar-bg border-primary/20">
          <CardHeader>
            <CardTitle className="text-primary text-center">Digite sua Mesa</CardTitle>
            <CardDescription className="text-primary/70 text-center">
              Informe o número da sua mesa para começar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleJoinTable} className="space-y-4">
              <div className="space-y-2">
                <Input
                  id="tableNumber"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="bg-black/20 border-primary/20 text-primary placeholder:text-primary/40"
                  placeholder="Número da mesa"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? "Conectando..." : "Entrar na Mesa"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default JoinBar;
