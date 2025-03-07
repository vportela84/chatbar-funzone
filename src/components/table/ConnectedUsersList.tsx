
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Users } from 'lucide-react';

// Type for the connected users
interface ConnectedUser {
  id: string;
  name: string;
  table_id: string;
  photo?: string;
}

interface ConnectedUsersListProps {
  users: ConnectedUser[];
  isLoading: boolean;
  onStartChat: (userId: string, userName: string) => void;
}

const ConnectedUsersList: React.FC<ConnectedUsersListProps> = ({ 
  users, 
  isLoading, 
  onStartChat 
}) => {
  return (
    <Card className="bg-bar-bg border-primary/20 mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-primary flex items-center">
          <Users className="mr-2" /> Pessoas no Bar
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-center py-4">Carregando usuários...</p>
        ) : users.length === 0 ? (
          <p className="text-center py-4">Nenhuma pessoa conectada no momento.</p>
        ) : (
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 rounded-lg bg-black/20 hover:bg-black/30 transition-colors">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary mr-3">
                    {user.photo ? (
                      <img src={user.photo} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      user.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-primary">{user.name}</h3>
                    <p className="text-xs text-primary opacity-70">Mesa {user.table_id}</p>
                  </div>
                </div>
                <Button 
                  onClick={() => onStartChat(user.id, user.name)}
                  variant="outline"
                  size="sm"
                  className="flex items-center"
                >
                  <MessageSquare className="w-4 h-4 mr-1" />
                  Conversar
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ConnectedUsersList;
