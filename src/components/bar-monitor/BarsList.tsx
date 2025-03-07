
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Users, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import BarCard from './BarCard';
import { LayoutDashboard } from 'lucide-react';

interface Bar {
  id: string;
  name: string;
  address: string;
  city: string;
  qr_code?: string;
  logo_url?: string;
  phone?: string;
}

interface BarsListProps {
  bars: Bar[];
  isExpanded: boolean;
  onToggle: () => void;
  onShowQRCode: (qrCode: string) => void;
  goToAdmin: () => void;
}

const BarsList = ({ bars, isExpanded, onToggle, onShowQRCode, goToAdmin }: BarsListProps) => {
  return (
    <Card className="bg-bar-bg/50 backdrop-blur-sm border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="bg-black/20 rounded-t-lg p-3 md:p-6">
        <div className="flex justify-between items-center cursor-pointer" onClick={onToggle}>
          <CardTitle className="text-primary flex items-center text-lg md:text-2xl">
            <Users className="mr-2 h-5 w-5" /> Bares Cadastrados
          </CardTitle>
          <div className="flex items-center">
            <Badge variant="outline" className="bg-primary text-black mr-2">
              {bars.length} {bars.length === 1 ? 'bar' : 'bares'}
            </Badge>
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-primary" />
            ) : (
              <ChevronDown className="h-5 w-5 text-primary" />
            )}
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="p-3 md:p-6">
          <div className="space-y-4">
            {bars.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-4 md:py-8">
                <p className="text-center text-primary/70 mb-4">Nenhum bar cadastrado ainda.</p>
                <Button 
                  onClick={goToAdmin} 
                  variant="default" 
                  className="bg-primary text-black hover:bg-primary/80"
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" /> Cadastrar Seu Primeiro Bar
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                {bars.map((bar) => (
                  <BarCard 
                    key={bar.id} 
                    bar={bar} 
                    onShowQRCode={onShowQRCode} 
                  />
                ))}
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default BarsList;
