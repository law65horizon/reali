// store/useFormStore.ts
import { AddressDetails } from '@/app/(host)/(tabs)/listing/homes/location';
import { ImageProps } from '@/types/type';
import { create } from 'zustand';

type fieldOptions = 'title'| 'description' | 'videos' | 'specialize' | 'amenities' | 'address' | 'images'

type FormState = {
  title: string;
  description: string;
  images: ImageProps[];
  videos: string[];
  specialize: string;
  amenities: [];
  address: AddressDetails | null;
  setField: (field: fieldOptions, value: any) => void;
  addImage: (images: ImageProps[]) => void;
  addVideo: (uri: string) => void;
  removeImage: (filename: string) => void;
  resetForm: () => void;
};

interface FormProp {
  title: string;
  description: string;
  images: ImageProps[];
  videos: string[];
  specialize: string;
  amenities: []
};

export const useHomeStore = create<FormState>((set) => ({
  title: '',
  description: '',
  specialize: '',
  images: [],
  videos: [],
  amenities: [],
  address: [],
  setField: (field, value) => set((state) => ({ ...state, [field]: value })),
  setForm: (form:FormState) => set({...form}),
  addImage: (images: any) => set((state) => ({ images: [...state.images, ...images] })),
  removeImage: (filename:string) => set((state) => ({images: state.images.filter(img => filename !== img.filename)})),
//   addImage: (uri) => set((state) => ({ images: [...state.images, uri] })),
  addVideo: (uri) => set((state) => ({ videos: [...state.videos, uri] })),
  resetForm: () => set({ title: '', images: [], videos: [], specialize: '', amenities: [] }),
}));
