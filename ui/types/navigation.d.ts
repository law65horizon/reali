import { NavigationProp } from '@react-navigation/native';

declare module '@react-navigation/native' {
  export type ExtendedNavigationProp = NavigationProp<
    ReactNavigation.RootParamList,
    string,
    string,
    any,
    { type: 'SAVE_PROJECT'; payload: { source: string; amenities?: string[] } }
  >;

  export function useNavigation(): ExtendedNavigationProp;
}