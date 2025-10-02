// app/(guest)/_layout.tsx
import { useSession } from '@/context/ctx';
import { Stack } from 'expo-router';

export default function GuestLayout() {
  const { session } = useSession();

//   if (userRole !== 'guest') return null; // Ensure only guests see this layout

  return (
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        {/* <Stack.Screen name="index" options={{ headerShown: true }} /> */}
        {/* <Stack.Screen name="+not-found" /> */}
        <Stack.Screen
          name="(modals)/reviews/[modal]"
          options={{
            presentation: 'modal',
            animation: 'fade',
            headerShown: false,
          }}
        />
        <Stack.Screen name='(modals)/host_profile/[host_profile]' 
          options={{ 
            presentation: 'modal',
            animation: 'fade',
            headerShown: false
          }}
        />
        <Stack.Screen
          name="(modals)/about/[about]"
          options={{
            presentation: 'modal',
            animation: 'fade',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(modals)/images/images"
          options={{
            presentation: 'fullScreenModal',
            animation: 'fade',
            headerShown: false,
          }}
        />
        {/* <Stack.Protected guard={!session}> */}
          <Stack.Screen
            name="(auth)/auth_page"
            options={{
              presentation: 'modal',
              animation: 'fade',
              headerShown: false,
            }}
          />
        {/* </Stack.Protected> */}
        <Stack.Screen
          name="(auth)/auth_form"
          options={{
            presentation: 'modal',
            animation: 'fade',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(auth)/sign_in"
          options={{
            presentation: 'modal',
            animation: 'fade',
            headerShown: false,
          }}
        />
        
      </Stack>
    //   <StatusBar style="auto" />
  );
}

// const styles = StyleSheet.create({
//   content: {
//     height: '60%'
//   }
// })