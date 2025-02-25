
import React, { useState, useEffect } from 'react';
import QRScanner from '@/components/QRScanner';
import ProfileSetup from '@/components/ProfileSetup';
import ChatRoom from '@/components/ChatRoom';
import Dashboard from '@/components/Dashboard';
import TableSelection from '@/components/TableSelection';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";

type Profile = {
  name: string;
  phone: string;
  tableId: string;
  photo?: string;
  interest: string;
  barId?: string;
};

type AppState = 'SCAN' | 'TABLE' | 'PROFILE' | 'DASHBOARD' | 'CHAT';

const Index = () => {
  const [state, setState] = useState<AppState>('SCAN');
  const [tableId, setTableId] = useState<string>('');
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [barId, setBarId] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    if (barId) {
      loadProfiles();
    }
  }, [barId]);

  const loadProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('bar_profiles')
        .select('*')
        .eq('bar_id', barId);

      if (error) throw error;

      if (data) {
        const formattedProfiles: Profile[] = data.map(profile => ({
          name: profile.name,
          phone: profile.phone || '',
          tableId: profile.table_id,
          photo: profile.photo,
          interest: profile.interest,
          barId: profile.bar_id
        }));
        setProfiles(formattedProfiles);
      }
    } catch (error) {
      console.error('Erro ao carregar perfis:', error);
      toast({
        title: "Erro ao carregar perfis",
        description: "Não foi possível carregar os perfis existentes.",
        variant: "destructive"
      });
    }
  };

  const handleQrScan = (scannedTableId: string, scannedBarId: string) => {
    setBarId(scannedBarId);
    setState('TABLE'); // Muda para a seleção de mesa após escanear o QR ou inserir ID
  };

  const handleTableSelect = (selectedTableId: string) => {
    setTableId(selectedTableId);
    setState('PROFILE');
  };

  const handleSelectProfile = (profile: Profile) => {
    setSelectedProfile(profile);
    setState('CHAT');
  };

  const handleBackToDashboard = () => {
    setSelectedProfile(null);
    setState('DASHBOARD');
  };

  const getOtherProfiles = () => {
    if (!currentProfile) return [];
    return profiles.filter(p => p.tableId !== currentProfile.tableId && p.barId === currentProfile.barId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-bar-bg to-black text-bar-text p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="text-center mb-10 animate-fadeIn">
          <h1 className="text-4xl font-bold text-primary mb-2">Bar Match</h1>
          <p className="text-bar-text/80">Connect with people at the bar</p>
        </header>

        {state === 'SCAN' && (
          <div className="flex flex-col items-center justify-center">
            <QRScanner onScan={handleQrScan} />
          </div>
        )}

        {state === 'TABLE' && (
          <TableSelection 
            barId={barId}
            onTableSelect={handleTableSelect}
          />
        )}

        {state === 'PROFILE' && (
          <ProfileSetup 
            tableId={tableId}
            barId={barId}
            onProfileCreated={() => setState('DASHBOARD')}
          />
        )}

        {state === 'DASHBOARD' && currentProfile && (
          <>
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-bar-text mb-2">Pessoas no Bar</h2>
              <p className="text-bar-text/80">Clique em um perfil para iniciar uma conversa</p>
            </div>
            <Dashboard 
              profiles={getOtherProfiles()}
              onSelectProfile={handleSelectProfile} 
            />
          </>
        )}

        {state === 'CHAT' && currentProfile && selectedProfile && (
          <div>
            <button 
              onClick={handleBackToDashboard}
              className="mb-4 text-primary hover:text-primary/80 transition-colors"
            >
              ← Voltar para o Dashboard
            </button>
            <ChatRoom 
              tableId={currentProfile.tableId} 
              profile={currentProfile}
              targetProfile={selectedProfile}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
