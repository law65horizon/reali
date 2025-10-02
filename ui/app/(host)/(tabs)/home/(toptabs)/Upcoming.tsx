import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTheme } from '@/theme/theme';
// import { Image } from 'expo-image';
import { ThemedView } from '@/components/ThemedView';
import { Entypo } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import React, { useContext, useState } from 'react';
import { Dimensions, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HideIconContext } from './HideIconContext';

export default function Upcoming() {
  const { theme } = useTheme();
  const { width: screenWidth, height } = Dimensions.get('screen');
  const insets = useSafeAreaInsets(); // Get safe area insets
  const [headerHeight, setHeaderHeight] = useState(0); // Dynamic header height

  const data = [
  {
    title: 'USA',
    data: [
      { id: '1', name: 'Cozy Cabin', image: 'https://example.com/cabin.jpg' },
      { id: '2', name: 'Beach House', image: 'https://example.com/beach.jpg' },
      { id: '3', name: 'Beach House', image: 'https://example.com/beach.jpg' },
      { id: '4', name: 'Beach House', image: 'https://example.com/beach.jpg' },
      { id: '5', name: 'Beach House', image: 'https://example.com/beach.jpg' },
      { id: '6', name: 'Beach House', image: 'https://example.com/beach.jpg' },
    ],
  },
  {
    title: 'France',
    data: [
      { id: '1', name: 'Cozy Cabin', image: 'https://example.com/cabin.jpg' },
      { id: '2', name: 'Beach House', image: 'https://example.com/beach.jpg' },
      { id: '3', name: 'Beach House', image: 'https://example.com/beach.jpg' },
      { id: '4', name: 'Beach House', image: 'https://example.com/beach.jpg' },
      { id: '5', name: 'Beach House', image: 'https://example.com/beach.jpg' },
      { id: '6', name: 'Beach House', image: 'https://example.com/beach.jpg' },
    ],
  },
  {
    title: 'Germany',
    data: [
      { id: '1', name: 'Cozy Cabin', image: 'https://example.com/cabin.jpg' },
      { id: '2', name: 'Beach House', image: 'https://example.com/beach.jpg' },
      { id: '3', name: 'Beach House', image: 'https://example.com/beach.jpg' },
      { id: '4', name: 'Beach House', image: 'https://example.com/beach.jpg' },
      { id: '5', name: 'Beach House', image: 'https://example.com/beach.jpg' },
      { id: '6', name: 'Beach House', image: 'https://example.com/beach.jpg' },
    ],
  },
  {
    title: 'Italy',
    data: [
      { id: '1', name: 'Cozy Cabin', image: 'https://example.com/cabin.jpg' },
      { id: '2', name: 'Beach House', image: 'https://example.com/beach.jpg' },
      { id: '3', name: 'Beach House', image: 'https://example.com/beach.jpg' },
      { id: '4', name: 'Beach House', image: 'https://example.com/beach.jpg' },
      { id: '5', name: 'Beach House', image: 'https://example.com/beach.jpg' },
      { id: '6', name: 'Beach House', image: 'https://example.com/beach.jpg' },
    ],
  },
  {
    title: 'Rome',
    data: [
      { id: '1', name: 'Cozy Cabin', image: 'https://example.com/cabin.jpg' },
      { id: '2', name: 'Beach House', image: 'https://example.com/beach.jpg' },
      { id: '3', name: 'Beach House', image: 'https://example.com/beach.jpg' },
      { id: '4', name: 'Beach House', image: 'https://example.com/beach.jpg' },
      { id: '5', name: 'Beach House', image: 'https://example.com/beach.jpg' },
      { id: '6', name: 'Beach House', image: 'https://example.com/beach.jpg' },
    ],
  },
  
];

  const { setHideIcons } = useContext(HideIconContext);

  return (
      <ThemedView plain>
        <FlatList 
              data={data}
              renderItem={({item}) => (
                // <Link href={{
                //   pathname: '/(tabs)/home/[listing]',
                //   params: {listing: encodeURIComponent(title)}
                // }} asChild>
                <Link href={{
                  pathname: '/(host)/(tabs)/home/[listing]',
                  // pathname: '/(host)/(auth)/auth_form',
                  params: {listing: item.title}
                }} style={{width: '100%', }}>
                <View style={{gap: 10, width: '100%', paddingHorizontal: 20, paddingVertical: 20}}>
                  <View style={{position: 'relative', alignItems: 'center'}}>
                    <Image
                      source={require('@/assets/images/image.png')}
                      // borderRadius={20}
                      style={{width: '100%', height: 270, borderRadius: 20}}
                      contentFit='cover'
                    />
                    <View style={{position: 'absolute', top: 10, left: 10, flexDirection: 'row', alignItems: 'center', width: '90%', justifyContent: 'space-between'}}>
                      <Text style={{padding: 10, borderRadius: 20, backgroundColor: 'white', fontSize:10, fontWeight: 'bold'}}>
                        Guest Favourite
                      </Text>
                      <IconSymbol name='heart' style={{fontWeight: 'bold'}} size={30} color='white' />
                    </View>
                  </View>
                  <View>
                    <ThemedText style={{fontWeight: '600', fontSize: 13}}>
                      Room in {item.title}
                    </ThemedText>
                    <ThemedText secondary style={{fontSize: 13}}>22-24 Aug</ThemedText>
                    <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                      <ThemedText secondary style={{fontSize: 13}}>$163 for 2 nights</ThemedText>
                      <View style={{flexDirection: 'row', alignItems: 'center', gap: 4, paddingRight:10}}>
                        <IconSymbol name={'person'} size={15} color={theme.colors.text} />
                        <ThemedText secondary style={{fontSize: 15}}>4</ThemedText>
                      </View>
                    </View>
                  </View>
                </View>
                </Link>
              )}
              ListHeaderComponent={() => (
                <View style={{flex: 1, justifyContent: 'flex-end', gap: 10, flexDirection: 'row', paddingTop: 10, marginRight: 20}}>
                  <Pressable style={{backgroundColor: theme.colors.text, padding:10, borderRadius: '50%', justifyContent: 'center', alignItems: 'center'}}>
                    <Entypo name='magnifying-glass' size={24} color={theme.colors.background} />
                  </Pressable>
                  <Pressable style={{backgroundColor: theme.colors.text, padding:10, borderRadius: '50%', justifyContent: 'center', alignItems: 'center'}}>
                    {true ? <Entypo name='grid' size={24} color={theme.colors.background} /> : <Entypo name='list' size={24} color={theme.colors.background} />}
                  </Pressable>
                </View> 
              )}
              ItemSeparatorComponent={() => (
                <View style={{width: 10}}></View>
              )}
              contentContainerStyle={{paddingBottom: 60}}
              showsHorizontalScrollIndicator={false}
            />
      </ThemedView>
    )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 8
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5
    // borderBottomWidth: 1,
    // borderBottomColor: '#e0e0e0',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1},
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 28,
    // paddingHorizontal: 12,
    height: '100%',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
    backgroundColor: 'transparent',
  },
  filterContainer: {
    width: 48,
    height: 48,
    borderWidth: 1,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  carouselContainer: {
    marginTop: 12,
    marginBottom: 16,
  },
  carouselContent: {
    // paddingHorizontal: 8,
  },
  carouselItem: {
    width: 100,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  carouselText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  flatList: {
    flex: 1,
  },
  cardContainer: {
    marginVertical: 8,
  },
  card: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 200,
  },
  cardOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    // paddingHorizontal: 8,
    paddingVertical: 4,
  },
  cardOverlayText: {
    fontSize: 14,
    fontWeight: '600',
  },
  cardDetails: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});