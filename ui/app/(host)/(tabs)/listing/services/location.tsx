import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import PreviousNextUI from '@/components/ui/PreviousNextUI'
import { useFormStore } from '@/stores/homeStore'
import { useTheme } from '@/theme/theme'
import { router } from 'expo-router'
import React, { useState } from 'react'
import { Dimensions, StyleSheet } from 'react-native'

const {width, height} = Dimensions.get('screen')

const Specialize = () => {
    const {theme} = useTheme()
    const { title, description} = useFormStore()
    const {setField, specialize} = useFormStore()
    const [category, setCategory] = useState(specialize || '')

    const handle_navigation = (direction: 'next'|'prev') => {
      if(direction === 'next') {
        setField('specialize', category)
        router.push('/listing/homes/upload_media')
      } else {
        router.push('/listing/homes/specialize')
      }
    }




  return (
    <ThemedView plain secondary style={{width, height, gap: 50, paddingVertical: 40, paddingHorizontal: 22, 
        backgroundColor: theme.colors.background2
    }}> 
        <ThemedText>ispsip</ThemedText>
        <PreviousNextUI style={ {position: 'absolute', width, bottom: 100, zIndex: 1, }} prevFunc={() => handle_navigation('prev')} nextFunc={() => handle_navigation('next')}/>
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
        
    }
})

export default Specialize