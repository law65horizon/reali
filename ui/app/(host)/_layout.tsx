// app/(guest)/_layout.tsx
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTheme } from '@/theme/theme';
import { useNetInfo } from "@react-native-community/netinfo";
import { Stack } from 'expo-router';
import { StatusBar, Text, View } from 'react-native';

export default function GuestLayout() {
  const {theme } = useTheme()
  const {isInternetReachable, isConnected} = useNetInfo()
  console.log(isInternetReachable, isConnected)

//   if (userRole !== 'guest') return null; // Ensure only guests see this layout

  return (<>
    {(!isInternetReachable || !isConnected) &&<View style={{backgroundColor: theme.colors.text, paddingTop: 60, marginBottom: 0, paddingBottom: 10, alignItems: 'center', justifyContent:'center' }}>
      <View style={{flexDirection: 'row', alignItems: 'center', gap: 2}}>
        <IconSymbol name='wifi.slash' color={'red'} />
        <Text style={{color: theme.colors.background}}>Your device is offline</Text>
      </View>
    </View>}
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="chats" options={{ headerShown: false }} />
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
        
      </Stack>
      <StatusBar  />
  </>);
}

// const styles = StyleSheet.create({
//   content: {
//     height: '60%'
//   }
// })