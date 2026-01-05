import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { useFormStore } from '@/stores/homeStore'
import { useTheme } from '@/theme/theme'
import { router } from 'expo-router'
import React, { useState } from 'react'
import { Dimensions, StyleSheet, TouchableOpacity } from 'react-native'

const {width, height} = Dimensions.get('screen')

const Landing
 = () => {
    const {theme} = useTheme()
    const { title, description} = useFormStore()
    const {setField, specialize} = useFormStore()
    const [category, setCategory] = useState(specialize || '')





  return (
    <ThemedView plain secondary style={{width, height, gap: 50, paddingVertical: 40, paddingHorizontal: 22, 
        backgroundColor: theme.colors.background2, justifyContent: 'space-between'
    }}> 
        <ThemedText>ispsip</ThemedText>

        <TouchableOpacity onPress={() => router.push('/listing/homes/specialize')} style={[styles.button, {marginBottom: 10, backgroundColor: theme.colors.primary, }]}>
          <ThemedText>Get Started</ThemedText>
        </TouchableOpacity>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
    shadow: {
        // shadowOffset: { width: 0, height: 0},
        // shadowOpacity: 0.3,
        // shadowRadius: 3,
        // elevation: 6,
        borderWidth: 1
    },
    button: {
      padding: 20,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center'
    }
})

export default Landing
