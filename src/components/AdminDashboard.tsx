
import React from 'react';
import BarCard from './admin-dashboard/BarCard';
import EmptyBarsCard from './admin-dashboard/EmptyBarsCard';
import RefreshButton from './admin-dashboard/RefreshButton';
import { useProfileData } from './admin-dashboard/useProfileData';

const AdminDashboard = () => {
  const { bars, isLoading, loadBarsAndProfiles, translateInterest } = useProfileData();

  return (
    <div className="space-y-4 md:space-y-6 p-3 md:p-6">
      <div className="flex justify-between items-center mb-2 md:mb-4">
        <RefreshButton 
          isLoading={isLoading} 
          onClick={loadBarsAndProfiles} 
        />
      </div>
      
      {bars.length === 0 ? (
        <EmptyBarsCard />
      ) : (
        bars.map(bar => (
          <BarCard 
            key={bar.id} 
            name={bar.name} 
            profiles={bar.profiles} 
            translateInterest={translateInterest} 
          />
        ))
      )}
    </div>
  );
};

export default AdminDashboard;
