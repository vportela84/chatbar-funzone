
import { useState, useEffect } from 'react';
import { BarInfo, UserProfile } from '@/types/bar';

export const useBarSession = (barId?: string, tableId?: string) => {
  const [barInfo, setBarInfo] = useState<BarInfo | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Initialize bar info and user profile from session storage
  useEffect(() => {
    // Retrieve bar info from sessionStorage
    const storedBarInfo = sessionStorage.getItem('currentBar');
    if (storedBarInfo) {
      setBarInfo(JSON.parse(storedBarInfo));
    } else {
      // If no stored info, use URL parameters
      setBarInfo({
        barId: barId || '',
        barName: 'Bar',
        tableNumber: tableId || ''
      });
    }
    
    // Check for existing user profile
    const storedProfile = sessionStorage.getItem('userProfile');
    if (storedProfile) {
      setUserProfile(JSON.parse(storedProfile));
      const storedUserId = sessionStorage.getItem('userId');
      if (storedUserId) {
        setUserId(storedUserId);
      }
    }
  }, [barId, tableId]);

  return {
    barInfo,
    userProfile,
    userId,
    setUserProfile
  };
};
