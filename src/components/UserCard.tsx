
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UserRound, MessagesSquare } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UserCardProps {
  name: string;
  phone: string;
  tableId: string;
  photo?: string;
  interest: string;
  onClick: () => void;
}

const UserCard = ({ name, phone, tableId, photo, interest, onClick }: UserCardProps) => {
  const getInterestText = (interest: string) => {
    switch (interest) {
      case 'men':
        return 'Interesse em homens';
      case 'women':
        return 'Interesse em mulheres';
      default:
        return 'Interesse em todos';
    }
  };

  return (
    <Card 
      onClick={onClick}
      className="bg-bar-bg border-primary/20 cursor-pointer transform transition-all duration-200 hover:scale-105 hover:border-primary animate-fadeIn"
    >
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10 border-2 border-primary/20">
              <AvatarImage src={photo} />
              <AvatarFallback>
                <UserRound className="w-5 h-5 text-primary" />
              </AvatarFallback>
            </Avatar>
            <CardTitle className="text-bar-text">{name}</CardTitle>
          </div>
          <MessagesSquare className="w-5 h-5 text-secondary" />
        </div>
        <CardDescription className="text-bar-text/80">
          <div>Mesa: {tableId}</div>
          {phone && <div>Telefone: {phone}</div>}
          <div>{getInterestText(interest)}</div>
        </CardDescription>
      </CardHeader>
    </Card>
  );
};

export default UserCard;
