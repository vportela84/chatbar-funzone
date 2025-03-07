
import { useState } from 'react';

export const useBarFormState = () => {
  const [name, setName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [document, setDocument] = useState('');
  const [address, setAddress] = useState('');
  const [number, setNumber] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [login, setLogin] = useState('');
  const [subscriptionPlan, setSubscriptionPlan] = useState('trial');
  const [description, setDescription] = useState('');

  const resetForm = () => {
    setName('');
    setOwnerName('');
    setDocument('');
    setAddress('');
    setNumber('');
    setNeighborhood('');
    setCity('');
    setState('');
    setPhone('');
    setEmail('');
    setLogin('');
    setSubscriptionPlan('trial');
    setDescription('');
  };

  return {
    name, setName,
    ownerName, setOwnerName,
    document, setDocument,
    address, setAddress,
    number, setNumber,
    neighborhood, setNeighborhood,
    city, setCity,
    state, setState,
    phone, setPhone,
    email, setEmail,
    login, setLogin,
    subscriptionPlan, setSubscriptionPlan,
    description, setDescription,
    resetForm
  };
};
