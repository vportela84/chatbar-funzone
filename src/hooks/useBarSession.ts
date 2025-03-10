
import { useState, useEffect } from 'react';
import { BarInfo, UserProfile } from '@/types/bar';
import { useToast } from '@/hooks/use-toast';

export const useBarSession = (barId?: string, tableId?: string) => {
  const [barInfo, setBarInfo] = useState<BarInfo | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();

  // Initialize bar info and user profile from session storage
  useEffect(() => {
    try {
      console.log('Inicializando useBarSession com barId:', barId, 'tableId:', tableId);
      // Retrieve bar info from sessionStorage
      const storedBarInfo = sessionStorage.getItem('currentBar');
      if (storedBarInfo) {
        const parsedBarInfo = JSON.parse(storedBarInfo);
        console.log('Informações de bar recuperadas do sessionStorage:', parsedBarInfo);
        setBarInfo(parsedBarInfo);
      } else if (barId && tableId) {
        // If no stored info, use URL parameters
        const newBarInfo = {
          barId: barId,
          barName: 'Bar',
          tableNumber: tableId
        };
        console.log('Informações de bar criadas a partir da URL:', newBarInfo);
        
        // Armazenar as informações no sessionStorage
        sessionStorage.setItem('currentBar', JSON.stringify(newBarInfo));
        setBarInfo(newBarInfo);
      } else {
        console.warn('Sem informações de bar válidas disponíveis');
      }
      
      // Check for existing user profile
      const storedProfile = sessionStorage.getItem('userProfile');
      if (storedProfile) {
        const parsedProfile = JSON.parse(storedProfile);
        console.log('Perfil de usuário recuperado do sessionStorage:', parsedProfile);
        setUserProfile(parsedProfile);
        
        const storedUserId = sessionStorage.getItem('userId');
        if (storedUserId) {
          console.log('ID de usuário recuperado:', storedUserId);
          setUserId(storedUserId);
        } else {
          console.warn('Perfil encontrado mas sem ID de usuário');
        }
      } else {
        console.log('Nenhum perfil de usuário armazenado encontrado');
      }
    } catch (error) {
      console.error('Erro ao inicializar a sessão do bar:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao carregar as informações da sessão",
        variant: "destructive"
      });
    }
  }, [barId, tableId, toast]);

  return {
    barInfo,
    userProfile,
    userId,
    setUserProfile
  };
};
