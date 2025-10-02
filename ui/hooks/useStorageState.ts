// import * as SecureStore from 'expo-secure-store';
// import { useCallback, useEffect, useReducer } from 'react';
// import { Platform } from 'react-native';

// type UseStateHook<T> = [[boolean, T | null], (value: T | null) => void];

// interface SessionProps {
//   uid: string,
//   mode: string
// }

// function useAsyncState<T>(
//   initialValue: [boolean, T | null] = [true, null],
// ): UseStateHook<T> {
//   return useReducer(
//     (state: [boolean, T | null], action: T | null = null): [boolean, T | null] => [false, action],
//     initialValue
//   ) as UseStateHook<T>;
// }

// export async function setStorageItemAsync(key: string, value: string | null) {
//   console.log(`setting ${key} to ${value}`)
//   if (Platform.OS === 'web') {
//     try {
//       if (value === null) {
//         localStorage.removeItem(key);
//       } else {
//         localStorage.setItem(key, value);
//       }
//     } catch (e) {
//       console.error('Local storage is unavailable:', e);
//     }
//   } else {
//       try {
//         if (value == null) {
//         await SecureStore.deleteItemAsync(key);
//         console.log(`deleted ${key} from securestore`)
//       } else {
//         await SecureStore.setItemAsync(key, value);
//         console.log(`stored ${key} in securestore`)
//       }
//     } catch (error) {
//       console.error('securestore is unavailable:', error)
//     }
//   }
// }

// export function useStorageState(key: string): UseStateHook<string> {
//   // Public
//   const [state, setState] = useAsyncState<string>();

//   // Get
//   useEffect(() => {
//     if (Platform.OS === 'web') {
//       try {
//         if (typeof localStorage !== 'undefined') {
//           setState(localStorage.getItem(key));
//         }
//       } catch (e) {
//         console.error('Local storage is unavailable:', e);
//       }
//     } else {
//       SecureStore.getItemAsync(key).then(value => {
//         console.log(`retrieved ${key} from securestore: ${value}`)
//         setState(value);
//       });
//     }
//   }, [key]);

//   // Set
//   const setValue = useCallback(
//     (value: string | null) => {
//       console.log(`setting state for ${key} to ${value} `)
//       setState(value);
//       setStorageItemAsync(key, value);
//     },
//     [key]
//   );

//   return [state, setValue];
// }


import client from '@/lib/apolloClient';
import * as SecureStore from 'expo-secure-store';
import { useCallback, useEffect, useReducer } from 'react';
import { Platform } from 'react-native';

type UseStateHook<T> = [[boolean, T | null], (value: T | null) => void];

interface SessionProps {
  uid: string,
  mode: string
}

function useAsyncState<T>(
  initialValue: [boolean, T | null] = [true, null],
): UseStateHook<T> {
  return useReducer(
    (state: [boolean, T | null], action: T | null = null): [boolean, T | null] => [false, action],
    initialValue
  ) as UseStateHook<T>;
}

export async function setStorageItemAsync(key: string, value: SessionProps | null) {
  console.log(`setting ${key} to ${JSON.stringify(value)}`)
  if (Platform.OS === 'web') {
    try {
      if (value === null) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (e) {
      console.error('Local storage is unavailable:', e);
    }
  } else {
    try {
      if (value == null) {
        await SecureStore.deleteItemAsync(key);
        console.log(`deleted ${key} from securestore`)
      } else {
        await SecureStore.setItemAsync(key, JSON.stringify(value));
        await client.resetStore()
        console.log(`stored ${key} in securestore`)
      }
    } catch (error) {
      console.error('securestore is unavailable:', error)
    }
  }
}

export function useStorageState(key: string): UseStateHook<SessionProps> {
  // Public
  const [state, setState] = useAsyncState<SessionProps>();

  // Get
  useEffect(() => {
    if (Platform.OS === 'web') {
      try {
        if (typeof localStorage !== 'undefined') {
          const storedValue = localStorage.getItem(key);
          setState(storedValue ? JSON.parse(storedValue) : null);
        }
      } catch (e) {
        console.error('Local storage is unavailable:', e);
      }
    } else {
      SecureStore.getItemAsync(key).then(value => {
        console.log(`retrieved ${key} from securestore: ${value}`)
        setState(value ? JSON.parse(value) : null);
      });
    }
  }, [key]);

  // Set
  const setValue = useCallback(
    (value: SessionProps | null) => {
      console.log(`setting state for ${key} to ${JSON.stringify(value)}`)
      setState(value);
      setStorageItemAsync(key, value);
    },
    [key]
  );

  return [state, setValue];
}