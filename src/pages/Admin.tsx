
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { QrCode, Users } from 'lucide-react';

interface Bar {
  id: string;
  name: string;
  address: string;
  qrCode: string;
  activeUsers: number;
}

const Admin = () => {
  const [bars, setBars] = useState<Bar[]>([]);
  const [selectedBar, setSelectedBar] = useState<Bar | null>(null);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const { toast } = useToast();

  const handleCreateBar = (e: React.FormEvent) => {
    e.preventDefault();
    const newBar: Bar = {
      id: Date.now().toString(),
      name,
      address,
      qrCode: `https://barmatch.app/join/${Date.now()}`,
      activeUsers: 0,
    };
    setBars([...bars, newBar]);
    setName('');
    setAddress('');
    toast({
      title: "Bar cadastrado com sucesso!",
      description: "O QR Code foi gerado automaticamente.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-bar-bg to-black text-bar-text p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="text-center mb-10 animate-fadeIn">
          <h1 className="text-4xl font-bold text-primary mb-2">Bar Match</h1>
          <p className="text-2xl text-bar-text/80">Área Administrativa</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulário de Cadastro */}
          <Card className="bg-bar-bg border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary">Cadastrar Novo Bar</CardTitle>
              <CardDescription>Preencha os dados do estabelecimento</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateBar} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Bar</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-black/20 border-primary/20"
                    placeholder="Digite o nome do bar"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Endereço</Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="bg-black/20 border-primary/20"
                    placeholder="Digite o endereço completo"
                  />
                </div>
                <Button type="submit" className="w-full">Cadastrar Bar</Button>
              </form>
            </CardContent>
          </Card>

          {/* Lista de Bares */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-primary mb-4">Bares Cadastrados</h2>
            {bars.map((bar) => (
              <Card 
                key={bar.id}
                className="bg-bar-bg border-primary/20 cursor-pointer hover:border-primary transition-colors"
                onClick={() => setSelectedBar(bar)}
              >
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-bar-text">{bar.name}</CardTitle>
                    <div className="flex items-center space-x-2 text-primary/80">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">{bar.activeUsers} online</span>
                    </div>
                  </div>
                  <CardDescription>{bar.address}</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-between items-center">
                  <Button 
                    variant="outline" 
                    className="text-primary border-primary/20"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Aqui você pode implementar a lógica para mostrar o QR Code
                      console.log('QR Code:', bar.qrCode);
                    }}
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    Ver QR Code
                  </Button>
                  <span className="text-sm text-bar-text/60">ID: {bar.id}</span>
                </CardContent>
              </Card>
            ))}
            {bars.length === 0 && (
              <p className="text-center text-bar-text/60 py-8">
                Nenhum bar cadastrado ainda
              </p>
            )}
          </div>
        </div>

        {/* Modal ou seção para mostrar detalhes do bar selecionado */}
        {selectedBar && (
          <Card className="mt-8 bg-bar-bg border-primary/20">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-primary">{selectedBar.name}</CardTitle>
                <Button
                  variant="ghost"
                  onClick={() => setSelectedBar(null)}
                  className="text-bar-text/60 hover:text-bar-text"
                >
                  Fechar
                </Button>
              </div>
              <CardDescription>{selectedBar.address}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-black/20 rounded-lg">
                <h3 className="text-lg font-semibold text-primary mb-2">Clientes Ativos</h3>
                {/* Aqui você pode implementar a lista de clientes ativos */}
                <p className="text-bar-text/60">
                  Implementar lista de clientes ativos...
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Admin;
