// store/useFormStore.ts
import { AddressDetails } from '@/app/(host)/(tabs)/listing/homes/location';
import { EventDay, FAQ, ImageProps, ItineraryProps } from '@/types/type';
import { create } from 'zustand';


type fieldOptions = 'title'| 'briefBio' | 'category' | 'yearsOfExperience' 
 | 'professionalTitle' | 'experienceOverview' | 'address' | 'images' 
 | 'itenerary' | 'availability' | 'price' | 'groupSizeMin' | 'groupSizeMax' 
 | 'duration' | 'whatsIncluded' | 'whatToBring' | 'faqs' | 'cancellationPolicy'

export type FormState = {
  title: string;
  briefBio: string;
  images: ImageProps[];
  videos: string[];
  category: string;
  yearsOfExperience: string;
  professionalTitle: string;
  availability: EventDay[];
  price: string,
  groupSizeMin: string;
  groupSizeMax: string;
  duration: any;
  experienceOverview: string
  address: AddressDetails | null;
  itenerary: ItineraryProps[]
  whatsIncluded: any,
  whatToBring: any,
  faqs: FAQ[],
  cancellationPolicy: any,
  setField: (field: fieldOptions, value: any) => void;
  addImage: (images: ImageProps[]) => void;
  addVideo: (uri: string) => void;
  removeImage: (filename: string) => void;
  resetForm: () => void;
};


export const useExperienceStore = create<FormState>((set) => ({
  title: '',
  briefBio: '',
  category: '',
  images: [],
  videos: [],
  yearsOfExperience: '',
  professionalTitle: '',
  experienceOverview: '',
  availability: [],
  price: '',
  groupSizeMax: '',
  groupSizeMin: '',
  duration: '',
  address: null,
  whatsIncluded: '',
  whatToBring: '',
  faqs: [],
  cancellationPolicy: '',
  itenerary: [],
  setField: (field, value) => set((state) => ({ ...state, [field]: value })),
  setForm: (form:FormState) => set({...form}),
  addImage: (images: any) => set((state) => ({ images: [...state.images, ...images] })),
  removeImage: (filename:string) => set((state) => ({images: state.images.filter(img => filename !== img.filename)})),
//   addImage: (uri) => set((state) => ({ images: [...state.images, uri] })),
  addVideo: (uri) => set((state) => ({ videos: [...state.videos, uri] })),
  resetForm: () => set({ title: '', images: [], videos: [], category: '',  }),
}));
