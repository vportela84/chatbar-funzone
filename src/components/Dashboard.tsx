
import React from 'react';
import UserCard from './UserCard';

interface Profile {
  name: string;
  phone: string;
  tableId: string;
  photo?: string;
  interest: string;
}

interface DashboardProps {
  profiles: Profile[];
  onSelectProfile: (profile: Profile) => void;
}

const Dashboard = ({ profiles, onSelectProfile }: DashboardProps) => {
  console.log('Profiles no Dashboard:', profiles);
  
  if (profiles.length === 0) {
    return (
      <div className="text-center text-bar-text/80 py-8">
        Ainda não há outras pessoas no bar.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 animate-fadeIn">
      {profiles.map((profile, index) => (
        <UserCard
          key={`${profile.tableId}-${index}`}
          name={profile.name}
          phone={profile.phone}
          tableId={profile.tableId}
          photo={profile.photo}
          interest={profile.interest}
          onClick={() => onSelectProfile(profile)}
        />
      ))}
    </div>
  );
};

export default Dashboard;
