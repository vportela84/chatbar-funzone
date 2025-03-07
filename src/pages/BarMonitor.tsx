
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, LogOut, LayoutDashboard, Users, RefreshCcw, Menu, ChevronDown, ChevronUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import AdminDashboard from '@/components/AdminDashboard';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isBaresExpanded, setIsBaresExpanded] = useState(true);
  const [isDashboardExpanded, setIsDashboardExpanded] = useState(true);
  const { toast } = useToast();
  const { logout } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadBars();
    console.log("Página BarMonitor carregada");
  }, []);

  const loadBars = async () => {
    try {
      setIsRefreshing(true);
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
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleShowQRCode = (qrCode: string) => {
    setSelectedQRCode(qrCode);
    setShowQRCode(true);
  };

  const handleLogout = () => {
    logout();
    navigate('/admin-login');
  };

  const goToAdmin = () => {
    navigate('/admin');
  };

  const toggleBaresSection = () => {
    setIsBaresExpanded(!isBaresExpanded);
  };

  const toggleDashboardSection = () => {
    setIsDashboardExpanded(!isDashboardExpanded);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-bar-bg via-black/90 to-black text-bar-text p-2 md:p-6">
      <div className="max-w-6xl mx-auto space-y-4 md:space-y-6">
        <header className="bg-black/30 backdrop-blur-md rounded-xl p-3 md:p-6 shadow-lg border border-primary/10 animate-fadeIn">
          <div className="flex flex-col md:flex-row justify-between items-center mb-2 md:mb-4">
            <div className="mb-3 md:mb-0 text-center md:text-left">
              <h1 className="text-2xl md:text-4xl font-bold text-primary">Bar Match</h1>
              <p className="text-sm md:text-xl text-bar-text/80">Monitoramento de Bares</p>
            </div>
            
            {/* Menu para dispositivos móveis */}
            <div className="flex md:hidden w-full justify-center mt-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full md:w-auto bg-primary text-black hover:bg-primary/80">
                    <Menu className="mr-2 h-4 w-4" /> Menu
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-black/90 border-primary/20">
                  <DropdownMenuLabel className="text-primary">Ações</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-primary/20" />
                  <DropdownMenuItem 
                    className="text-primary hover:bg-primary/10 cursor-pointer"
                    onClick={loadBars}
                  >
                    <RefreshCcw className="mr-2 h-4 w-4" /> Atualizar
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-primary hover:bg-primary/10 cursor-pointer"
                    onClick={goToAdmin}
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4" /> Cadastrar Bar
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-primary hover:bg-primary/10 cursor-pointer"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" /> Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Botões para desktop */}
            <div className="hidden md:flex flex-wrap gap-2 justify-center md:justify-end">
              <Button 
                onClick={loadBars} 
                variant="outline" 
                className="bg-primary text-black hover:bg-primary/80 transition-all"
                disabled={isRefreshing}
              >
                <RefreshCcw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} /> 
                {isRefreshing ? 'Atualizando...' : 'Atualizar'}
              </Button>
              <Button 
                onClick={goToAdmin} 
                variant="outline" 
                className="bg-primary text-black hover:bg-primary/80 transition-all"
              >
                <LayoutDashboard className="mr-2 h-4 w-4" /> Cadastrar Bar
              </Button>
              <Button 
                onClick={handleLogout} 
                variant="outline" 
                className="bg-primary text-black hover:bg-primary/80 transition-all"
              >
                <LogOut className="mr-2 h-4 w-4" /> Sair
              </Button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-4 md:gap-6">
          {/* Lista de Bares Cadastrados com toggle */}
          <Card className="bg-bar-bg/50 backdrop-blur-sm border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="bg-black/20 rounded-t-lg p-3 md:p-6">
              <div className="flex justify-between items-center cursor-pointer" onClick={toggleBaresSection}>
                <CardTitle className="text-primary flex items-center text-lg md:text-2xl">
                  <Users className="mr-2 h-5 w-5" /> Bares Cadastrados
                </CardTitle>
                <div className="flex items-center">
                  <Badge variant="outline" className="bg-primary text-black mr-2">
                    {bars.length} {bars.length === 1 ? 'bar' : 'bares'}
                  </Badge>
                  {isBaresExpanded ? (
                    <ChevronUp className="h-5 w-5 text-primary" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-primary" />
                  )}
                </div>
              </div>
            </CardHeader>
            
            {isBaresExpanded && (
              <CardContent className="p-3 md:p-6">
                <div className="space-y-4">
                  {bars.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-4 md:py-8">
                      <p className="text-center text-primary/70 mb-4">Nenhum bar cadastrado ainda.</p>
                      <Button 
                        onClick={goToAdmin} 
                        variant="default" 
                        className="bg-primary text-black hover:bg-primary/80"
                      >
                        <LayoutDashboard className="mr-2 h-4 w-4" /> Cadastrar Seu Primeiro Bar
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                      {bars.map((bar) => (
                        <Card key={bar.id} className="bg-black/40 border-primary/10 backdrop-blur-sm hover:bg-black/50 transition-all duration-300">
                          <CardContent className="p-3 md:p-4">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4">
                              <div className="flex-shrink-0">
                                {bar.logo_url ? (
                                  <div className="w-12 h-12 md:w-16 md:h-16 overflow-hidden rounded-lg border border-primary/20">
                                    <img 
                                      src={bar.logo_url} 
                                      alt={`Logo ${bar.name}`} 
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                ) : (
                                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                                    {bar.name.charAt(0).toUpperCase()}
                                  </div>
                                )}
                              </div>
                              <div className="flex-grow">
                                <h3 className="font-medium text-base md:text-lg text-primary">{bar.name}</h3>
                                <p className="text-xs md:text-sm text-primary/70">
                                  {bar.address}
                                  {bar.city && `, ${bar.city}`}
                                </p>
                                {bar.phone && <p className="text-xs text-primary/60">{bar.phone}</p>}
                              </div>
                              {bar.qr_code && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleShowQRCode(bar.qr_code!)}
                                  className="flex items-center gap-2 bg-primary text-black hover:bg-primary/80 transition-all self-start sm:self-center mt-2 sm:mt-0"
                                >
                                  <QrCode className="w-4 h-4" />
                                  QR Code
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>

          {/* Seção do painel de admin com toggle */}
          <Card className="bg-bar-bg/50 backdrop-blur-sm border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader 
              className="bg-black/20 rounded-t-lg p-3 md:p-6 cursor-pointer" 
              onClick={toggleDashboardSection}
            >
              <div className="flex justify-between items-center">
                <CardTitle className="text-primary flex items-center text-lg md:text-2xl">
                  <Users className="mr-2 h-5 w-5" /> Dashboard de Usuários
                </CardTitle>
                {isDashboardExpanded ? (
                  <ChevronUp className="h-5 w-5 text-primary" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-primary" />
                )}
              </div>
            </CardHeader>
            
            {isDashboardExpanded && (
              <CardContent className="p-0">
                <AdminDashboard />
              </CardContent>
            )}
          </Card>
        </div>

        <Dialog open={showQRCode} onOpenChange={setShowQRCode}>
          <DialogContent className="bg-bar-bg border-primary/20 max-w-[90vw] md:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-primary">QR Code do Bar</DialogTitle>
              <DialogDescription className="text-primary/70">
                Compartilhe este QR Code com seus clientes
              </DialogDescription>
            </DialogHeader>
            <div className="p-4 md:p-6 bg-white rounded-lg">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(selectedQRCode)}`}
                alt="QR Code"
                className="mx-auto max-w-full h-auto"
              />
            </div>
            <p className="text-center text-xs md:text-sm text-primary mt-2 break-all px-2">
              {selectedQRCode}
            </p>
            <div className="flex justify-center mt-4">
              <Button 
                onClick={() => {
                  // Copy to clipboard
                  navigator.clipboard.writeText(selectedQRCode);
                  toast({
                    title: "Copiado!",
                    description: "Link copiado para a área de transferência",
                  });
                }}
                variant="outline"
                className="bg-primary text-black hover:bg-primary/80"
              >
                Copiar Link
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default BarMonitor;
