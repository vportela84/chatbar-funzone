
import React from 'react';
import { Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QRScannerProps {
  onScan: (tableId: string) => void;
}

const QRScanner = ({ onScan }: QRScannerProps) => {
  // Simulated scan for now
  const handleScan = () => {
    onScan("TABLE-123");
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-6 bg-bar-bg rounded-lg animate-fadeIn">
      <div className="relative w-64 h-64 bg-black/20 rounded-lg border-2 border-dashed border-primary flex items-center justify-center">
        <Camera className="w-16 h-16 text-primary opacity-50" />
      </div>
      <p className="text-bar-text text-sm">Position the QR code within the frame</p>
      <Button 
        onClick={handleScan}
        className="bg-primary hover:bg-primary/90 text-primary-foreground"
      >
        Scan QR Code
      </Button>
    </div>
  );
};

export default QRScanner;
