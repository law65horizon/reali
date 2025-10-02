import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import NavigateHeader from '@/components/ui/NavigateHeader'
import { useTheme } from '@/theme/theme'
import { Image } from 'expo-image'
import { router } from 'expo-router'
import React, { useState } from 'react'
import { Pressable, TouchableOpacity, View } from 'react-native'

type category = 'homes' | 'services' | 'experiences'

const Initial = () => {
  const {theme} = useTheme()
  const [category, setCategory] = useState<category>()
  return (   
    <ThemedView plain secondary style={{width: '100%', height: '100%', padding: 20, gap: 20,borderColor: 'transperent', borderTopStartRadius: 20, borderTopEndRadius: 20 }}>
      <View style={{ alignItems: 'flex-end', }}>
        <NavigateHeader />
      </View>

      {/* <ThemedText type="subtitle" style={{textAlign: 'center', marginTop: 30, fontSize: 25}}>What would you like to host</ThemedText> */}

      <View style={{gap: 10}}>
        <Pressable onPress={() => setCategory('homes')} style={{width: '100%', height: 150, justifyContent: 'space-between', 
          alignItems: 'center', flexDirection: 'row', paddingHorizontal:20, borderRadius: 10, 
          borderColor: category === 'homes' ? theme.colors.text: theme.colors.textSecondary, borderWidth:category === 'homes' ? 2 : 0.5
        }}>
          <ThemedText type='subtitle'>Home</ThemedText>
          <Image source={require('@/assets/images/building.png')} style={{height: 100, width: 100}} />
        </Pressable>

        <Pressable onPress={() => setCategory('experiences')} style={{width: '100%', height: 150, justifyContent: 'space-between', 
          alignItems: 'center', flexDirection: 'row', paddingHorizontal:20, borderRadius: 10, 
          borderColor: category === 'experiences' ? theme.colors.text: theme.colors.textSecondary, borderWidth:category === 'experiences' ? 2 : 0.5
        }}>
          <ThemedText type='subtitle'>Experience</ThemedText>
          <Image source={require('@/assets/images/calendar.png')} style={{height: 100, width: 100}} />
        </Pressable>

        <Pressable onPress={() => setCategory('services')} style={{width: '100%', height: 150, justifyContent: 'space-between', 
          alignItems: 'center', flexDirection: 'row', paddingHorizontal:20, borderRadius: 10, 
          borderColor: category === 'services' ? theme.colors.text: theme.colors.textSecondary, borderWidth:category === 'services' ? 2 : 0.5
        }}>
          <ThemedText type='subtitle'>Services</ThemedText>
          <Image source={require('@/assets/images/customer-service.png')} style={{height: 100, width: 100}} />
        </Pressable>
      </View>

      <TouchableOpacity onPress={() => router.replace(`/listing/${category!}/landing`)} disabled={!category} >
      {/* <TouchableOpacity onPress={() => router.push(category != 'experiences' ? `/listing/${category!}/landing` : '/(host)/(modals)/experiences/landing')} disabled={!category} > */}
        <View style={{width:'100%', opacity: !category ? 0.3 : 1, backgroundColor: theme.colors.text, padding: 15, alignItems: 'center', borderRadius: 10, justifyContent: 'center'}}>
          <ThemedText type='subtitle' style={{color: theme.colors.background}}>Next</ThemedText>
        </View>
      </TouchableOpacity>
    </ThemedView>
  )
}


export default Initial