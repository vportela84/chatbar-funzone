
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Eye, EyeOff } from 'lucide-react';
import ProfileCard from './ProfileCard';
import { Button } from '@/components/ui/button';

interface Profile {
  name: string;
  phone: string;
  tableId: string;
  barId: string;
  photo?: string;
  interest?: string;
  isOnline?: boolean;
}

interface BarCardProps {
  name: string;
  profiles: Profile[];
  translateInterest: (interest: string) => string;
}

const BarCard = ({ name, profiles, translateInterest }: BarCardProps) => {
  // Contar usuários online
  const onlineCount = profiles.filter(profile => profile.isOnline).length;
  const [showOfflineUsers, setShowOfflineUsers] = useState(false);
  
  // Filtrar perfis com base na configuração
  const filteredProfiles = showOfflineUsers 
    ? profiles 
    : profiles.filter(profile => profile.isOnline);

  return (
    <Card className="bg-bar-bg/50 backdrop-blur-sm border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="bg-black/20 rounded-t-lg p-3 md:p-6">
        <div className="flex justify-between items-center">
          <CardTitle className="text-primary text-base md:text-xl">{name}</CardTitle>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 flex items-center gap-1"
              onClick={() => setShowOfflineUsers(!showOfflineUsers)}
            >
              {showOfflineUsers ? (
                <>
                  <EyeOff className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="text-xs">Ocultar offline</span>
                </>
              ) : (
                <>
                  <Eye className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="text-xs">Mostrar todos</span>
                </>
              )}
            </Button>
            <Badge variant="outline" className="flex items-center gap-2 text-black bg-primary text-xs md:text-sm">
              <Users className="w-3 h-3 md:w-4 md:h-4" />
              {onlineCount} online
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {filteredProfiles.length === 0 ? (
            <p className="text-primary/70 col-span-full">
              {showOfflineUsers 
                ? "Nenhum usuário cadastrado neste bar." 
                : "Nenhum usuário online no momento."}
            </p>
          ) : (
            filteredProfiles.map((profile, index) => (
              <ProfileCard 
                key={`${profile.tableId}-${index}`} 
                profile={profile} 
                translateInterest={translateInterest} 
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BarCard;

