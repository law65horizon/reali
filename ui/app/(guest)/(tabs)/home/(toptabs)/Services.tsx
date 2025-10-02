// import { ThemedText } from '@/components/ThemedText';
// import { ThemedView } from '@/components/ThemedView';
// import Card from '@/components/ui/Card';
// import { IconSymbol } from '@/components/ui/IconSymbol';
// import { useProperties } from '@/hooks/useProperties';
// import { useTheme } from '@/theme/theme';
// import { Image } from 'expo-image';
// import { Link } from 'expo-router';
// import React, { useCallback, useContext } from 'react';
// import { FlatList, NativeScrollEvent, NativeSyntheticEvent, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import { HideIconContext } from './HideIconContext';

// const EXPERIENCES_DATA = [
//   {
//     title: 'USA',
//     data: [
//       { id: '1', name: 'Cozy Cabin', price: 50, location: 'New York', tag: 'jsi', image: 'https://example.com/cabin.jpg' },
//       { id: '2', name: 'Beach House', price: 50, location: 'New York', image: 'https://example.com/beach.jpg' },
//       { id: '3', name: 'Beach House', price: 50, location: 'New York', image: 'https://example.com/beach.jpg' },
//     ],
//   },
//   {
//     title: 'France',
//     data: [
//       { id: '1', name: 'Cozy Cabin', price: 50, location: 'Paris', tag: 'beach', image: 'https://example.com/cabin.jpg' },
//       { id: '2', name: 'Beach House', price: 50, location: 'Paris', tag: 'beach', image: 'https://example.com/beach.jpg' },
//       { id: '3', name: 'Beach House', price: 50, location: 'Paris', tag: 'beach', image: 'https://example.com/beach.jpg' },
//     ],
//   },
//   {
//     title: 'Spain',
//     data: [
//       { id: '1', name: 'Cozy Cabin', price: 50, location: 'Paris', tag: 'beach', image: 'https://example.com/cabin.jpg' },
//       { id: '2', name: 'Beach House', price: 50, location: 'Paris', tag: 'beach', image: 'https://example.com/beach.jpg' },
//       { id: '3', name: 'Beach House', price: 50, location: 'Paris', tag: 'beach', image: 'https://example.com/beach.jpg' },
//     ],
//   },
// ];

// function ExperiencesTab() {
//   const { theme } = useTheme();
//   const insets = useSafeAreaInsets();
//   const { setHideIcons } = useContext(HideIconContext);
//   const { properties } = useProperties();

//   const onScroll = useCallback(
//     (e: NativeSyntheticEvent<NativeScrollEvent>) => {
//       setHideIcons(e.nativeEvent.contentOffset.y > 0);
//     },
//     [setHideIcons]
//   );

//   const renderExperienceItem = useCallback(
//     ({ item, index, section }: { item: any; index: number; section: { title: string } }) => (
//       <Link
//         href={{
//           pathname: '/(guest)/(tabs)/home/listing/[listing]',
//           params: { listing: section.title },
//         }}
//         asChild
//       >
//         <View style={{ marginLeft: index === 0 ? 16 : 0 }}>
//           <Card style={styles.propertyCard} elevated>
//             <View style={styles.imageContainer}>
//               <Image
//                 source={{
//                   uri: properties?.[8]?.images?.[2]?.image_url || 'https://via.placeholder.com/170x140.png?text=Property',
//                 }}
//                 style={styles.propertyImage}
//                 contentFit="cover"
//                 cachePolicy="disk"
//                 priority="normal"
//                 transition={200}
//               />
//               <View style={styles.imageOverlay}>
//                 {item.tag?.length > 3 && (
//                   <View style={styles.badgeContainer}>
//                     <ThemedText style={styles.badgeText}>{item.tag}</ThemedText>
//                   </View>
//                 )}
//                 <Pressable style={styles.heartButton} onPress={() => {}}>
//                   <IconSymbol name="heart" style={styles.heartIcon} size={24} color="white" />
//                 </Pressable>
//               </View>
//             </View>
//             <View style={styles.propertyDetails}>
//               <ThemedText type="defaultSemiBold" style={styles.propertyTitle}>
//                 {item.name}
//               </ThemedText>
//               <ThemedText type="caption" secondary>{item.location}</ThemedText>
//               <View style={styles.propertyFooter}>
//                 <ThemedText type="caption" secondary>from ${item.price}</ThemedText>
//                 <View style={styles.ratingContainer}>
//                   <IconSymbol name="star.fill" size={12} color={theme.colors.warning} />
//                   <ThemedText type="caption" secondary>4.88</ThemedText>
//                 </View>
//               </View>
//             </View>
//           </Card>
//         </View>
//       </Link>
//     ),
//     [theme.colors.warning, properties]
//   );

