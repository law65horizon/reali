// types/property.ts
export interface Address {
  id: string;
  street: string;
  city: string;
  postal_code?: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

export interface Image {
  id: string;
  url: string;
  caption?: string;
}

export interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

export interface Property {
  id: string;
  title?: string;
  price?: number;
  description?: string;
  status: string;
  amenities: string[];
  speciality?: string;
  address?: Address;
  realtor: User;
  images: Image[];
  created_at: string;
  property_type: string
  updated_at: string;
  essentials: {
    bathrooms: number
    bedrooms: number
  }
}

export interface PropertyEdge {
  node: Property;
  cursor: string;
}

export interface PageInfo {
  hasNextPage: boolean;
  endCursor?: string;
}

export interface PropertyConnection {
  edges: PropertyEdge[];
  pageInfo: PageInfo;
  totalCount: number;
}

export interface PropertySearchInput {
  query?: string|null;
  minPrice?: number;
  maxPrice?: number;
  speciality?: string;
  amenities?: string[];
  startDate?: string;
  endDate?: string;
  minRating?: number;
}

export interface SearchPropertiesData {
  searchProperties: PropertyConnection;
}

export interface SearchPropertiesVariables {
  input?: PropertySearchInput;
  first: number;
  after?: string;
}