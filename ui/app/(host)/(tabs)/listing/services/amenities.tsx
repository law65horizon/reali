import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import PreviousNextUI from '@/components/ui/PreviousNextUI'
import { useFormStore } from '@/store/homeStore'
import { useTheme } from '@/theme/theme'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { router, useFocusEffect } from 'expo-router'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Dimensions, FlatList, Pressable, StyleSheet, View } from 'react-native'

const {width, height} = Dimensions.get('screen')

const Amenities = () => {
    const {theme} = useTheme()
    const {setField, amenities} = useFormStore()
    const [selections, setSelections] = useState<string[]>(amenities)
    const selectionsRef = useRef<string[]>(amenities)
   const residenciesIcons = [
  { id: 1, icon: () => <MaterialCommunityIcons name="fridge" color={theme.colors.text} size={50} />, name: "Kitchen" },
  { id: 2, icon: () => <MaterialCommunityIcons name="wifi" color={theme.colors.text} size={50} />, name: "WiFi" },
  { id: 3, icon: () => <MaterialCommunityIcons name="television" color={theme.colors.text} size={50} />, name: "TV" },
  { id: 4, icon: () => <MaterialCommunityIcons name="car" color={theme.colors.text} size={50} />, name: "Parking" },
  { id: 5, icon: () => <MaterialCommunityIcons name="bed" color={theme.colors.text} size={50} />, name: "Bedroom" },
  { id: 6, icon: () => <MaterialCommunityIcons name="shower" color={theme.colors.text} size={50} />, name: "Bathroom" },
  { id: 7, icon: () => <MaterialCommunityIcons name="sofa" color={theme.colors.text} size={50} />, name: "Living Room" },
  { id: 8, icon: () => <MaterialCommunityIcons name="table-chair" color={theme.colors.text} size={50} />, name: "Dining Area" },
  { id: 9, icon: () => <MaterialCommunityIcons name="washing-machine" color={theme.colors.text} size={50} />, name: "Laundry" },
  { id: 10, icon: () => <MaterialCommunityIcons name="air-conditioner" color={theme.colors.text} size={50} />, name: "Air Conditioning" },
  { id: 11, icon: () => <MaterialCommunityIcons name="fireplace" color={theme.colors.text} size={50} />, name: "Fireplace" },
  { id: 12, icon: () => <MaterialCommunityIcons name="pool" color={theme.colors.text} size={50} />, name: "Swimming Pool" },
  { id: 13, icon: () => <MaterialCommunityIcons name="grill" color={theme.colors.text} size={50} />, name: "Barbecue" },
  { id: 14, icon: () => <MaterialCommunityIcons name="flower" color={theme.colors.text} size={50} />, name: "Garden" },
  { id: 15, icon: () => <MaterialCommunityIcons name="balcony" color={theme.colors.text} size={50} />, name: "Balcony" },
  { id: 16, icon: () => <MaterialCommunityIcons name="hot-tub" color={theme.colors.text} size={50} />, name: "Hot Tub" },
  { id: 17, icon: () => <MaterialCommunityIcons name="security" color={theme.colors.text} size={50} />, name: "Security System" },
  { id: 18, icon: () => <MaterialCommunityIcons name="elevator" color={theme.colors.text} size={50} />, name: "Elevator" },
  { id: 19, icon: () => <MaterialCommunityIcons name="dumbbell" color={theme.colors.text} size={50} />, name: "Gym" },
  { id: 20, icon: () => <MaterialCommunityIcons name="paw" color={theme.colors.text} size={50} />, name: "Pet Friendly" },
];
     const handleInputChange = (value:string) => {
      if(!selections.includes(value)) {
        setSelections([...selections, value])
        // setField('amenities', [...selections, value])
      }else {
        const selection = selections.filter((item:string) => item !== value)
        setSelections([...selection])
        // setField('amenities', [selection])
      }
     }

     useEffect(() => {
      selectionsRef.current = selections
     }, [selections])

    useFocusEffect(
      useCallback(() => {
        const saveData = () => {
          console.log(selectionsRef.current)
          if(selectionsRef.current.length == 0) return
          setField('amenities', selectionsRef.current)
        }
        return () => {
          saveData()
        }
      }, [])
    )

    const handle_navigation = (direction: 'next'|'prev') => {
      if(direction === 'next') {
        setField('amenities', selections)
        router.push('/listing/homes/amenities')
      } else {
        router.push('/listing/homes/title_description')
      }
    }

const eventsIcons = [
  { id: 1, icon: () => <MaterialCommunityIcons name="chair-school" color={theme.colors.text} size={50} />, name: "Seating" },
  { id: 2, icon: () => <MaterialCommunityIcons name="music" color={theme.colors.text} size={50} />, name: "Live Music" },
  { id: 3, icon: () => <MaterialCommunityIcons name="food-fork-drink" color={theme.colors.text} size={50} />, name: "Catering" },
  { id: 4, icon: () => <MaterialCommunityIcons name="parking" color={theme.colors.text} size={50} />, name: "Parking" },
  { id: 5, icon: () => <MaterialCommunityIcons name="projector-screen" color={theme.colors.text} size={50} />, name: "Audio-Visual Equipment" },
  { id: 6, icon: () => <MaterialCommunityIcons name="wifi" color={theme.colors.text} size={50} />, name: "WiFi" },
  { id: 7, icon: () => <MaterialCommunityIcons name="tent" color={theme.colors.text} size={50} />, name: "Outdoor Space" },
  { id: 8, icon: () => <MaterialCommunityIcons name="lightbulb" color={theme.colors.text} size={50} />, name: "Lighting" },
  { id: 9, icon: () => <MaterialCommunityIcons name="toilet" color={theme.colors.text} size={50} />, name: "Restrooms" },
  { id: 10, icon: () => <MaterialCommunityIcons name="wheelchair-accessibility" color={theme.colors.text} size={50} />, name: "Accessibility" },
  { id: 11, icon: () => <MaterialCommunityIcons name="microphone-variant" color={theme.colors.text} size={50} />, name: "Stage" },
  { id: 12, icon: () => <MaterialCommunityIcons name="glass-cocktail" color={theme.colors.text} size={50} />, name: "Bar Service" },
  { id: 13, icon: () => <MaterialCommunityIcons name="security" color={theme.colors.text} size={50} />, name: "Security" },
  { id: 14, icon: () => <MaterialCommunityIcons name="weather-sunny" color={theme.colors.text} size={50} />, name: "Weather Backup" },
  { id: 15, icon: () => <MaterialCommunityIcons name="camera" color={theme.colors.text} size={50} />, name: "Photography" },
  { id: 16, icon: () => <MaterialCommunityIcons name="bus" color={theme.colors.text} size={50} />, name: "Transportation" },
  { id: 17, icon: () => <MaterialCommunityIcons name="flower-outline" color={theme.colors.text} size={50} />, name: "Decorations" },
  { id: 18, icon: () => <MaterialCommunityIcons name="calendar-clock" color={theme.colors.text} size={50} />, name: "Event Planning" },
  { id: 19, icon: () => <MaterialCommunityIcons name="ticket-confirmation" color={theme.colors.text} size={50} />, name: "Ticketing System" },
  { id: 20, icon: () => <MaterialCommunityIcons name="medical-bag" color={theme.colors.text} size={50} />, name: "First Aid" },
];

  return (
    <ThemedView plain secondary style={{width, height, gap: 50, paddingVertical: 40, paddingHorizontal: 22, 
        backgroundColor: theme.colors.background2
    }}> 
        <FlatList 
           data={eventsIcons}
        //    keyExtractor={it}
           renderItem={({item}) => (
            <View style={[styles.shadow, {width: width/2-30, height: 100, backgroundColor: theme.colors.background2, justifyContent: 'center',
              paddingLeft: 10, borderRadius: 5, marginRight:15, borderWidth: selections.includes(item.name) ? 2.5:1,
              borderColor: selections.includes(item.name) ? theme.colors.text: 'gray'
            }]}>
                <Pressable onPress={() => handleInputChange(item.name)} style={{width: '100%'}}>
                {/* <Pressable onPress={() => setSelections([...selections, item.name])} style={{width: '100%'}}> */}
                    {item.icon()}
                    <ThemedText type='defaultSemiBold'> {item.name} </ThemedText>
                </Pressable>
            </View>
           )}
           contentContainerStyle={{ gap: 15, marginBottom: 150, justifyContent: 'space-between'}}
           showsVerticalScrollIndicator={false}
           numColumns={2}
           ListFooterComponent={() => (
            <View style={{height: 150}} />
           )}
           ListHeaderComponent={() => (
                <ThemedText type='subtitle'>Tell guests why your place stands out</ThemedText>
           )}
           ItemSeparatorComponent={() => (
            <View style={{width: 15}} />
           )}
        />
        <PreviousNextUI style={ {position: 'absolute', width, bottom: 100, zIndex: 1, }} prevFunc={() => handle_navigation('prev')} />
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

export default Amenities