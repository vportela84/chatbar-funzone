
import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { Pencil, Trash2, Plus } from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  active: boolean;
}

interface MenuAdminProps {
  barId: string;
}

const MenuAdmin = ({ barId }: MenuAdminProps) => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadMenuItems();
  }, [barId]);

  const loadMenuItems = async () => {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('bar_id', barId)
      .eq('active', true)
      .order('category', { ascending: true });

    if (error) {
      console.error('Erro ao carregar itens:', error);
      return;
    }

    if (data) {
      setItems(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const numericPrice = parseFloat(price.replace(',', '.'));
      
      if (isNaN(numericPrice)) {
        throw new Error('Preço inválido');
      }

      if (editingItem) {
        const { error } = await supabase
          .from('menu_items')
          .update({
            name,
            description: description || null,
            price: numericPrice,
            category
          })
          .eq('id', editingItem);

        if (error) throw error;

        toast({
          title: "Item atualizado",
          description: "O item do menu foi atualizado com sucesso.",
        });
      } else {
        const { error } = await supabase
          .from('menu_items')
          .insert([
            {
              bar_id: barId,
              name,
              description: description || null,
              price: numericPrice,
              category
            }
          ]);

        if (error) throw error;

        toast({
          title: "Item adicionado",
          description: "O novo item foi adicionado ao menu.",
        });
      }

      // Limpar formulário
      setName("");
      setDescription("");
      setPrice("");
      setCategory("");
      setEditingItem(null);
      
      // Recarregar itens
      loadMenuItems();
    } catch (error: any) {
      console.error('Erro ao salvar item:', error);
      toast({
        title: "Erro ao salvar item",
        description: error.message || "Não foi possível salvar o item. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (item: MenuItem) => {
    setName(item.name);
    setDescription(item.description || "");
    setPrice(item.price.toString());
    setCategory(item.category);
    setEditingItem(item.id);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('menu_items')
        .update({ active: false })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Item removido",
        description: "O item foi removido do menu.",
      });

      loadMenuItems();
    } catch (error: any) {
      console.error('Erro ao remover item:', error);
      toast({
        title: "Erro ao remover item",
        description: error.message || "Não foi possível remover o item. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-8 p-6 bg-bar-bg rounded-lg">
      <Card className="bg-black/20 border-primary/20">
        <CardHeader>
          <CardTitle className="text-primary">
            {editingItem ? "Editar Item" : "Adicionar Item ao Menu"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Item</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-black/20 border-primary/20 text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-black/20 border-primary/20 text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Preço</Label>
                <Input
                  id="price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="bg-black/20 border-primary/20 text-white"
                  placeholder="0,00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger className="bg-black/20 border-primary/20 text-white">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bebidas">Bebidas</SelectItem>
                    <SelectItem value="Petiscos">Petiscos</SelectItem>
                    <SelectItem value="Pratos Principais">Pratos Principais</SelectItem>
                    <SelectItem value="Sobremesas">Sobremesas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button type="submit" className="w-full">
              {editingItem ? (
                "Atualizar Item"
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Item
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        {items.map((item) => (
          <Card key={item.id} className="bg-black/20 border-primary/20">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-bar-text">{item.name}</h3>
                  {item.description && (
                    <p className="text-sm text-bar-text/70">{item.description}</p>
                  )}
                  <div className="mt-2 flex items-center gap-4">
                    <span className="text-primary font-medium">
                      R$ {item.price.toFixed(2)}
                    </span>
                    <span className="text-sm text-bar-text/70">{item.category}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(item)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MenuAdmin;
