// app/(guest)/_layout.tsx
import { Stack } from 'expo-router';

export default function GuestLayout() {

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
        <Stack.Screen name='(modals)/base_search/[query]' 
          options={{ 
            presentation: 'containedModal',
            animation: 'fade',
            headerShown: false,
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
          name="(modals)/listing/[listing]"
          options={{
            presentation: 'fullScreenModal',
            animation: 'fade',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(modals)/reserve/[query]"
          options={{
            presentation: 'fullScreenModal',
            animation: 'fade',
            headerShown: false,
            
          }}
        />
        <Stack.Screen
          name="(modals)/experienceDetail/[query]"
          options={{
            presentation: 'fullScreenModal',
            animation: 'fade',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(modals)/filter/propertiesFilter"
          options={{
            presentation: 'fullScreenModal',
            animation: "ios_from_left",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(modals)/filter/FilterScreen"
          options={{
            presentation: 'fullScreenModal',
            animation: "ios_from_left",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(modals)/filter/experienceFilter"
          options={{
            presentation: 'fullScreenModal',
            animation: "ios_from_left",
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