
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";
import { Users } from 'lucide-react';

interface Profile {
  name: string;
  phone: string;
  tableId: string;
  barId: string;
  photo?: string;
}

interface Bar {
  id: string;
  name: string;
  profiles: Profile[];
}

const AdminDashboard = () => {
  const [bars, setBars] = useState<Bar[]>([]);
  const { toast } = useToast();

  const loadBarsAndProfiles = async () => {
    try {
      const { data: barsData, error: barsError } = await supabase
        .from('bars')
        .select('*');

      if (barsError) throw barsError;

      const { data: profilesData, error: profilesError } = await supabase
        .from('bar_profiles')
        .select('*');

      if (profilesError) throw profilesError;

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
            photo: profile.photo
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
    }
  };

  useEffect(() => {
    loadBarsAndProfiles();
    // Atualiza a cada 30 segundos
    const interval = setInterval(loadBarsAndProfiles, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-primary mb-4">Dashboard de Usuários</h2>
      {bars.length === 0 ? (
        <Card className="bg-bar-bg border-primary/20">
          <CardContent className="p-6">
            <p className="text-center text-primary/70">Nenhum bar cadastrado ainda.</p>
          </CardContent>
        </Card>
      ) : (
        bars.map(bar => (
          <Card key={bar.id} className="bg-bar-bg border-primary/20">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-primary">{bar.name}</CardTitle>
                <Badge variant="outline" className="flex items-center gap-2 text-primary">
                  <Users className="w-4 h-4" />
                  {bar.profiles.length} online
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bar.profiles.length === 0 ? (
                  <p className="text-primary/70 col-span-full">Nenhum usuário online no momento.</p>
                ) : (
                  bar.profiles.map((profile, index) => (
                    <Card key={`${profile.tableId}-${index}`} className="bg-black/20 border-primary/10">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="font-medium text-primary/90">{profile.name}</p>
                            <p className="text-sm text-primary/70">Mesa {profile.tableId}</p>
                            {profile.phone && (
                              <p className="text-sm text-primary/70">{profile.phone}</p>
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
