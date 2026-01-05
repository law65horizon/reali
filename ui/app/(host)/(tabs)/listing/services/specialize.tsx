import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import PreviousNextUI from '@/components/ui/PreviousNextUI'
import { useFormStore } from '@/stores/homeStore'
import { useTheme } from '@/theme/theme'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { router } from 'expo-router'
import React, { useState } from 'react'
import { Dimensions, FlatList, Pressable, StyleSheet, View } from 'react-native'

const {width, height} = Dimensions.get('screen')

const Specialize = () => {
    const {theme} = useTheme()
    const { title, description} = useFormStore()
    const {setField, specialize} = useFormStore()
    const [category, setCategory] = useState(specialize || '')
    const residenciesIcons = [
  { id: 1, icon: () => <MaterialCommunityIcons name="home" color={theme.colors.text} size={50} />, name: "House" },
  { id: 2, icon: () => <MaterialCommunityIcons name="home-city" color={theme.colors.text} size={50} />, name: "Apartment" },
  { id: 3, icon: () => <MaterialCommunityIcons name="sail-boat" color={theme.colors.text} size={50} />, name: "Boat" },
  { id: 4, icon: () => <MaterialCommunityIcons name='abacus' color={theme.colors.text} size={50} />, name: "Hotel Room" },
//   { id: 4, icon: () => <MaterialCommunityIcons name='hotel' color={theme.colors.text} size={50} />, name: "Hotel Room" },
  { id: 5, icon: () => <MaterialCommunityIcons name="home-variant" color={theme.colors.text} size={50} />, name: "Condominium" },
  { id: 6, icon: () => <MaterialCommunityIcons name="home-modern" color={theme.colors.text} size={50} />, name: "Modern House" },
  { id: 7, icon: () => <MaterialCommunityIcons name="home-floor-1" color={theme.colors.text} size={50} />, name: "Single-Story Home" },
  { id: 8, icon: () => <MaterialCommunityIcons name="home-group" color={theme.colors.text} size={50} />, name: "Townhouse" },
  { id: 9, icon: () => <MaterialCommunityIcons name="castle" color={theme.colors.text} size={50} />, name: "Mansion" },
  { id: 10, icon: () => <MaterialCommunityIcons name="tent" color={theme.colors.text} size={50} />, name: "Cabin" },
  { id: 11, icon: () => <MaterialCommunityIcons name="tree-outline" color={theme.colors.text} size={50} />, name: "Treehouse" },
  { id: 12, icon: () => <MaterialCommunityIcons name="home-roof" color={theme.colors.text} size={50} />, name: "Villa" },
  { id: 13, icon: () => <MaterialCommunityIcons name="bunk-bed" color={theme.colors.text} size={50} />, name: "Hostel Room" },
  { id: 14, icon: () => <MaterialCommunityIcons name="caravan" color={theme.colors.text} size={50} />, name: "Caravan" },
  { id: 15, icon: () => <MaterialCommunityIcons name="home-flood" color={theme.colors.text} size={50} />, name: "Beach House" },
  { id: 16, icon: () => <MaterialCommunityIcons name="barn" color={theme.colors.text} size={50} />, name: "Farmhouse" },
  { id: 17, icon: () => <MaterialCommunityIcons name="office-building" color={theme.colors.text} size={50} />, name: "Penthouse" },
  { id: 18, icon: () => <MaterialCommunityIcons name="home-plus" color={theme.colors.text} size={50} />, name: "Guest House" },
  { id: 19, icon: () => <MaterialCommunityIcons name="yurt" color={theme.colors.text} size={50} />, name: "Yurt" },
  { id: 20, icon: () => <MaterialCommunityIcons name="lighthouse" color={theme.colors.text} size={50} />, name: "Lighthouse Stay" },
];

    const handle_navigation = (direction: 'next'|'prev') => {
      if(direction === 'next') {
        setField('specialize', category)
        router.push('/listing/homes/location')
      } else {
      }
    }


const eventsIcons = [
  { id: 1, icon: () => <MaterialCommunityIcons name="calendar" color={theme.colors.text} size={50} />, name: "Event Schedule" },
  { id: 2, icon: () => <MaterialCommunityIcons name="ticket" color={theme.colors.text} size={50} />, name: "Event Ticket" },
  { id: 3, icon: () => <MaterialCommunityIcons name="party-popper" color={theme.colors.text} size={50} />, name: "Celebration" },
  { id: 4, icon: () => <MaterialCommunityIcons name="music-note" color={theme.colors.text} size={50} />, name: "Music Event" },
  { id: 5, icon: () => <MaterialCommunityIcons name="cake" color={theme.colors.text} size={50} />, name: "Birthday Party" },
  { id: 6, icon: () => <MaterialCommunityIcons name="calendar-star" color={theme.colors.text} size={50} />, name: "Special Event" },
  { id: 7, icon: () => <MaterialCommunityIcons name="glass-cocktail" color={theme.colors.text} size={50} />, name: "Cocktail Party" },
  { id: 8, icon: () => <MaterialCommunityIcons name="account-group" color={theme.colors.text} size={50} />, name: "Community Gathering" },
  { id: 9, icon: () => <MaterialCommunityIcons name="calendar-check" color={theme.colors.text} size={50} />, name: "Confirmed Event" },
  { id: 10, icon: () => <MaterialCommunityIcons name="gift" color={theme.colors.text} size={50} />, name: "Gift Event" },
  { id: 11, icon: () => <MaterialCommunityIcons name="ring" color={theme.colors.text} size={50} />, name: "Wedding" },
  { id: 12, icon: () => <MaterialCommunityIcons name="microphone" color={theme.colors.text} size={50} />, name: "Concert" },
  { id: 13, icon: () => <MaterialCommunityIcons name="theater" color={theme.colors.text} size={50} />, name: "Theater Performance" },
  { id: 14, icon: () => <MaterialCommunityIcons name="food" color={theme.colors.text} size={50} />, name: "Food Festival" },
  { id: 15, icon: () => <MaterialCommunityIcons name="calendar-heart" color={theme.colors.text} size={50} />, name: "Charity Event" },
  { id: 16, icon: () => <MaterialCommunityIcons name="briefcase" color={theme.colors.text} size={50} />, name: "Corporate Event" },
  { id: 17, icon: () => <MaterialCommunityIcons name="fire" color={theme.colors.text} size={50} />, name: "Bonfire Party" },
  { id: 18, icon: () => <MaterialCommunityIcons name="palette" color={theme.colors.text} size={50} />, name: "Art Exhibition" },
  { id: 19, icon: () => <MaterialCommunityIcons name="filmstrip" color={theme.colors.text} size={50} />, name: "Film Screening" },
  { id: 20, icon: () => <MaterialCommunityIcons name="run" color={theme.colors.text} size={50} />, name: "Sporting Event" },
];

  return (
    <ThemedView plain secondary style={{width, height, gap: 50, paddingVertical: 40, paddingHorizontal: 22, 
        backgroundColor: theme.colors.background2
    }}> 
        <FlatList 
           data={residenciesIcons}
           renderItem={({item}) => (
            <View style={[styles.shadow, {width: width/2-30, height: 100, backgroundColor: theme.colors.background2, justifyContent: 'center',
              paddingLeft: 10, borderRadius: 5, marginRight:15, borderColor: category === item.name ? theme.colors.text: 'gray',
              borderWidth: category === item.name ? 2.5:1
            }]}>
                <Pressable onPress={() => setCategory(item.name)} style={{width: '100%'}}>
                    {item.icon()}
                    <ThemedText type='defaultSemiBold'> {item.name} </ThemedText>
                </Pressable>
            </View>
           )}
           contentContainerStyle={{ gap: 15, marginBottom: 150, justifyContent: 'space-between'}}
           showsVerticalScrollIndicator={false}
           ListHeaderComponent={() => (
            <ThemedText type='subtitle'>Which of these best describes your place?</ThemedText>
           )}
           numColumns={2}
           ListFooterComponent={() => (
            <View style={{height: 150}} />
           )}
           ItemSeparatorComponent={() => (
            <View style={{width: 15}} />
           )}
        />
        <PreviousNextUI style={ {position: 'absolute', width, bottom: 100, zIndex: 1, }} nextFunc={() => handle_navigation('next')}/>
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