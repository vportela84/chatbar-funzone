
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';

interface Profile {
  name: string;
  phone: string;
  tableId: string;
  barId: string;
  photo?: string;
  interest?: string;
  isOnline?: boolean;
}

interface ProfileCardProps {
  profile: Profile;
  translateInterest: (interest: string) => string;
}

const ProfileCard = ({ profile, translateInterest }: ProfileCardProps) => {
  return (
    <Card className="bg-black/40 backdrop-blur-sm border-primary/10 hover:bg-black/50 transition-colors">
      <CardContent className="p-3 md:p-4">
        <div className="flex items-center space-x-3 md:space-x-4">
          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-primary ${profile.isOnline ? 'bg-green-500/20 border-2 border-green-500' : 'bg-primary/20'}`}>
            {profile.photo ? (
              <img 
                src={profile.photo} 
                alt={profile.name} 
                className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover"
              />
            ) : (
              <span className="text-lg md:text-xl font-bold">{profile.name.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div>
            <div className="flex items-center">
              <p className="font-medium text-primary/90 text-sm md:text-base">{profile.name}</p>
              <span className={`ml-2 w-2 h-2 rounded-full ${profile.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></span>
            </div>
            <p className="text-xs md:text-sm text-primary/70">Mesa {profile.tableId}</p>
            {profile.interest && (
              <p className="text-xs md:text-sm text-primary/70">
                Interesse: {translateInterest(profile.interest)}
              </p>
            )}
            {profile.phone && (
              <p className="text-xs md:text-sm text-primary/70">{profile.phone}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileCard;
