
import React, { useState } from 'react';
import { Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface QRScannerProps {
  onScan: (tableId: string, barId: string) => void;
}

const QRScanner = ({ onScan }: QRScannerProps) => {
  const [manualId, setManualId] = useState('');
  const [showManual, setShowManual] = useState(false);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualId.trim()) {
      onScan(manualId, "BAR-DEFAULT"); // Using a default bar ID for manual entry
    }
  };

  // Simulated scan for now
  const handleScan = () => {
    onScan("TABLE-123", "BAR-123");
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-6 bg-gradient-to-b from-gray-900 to-black rounded-lg shadow-xl max-w-md mx-auto animate-fadeIn">
      {!showManual ? (
        <>
          <div className="relative w-64 h-64 bg-black/20 rounded-lg border-2 border-dashed border-primary flex items-center justify-center">
            <Camera className="w-16 h-16 text-primary opacity-50" />
          </div>
          <p className="text-bar-text text-sm">Posicione o QR code dentro do quadro</p>
          <Button 
            onClick={handleScan}
            className="bg-primary hover:bg-primary/90 text-primary-foreground w-full"
          >
            Escanear QR Code
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowManual(true)}
            className="w-full"
          >
            Inserir ID Manualmente
          </Button>
        </>
      ) : (
        <form onSubmit={handleManualSubmit} className="w-full space-y-4">
          <div>
            <Label htmlFor="manualId" className="text-bar-text">
              Digite o ID do estabelecimento
            </Label>
            <Input
              id="manualId"
              type="text"
              value={manualId}
              onChange={(e) => setManualId(e.target.value)}
              placeholder="Digite o ID"
              className="mt-1"
            />
          </div>
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
            Confirmar
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowManual(false)}
            className="w-full"
          >
            Voltar para Scanner
          </Button>
        </form>
      )}
    </div>
  );
};

export default QRScanner;