//   return (
//     <ThemedView plain style={styles.container}>
//       <ScrollView onScroll={onScroll} scrollEventThrottle={16} showsVerticalScrollIndicator={false}>
//         <ThemedText type="subtitle" style={styles.subtitle}>
//           Popular with travellers in your areas
//         </ThemedText>
//         <FlatList
//           data={EXPERIENCES_DATA}
//           scrollEnabled={false}
//           renderItem={({ item }) => (
//             <View>
//               <View style={styles.sectionHeader}>
//                 <Text style={[styles.sectionHeaderText, { color: theme.colors.text }]}>
//                   Experiences in {item.title}
//                 </Text>
//                 <IconSymbol name="chevron.forward" style={styles.chevron} size={18} color={theme.colors.text} />
//               </View>
//               <FlatList
//                 data={item.data}
//                 renderItem={({ item: experience, index }) => renderExperienceItem({ item: experience, index, section: item })}
//                 horizontal
//                 showsHorizontalScrollIndicator={false}
//                 initialNumToRender={3}
//                 maxToRenderPerBatch={3}
//                 windowSize={5}
//                 getItemLayout={(data, index) => ({
//                   length: 170,
//                   offset: 170 * index,
//                   index,
//                 })}
//               />
//             </View>
//           )}
//           contentContainerStyle={[styles.flatListContent, { paddingTop: 10}]}
//           // contentContainerStyle={[styles.flatListContent, { paddingTop: insets.top }]}
//           ItemSeparatorComponent={() => <View style={styles.separator} />}
//         />
//       </ScrollView>
//     </ThemedView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, paddingHorizontal: 0 },
//   subtitle: { marginTop: 10, paddingHorizontal: 16 },
//   flatListContent: { paddingBottom: 100 },
//   separator: { height: 3 },
//   sectionHeader: { paddingVertical: 10, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 5 },
//   sectionHeaderText: { fontWeight: 'bold', fontSize: 16 },
//   chevron: { fontWeight: '900' },
//   propertyCard: { width: 170, marginRight: 12,padding:0, borderRadius: 16, overflow: 'hidden' },
//   imageContainer: { position: 'relative', marginBottom: 8 },
//   propertyImage: { width: '100%', height: 140, borderRadius: 12 },
//   imageOverlay: { position: 'absolute', top: 8, left: 8, right: 8, flexDirection: 'row', justifyContent: 'space-between' },
//   badgeContainer: { backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4 },
//   badgeText: { fontSize: 10, fontWeight: '600', color: '#000' },
//   heartButton: { padding: 4 },
//   heartIcon: { fontWeight: 'bold' },
//   propertyDetails: { gap: 0, paddingHorizontal: 8, paddingBottom: 8 },
//   propertyTitle: { fontSize: 13, lineHeight: 18 },
//   propertyFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
//   ratingContainer: { flexDirection: 'row', gap: 2 },
// });

// export default ExperiencesTab;

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import Card from '@/components/ui/Card';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useProperties } from '@/hooks/useProperties';
import { useTheme } from '@/theme/theme';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import React, { memo, useCallback, useContext } from 'react';
import { FlatList, NativeScrollEvent, NativeSyntheticEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HideIconContext } from './HideIconContext';

const SERVICES_DATA = [
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

const flattenData = (data:any) => {
  return data.reduce((acc:any, section:any) => {
    return [...acc, { type: 'header', title: section.title }, { type: 'items', data: section.data, title: section.title }];
  }, []);
};

const ExperienceItem = memo(({ item, index, section, theme }:any) => (
  <Link
    href={{
      pathname: '/(guest)/(modals)/listing/[listing]',
      params: { listing: section.title },
    }}
    asChild
  >
    <View style={{ marginLeft: index === 0 ? 16 : 0 }}>
      <Card style={styles.propertyCard} elevated>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: 'https://res.cloudinary.com/dajzo2zpq/image/upload/w_300,h_200/v1752247182/properties/wlf2uijbultztvqptnka.jpg' }}
            // source={{ uri: item.image || 'https://via.placeholder.com/170x140.png?text=Property' }}
            style={styles.propertyImage}
            contentFit="cover"
            cachePolicy="disk"
            priority="normal"
            transition={200}
          />
          <View style={styles.imageOverlay}>
            {item.tag?.length > 3 && (
              <View style={styles.badgeContainer}>
                <ThemedText style={styles.badgeText}>{item.tag}</ThemedText>
              </View>
            )}
            <Pressable style={styles.heartButton} onPress={() => {}}>
              <IconSymbol name="heart" style={styles.heartIcon} size={24} color="white" />
            </Pressable>
          </View>
        </View>
        <View style={styles.propertyDetails}>
          <ThemedText type="defaultSemiBold" style={styles.propertyTitle}>
            {item.name}
          </ThemedText>
          <ThemedText type="caption" secondary>{item.location}</ThemedText>
          <View style={styles.propertyFooter}>
            <ThemedText type="caption" secondary>from ${item.price}</ThemedText>
            <View style={styles.ratingContainer}>
              <IconSymbol name="star.fill" size={12} color={theme.colors.warning} />
              <ThemedText type="caption" secondary>4.88</ThemedText>
            </View>
          </View>
        </View>
      </Card>
    </View>
  </Link>
));

