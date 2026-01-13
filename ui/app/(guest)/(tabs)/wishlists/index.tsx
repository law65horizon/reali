import DraggableModal from '@/components/DraggableModal'
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import Card from '@/components/ui/Card'
import ImageCarousel from '@/components/ui/ImageCarousel'
import { Line } from '@/components/ui/Line'
import { useTheme } from '@/theme/theme'
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { router } from 'expo-router'
import React, { useCallback, useState } from 'react'
import { Dimensions, FlatList, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

const { width, height } = Dimensions.get('screen');


export default function Saved() {
     
    const {theme} = useTheme()
    const [isModalVisible, setModalVisible] = useState(false)
    const [type, setType] = useState<'properties' | 'experiences' | 'all'>('all');
    const [propertyType, setPropertyType] = useState<'rent' | 'sale' | 'sold' | 'all'>('rent');
    const [sort, setSort] = useState('')
    
    
    const images = [
        require('@/assets/images/image.png'),
        require('@/assets/images/living-room.jpg'),
        require('@/assets/images/image3.jpg'),
        require('@/assets/images/image.png'),
        require('@/assets/images/living-room.jpg'),
        // require('@/assets/images/image3.jpg'),
        // require('@/assets/images/image.png'),
        // require('@/assets/images/living-room.jpg'),
        // require('@/assets/images/image3.jpg'),
        // Add more images up to 25
        // ...require('@/assets/images/image4.jpg'), etc.
    ]

    const renderItem = useCallback(
          ({ item }: { item: any }) => (
            <Card elevated style={[styles.propertyCard, {backgroundColor: theme.colors.backgroundSec}]}>
                                {/* <ThemedText type='defaultSemiBold' style={styles.cardTitle}> {item?.title} </ThemedText> */}
                                <ThemedText type='defaultSemiBold' style={styles.cardTitle}>Modern Apartment in City Center</ThemedText>
                                
                                <View style={styles.imageContainer}>
                                  <ImageCarousel imageHeight={240} width={width-40} images={images} modal />
                                </View>
    
                                {/* <Pressable onPress={() => router.push( item < 2 ? '/(guest)/(modals)/experienceDetail/[query]' : '/(guest)/(modals)/listing/[listing]' )} style={styles.cardContent}> */}
                                <Pressable onPress={() => router.push({pathname: '/(guest)/(modals)/experienceDetail/[query]', params: {query: "2"}})} style={styles.cardContent}>
                                    <View style={styles.propertyInfo}>
                                        <ThemedText type='defaultSemiBold' style={styles.propertyTitle}>Room in {item?.address?.city|| 'USA'}</ThemedText>
                                        <View style={styles.ratingContainer}>
                                            <MaterialCommunityIcons name='star' color={theme.colors.warning} size={16}/>
                                            <ThemedText type='body' style={styles.ratingText}>4.8 (6)</ThemedText>
                                        </View>
                                    </View>
                                    
                                    <View style={styles.locationContainer}>
                                        <MaterialCommunityIcons name='map-marker' color={theme.colors.textSecondary} size={16} />
                                        {/* <ThemedText type="caption" secondary>Beach getaway in {item.address?.country}</ThemedText> */}
                                        <ThemedText type="caption" secondary>Beach getaway in Ton Fug</ThemedText>
                                    </View>
                                    
                                    <View style={styles.priceContainer}>
                                        <ThemedText type='defaultSemiBold' style={styles.priceText}>${item?.price || 90} USD / night</ThemedText>
                                    </View>
                                </Pressable>
                            </Card>
          ), [theme]
    )

    const reset = () => {
        setType('all')
        setPropertyType('all')
        setSort('')
    }
  return (
    <ThemedView style={{paddingTop: 60,}}>
        <View style={{paddingBottom: 10, paddingHorizontal:20, justifyContent: 'space-between', flexDirection: 'row', }}>
            <View>
                <Text style={{fontSize: 26, fontWeight: 'bold', color: theme.colors.text}} >Saved</Text>
            </View>
            <View style={{flexDirection: 'row', gap:8, alignItems:'center'}}>
                {/* {true ? 
                 <View style={{backgroundColor: theme.colors.backgroundSec, padding: 10, borderRadius: '50%', alignItems:'center', justifyContent: 'center'}}>
                    <Entypo name='grid' size={24} color={theme.colors.text} /> 
                 </View> 
                 : <View style={{backgroundColor: theme.colors.backgroundSec, padding: 10, borderRadius: '50%', alignItems:'center', justifyContent: 'center'}}>
                    <Entypo name='list' size={24} color={theme.colors.text} /> 
                 </View>
                } */}
                {/* not assigned */}

                <TouchableOpacity onPress={() => router.push('/wishlists/playlist')} style={{backgroundColor: theme.colors.background2, padding: 10, borderRadius: '50%', alignItems:'center', justifyContent: 'center'}}>
                    <Ionicons name='folder' size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setModalVisible(true)} style={{backgroundColor: theme.colors.background2, padding: 10, borderRadius: '50%', alignItems:'center', justifyContent: 'center'}}>
                    <Ionicons name='options-outline' size={24} color={theme.colors.text} />
                    <DraggableModal isVisible={isModalVisible} onClose={() => setModalVisible(false)} height={height * 0.7}>
                        <View style={{flex: 1, gap: 10, padding: 20}} >
                            <ThemedText type='title'> Type</ThemedText>
                            <View style={{flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', }}>
                                <Pressable style={{borderWidth: 1, borderColor: type == 'properties'? theme.colors.accent : theme.colors.border, padding: 15, borderRadius: 20, flexDirection: 'row', alignItems: 'center',gap: 5}}
                                  onPress={() => {
                                    if(type == 'properties') {
                                        setType('all')
                                    } else setType('properties')
                                  }}
                                >
                                    <FontAwesome5 name='home' size={24} color={true ? theme.colors.primary : theme.colors.text} />
                                    <ThemedText>Properties</ThemedText>
                                </Pressable>
                                <Pressable style={{borderWidth: 1, borderColor: type == 'experiences'? theme.colors.accent : theme.colors.border, padding: 15, borderRadius: 20, flexDirection: 'row', alignItems: 'center',gap: 5}}
                                  onPress={() => {
                                    if(type == 'experiences') {
                                        setType('all')
                                    } else setType('experiences')
                                  }}
                                >
                                    <FontAwesome5 name='star' size={24} color={true ? theme.colors.primary : theme.colors.text} />
                                    <ThemedText>Experiences</ThemedText>
                                </Pressable>
                            </View>

                            {type === 'properties' && <View style={[styles.tabBar2, {backgroundColor: theme.mode == 'light' ? '#e8e8e8': theme.colors.background2,}]}>
                                <Pressable onPress={() => setPropertyType('rent')} style={[styles.tabItem2, {backgroundColor: propertyType === 'rent' ? theme.colors.backgroundSec: 'transparent'}]}>
                                  <ThemedText>Rent</ThemedText>
                                </Pressable>
                                <Pressable onPress={() => setPropertyType('sale')} style={[styles.tabItem2, {backgroundColor: propertyType === 'sale' ? theme.colors.backgroundSec: 'transparent'}]}>
                                  <ThemedText>Sale</ThemedText>
                                </Pressable>
                                <Pressable onPress={() => setPropertyType('sold')} style={[styles.tabItem2, {backgroundColor: propertyType === 'sold' ? theme.colors.backgroundSec: 'transparent'}]}>
                                  <ThemedText>Sold</ThemedText>
                                </Pressable>
                            </View>}
                            <Line style={{borderBottomWidth: 1, borderColor: theme.colors.border, marginVertical: 10}} />
                            <View>
                                <ThemedText type='title'> Sort</ThemedText>
                                {['Recent', 'Oldest', 'nom', 'Price (min)', 'Price (max)'].map((item, index) => (
                                    <TouchableOpacity onPress={() => setSort(item)} key={index} style={{borderBottomWidth: 1, borderColor: theme.colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10,}}>
                                        <ThemedText type='defaultSemiBold'> {item === 'nom'? 'Newest on market': item} </ThemedText>
                                        {sort == item && <Ionicons name='checkmark' color={theme.colors.text} size={20} />}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                        <TouchableOpacity style={{position: 'absolute', top:15, right: 15,}} onPress={reset}>
                            <Ionicons name='refresh-outline' color={theme.colors.text} style={{fontWeight: '900', fontSize: 30}} />
                        </TouchableOpacity>
                    </DraggableModal>
                    {/* <ThemedText style={{position: 'absolute', color: theme.colors.accent, fontWeight: '900', top:0, right: 5}} >1</ThemedText> */}
                </TouchableOpacity>
                <TouchableOpacity style={{backgroundColor: theme.colors.background2, padding: 10, borderRadius: '50%', alignItems:'center', justifyContent: 'center'}}>
                    <MaterialCommunityIcons name='bell-badge' size={24} color={theme.colors.text} />
                </TouchableOpacity>
                
            </View>
        </View>

        {/* <ContactListItem  /> */}

        <FlatList
            data={[1,2,3,4,5]}
            renderItem={renderItem}
            keyExtractor={(item) => item.toString()}
            ListEmptyComponent={() => (
                <View style={{marginTop: 40, gap:25}}>
                    <ThemedText type='defaultSemiBold'>
                        Log in to view saved items
                    </ThemedText>
                    <ThemedText secondary>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Hic vero perferendis optio, perspiciatis est fuga?</ThemedText>
                    <TouchableOpacity onPress={() => router.push('/(guest)/(auth)/auth_page')} style={{padding:20, backgroundColor: theme.colors.primary, width: 150, borderRadius:5}}>
                       <ThemedText>Log in</ThemedText>
                    </TouchableOpacity>
                </View>
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{paddingTop: 0, paddingBottom: 150, paddingHorizontal: 10}}
            ListFooterComponentStyle={{padding: 15}}
        />
    </ThemedView>
  )
}

const styles = StyleSheet.create({
    shadow: {
        shadowOffset: { width: 0, height: 1},
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 6,
    },
    tabBar2: {
        flexDirection:'row',
        borderRadius: 7,
        // marginBottom: 10,
        marginTop: 8,
        padding: 2
    },
    tabItem2: {padding: 5, flex:1, justifyContent: 'center', alignItems: 'center', borderRadius: 7},
    propertyCard: {
    marginBottom: 8,
    padding: 10,
    borderRadius: 16,
    // overflow: 'hidden',
  },
  cardTitle: {
    fontSize: 16,
    marginBottom: 12,
  },
  imageContainer: {
    marginBottom: 12,
    borderRadius: 12,
    flex: 1,
    // backgroundColor: 'red',
    overflow: 'hidden',
  },
  cardContent: {
    gap: 8,
  },
  propertyInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  propertyTitle: {
    fontSize: 16,
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  priceContainer: {
    alignItems: 'flex-start',
  },
  priceText: {
    fontSize: 16,
    fontWeight: '600',
  },
})