// context/FormContext.tsx
import React, { createContext, useContext } from 'react';

type FormContextType = {
  updateFormData: (screen: string, data: any) => void;
  formData: any; // Optional: Share formData if screens need to read it
};

const FormContext = createContext<FormContextType | undefined>(undefined);

export const useFormContext = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  return context;
};

export const FormProvider: React.FC<{
  children: React.ReactNode;
  updateFormData: (screen: string, data: any) => void;
  formData: any;
}> = ({ children, updateFormData, formData }) => {
  return <FormContext.Provider value={{ updateFormData, formData }}>{children}</FormContext.Provider>;
};