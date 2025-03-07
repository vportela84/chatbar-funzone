
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import BasicInfoForm from './BasicInfoForm';
import AddressForm from './AddressForm';
import ContactForm from './ContactForm';
import BarDetailsForm from './BarDetailsForm';
import MediaUploadForm from './MediaUploadForm';
import { useBarFormState } from '@/hooks/useBarFormState';
import { useMediaUpload } from '@/hooks/useMediaUpload';
import { useBarRegistration } from '@/hooks/useBarRegistration';

const BarRegistrationForm = () => {
  const {
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
  } = useBarFormState();

  const {
    logoFile,
    logoPreview,
    photos,
    setLogoFile,
    setLogoPreview,
    handleLogoChange,
    handlePhotoChange,
    removePhoto,
    uploadFile,
    resetMedia
  } = useMediaUpload();

  const { handleCreateBar } = useBarRegistration({
    name,
    ownerName,
    document,
    address,
    number,
    neighborhood,
    city,
    state,
    phone,
    email,
    login,
    subscriptionPlan,
    description,
    logoFile,
    photos,
    uploadFile,
    resetForm,
    resetMedia
  });

  return (
    <Card className="bg-bar-bg border-primary/20">
      <CardHeader>
        <CardTitle className="text-primary">Cadastrar Novo Bar</CardTitle>
        <CardDescription className="text-primary/70">Preencha os dados do estabelecimento</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCreateBar} className="space-y-6">
          <BasicInfoForm
            name={name}
            setName={setName}
            ownerName={ownerName}
            setOwnerName={setOwnerName}
            document={document}
            setDocument={setDocument}
          />
          
          <AddressForm
            address={address}
            setAddress={setAddress}
            number={number}
            setNumber={setNumber}
            neighborhood={neighborhood}
            setNeighborhood={setNeighborhood}
            city={city}
            setCity={setCity}
            state={state}
            setState={setState}
          />
          
          <ContactForm
            phone={phone}
            setPhone={setPhone}
            email={email}
            setEmail={setEmail}
            login={login}
            setLogin={setLogin}
            subscriptionPlan={subscriptionPlan}
            setSubscriptionPlan={setSubscriptionPlan}
          />
          
          <BarDetailsForm
            description={description}
            setDescription={setDescription}
          />
          
          <MediaUploadForm
            logoFile={logoFile}
            logoPreview={logoPreview}
            setLogoFile={setLogoFile}
            setLogoPreview={setLogoPreview}
            photos={photos}
            handleLogoChange={handleLogoChange}
            handlePhotoChange={handlePhotoChange}
            removePhoto={removePhoto}
          />
          
          <Button type="submit" className="w-full mt-6">Cadastrar Bar</Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default BarRegistrationForm;
