
import React, { useState } from 'react';
import QRScanner from '@/components/QRScanner';
import ProfileSetup from '@/components/ProfileSetup';
import ChatRoom from '@/components/ChatRoom';
import Dashboard from '@/components/Dashboard';
import { useToast } from '@/hooks/use-toast';

type Profile = {
  name: string;
  phone: string;
  tableId: string;
  photo?: string;
};

type AppState = 'SCAN' | 'PROFILE' | 'DASHBOARD' | 'CHAT';

const Index = () => {
  const [state, setState] = useState<AppState>('SCAN');
  const [tableId, setTableId] = useState<string | null>(null);
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const { toast } = useToast();

  const handleScan = (scannedTableId: string) => {
    setTableId(scannedTableId);
    setState('PROFILE');
  };

  const handleProfileComplete = (profileData: { name: string; phone: string; photo?: string }) => {
    const newProfile = {
      ...profileData,
      tableId: tableId!,
    };
    
    console.log('Novo perfil criado:', newProfile);
    
    setCurrentProfile(newProfile);
    setProfiles(prevProfiles => {
      // Adiciona alguns perfis de teste junto com o novo perfil
      const updatedProfiles = [
        ...prevProfiles,
        newProfile,
        { name: "João", phone: "11999999999", tableId: "TABLE-456" },
        { name: "Maria", phone: "11988888888", tableId: "TABLE-789" },
      ];
      console.log('Perfis atualizados:', updatedProfiles);
      return updatedProfiles;
    });
    
    setState('DASHBOARD');
    toast({
      title: "Perfil criado!",
      description: "Você já pode interagir com outras pessoas no bar.",
    });
  };

  const handleSelectProfile = (profile: Profile) => {
    setSelectedProfile(profile);
    setState('CHAT');
  };

  const handleBackToDashboard = () => {
    setSelectedProfile(null);
    setState('DASHBOARD');
  };

  // Função auxiliar para filtrar perfis
  const getOtherProfiles = () => {
    if (!currentProfile) return [];
    return profiles.filter(p => p.tableId !== currentProfile.tableId);
  };

  console.log('Estado atual:', {
    state,
    currentProfile,
    profiles,
    tableId,
    filteredProfiles: getOtherProfiles()
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-bar-bg to-black text-bar-text p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="text-center mb-10 animate-fadeIn">
          <h1 className="text-4xl font-bold text-primary mb-2">Bar Match</h1>
          <p className="text-bar-text/80">Connect with people at the bar</p>
        </header>

        {state === 'SCAN' && (
          <QRScanner onScan={handleScan} />
        )}

        {state === 'PROFILE' && tableId && (
          <ProfileSetup onComplete={handleProfileComplete} tableId={tableId} />
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
