
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import FormSection from './FormSection';

interface BasicInfoFormProps {
  name: string;
  setName: (value: string) => void;
  ownerName: string;
  setOwnerName: (value: string) => void;
  document: string;
  setDocument: (value: string) => void;
}

const BasicInfoForm = ({ 
  name, 
  setName, 
  ownerName, 
  setOwnerName, 
  document, 
  setDocument 
}: BasicInfoFormProps) => {
  return (
    <FormSection title="Dados Básicos">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-primary">Nome do Bar *</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-black/20 border-primary/20 text-primary"
            placeholder="Nome do estabelecimento"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="ownerName" className="text-primary">Nome do Responsável</Label>
          <Input
            id="ownerName"
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            className="bg-black/20 border-primary/20 text-primary"
            placeholder="Nome completo"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="document" className="text-primary">CPF/CNPJ</Label>
        <Input
          id="document"
          value={document}
          onChange={(e) => setDocument(e.target.value)}
          className="bg-black/20 border-primary/20 text-primary"
          placeholder="CPF ou CNPJ do estabelecimento"
        />
      </div>
    </FormSection>
  );
};

export default BasicInfoForm;
