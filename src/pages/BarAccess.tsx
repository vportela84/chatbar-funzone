
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { QrCode, LogIn } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import QrCodeScanner from '@/components/QrCodeScanner';
import { supabase } from '@/integrations/supabase/client';

const BarAccess = () => {
  const [barId, setBarId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isQrDialogOpen, setIsQrDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barId.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, insira o ID do bar",
        variant: "destructive"
      });
      return;
    }

    navigateToBar(barId);
  };

  const navigateToBar = async (id: string) => {
    setIsLoading(true);
    
    try {
      // Verificar se o bar existe
      const { data, error } = await supabase
        .from('bars')
        .select('id, name')
        .eq('id', id)
        .single();
      
      if (error || !data) {
        toast({
          title: "Bar não encontrado",
          description: "Verifique o ID do bar e tente novamente",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      // Bar encontrado, navegar para a página
      setTimeout(() => {
        setIsLoading(false);
        navigate(`/bar/${id}`);
      }, 500);
      
    } catch (error) {
      console.error('Erro ao verificar bar:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao verificar o bar",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  const handleScanQRCode = () => {
    setIsQrDialogOpen(true);
  };

  const handleQrCodeScanned = (scannedBarId: string) => {
    setIsQrDialogOpen(false);
    setBarId(scannedBarId);
    navigateToBar(scannedBarId);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-bar-bg to-black text-bar-text p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-primary mb-2">Bar Match</h1>
        <p className="text-xl text-primary/80">Acesse um bar para começar</p>
      </div>

      <Card className="w-full max-w-md bg-bar-bg border-primary/20">
        <CardHeader>
          <CardTitle className="text-primary text-center">Acesso ao Bar</CardTitle>
          <CardDescription className="text-primary/70 text-center">
            Escaneie o QR code ou digite o ID do bar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <Button 
              onClick={handleScanQRCode} 
              className="w-full flex items-center justify-center gap-2"
              variant="outline"
            >
              <QrCode className="w-5 h-5" />
              Escanear QR Code
            </Button>

            <div className="relative flex items-center">
              <div className="flex-grow border-t border-primary/20"></div>
              <span className="mx-4 text-primary/60 text-sm">ou</span>
              <div className="flex-grow border-t border-primary/20"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                id="barId"
                value={barId}
                onChange={(e) => setBarId(e.target.value)}
                className="bg-black/20 border-primary/20 text-primary placeholder:text-primary/40"
                placeholder="Digite o ID do bar"
              />
              
              <Button 
                type="submit" 
                className="w-full flex items-center justify-center gap-2" 
                disabled={isLoading}
              >
                <LogIn className="w-5 h-5" />
                {isLoading ? "Acessando..." : "Acessar Bar"}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>

      <Button 
        variant="link" 
        onClick={() => navigate('/')}
        className="mt-6"
      >
        Voltar para página inicial
      </Button>

      <Dialog open={isQrDialogOpen} onOpenChange={setIsQrDialogOpen}>
        <DialogContent className="bg-bar-bg border-primary/20 text-primary">
          <DialogHeader>
            <DialogTitle className="text-primary text-center">Escanear QR Code</DialogTitle>
          </DialogHeader>
          <QrCodeScanner 
            onScanSuccess={handleQrCodeScanned} 
            onClose={() => setIsQrDialogOpen(false)} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BarAccess;
