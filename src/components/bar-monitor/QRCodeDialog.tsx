
import React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface QRCodeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  qrCodeUrl: string;
}

const QRCodeDialog = ({ isOpen, onOpenChange, qrCodeUrl }: QRCodeDialogProps) => {
  const { toast } = useToast();

  const handleCopyLink = () => {
    navigator.clipboard.writeText(qrCodeUrl);
    toast({
      title: "Copiado!",
      description: "Link copiado para a área de transferência",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-bar-bg border-primary/20 max-w-[90vw] md:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-primary">QR Code do Bar</DialogTitle>
          <DialogDescription className="text-primary/70">
            Compartilhe este QR Code com seus clientes
          </DialogDescription>
        </DialogHeader>
        <div className="p-4 md:p-6 bg-white rounded-lg">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeUrl)}`}
            alt="QR Code"
            className="mx-auto max-w-full h-auto"
          />
        </div>
        <p className="text-center text-xs md:text-sm text-primary mt-2 break-all px-2">
          {qrCodeUrl}
        </p>
        <div className="flex justify-center mt-4">
          <Button 
            onClick={handleCopyLink}
            variant="outline"
            className="bg-primary text-black hover:bg-primary/80"
          >
            Copiar Link
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeDialog;
