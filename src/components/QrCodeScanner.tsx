
import React, { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface QrCodeScannerProps {
  onScanSuccess: (barId: string) => void;
  onClose: () => void;
}

const QrCodeScanner: React.FC<QrCodeScannerProps> = ({ onScanSuccess, onClose }) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0
    };

    const startScanner = async () => {
      try {
        if (containerRef.current) {
          const html5QrCode = new Html5Qrcode("qr-reader");
          scannerRef.current = html5QrCode;
          
          await html5QrCode.start(
            { facingMode: "environment" },
            config,
            (decodedText) => {
              // Verifique se o texto decodificado é um ID de bar válido
              if (decodedText && typeof decodedText === 'string') {
                console.log(`QR Code detectado: ${decodedText}`);
                onScanSuccess(decodedText);
                stopScanner();
              }
            },
            (errorMessage) => {
              // Ignore erros durante a leitura
              console.log(errorMessage);
            }
          );
        }
      } catch (err) {
        console.error("Erro ao iniciar scanner:", err);
      }
    };

    startScanner();

    return () => {
      stopScanner();
    };
  }, [onScanSuccess]);

  const stopScanner = () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current.stop()
        .catch(err => console.error("Erro ao parar scanner:", err));
    }
  };

  return (
    <div className="relative flex flex-col items-center">
      <div className="relative">
        <div id="qr-reader" ref={containerRef} className="w-full max-w-xs"></div>
        <Button 
          onClick={onClose} 
          className="absolute top-2 right-2 p-2 h-8 w-8" 
          variant="outline"
          size="icon"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-center mt-4 text-primary/70">Posicione o QR Code do bar no centro da câmera</p>
    </div>
  );
};

export default QrCodeScanner;
