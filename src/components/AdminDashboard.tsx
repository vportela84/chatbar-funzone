
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";
import { Users, RefreshCcw } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface Profile {
  name: string;
  phone: string;
  tableId: string;
  barId: string;
  photo?: string;
  interest?: string;
  isOnline?: boolean; // Mudando de 'online' para 'isOnline' para evitar conflitos
}

interface Bar {
  id: string;
  name: string;
  profiles: Profile[];
}

const AdminDashboard = () => {
  const [bars, setBars] = useState<Bar[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const loadBarsAndProfiles = async () => {
    try {
      setIsLoading(true);
      const { data: barsData, error: barsError } = await supabase
        .from('bars')
        .select('*');

      if (barsError) throw barsError;

      const { data: profilesData, error: profilesError } = await supabase
        .from('bar_profiles')
        .select('*');

      if (profilesError) throw profilesError;

      // Vamos considerar que todos os usuários presentes na lista estão online
      // No futuro, podemos integrar com a funcionalidade de presença do Supabase
      const barsWithProfiles = barsData.map(bar => ({
        id: bar.id,
        name: bar.name,
        profiles: profilesData
          .filter(profile => profile.bar_id === bar.id)
          .map(profile => ({
            name: profile.name,
            phone: profile.phone || '',
            tableId: profile.table_id,
            barId: profile.bar_id,
            photo: profile.photo,
            interest: profile.interest,
            isOnline: true // Definindo todos como online por enquanto
          }))
      }));

      setBars(barsWithProfiles);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar as informações dos bares",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBarsAndProfiles();
    // Atualiza a cada 30 segundos
    const interval = setInterval(loadBarsAndProfiles, 30000);
    return () => clearInterval(interval);
  }, []);

  const translateInterest = (interest: string) => {
    switch (interest) {
      case 'men':
        return 'Homens';
      case 'women':
        return 'Mulheres';
      case 'all':
      default:
        return 'Todos';
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 p-3 md:p-6">
      <div className="flex justify-between items-center mb-2 md:mb-4">
        <Button 
          onClick={loadBarsAndProfiles} 
          variant="outline" 
          size="sm"
          className="ml-auto bg-primary text-black hover:bg-primary/80"
          disabled={isLoading}
        >
          <RefreshCcw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> 
          {isLoading ? 'Atualizando...' : 'Atualizar'}
        </Button>
      </div>
      
      {bars.length === 0 ? (
        <Card className="bg-bar-bg/50 backdrop-blur-sm border-primary/20 shadow-lg">
          <CardContent className="p-4 md:p-6">
            <p className="text-center text-primary/70">Nenhum bar cadastrado ainda.</p>
          </CardContent>
        </Card>
      ) : (
        bars.map(bar => (
          <Card key={bar.id} className="bg-bar-bg/50 backdrop-blur-sm border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="bg-black/20 rounded-t-lg p-3 md:p-6">
              <div className="flex justify-between items-center">
                <CardTitle className="text-primary text-base md:text-xl">{bar.name}</CardTitle>
                <Badge variant="outline" className="flex items-center gap-2 text-black bg-primary text-xs md:text-sm">
                  <Users className="w-3 h-3 md:w-4 md:h-4" />
                  {bar.profiles.length} online
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-3 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {bar.profiles.length === 0 ? (
                  <p className="text-primary/70 col-span-full">Nenhum usuário online no momento.</p>
                ) : (
                  bar.profiles.map((profile, index) => (
                    <Card key={`${profile.tableId}-${index}`} className="bg-black/40 backdrop-blur-sm border-primary/10 hover:bg-black/50 transition-colors">
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
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default AdminDashboard;
