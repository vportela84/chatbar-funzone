
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { QrCode, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [barId, setBarId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleJoinBar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barId.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, insira o ID do bar",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    // Simulação de validação do ID do bar
    setTimeout(() => {
      setIsLoading(false);
      
      // Agora navegamos para a página de mesa usando o ID do bar
      navigate(`/bar/${barId}`);
    }, 1500);
  };

  const handleScanQrCode = () => {
    // Aqui você implementaria a lógica para abrir o scanner de QR code
    // Para esta demonstração, estamos apenas exibindo um toast
    toast({
      title: "Scanner de QR Code",
      description: "Funcionalidade de scanner de QR code será implementada em breve.",
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-bar-bg to-black text-bar-text p-6">
      <main className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4">Bar Match</h1>
          <p className="text-xl text-primary">A plataforma de socialização para bares e restaurantes</p>
        </div>

        <Card className="bg-bar-bg border-primary/20">
          <CardHeader>
            <CardTitle className="text-primary text-center">Entrar em um Bar</CardTitle>
            <CardDescription className="text-primary text-center">
              Escaneie o QR code ou digite o ID do bar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center gap-2 border-primary/30 hover:bg-primary/10"
                onClick={handleScanQrCode}
              >
                <QrCode className="w-5 h-5" />
                Escanear QR Code
              </Button>
              
              <div className="relative flex items-center">
                <div className="grow h-px bg-primary/20"></div>
                <span className="mx-3 text-sm text-primary">ou</span>
                <div className="grow h-px bg-primary/20"></div>
              </div>
              
              <form onSubmit={handleJoinBar} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    id="barId"
                    value={barId}
                    onChange={(e) => setBarId(e.target.value)}
                    className="bg-black/20 border-primary/20 text-primary placeholder:text-primary/40"
                    placeholder="Digite o ID do bar"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? "Carregando..." : (
                    <>
                      Entrar <ArrowRight className="ml-2 w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Index;
