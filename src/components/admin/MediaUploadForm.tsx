
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { FileImage, Upload, X } from 'lucide-react';
import FormSection from './FormSection';

interface PhotoFile {
  file: File;
  preview: string;
}

interface MediaUploadFormProps {
  logoFile: File | null;
  logoPreview: string;
  setLogoFile: (file: File | null) => void;
  setLogoPreview: (preview: string) => void;
  photos: PhotoFile[];
  setPhotos: React.Dispatch<React.SetStateAction<PhotoFile[]>>;
  handleLogoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removePhoto: (index: number) => void;
}

const MediaUploadForm = ({
  logoFile,
  logoPreview,
  setLogoFile,
  setLogoPreview,
  photos,
  handleLogoChange,
  handlePhotoChange,
  removePhoto
}: MediaUploadFormProps) => {
  const logoInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  return (
    <FormSection title="Mídia">
      <div className="space-y-2">
        <Label className="text-primary">Logo do Estabelecimento</Label>
        <div className="flex flex-col space-y-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => logoInputRef.current?.click()}
            className="w-full"
          >
            <FileImage className="mr-2" /> Selecionar Logo
          </Button>
          <input
            ref={logoInputRef}
            type="file"
            onChange={handleLogoChange}
            accept="image/*"
            className="hidden"
          />
          
          {logoPreview && (
            <div className="relative w-24 h-24 overflow-hidden rounded-md">
              <img 
                src={logoPreview} 
                alt="Preview do logo" 
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  setLogoFile(null);
                  setLogoPreview('');
                }}
                className="absolute top-1 right-1 bg-black/70 rounded-full p-1 text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label className="text-primary">Fotos do Ambiente (máx. 5)</Label>
        <div className="flex flex-col space-y-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => photoInputRef.current?.click()}
            className="w-full"
            disabled={photos.length >= 5}
          >
            <Upload className="mr-2" /> Adicionar Fotos ({photos.length}/5)
          </Button>
          <input
            ref={photoInputRef}
            type="file"
            onChange={handlePhotoChange}
            accept="image/*"
            className="hidden"
          />
          
          {photos.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {photos.map((photo, index) => (
                <div key={index} className="relative w-full h-24 overflow-hidden rounded-md">
                  <img 
                    src={photo.preview} 
                    alt={`Foto ${index + 1}`} 
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute top-1 right-1 bg-black/70 rounded-full p-1 text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </FormSection>
  );
};

export default MediaUploadForm;
