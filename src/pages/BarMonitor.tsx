
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";
import AdminDashboard from '@/components/AdminDashboard';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface Bar {
  id: string;
  name: string;
  address: string;
  city: string;
  qr_code?: string;
  logo_url?: string;
  phone?: string;
}

const BarMonitor = () => {
  const [bars, setBars] = useState<Bar[]>([]);
  const [showQRCode, setShowQRCode] = useState(false);
  const [selectedQRCode, setSelectedQRCode] = useState<string>('');
  const { toast } = useToast();

  React.useEffect(() => {
    loadBars();
    console.log("Página BarMonitor carregada");
  }, []);

  const loadBars = async () => {
    try {
      const { data, error } = await supabase
        .from('bars')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setBars(data);
    } catch (error) {
      console.error('Erro ao carregar bares:', error);
      toast({
        title: "Erro ao carregar bares",
        description: "Não foi possível carregar a lista de bares.",
        variant: "destructive"
      });
    }
  };

  const handleShowQRCode = (qrCode: string) => {
    setSelectedQRCode(qrCode);
    setShowQRCode(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-bar-bg to-black text-bar-text p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="text-center mb-10 animate-fadeIn">
          <h1 className="text-4xl font-bold text-primary mb-2">Bar Match</h1>
          <p className="text-2xl text-bar-text/80">Monitoramento de Bares</p>
        </header>

        <div className="grid grid-cols-1 gap-8">
          {/* Lista de Bares Cadastrados */}
          <Card className="bg-bar-bg border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary">Bares Cadastrados</CardTitle>
              <CardDescription className="text-primary/70">Lista de todos os bares cadastrados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bars.length === 0 ? (
                  <p className="text-center text-primary/70">Nenhum bar cadastrado ainda.</p>
                ) : (
                  bars.map((bar) => (
                    <Card key={bar.id} className="bg-black/20 border-primary/10">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex gap-4 items-center">
                            {bar.logo_url && (
                              <div className="w-12 h-12 overflow-hidden rounded-md">
                                <img 
                                  src={bar.logo_url} 
                                  alt={`Logo ${bar.name}`} 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div>
                              <h3 className="font-medium text-primary">{bar.name}</h3>
                              <p className="text-sm text-primary/70">
                                {bar.address}
                                {bar.city && `, ${bar.city}`}
                              </p>
                              {bar.phone && <p className="text-xs text-primary/60">{bar.phone}</p>}
                            </div>
                          </div>
                          {bar.qr_code && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleShowQRCode(bar.qr_code!)}
                              className="flex items-center gap-2"
                            >
                              <QrCode className="w-4 h-4" />
                              Ver QR Code
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <AdminDashboard />
        </div>

        <Dialog open={showQRCode} onOpenChange={setShowQRCode}>
          <DialogContent className="bg-bar-bg border-primary/20">
            <DialogHeader>
              <DialogTitle className="text-primary">QR Code do Bar</DialogTitle>
              <DialogDescription className="text-primary/70">
                Compartilhe este QR Code com seus clientes
              </DialogDescription>
            </DialogHeader>
            <div className="p-6 bg-white rounded-lg">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(selectedQRCode)}`}
                alt="QR Code"
                className="mx-auto"
              />
            </div>
            <p className="text-center text-sm text-primary mt-2">
              {selectedQRCode}
            </p>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default BarMonitor;
