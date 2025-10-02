// src/constants/featureIcons.ts
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';

// Define a type for features to ensure type safety
export type PropertyFeature =
  | 'kitchen'
  | 'pool'
  | 'wifi'
  | 'parking'
  | 'airConditioning'
  | 'gym'
  // Add more features as needed
;

// Define the mapping of features to icons
export const featureIconMap: Record<
  PropertyFeature,
  { iconSet: any; iconName: string; description: string }
> = {
  kitchen: {
    iconSet: MaterialIcons,
    iconName: 'kitchen',
    description: 'Fully equipped kitchen',
  },
  pool: {
    iconSet: FontAwesome5,
    iconName: 'swimming-pool',
    description: 'Private or shared pool',
  },
  wifi: {
    iconSet: MaterialIcons,
    iconName: 'wifi',
    description: 'High-speed Wi-Fi',
  },
  parking: {
    iconSet: MaterialIcons,
    iconName: 'local-parking',
    description: 'Free parking on premises',
  },
  airConditioning: {
    iconSet: MaterialIcons,
    iconName: 'ac-unit',
    description: 'Air conditioning',
  },
  gym: {
    iconSet: FontAwesome5,
    iconName: 'dumbbell',
    description: 'Fitness center or gym',
  },
  // Add more features as needed
};