import { ThemedText } from '@/components/ThemedText'
import { Line } from '@/components/ui/Line'
import NavigateHeader from '@/components/ui/NavigateHeader'
import { useTheme } from '@/theme/theme'
import { Entypo } from '@expo/vector-icons'
import { router } from 'expo-router'
import React, { useState } from 'react'
import { Pressable, ScrollView, TouchableOpacity, View } from 'react-native'

const auth_page = () => {
    const {theme} = useTheme()
    const [location, setIsLocation] = useState(true)
    const [form, setForm] = useState({
      first_name: '',
      last_name: '',
      dob: Date,
      email: ''
    })
  return (
    <ScrollView style={{backgroundColor: theme.colors.backgroundSec}}> 
        <View style={{paddingVertical: 15, alignItems: 'center', justifyContent: 'center', position: 'relative', borderBottomWidth: 1, borderColor: theme.colors.backgroundSec}}>
            <ThemedText type='subtitle'>Log in or sign up</ThemedText>
            <View style={{position: 'absolute', right: 10,}}>
              <NavigateHeader />
            </View>
        </View>

        {/* <View style={{padding: 20, gap: 10}}>
          <View style={{gap: 0, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 5}}>
            <Pressable onPress={() => setIsLocation(true)} style={[ location && {borderRadius: 5, borderWidth: 2, borderColor: theme.colors.border}, { width: '100%', height: 60, padding: 10 }  ]}>
              <ThemedText secondary style={{fontSize: 12, fontWeight: 'medium'}}>Country/Region</ThemedText>
              <View style={[ {flex: 1, justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row'}]}>
                <ThemedText> {'Niger(+234)'} </ThemedText>
                <Entypo name='arrow-down' size={24} color={theme.colors.text} />
              </View>
            </Pressable>
            <Pressable onPress={() =>(setIsLocation(false))} style={[ !location && {borderRadius: 5, borderWidth: 2, borderColor: theme.colors.border}, { width: '100%', height: 60, padding: 10 }  ]}>
              <ThemedText secondary style={{fontSize: location ? 18: 12, fontWeight: 'medium'}}>Phone number</ThemedText>
              {!location && 
                <TextInput keyboardType='phone-pad' placeholder='Phone' style={{width: '100%', height: '100%'}} /> 
              }
            </Pressable>

    
            
          </View>

            <ThemedText>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Accusantium numquam libero minima, earum ipsam ut dolore. Minus maiores officia iste exercitationem quibusdam eum reprehenderit possimus quam odit. Inventore, dignissimos quos!
            </ThemedText>

        </View> */}

        <View style={{padding: 20, gap: 30, marginTop: 20}}>
          <TouchableOpacity onPress={() => router.push('/(guest)/(auth)/sign_up')} style={{backgroundColor: theme.colors.primary, width: '100%', borderRadius: 10, height: 50, alignItems: 'center', justifyContent: 'center'}}>
            <ThemedText>Sign Up</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/(guest)/(auth)/sign_in')} style={{backgroundColor: theme.colors.primary, width: '100%', borderRadius: 10, height: 50, alignItems: 'center', justifyContent: 'center'}}>
            <ThemedText>Sign In</ThemedText>
          </TouchableOpacity>


          <View style={{gap: 2, flexDirection: 'row', alignItems: 'center'}}>
            <Line style={{height:2, flex: 1,}} />
            <ThemedText type='defaultSemiBold'>or</ThemedText>
            <Line style={{height:2, flex: 1,}} />
          </View>

          <View style={{gap: 15}}>
            <Pressable onPress={() => router.push('/(guest)/(auth)/sign_in')}  style={{borderRadius: 5, alignItems: 'center', width: '100%', padding: 10, flexDirection: 'row', borderWidth: 1}}>
              <Entypo name='mail' size={24} color={theme.colors.text} />
              <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                <ThemedText>continue with email</ThemedText>
              </View>
            </Pressable>

            <Pressable style={{borderRadius: 5, alignItems: 'center', width: '100%', padding: 10, flexDirection: 'row', borderWidth: 1}}>
              <Entypo name='app-store' size={24} color={theme.colors.text} />
              <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                <ThemedText>continue with apple</ThemedText>
              </View>
            </Pressable>
            <Pressable style={{borderRadius: 5, alignItems: 'center', width: '100%', padding: 10, flexDirection: 'row', borderWidth: 1}}>
              <Entypo name='google-' size={24} color={theme.colors.text} />
              <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                <ThemedText>continue with google</ThemedText>
              </View>
            </Pressable>

            <Pressable style={{borderRadius: 5, alignItems: 'center', width: '100%', padding: 10, flexDirection: 'row', borderWidth: 1}}>
              <Entypo name='facebook' size={24} color={theme.colors.text} />
              <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                <ThemedText>continue with email</ThemedText>
              </View>
            </Pressable>
          </View>
        </View>
        
    </ScrollView>
  )
}

export default auth_page