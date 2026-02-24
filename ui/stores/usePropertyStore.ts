
import { AddressDetails } from "@/types/type";
import { create } from "zustand";

export type ImageProps = {
    storage_key?: string 
    cdn_url?: string
    id?: number,
    uri: string,
    fileSize?: any,
    width?: number,
    height?: number
    fileName?: string
    mimeType?: string
}

type fieldOptions = 'basicInfo' | 'address' | 'photos' | 'pricing' | 'description'| 'mode' | 'snapshot'

type PropertyType = 'apartment' | 'house' | 'hotel'
type ListingType = 'sale' | 'rent'
type FormState = {
    basicInfo: {
        propertyType: PropertyType,
        listingType: ListingType,
        title: string
        speciality?: string
    } | null
    address: AddressDetails | null
    description: {
        description: string,
        amenities: string[],
    } | null
    photos: ImageProps[],
    pricing: string,
    mode: 'create' | 'edit'

    snapshot: {
        propertyId: number
        basicInfo: {
            propertyType: PropertyType,
            listingType: ListingType,
            title: string
            speciality?: string
        } 
        address: AddressDetails
        description: {
            description: string,
            amenities: string[],
        }
        photos: ImageProps[],
        pricing: string,
    } | null

    setField: (field: fieldOptions, value: any) => void
    resetForm: () => void;
}

export const usePropertyStore = create<FormState>((set) => ({
    basicInfo: null,
    address: null,
    description: null,
    photos: [],
    pricing: '',
    mode:'create',
    snapshot: null,

    setField: (field, value) => set((state) => ({...state, [field]: value})),
    resetForm: () => set({basicInfo: null, address: null, description: null, photos: [], pricing: '', mode: 'create', snapshot: null})
}));