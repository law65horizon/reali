// import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { SessionProvider, useSession } from '@/context/ctx';
import { useColorScheme } from '@/hooks/useColorScheme';
import client from '@/lib/apolloClient';
import { getSession } from '@/lib/appwrite';
// import client from '@/lib/apolloClient';
import { ThemeProvider } from '@/theme/theme';
import { ApolloProvider } from '@apollo/client';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
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
      <SessionProvider>
        <RootNavigator />
      </SessionProvider>
    </ApolloProvider>
  );
}


function RootNavigator() {
  const {session, isLoading} = useSession()
  const seos = getSession()
  // const {user} = useAuth()
  console.log(isLoading, session)
  return (
    // <ThemeProvider>
    //   <Stack>
    //     {session?.mode === 'guest' && (
    //       <Stack.Screen
    //         name="(guest)"
    //         options={{ headerShown: false }}
    //         // component={require('./(guest)/_layout').default}
    //       />
    //     )}
    //     {session?.mode === 'host' && (
    //       <Stack.Screen
    //         name="(host)"
    //         options={{ headerShown: false }}
    //         // component={require('./(host)/_layout').default}
    //       />
    //     )}
    //     <Stack.Screen name="index" options={{ headerShown: false }} />
    //   </Stack>
    // </ThemeProvider>
   <GestureHandlerRootView style={{flex:1}}>
    <ThemeProvider>
      <Stack >
        {/* <Home /> */}
        <Stack.Protected guard={!isLoading && !session || session?.mode === 'guest'}>
          <Stack.Screen name='(guest)' options={{headerShown: false}}/> 
        </Stack.Protected>
        <Stack.Protected guard={session?.mode === 'host'} >
          <Stack.Screen name='(host)' options={{headerShown: false}} />
        </Stack.Protected>
      
        <Stack.Screen name='index' options={{headerShown: false}} />
        {/* <Stack.Screen name='(shared)/(modals)/listing/[listing]' options={{headerShown: false}} /> */}
      </Stack>
    </ThemeProvider>
   </GestureHandlerRootView>
  )
}





