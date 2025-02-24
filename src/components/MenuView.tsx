
import React, { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
}

interface MenuViewProps {
  barId: string;
  onBack: () => void;
}

const MenuView = ({ barId, onBack }: MenuViewProps) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [barName, setBarName] = useState("");

  useEffect(() => {
    const loadMenu = async () => {
      // Carregar nome do bar
      const { data: barData } = await supabase
        .from('bars')
        .select('name')
        .eq('id', barId)
        .single();

      if (barData) {
        setBarName(barData.name);
      }

      // Carregar itens do menu
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('bar_id', barId)
        .eq('active', true)
        .order('category', { ascending: true });

      if (error) {
        console.error('Erro ao carregar menu:', error);
        return;
      }

      if (data) {
        setMenuItems(data);
      }
    };

    loadMenu();
  }, [barId]);

  // Agrupar itens por categoria
  const groupedItems = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  return (
    <div className="space-y-6 p-6 bg-bar-bg rounded-lg max-w-4xl mx-auto animate-fadeIn">
      <div className="flex items-center gap-4">
        <Button
          onClick={onBack}
          variant="ghost"
          className="text-primary hover:text-primary/90"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <h2 className="text-2xl font-bold text-primary">
          Cardápio - {barName}
        </h2>
      </div>

      <div className="grid gap-6">
        {Object.entries(groupedItems).map(([category, items]) => (
          <Card key={category} className="bg-black/20 border-primary/20">
            <CardHeader>
              <CardTitle className="text-xl text-primary">{category}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-start border-b border-primary/10 pb-4 last:border-0 last:pb-0"
                >
                  <div>
                    <h3 className="font-medium text-bar-text">{item.name}</h3>
                    {item.description && (
                      <p className="text-sm text-bar-text/70">{item.description}</p>
                    )}
                  </div>
                  <span className="text-primary font-medium">
                    R$ {item.price.toFixed(2)}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}

        {menuItems.length === 0 && (
          <Card className="bg-black/20 border-primary/20">
            <CardContent className="p-6 text-center text-bar-text/70">
              Nenhum item no cardápio.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MenuView;
