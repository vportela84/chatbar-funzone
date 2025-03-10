
import { useEffect } from 'react';
import { translateInterest } from '@/utils/interestTranslator';
import { useProfileStateUpdates } from '@/hooks/useProfileStateUpdates';
import { useBarProfilesLoader } from '@/hooks/useBarProfilesLoader';
import { useRealtimeDatabaseUpdates } from '@/hooks/useRealtimeDatabaseUpdates';
import { usePresenceChannel } from '@/hooks/usePresenceChannel';

export const useProfileData = () => {
  const {
    bars,
    setBars,
    updateBarsWithNewProfile,
    updateBarsWithRemovedProfile
  } = useProfileStateUpdates();
  
  const { isLoading, loadBarsAndProfiles } = useBarProfilesLoader(setBars);
  
  // Set up realtime database updates
  useRealtimeDatabaseUpdates(updateBarsWithNewProfile, updateBarsWithRemovedProfile);
  
  // Set up presence channels for online/offline status
  usePresenceChannel(bars, setBars);
  
  // Load initial data
  useEffect(() => {
    console.log('Inicializando hook useProfileData');
    loadBarsAndProfiles();
  }, []);

  return {
    bars,
    isLoading,
    loadBarsAndProfiles,
    translateInterest
  };
};

// Re-export types for convenience
export type { Profile, Bar } from '@/types/admin-dashboard';
