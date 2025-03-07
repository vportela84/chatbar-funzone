
import React from 'react';

interface FormSectionProps {
  title: string;
  children: React.ReactNode;
}

const FormSection = ({ title, children }: FormSectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-primary">{title}</h3>
      {children}
    </div>
  );
};

export default FormSection;
