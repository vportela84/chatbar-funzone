
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UserRound, MessagesSquare } from 'lucide-react';

interface UserCardProps {
  name: string;
  phone: string;
  tableId: string;
  onClick: () => void;
}

const UserCard = ({ name, phone, tableId, onClick }: UserCardProps) => {
  return (
    <Card 
      onClick={onClick}
      className="bg-bar-bg border-primary/20 cursor-pointer transform transition-all duration-200 hover:scale-105 hover:border-primary animate-fadeIn"
    >
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <UserRound className="w-5 h-5 text-primary" />
            <CardTitle className="text-bar-text">{name}</CardTitle>
          </div>
          <MessagesSquare className="w-5 h-5 text-secondary" />
        </div>
        <CardDescription className="text-bar-text/80">
          <div>Mesa: {tableId}</div>
          {phone && <div>Telefone: {phone}</div>}
        </CardDescription>
      </CardHeader>
    </Card>
  );
};

export default UserCard;
