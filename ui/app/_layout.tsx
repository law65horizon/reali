// import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { client } from '@/lib/apolloClient';
import { useAuthStore } from '@/stores/authStore';
// import client from '@/lib/apolloClient';
import { ThemeProvider } from '@/theme/theme';
import { ApolloProvider } from '@apollo/client';
import { StripeProvider } from '@stripe/stripe-react-native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';


export default function RootLayout() {
  const colorScheme = useColorScheme();
  
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }


  return (
    <ApolloProvider client={client}>
      <StripeProvider publishableKey='pk_test_51O5EKFEMz6QQdgMEosyoo1yD40SBHJmHcAudyYazrEk8r45xGH2p5nY7FwBNkCfs3tUncdGT0Twmh1ZYquejG3qz00dHkJJ5ev'>
      <RootNavigator />
      </StripeProvider>
    </ApolloProvider>
  );
}


function RootNavigator() {

  useEffect(() => {
    loadAuth()
  }, [])

  const {isAuthenticated, isLoading, mode, loadAuth} = useAuthStore()
  // console.warn({isAuthenticated, isLoading, accessToken})
  return (
   <GestureHandlerRootView style={{flex:1}}>
    <ThemeProvider>
      <Stack >
        {/* <Home /> */}
        <Stack.Protected guard={!isLoading && !isAuthenticated || mode === 'guest'}>
          <Stack.Screen name='(guest)' options={{headerShown: false}}/> 
        </Stack.Protected>
        <Stack.Protected guard={mode === 'host'} >
          <Stack.Screen name='(host)' options={{headerShown: false}} />
        </Stack.Protected>
      
        <Stack.Screen name='index' options={{headerShown: false}} />
        {/* <Stack.Screen name='(shared)/(modals)/listing/[listing]' options={{headerShown: false}} /> */}
      </Stack>
    </ThemeProvider>
   </GestureHandlerRootView>
  )
}





