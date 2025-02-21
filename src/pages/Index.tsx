import React, { useState, useEffect } from 'react';
import QRScanner from '@/components/QRScanner';
import ProfileSetup from '@/components/ProfileSetup';
import ChatRoom from '@/components/ChatRoom';
import Dashboard from '@/components/Dashboard';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";

type Profile = {
  name: string;
  phone: string;
  tableId: string;
  photo?: string;
  interest: string;
};

type AppState = 'SCAN' | 'PROFILE' | 'DASHBOARD' | 'CHAT';

const Index = () => {
  const [state, setState] = useState<AppState>('SCAN');
  const [tableId, setTableId] = useState<string | null>(null);
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const loadProfiles = async () => {
      try {
        const { data, error } = await supabase
          .from('bar_profiles')
          .select('*');

        if (error) throw error;

        if (data) {
          const formattedProfiles: Profile[] = data.map(profile => ({
            name: profile.name,
            phone: profile.phone || '',
            tableId: profile.table_id,
            photo: profile.photo,
            interest: profile.interest
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

    loadProfiles();
  }, [toast]);

  const handleScan = async (scannedTableId: string) => {
    const { data: existingProfile } = await supabase
      .from('bar_profiles')
      .select('*')
      .eq('table_id', scannedTableId)
      .single();

    if (existingProfile) {
      const profile: Profile = {
        name: existingProfile.name,
        phone: existingProfile.phone || '',
        tableId: existingProfile.table_id,
        photo: existingProfile.photo,
        interest: existingProfile.interest
      };
      setCurrentProfile(profile);
      setState('DASHBOARD');
      toast({
        title: "Perfil encontrado",
        description: "Bem-vindo de volta!",
      });
    } else {
      setTableId(scannedTableId);
      setState('PROFILE');
    }
  };

  const handleProfileComplete = async (profileData: { name: string; phone: string; photo?: string; interest: string }) => {
    if (!tableId) {
      toast({
        title: "Erro ao salvar perfil",
        description: "Mesa não identificada. Por favor, escaneie o QR code novamente.",
        variant: "destructive"
      });
      return;
    }

    const newProfile = {
      name: profileData.name,
      phone: profileData.phone || '',
      photo: profileData.photo,
      interest: profileData.interest,
      tableId: tableId,
    };
    
    try {
      console.log('Tentando salvar/atualizar perfil:', {
        name: newProfile.name,
        phone: newProfile.phone,
        table_id: newProfile.tableId,
        photo: newProfile.photo,
        interest: newProfile.interest
      });

      const { data, error } = await supabase
        .from('bar_profiles')
        .upsert({
          name: newProfile.name,
          phone: newProfile.phone,
          table_id: newProfile.tableId,
          photo: newProfile.photo,
          interest: newProfile.interest
        })
        .select()
        .single();

      if (error) throw error;

      console.log('Perfil salvo com sucesso:', data);
      
      setProfiles(prevProfiles => {
        const filteredProfiles = prevProfiles.filter(p => p.tableId !== newProfile.tableId);
        return [...filteredProfiles, newProfile];
      });
      
      setCurrentProfile(newProfile);
      setState('DASHBOARD');
      
      toast({
        title: "Perfil criado!",
        description: "Você já pode interagir com outras pessoas no bar.",
      });
    } catch (error: any) {
      console.error('Erro ao salvar perfil:', error);
      toast({
        title: "Erro ao salvar perfil",
        description: error.message || "Não foi possível salvar seu perfil. Tente novamente.",
        variant: "destructive"
      });
    }
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
    return profiles.filter(p => p.tableId !== currentProfile.tableId);
  };

  console.log('Estado atual:', {
    state,
    currentProfile,
    profiles: profiles.map(p => ({ 
      name: p.name, 
      tableId: p.tableId, 
      interest: p.interest 
    })),
    tableId,
    filteredProfiles: getOtherProfiles().map(p => ({ 
      name: p.name, 
      tableId: p.tableId, 
      interest: p.interest 
    }))
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
