
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from '@/contexts/AdminAuthContext';

// Importando os componentes refatorados
import Header from '@/components/bar-monitor/Header';
import BarsList from '@/components/bar-monitor/BarsList';
import DashboardSection from '@/components/bar-monitor/DashboardSection';
import QRCodeDialog from '@/components/bar-monitor/QRCodeDialog';

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
        <Header 
          isRefreshing={isRefreshing}
          onRefresh={loadBars}
          onNavigateToAdmin={goToAdmin}
          onLogout={handleLogout}
        />

        <div className="grid grid-cols-1 gap-4 md:gap-6">
          <BarsList 
            bars={bars}
            isExpanded={isBaresExpanded}
            onToggle={toggleBaresSection}
            onShowQRCode={handleShowQRCode}
            goToAdmin={goToAdmin}
          />

          <DashboardSection 
            isExpanded={isDashboardExpanded}
            onToggle={toggleDashboardSection}
          />
        </div>

        <QRCodeDialog 
          isOpen={showQRCode}
          onOpenChange={setShowQRCode}
          qrCodeUrl={selectedQRCode}
        />
      </div>
    </div>
  );
};

export default BarMonitor;
