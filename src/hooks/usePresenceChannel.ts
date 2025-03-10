
import { useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Bar } from '@/types/admin-dashboard';

export const usePresenceChannel = (bars: Bar[], setBars: React.Dispatch<React.SetStateAction<Bar[]>>) => {
  useEffect(() => {
    const presenceChannels = bars.map(bar => {
      const presenceChannel = supabase.channel(`presence:bar:${bar.id}`);
      
      presenceChannel
        .on('presence', { event: 'sync' }, () => {
          const presenceState = presenceChannel.presenceState();
          console.log(`Estado de presença para bar ${bar.id}:`, presenceState);
          
          // Atualizar estado online dos usuários
          setBars(currentBars => {
            return currentBars.map(currentBar => {
              if (currentBar.id !== bar.id) return currentBar;
              
              return {
                ...currentBar,
                profiles: currentBar.profiles.map(profile => ({
                  ...profile,
                  isOnline: Object.values(presenceState)
                    .flat()
                    .some((presence: any) => presence.userId === profile.barId)
                }))
              };
            });
          });
        })
        .subscribe();
      
      return presenceChannel;
    });

    // Cleanup function
    return () => {
      console.log('Limpando canais de presença');
      supabase.removeAllChannels();
    };
  }, [bars, setBars]);
};
