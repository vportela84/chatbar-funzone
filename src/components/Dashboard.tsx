
import React from 'react';
import UserCard from './UserCard';

interface Profile {
  name: string;
  phone: string;
  tableId: string;
}

interface DashboardProps {
  profiles: Profile[];
  onSelectProfile: (profile: Profile) => void;
}

const Dashboard = ({ profiles, onSelectProfile }: DashboardProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 animate-fadeIn">
      {profiles.map((profile, index) => (
        <UserCard
          key={index}
          name={profile.name}
          phone={profile.phone}
          tableId={profile.tableId}
          onClick={() => onSelectProfile(profile)}
        />
      ))}
    </div>
  );
};

export default Dashboard;
