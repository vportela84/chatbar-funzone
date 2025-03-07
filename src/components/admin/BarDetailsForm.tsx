
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import FormSection from './FormSection';

interface BarDetailsFormProps {
  description: string;
  setDescription: (value: string) => void;
}

const BarDetailsForm = ({ description, setDescription }: BarDetailsFormProps) => {
  return (
    <FormSection title="Detalhes do Estabelecimento">
      <div className="space-y-2">
        <Label htmlFor="description" className="text-primary">Descrição do Bar</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="bg-black/20 border-primary/20 text-primary min-h-[100px]"
          placeholder="Descreva seu estabelecimento, ambiente, público-alvo, etc."
        />
      </div>
    </FormSection>
  );
};

export default BarDetailsForm;