function ServicesTab() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { setHideIcons } = useContext(HideIconContext);
  const { properties } = useProperties();

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      setHideIcons(e.nativeEvent.contentOffset.y > 0);
    },
    [setHideIcons]
  );

  const renderItem = useCallback(
      ({ item, index }:any) => {
        if (item.type === 'header') {
          return (
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionHeaderText, { color: theme.colors.text }]}>
                Experiences in {item.title}
              </Text>
              <IconSymbol name="chevron.forward" style={styles.chevron} size={18} color={theme.colors.text} />
            </View>
          );
        } else {
          return (
            <FlatList
              data={item.data}
              renderItem={({ item: experience, index }) => (
                <ExperienceItem item={experience} index={index} section={item} theme={theme} />
              )}
              horizontal
              showsHorizontalScrollIndicator={false}
              initialNumToRender={3}
              maxToRenderPerBatch={3}
              windowSize={3}
              getItemLayout={(data, index) => ({
                length: 170,
                offset: 170 * index,
                index,
              })}
            />
          );
        }
      },
      [theme]
    );
  
  const getItemLayout = useCallback(
      (data:any, index: any) => {
        const isHeader = data[index].type === 'header';
        return {
          length: isHeader ? 48 : 180, // Approximate height for headers and items
          offset: data.slice(0, index).reduce((sum:any, item:any) => sum + (item.type === 'header' ? 48 : 180), 0),
          index,
        };
      },
      []
    );
  

  return (
      <ThemedView style={styles.container}>
        <FlatList
          data={flattenData(SERVICES_DATA)}
          renderItem={renderItem}
          onScroll={onScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          initialNumToRender={5}
          maxToRenderPerBatch={5}
          windowSize={3}
          getItemLayout={getItemLayout}
          contentContainerStyle={[styles.flatListContent, { paddingTop: 10 }]}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </ThemedView>
    );

  // return (
  //   // <ThemedView style={styles.container}>
  //     <ScrollView style={[styles.container, {backgroundColor: theme.colors.background}]} onScroll={onScroll} scrollEventThrottle={16} showsVerticalScrollIndicator={false}>
  //       <ThemedText type="subtitle" style={styles.subtitle}>
  //         Popular with travellers in your areas
  //       </ThemedText>
  //       <FlatList
  //         data={SERVICES_DATA}
  //         scrollEnabled={false}
  //         renderItem={({ item }) => (
  //           <View>
  //             <View style={styles.sectionHeader}>
  //               <Text style={[styles.sectionHeaderText, { color: theme.colors.text }]}>
  //                 Experiences in {item.title}
  //               </Text>
  //               <IconSymbol name="chevron.forward" style={styles.chevron} size={18} color={theme.colors.text} />
  //             </View>
  //             <FlatList
  //               data={item.data}
  //               renderItem={({ item: experience, index }) => renderExperienceItem({ item: experience, index, section: item })}
  //               horizontal
  //               showsHorizontalScrollIndicator={false}
  //               initialNumToRender={3}
  //               maxToRenderPerBatch={3}
  //               windowSize={5}
  //               getItemLayout={(data, index) => ({
  //                 length: 170,
  //                 offset: 170 * index,
  //                 index,
  //               })}
  //             />
  //           </View>
  //         )}
  //         contentContainerStyle={[styles.flatListContent, { paddingTop: 10 }]}
  //         ItemSeparatorComponent={() => <View style={styles.separator} />}
  //       />
  //     </ScrollView>
  //   // </ThemedView> 
  // );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 0 },
  subtitle: { marginTop: 10, paddingHorizontal: 16 },
  flatListContent: { paddingBottom: 100 },
  separator: { height: 3 },
  sectionHeader: { paddingVertical: 10, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 5 },
  sectionHeaderText: { fontWeight: 'bold', fontSize: 16 },
  chevron: { fontWeight: '900' },
  propertyCard: { width: 170, padding:0, marginRight: 12, borderRadius: 16, overflow: 'hidden' },
  imageContainer: { position: 'relative', marginBottom: 8 },
  propertyImage: { width: '100%', height: 140, borderRadius: 12 },
  imageOverlay: { position: 'absolute', top: 8, left: 8, right: 8, flexDirection: 'row', justifyContent: 'space-between' },
  badgeContainer: { backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4 },
  badgeText: { fontSize: 10, fontWeight: '600', color: '#000' },
  heartButton: { padding: 4 },
  heartIcon: { fontWeight: 'bold' },
  propertyDetails: { gap: 0, paddingHorizontal: 8, paddingBottom: 8 },
  propertyTitle: { fontSize: 13, lineHeight: 18 },
  propertyFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  ratingContainer: { flexDirection: 'row', gap: 2 },
});

export default ServicesTab;