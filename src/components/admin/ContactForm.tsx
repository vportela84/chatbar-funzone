
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import FormSection from './FormSection';

interface ContactFormProps {
  phone: string;
  setPhone: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  login: string;
  setLogin: (value: string) => void;
  subscriptionPlan: string;
  setSubscriptionPlan: (value: string) => void;
}

const ContactForm = ({
  phone,
  setPhone,
  email,
  setEmail,
  login,
  setLogin,
  subscriptionPlan,
  setSubscriptionPlan
}: ContactFormProps) => {
  return (
    <FormSection title="Contato e Acesso">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-primary">Telefone/WhatsApp (Formato E.164)</Label>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="bg-black/20 border-primary/20 text-primary"
            placeholder="+55XXXXXXXXXX (ex: +5511999999999)"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email" className="text-primary">E-mail</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-black/20 border-primary/20 text-primary"
            placeholder="email@exemplo.com"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="login" className="text-primary">Login do Bar</Label>
        <Input
          id="login"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          className="bg-black/20 border-primary/20 text-primary"
          placeholder="Nome de usuário para acesso"
        />
      </div>
      
      <div className="space-y-2">
        <Label className="text-primary">Assinatura do App</Label>
        <RadioGroup 
          value={subscriptionPlan} 
          onValueChange={setSubscriptionPlan}
          className="flex flex-wrap gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="trial" id="trial" />
            <Label htmlFor="trial" className="cursor-pointer text-primary">Trial</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="monthly" id="monthly" />
            <Label htmlFor="monthly" className="cursor-pointer text-primary">Mensal</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="quarterly" id="quarterly" />
            <Label htmlFor="quarterly" className="cursor-pointer text-primary">Trimestral</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yearly" id="yearly" />
            <Label htmlFor="yearly" className="cursor-pointer text-primary">Anual</Label>
          </div>
        </RadioGroup>
      </div>
    </FormSection>
  );
};

export default ContactForm;
