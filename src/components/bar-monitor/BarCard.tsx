
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode } from 'lucide-react';

interface Bar {
  id: string;
  name: string;
  address: string;
  city: string;
  qr_code?: string;
  logo_url?: string;
  phone?: string;
}

interface BarCardProps {
  bar: Bar;
  onShowQRCode: (qrCode: string) => void;
}

const BarCard = ({ bar, onShowQRCode }: BarCardProps) => {
  return (
    <Card className="bg-black/40 border-primary/10 backdrop-blur-sm hover:bg-black/50 transition-all duration-300">
      <CardContent className="p-3 md:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4">
          <div className="flex-shrink-0">
            {bar.logo_url ? (
              <div className="w-12 h-12 md:w-16 md:h-16 overflow-hidden rounded-lg border border-primary/20">
                <img 
                  src={bar.logo_url} 
                  alt={`Logo ${bar.name}`} 
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                {bar.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-grow">
            <h3 className="font-medium text-base md:text-lg text-primary">{bar.name}</h3>
            <p className="text-xs md:text-sm text-primary/70">
              {bar.address}
              {bar.city && `, ${bar.city}`}
            </p>
            {bar.phone && <p className="text-xs text-primary/60">{bar.phone}</p>}
          </div>
          {bar.qr_code && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onShowQRCode(bar.qr_code!)}
              className="flex items-center gap-2 bg-primary text-black hover:bg-primary/80 transition-all self-start sm:self-center mt-2 sm:mt-0"
            >
              <QrCode className="w-4 h-4" />
              QR Code
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BarCard;
