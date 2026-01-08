import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTheme } from '@/theme/theme';
// import { Image } from 'expo-image';
import { ThemedView } from '@/components/ThemedView';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import React, { useCallback, useContext, useState } from 'react';
import { Dimensions, FlatList, NativeScrollEvent, NativeSyntheticEvent, Pressable, SectionList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HideIconContext } from './HideIconContext';

export default function ServicesTab() {
  const { theme } = useTheme();
  const { width: screenWidth } = Dimensions.get('window');
  const insets = useSafeAreaInsets(); // Get safe area insets
  const [headerHeight, setHeaderHeight] = useState(0); // Dynamic header height

  const data = [
  {
    title: 'Cleaning and Housekeeping',
    data: [
      { id: '1', name: 'Residential Cleaning', price: 100, location: 'Citywide', tag: 'Popular', image: 'https://example.com/cleaning.jpg' },
      { id: '2', name: 'Move-In/Move-Out Cleaning', price: 150, location: 'Suburbs', image: 'https://example.com/moveout.jpg' },
      { id: '3', name: 'Carpet Cleaning', price: 80, location: 'Downtown', tag: 'Eco-Friendly', image: 'https://example.com/carpet.jpg' },
      { id: '4', name: 'Window Cleaning', price: 60, location: 'Citywide', image: 'https://example.com/window.jpg' },
      { id: '5', name: 'Air Duct Cleaning', price: 200, location: 'Suburbs', image: 'https://example.com/airduct.jpg' },
      { id: '6', name: 'Disinfection and Sanitization', price: 120, location: 'Downtown', tag: 'Health', image: 'https://example.com/sanitize.jpg' },
    ],
  },
  {
    title: 'Maintenance and Repair',
    data: [
      { id: '1', name: 'Plumbing Services', price: 90, location: 'Citywide', image: 'https://example.com/plumbing.jpg' },
      { id: '2', name: 'Electrical Services', price: 110, location: 'Downtown', tag: 'Emergency', image: 'https://example.com/electrical.jpg' },
      { id: '3', name: 'HVAC Services', price: 150, location: 'Suburbs', image: 'https://example.com/hvac.jpg' },
      { id: '4', name: 'Painting Services', price: 200, location: 'Citywide', image: 'https://example.com/painting.jpg' },
      { id: '5', name: 'Locksmith Services', price: 70, location: 'Downtown', tag: '24/7', image: 'https://example.com/locksmith.jpg' },
      { id: '6', name: 'Roofing Services', price: 300, location: 'Suburbs', image: 'https://example.com/roofing.jpg' },
    ],
  },
  {
    title: 'Landscaping and Outdoor',
    data: [
      { id: '1', name: 'Lawn Care', price: 50, location: 'Suburbs', tag: 'Weekly', image: 'https://example.com/lawncare.jpg' },
      { id: '2', name: 'Tree Trimming', price: 120, location: 'Citywide', image: 'https://example.com/treetrim.jpg' },
      { id: '3', name: 'Pool Cleaning', price: 100, location: 'Downtown', image: 'https://example.com/pool.jpg' },
      { id: '4', name: 'Snow Removal', price: 80, location: 'Suburbs', tag: 'Seasonal', image: 'https://example.com/snowremoval.jpg' },
      { id: '5', name: 'Fence Installation', price: 250, location: 'Citywide', image: 'https://example.com/fence.jpg' },
      { id: '6', name: 'Outdoor Lighting', price: 150, location: 'Downtown', image: 'https://example.com/outdoorlight.jpg' },
    ],
  },
  {
    title: 'Specialized and Lifestyle',
    data: [
      { id: '1', name: 'Interior Design', price: 500, location: 'Citywide', tag: 'Luxury', image: 'https://example.com/interiordesign.jpg' },
      { id: '2', name: 'Home Staging', price: 300, location: 'Downtown', image: 'https://example.com/homestaging.jpg' },
      { id: '3', name: 'Smart Home Installation', price: 400, location: 'Suburbs', tag: 'Tech', image: 'https://example.com/smarthome.jpg' },
      { id: '4', name: 'Pest Control', price: 90, location: 'Citywide', image: 'https://example.com/pestcontrol.jpg' },
      { id: '5', name: 'Pet Care Services', price: 60, location: 'Downtown', image: 'https://example.com/petcare.jpg' },
      { id: '6', name: 'Home Organization', price: 120, location: 'Suburbs', tag: 'Declutter', image: 'https://example.com/organization.jpg' },
    ],
  },
  {
    title: 'Hospitality-Specific',
    data: [
      { id: '1', name: 'Room Service', price: 30, location: 'Downtown', image: 'https://example.com/roomservice.jpg' },
      { id: '2', name: 'Concierge Services', price: 50, location: 'Citywide', tag: 'Premium', image: 'https://example.com/concierge.jpg' },
      { id: '3', name: 'Valet Parking', price: 20, location: 'Downtown', image: 'https://example.com/valet.jpg' },
      { id: '4', name: 'Event Planning', price: 600, location: 'Citywide', image: 'https://example.com/eventplanning.jpg' },
      { id: '5', name: 'Laundry and Linen Services', price: 80, location: 'Downtown', image: 'https://example.com/laundry.jpg' },
      { id: '6', name: 'Shuttle Services', price: 100, location: 'Suburbs', tag: 'Transport', image: 'https://example.com/shuttle.jpg' },
    ],
  },
];


  const { setHideIcons } = useContext(HideIconContext);

  // On scroll, if y > 0 → hide icons; if y === 0 → show icons.
  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollY = e.nativeEvent.contentOffset.y;
    if (scrollY > 0) {
      setHideIcons(true);
    } else {
      setHideIcons(false);
    }
  }, [setHideIcons]);

  return (
    <ThemedView>
    <SectionList
       style={{marginTop: 20, backgroundColor: 'transparent', marginBottom: 20}}
       sections={data}
       onScroll={onScroll}
       keyExtractor={(item, index) => item.id + index}
       renderItem={({item}) => null}
       renderSectionHeader={({section: {title, data}}) => (
        <View>
          <View style={{paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 5}}>
            <Text style={[ {color: theme.colors.text, fontWeight: 'bold',fontSize: 18}]}>
              {title}
            </Text>
            <IconSymbol name='chevron.forward' style={{fontWeight: '900'}} size={18} color={theme.colors.text} />
          </View>
          <FlatList 
            data={data}
            renderItem={({item}) => (
              // <Link href={{
              //   pathname: '/(tabs)/home/[listing]',
              //   params: {listing: encodeURIComponent(title)}
              // }} asChild>
              <Link href={{
                // pathname: '/listing/[listing]',
                pathname: '/(guest)/(tabs)/home/[listing]',
                params: {listing: title}
              }} >
              <View style={{gap: 10}}>
                <View style={{position: 'relative'}}>
                  <Image
                    source={require('@/assets/images/image.png')}
                    // borderRadius={20}
                    style={{width: 170, height: 170, borderRadius: 20}}
                    contentFit='cover'
                  />
                  <View style={{position: 'absolute', top: 10, left: 10, flexDirection: 'row', alignItems: 'center', width: '90%', justifyContent: 'space-between'}}>
                    {item.tag && <Text style={{padding: 10, borderRadius: 20, backgroundColor: 'white', fontSize:10, fontWeight: 'bold'}}>
                      {item.tag}
                    </Text>}
                    <Pressable style={{alignItems: 'flex-end', flex: 1, paddingRight: item.tag ? 0: 10}}>
                      <IconSymbol name='heart' style={{fontWeight: 'bold'}} size={30} color='white' />
                    </Pressable>
                  </View>
                </View>
                <View style={{gap: 5}}>
                  <ThemedText style={{fontWeight: '600', fontSize: 13}}>
                     {item.name}
                  </ThemedText>
                  {/* <ThemedText secondary style={{fontSize: 13}}>22-24 Aug</ThemedText> */}
                  <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                    <ThemedText secondary style={{fontSize: 13}}>from ${item.price} </ThemedText>
                    <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
                      <IconSymbol name='star.fill' size={12} color={theme.colors.text} />
                      <ThemedText secondary style={{fontSize: 13}}>4.88</ThemedText>
                    </View>
                  </View>
                </View>
              </View>
              </Link>
            )}
            ItemSeparatorComponent={() => (
              <View style={{width: 10}}></View>
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>
       )}
       contentContainerStyle={{
          paddingTop: headerHeight - 70, // Fallback height
          paddingBottom: 32,
          paddingHorizontal: 16,
        }}
        ItemSeparatorComponent={() => (
          <View style={{height: 6}}></View>
        )}
        showsVerticalScrollIndicator={false}
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