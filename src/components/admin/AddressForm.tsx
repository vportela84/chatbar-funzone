
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import FormSection from './FormSection';

interface AddressFormProps {
  address: string;
  setAddress: (value: string) => void;
  number: string;
  setNumber: (value: string) => void;
  neighborhood: string;
  setNeighborhood: (value: string) => void;
  city: string;
  setCity: (value: string) => void;
  state: string;
  setState: (value: string) => void;
}

const AddressForm = ({
  address,
  setAddress,
  number,
  setNumber,
  neighborhood,
  setNeighborhood,
  city,
  setCity,
  state,
  setState
}: AddressFormProps) => {
  return (
    <FormSection title="Endereço">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="address" className="text-primary">Endereço (Rua) *</Label>
          <Input
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="bg-black/20 border-primary/20 text-primary"
            placeholder="Rua/Avenida"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="number" className="text-primary">Número</Label>
          <Input
            id="number"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            className="bg-black/20 border-primary/20 text-primary"
            placeholder="Número"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="neighborhood" className="text-primary">Bairro</Label>
          <Input
            id="neighborhood"
            value={neighborhood}
            onChange={(e) => setNeighborhood(e.target.value)}
            className="bg-black/20 border-primary/20 text-primary"
            placeholder="Bairro"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="city" className="text-primary">Cidade *</Label>
          <Input
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="bg-black/20 border-primary/20 text-primary"
            placeholder="Cidade"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="state" className="text-primary">Estado</Label>
          <Input
            id="state"
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="bg-black/20 border-primary/20 text-primary"
            placeholder="Estado"
          />
        </div>
      </div>
    </FormSection>
  );
};

export default AddressForm;
