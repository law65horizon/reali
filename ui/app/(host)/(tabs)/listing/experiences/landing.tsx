import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import Card from '@/components/ui/Card'
import { useExperienceStore } from '@/stores/experienceStore'
import { useTheme } from '@/theme/theme'
import { Image } from 'expo-image'
import { router } from 'expo-router'
import React, { useState } from 'react'
import { Dimensions, FlatList, StyleSheet, TouchableOpacity } from 'react-native'

const {width, height} = Dimensions.get('screen')

const data = [
  {
    id: 1,
    title: 'Adventure & Outdoor',
    image: require('@/assets/images/customer-service.png')
  },
  {
    id: 2,
    title: 'Digital & Interactive Entertainment',
    image: require('@/assets/images/customer-service.png')
  },
  {
    id:3,
    title: 'Cultural & Historical',
    image: require('@/assets/images/customer-service.png')
  },
  {
    id: 4,
    title: 'Creative & Artistice',
    image: require('@/assets/images/customer-service.png')
  },
  {
    id: 5,
    title: 'Wellness & Relaxation',
    image: require('@/assets/images/customer-service.png')
  },
  {
    id: 6,
    title: 'Food & Drink',
    image: require('@/assets/images/customer-service.png')
  },
]

const Landing
 = () => {
    const {theme} = useTheme()
    const [selected, setSelected] = useState<number>()
    const { setField } = useExperienceStore()
    // const {setField, specialize} = useFormStore()
    // const [category, setCategory] = useState(specialize || '')

  return (
    <ThemedView plain style={[styles.container, {width, height, backgroundColor: theme.colors.background2 }]}> 
      {/* <View style={[{flex: 1, justifyContent: 'space-between', backgroundColor: 'red'}]}> */}
        <ThemedText type='heading' style={{textAlign: 'center', paddingVertical: 20}}>Select a Category</ThemedText>
        <FlatList 
         data={data}
         renderItem={({item}) => (
          <Card elevated style={[styles.card, {borderColor: theme.colors.accent, borderWidth: selected == item.id ?1:0}]} onPress={() => setSelected(item.id)}>
            <Image source={item.image} style={{width: 50, height: 50}} />
            <ThemedText secondary type='caption' style={{textAlign: 'center', color: theme.colors.text}}> {item.title} </ThemedText>
          </Card>
         )}
        //  contentContainerStyle={{backgroundColor:'blue'}}
         numColumns={2}
        />
      {/* </View> */}

        <TouchableOpacity 
          onPress={() => {
            setField('category', selected)
            router.push('/(host)/(tabs)/listing/experiences/experienceBasics')
          }}
          disabled={!selected}
          style={[styles.button, {backgroundColor: theme.colors.primary, opacity: selected?1:0.4}]}>
          <ThemedText>Get Started</ThemedText>
        </TouchableOpacity>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
    container: {paddingVertical: 10, paddingTop: 50, justifyContent: 'space-between'},
    card: {width: '45%', margin: 10, gap: 20, height: 170, alignItems: 'center', justifyContent: 'center'},
    button: {
      padding: 20,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
      marginHorizontal:10
    }
})

export default Landing
