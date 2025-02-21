
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { QrCode, Users, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface Bar {
  id: string;
  name: string;
  address: string;
  city: string;
  qrCode: string;
  activeUsers: number;
}

interface ActiveUser {
  name: string;
  tableId: string;
  phone: string;
  photo?: string;
}

const Admin = () => {
  const [bars, setBars] = useState<Bar[]>([]);
  const [selectedBar, setSelectedBar] = useState<Bar | null>(null);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [showQRCode, setShowQRCode] = useState(false);
  const [selectedQRCode, setSelectedQRCode] = useState<string>('');
  const { toast } = useToast();

  // Simulating active users for demo purposes
  const [activeUsers] = useState<Record<string, ActiveUser[]>>({
    "1": [
      { name: "João", tableId: "TABLE-1", phone: "11999999999", photo: undefined },
      { name: "Maria", tableId: "TABLE-2", phone: "11988888888", photo: undefined },
    ],
  });

  const handleCreateBar = (e: React.FormEvent) => {
    e.preventDefault();
    const newBar: Bar = {
      id: Date.now().toString(),
      name,
      address,
      city,
      qrCode: `https://barmatch.app/join/${Date.now()}`,
      activeUsers: 0,
    };
    setBars([...bars, newBar]);
    setName('');
    setAddress('');
    setCity('');
    toast({
      title: "Bar cadastrado com sucesso!",
      description: "O QR Code foi gerado automaticamente.",
    });
  };

  const handleShowQRCode = (qrCode: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedQRCode(qrCode);
    setShowQRCode(true);
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
                    className="bg-black/20 border-primary/20 text-white placeholder:text-white/50"
                    placeholder="Digite o nome do bar"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Endereço</Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="bg-black/20 border-primary/20 text-white placeholder:text-white/50"
                    placeholder="Digite o endereço completo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="bg-black/20 border-primary/20 text-white placeholder:text-white/50"
                    placeholder="Digite a cidade"
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
                      <span className="text-sm">
                        {activeUsers[bar.id]?.length || 0} online
                      </span>
                    </div>
                  </div>
                  <CardDescription>
                    {bar.address}, {bar.city}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-between items-center">
                  <Button 
                    variant="outline" 
                    className="text-primary border-primary/20"
                    onClick={(e) => handleShowQRCode(bar.qrCode, e)}
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

        {/* Detalhes do bar selecionado */}
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
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <CardDescription>{selectedBar.address}, {selectedBar.city}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-black/20 rounded-lg">
                <h3 className="text-lg font-semibold text-primary mb-4">Clientes Ativos</h3>
                <div className="space-y-4">
                  {activeUsers[selectedBar.id]?.map((user, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-3 bg-black/30 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-bar-text">{user.name}</p>
                          <p className="text-sm text-bar-text/60">Mesa: {user.tableId}</p>
                        </div>
                      </div>
                      <p className="text-sm text-bar-text/60">{user.phone}</p>
                    </div>
                  ))}
                  {!activeUsers[selectedBar.id] && (
                    <p className="text-bar-text/60 text-center">
                      Nenhum cliente ativo no momento
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dialog do QR Code */}
        <Dialog open={showQRCode} onOpenChange={setShowQRCode}>
          <DialogContent className="bg-bar-bg border-primary/20">
            <DialogHeader>
              <DialogTitle className="text-primary">QR Code do Bar</DialogTitle>
              <DialogDescription>
                Compartilhe este QR Code com seus clientes
              </DialogDescription>
            </DialogHeader>
            <div className="p-6 bg-white rounded-lg">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(selectedQRCode)}`}
                alt="QR Code"
                className="mx-auto"
              />
            </div>
            <p className="text-center text-sm text-bar-text/60 mt-2">
              {selectedQRCode}
            </p>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Admin;
