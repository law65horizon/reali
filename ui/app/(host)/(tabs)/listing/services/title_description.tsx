import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import PreviousNextUI from '@/components/ui/PreviousNextUI'
import { useFormStore } from '@/store/homeStore'
import { useTheme } from '@/theme/theme'
import { router } from 'expo-router'
import React, { useState } from 'react'
import { Dimensions, Keyboard, Pressable, StyleSheet, TextInput, View } from 'react-native'

const {width, height} = Dimensions.get('screen')

const Description = () => {
    const {theme} = useTheme()
    const { title, description, setField} = useFormStore()
    const [formData, setFormData] = useState({
      title: title || '',
      description: description || ''
    })


    const handle_navigation = (direction: 'next'|'prev') => {
      if(direction === 'next') {
        setField('title', formData.title)
        setField('description', formData.description)
        router.push('/listing/homes/amenities')
      } else {
        router.push('/listing/homes/upload_media')
      }
    }

  return (
    <ThemedView plain secondary style={{width, height, gap: 50, paddingVertical: 40, paddingHorizontal: 22, 
      backgroundColor: theme.colors.background2
    }}> 
        
        <View style={{gap:20}}>
            <ThemedText type='subtitle'>Title</ThemedText>    
            <ThemedText secondary >Lorem ipsum dolor sit amet consectetur adipisicing elit. Quaerat magnam illum at libero.</ThemedText>
            <TextInput value={formData.title} 
              onChangeText={e => {
                setFormData({...formData, title: e})
              }}
              style={[styles.input, {color: theme.colors.border, borderColor: theme.colors.border}]} 
            />
            {/* <TextInput value={formData.title} onChangeText={e => {setFormData({...formData, title: e})}} style={styles.input}  /> */}
        </View>
        <View style={{gap:20}}>
            <ThemedText type='subtitle'>Description</ThemedText>    
            <ThemedText secondary >Lorem ipsum dolor sit amet consectetur adipisicing elit. Quaerat magnam illum at libero.</ThemedText>
            <TextInput value={formData.description} 
              onChangeText={e => {
                setFormData({...formData, description: e})
                // handleInputChange()
              }} 
              style={[styles.input, {height: 120, color: theme.colors.border, borderColor: theme.colors.border}]} 
              multiline={true} numberOfLines={4}
              returnKeyType='default' 
            />
        </View>
        {false && (
            <Pressable onPress={() => Keyboard.dismiss} style={{width, height: 30, left: 0, bottom: 0, zIndex:1, backgroundColor: 'red'}} />
        )}

        <PreviousNextUI style={ {position: 'absolute', width, bottom: 100, zIndex: 1, }} prevFunc={() => handle_navigation('prev')} nextFunc={() => handle_navigation('next')}/>
      
    </ThemedView>
  )
}

const styles = StyleSheet.create({
    input: {
    borderWidth: 1,
    // borderColor: '#CCC',
    borderRadius: 6,
    paddingVertical: 15,
    paddingHorizontal: 12,
    fontSize: 16,
    // backgroundColor: '#FAFAFA',
  },
})

export default Description