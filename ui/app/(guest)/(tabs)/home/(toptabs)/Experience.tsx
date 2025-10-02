import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import Card from '@/components/ui/Card';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useSectionedExperiences } from '@/hooks/useExperience';
import { useTheme } from '@/theme/theme';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { memo, useCallback, useContext } from 'react';
import { ActivityIndicator, Dimensions, FlatList, NativeScrollEvent, NativeSyntheticEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HideIconContext } from './HideIconContext';

const { width } = Dimensions.get('window');

const ExperienceItem = memo(({ item, index, section, theme }: any) => (
  // <Link
  //   href={{
  //     pathname: '/(guest)/(modals)/listing/[listing]',
  //     params: { listing: item.id }, // Use experience ID
  //   }}
  //   asChild
  // >
    <View style={{ marginLeft: index === 0 ? 16 : 0 }}>
      <Card style={styles.propertyCard} elevated onPress={() => router.push(`/listing/${item.id}`)}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: 'https://res.cloudinary.com/dajzo2zpq/image/upload/w_300,h_200/v1752247182/properties/wlf2uijbultztvqptnka.jpg' }}
            style={styles.propertyImage}
            contentFit="cover"
            cachePolicy="disk"
            priority="normal"
            transition={200}
          />
          <View style={styles.imageOverlay}>
            {item.tag?.length > 3 && (
              <View style={styles.badgeContainer}>
                <ThemedText  style={styles.badgeText}>{item.tag}</ThemedText>
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
              <ThemedText type="caption" secondary>{item.rating}</ThemedText>
            </View>
          </View>
        </View>
      </Card>
    </View>
  // </Link> 
));

function ExperiencesTab() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { setHideIcons } = useContext(HideIconContext);
  const { sections, loading, error, loadMore, hasNextPage, networkStatus } = useSectionedExperiences();

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      setHideIcons(e.nativeEvent.contentOffset.y > 0);
    },
    [setHideIcons]
  );

  const renderItem = useCallback(
    ({ item, index }: any) => {
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
            keyExtractor={(item, index) => item.id ? String(item.id) : `item-${index}`}
          />
        );
      }
    },
    [theme]
  );

  const renderFooter = useCallback(() => {
    if (!hasNextPage) return null;
    return (
      <View style={styles.footer}>
        {(loading || networkStatus === 3) && <ActivityIndicator size="large" color={theme.colors.text} />}
      </View>
    );
  }, [loading, hasNextPage, theme.colors.text, networkStatus]);

  const getItemLayout = useCallback(
    (data: any, index: number) => {
      const isHeader = data[index]?.type === 'header';
      return {
        length: isHeader ? 48 : 180,
        offset: data?.slice(0, index).reduce((sum: number, item: any) => sum + (item.type === 'header' ? 48 : 180), 0) || 0,
        index,
      };
    },
    []
  );

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="defaultSemiBold" style={{ color: 'red', textAlign: 'center', marginTop: 20 }}>
          Error: {error}
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { paddingTop: 10, backgroundColor: theme.colors.background }]}>
    {/* <ThemedView style={[styles.container, { paddingTop: insets.top }]}> */}
      <FlatList
        data={sections.length ? flattenData(sections) : []}
        renderItem={renderItem}
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        windowSize={3}
        getItemLayout={getItemLayout}
        contentContainerStyle={[styles.flatListContent, { paddingBottom: insets.bottom + 100 }]}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={() => (
          <ActivityIndicator style={{ flex: 1, marginTop: 50 }} size="large" color={theme.colors.text} animating={true} />
        )}
        ListFooterComponent={renderFooter}
        onEndReached={() => hasNextPage && loadMore()}
        onEndReachedThreshold={0.5}
        keyExtractor={(item, index) => item.type === 'header' ? `header-${item.title}` : `items-${item.title}`}
      />
    </ThemedView>
  );
}

const flattenData = (data: any) =>
  data.reduce((acc: any, section: any) => {
    return [...acc, { type: 'header', title: section.title }, { type: 'items', data: section.data, title: section.title }];
  }, []);

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 0 },
  flatListContent: { paddingBottom: 100 },
  separator: { height: 3 },
  sectionHeader: { paddingVertical: 10, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 5 },
  sectionHeaderText: { fontWeight: 'bold', fontSize: 16 },
  chevron: { fontWeight: '900' },
  propertyCard: { width: 170, padding: 0, marginRight: 12, borderRadius: 16, overflow: 'hidden' },
  imageContainer: { position: 'relative', marginBottom: 8 },
  propertyImage: { width: '100%', height: 140, borderRadius: 12 },
  imageOverlay: { position: 'absolute', top: 8, left: 8, right: 8, flexDirection: 'row', justifyContent: 'space-between' },
  // badgeContainer: { backgroundColor: 'red', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4 },
  badgeContainer: { backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4,  height: 25 },
  badgeText: { fontSize: 11, fontWeight: 'bold', color: '#000' },
  heartButton: { padding: 4 },
  heartIcon: { fontWeight: 'bold' },
  propertyDetails: { gap: 0, paddingHorizontal: 8, paddingBottom: 8 },
  propertyTitle: { fontSize: 13, lineHeight: 18 },
  propertyFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  ratingContainer: { flexDirection: 'row', gap: 2 },
  footer: { padding: 20, alignItems: 'center' },
});

export default ExperiencesTab;

// import { ThemedText } from '@/components/ThemedText';
// import { ThemedView } from '@/components/ThemedView';
// import Card from '@/components/ui/Card';
// import { IconSymbol } from '@/components/ui/IconSymbol';
// import { useTheme } from '@/theme/theme';
// import { Image } from 'expo-image';
// import { Link } from 'expo-router';
// import React, { memo, useCallback, useContext } from 'react';
// import { FlatList, NativeScrollEvent, NativeSyntheticEvent, Pressable, StyleSheet, Text, View } from 'react-native';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import { HideIconContext } from './HideIconContext';

// // Sample data structure (replace with your actual data)
// const EXPERIENCES_DATA = [
//   {
//     title: 'USA',
//     data: [
//       { id: '1', name: 'Cozy Cabin', price: 50, location: 'New York', tag: 'jsi', image: 'https://example.com/cabin.jpg' },
//       { id: '2', name: 'Beach House', price: 50, location: 'New York', image: 'https://example.com/beach.jpg' },
//       { id: '3', name: 'Beach House', price: 50, location: 'New York', image: 'https://example.com/beach.jpg' },
//       { id: '4', name: 'Beach House', price: 50, location: 'New York', image: 'https://example.com/beach.jpg' },
//       { id: '5', name: 'Beach House', price: 50, location: 'New York', image: 'https://example.com/beach.jpg' },
//       { id: '6', name: 'Beach House', price: 50, location: 'New York', image: 'https://example.com/beach.jpg' },
//       { id: '7', name: 'Beach House', price: 50, location: 'New York', image: 'https://example.com/beach.jpg' },
//       { id: '8', name: 'Beach House', price: 50, location: 'New York', image: 'https://example.com/beach.jpg' },
//     ],
//   },
//   {
//     title: 'France',
//     data: [
//       { id: '1', name: 'Cozy Cabin', price: 50, location: 'Paris', tag: 'beach', image: 'https://example.com/cabin.jpg' },
//       { id: '2', name: 'Beach House', price: 50, location: 'Paris', tag: 'beach', image: 'https://example.com/beach.jpg' },
//       { id: '3', name: 'Beach House', price: 50, location: 'New York', image: 'https://example.com/beach.jpg' },
//       { id: '4', name: 'Beach House', price: 50, location: 'New York', image: 'https://example.com/beach.jpg' },
//       { id: '5', name: 'Beach House', price: 50, location: 'New York', image: 'https://example.com/beach.jpg' },
//       { id: '6', name: 'Beach House', price: 50, location: 'New York', image: 'https://example.com/beach.jpg' },
//       { id: '7', name: 'Beach House', price: 50, location: 'New York', image: 'https://example.com/beach.jpg' },
//       { id: '8', name: 'Beach House', price: 50, location: 'New York', image: 'https://example.com/beach.jpg' },
//     ],
//   },
//   {
//     title: 'Spain',
//     data: [
//       { id: '1', name: 'Cozy Cabin', price: 50, location: 'Paris', tag: 'beach', image: 'https://example.com/cabin.jpg' },
//       { id: '2', name: 'Beach House', price: 50, location: 'Paris', tag: 'beach', image: 'https://example.com/beach.jpg' },
//       { id: '3', name: 'Beach House', price: 50, location: 'New York', image: 'https://example.com/beach.jpg' },
//       { id: '4', name: 'Beach House', price: 50, location: 'New York', image: 'https://example.com/beach.jpg' },
//       { id: '5', name: 'Beach House', price: 50, location: 'New York', image: 'https://example.com/beach.jpg' },
//       { id: '6', name: 'Beach House', price: 50, location: 'New York', image: 'https://example.com/beach.jpg' },
//       { id: '7', name: 'Beach House', price: 50, location: 'New York', image: 'https://example.com/beach.jpg' },
//       { id: '8', name: 'Beach House', price: 50, location: 'New York', image: 'https://example.com/beach.jpg' },
//     ],
//   },
//   {
//     title: 'Italy',
//     data: [
//       { id: '1', name: 'Cozy Cabin', price: 50, location: 'Paris', tag: 'beach', image: 'https://example.com/cabin.jpg' },
//       { id: '2', name: 'Beach House', price: 50, location: 'Paris', tag: 'beach', image: 'https://example.com/beach.jpg' },
//       { id: '3', name: 'Beach House', price: 50, location: 'New York', image: 'https://example.com/beach.jpg' },
//       { id: '4', name: 'Beach House', price: 50, location: 'New York', image: 'https://example.com/beach.jpg' },
//       { id: '5', name: 'Beach House', price: 50, location: 'New York', image: 'https://example.com/beach.jpg' },
//       { id: '6', name: 'Beach House', price: 50, location: 'New York', image: 'https://example.com/beach.jpg' },
//       { id: '7', name: 'Beach House', price: 50, location: 'New York', image: 'https://example.com/beach.jpg' },
//       { id: '8', name: 'Beach House', price: 50, location: 'New York', image: 'https://example.com/beach.jpg' },
//     ],
//   },
//   {
//     title: 'Gaye',
//     data: [
//       { id: '1', name: 'Cozy Cabin', price: 50, location: 'Paris', tag: 'beach', image: 'https://example.com/cabin.jpg' },
//       { id: '2', name: 'Beach House', price: 50, location: 'Paris', tag: 'beach', image: 'https://example.com/beach.jpg' },
//       { id: '3', name: 'Beach House', price: 50, location: 'New York', image: 'https://example.com/beach.jpg' },
//       { id: '4', name: 'Beach House', price: 50, location: 'New York', image: 'https://example.com/beach.jpg' },
//       { id: '5', name: 'Beach House', price: 50, location: 'New York', image: 'https://example.com/beach.jpg' },
//       { id: '6', name: 'Beach House', price: 50, location: 'New York', image: 'https://example.com/beach.jpg' },
//       { id: '7', name: 'Beach House', price: 50, location: 'New York', image: 'https://example.com/beach.jpg' },
//       { id: '8', name: 'Beach House', price: 50, location: 'New York', image: 'https://example.com/beach.jpg' },
//     ],
//   },
// ];

// // Flatten data for single FlatList
// const flattenData = (data:any) => {
//   return data.reduce((acc:any, section:any) => {
//     return [...acc, { type: 'header', title: section.title }, { type: 'items', data: section.data, title: section.title }];
//   }, []);
// };

// const ExperienceItem = memo(({ item, index, section, theme }:any) => (
//   <Link
//     href={{
//       pathname: '/(guest)/(modals)/listing/[listing]',
//       params: { listing: section.title },
//     }}
//     asChild
//   >
//     <View style={{ marginLeft: index === 0 ? 16 : 0 }}>
//       <Card style={styles.propertyCard} elevated>
//         <View style={styles.imageContainer}>
//           <Image
//             source={{ uri: 'https://res.cloudinary.com/dajzo2zpq/image/upload/w_300,h_200/v1752247182/properties/wlf2uijbultztvqptnka.jpg' }}
//             // source={{ uri: item.image || 'https://via.placeholder.com/170x140.png?text=Property' }}
//             style={styles.propertyImage}
//             contentFit="cover"
//             cachePolicy="disk"
//             priority="normal"
//             transition={200}
//           />
//           <View style={styles.imageOverlay}>
//             {item.tag?.length > 3 && (
//               <View style={styles.badgeContainer}>
//                 <ThemedText style={styles.badgeText}>{item.tag}</ThemedText>
//               </View>
//             )}
//             <Pressable style={styles.heartButton} onPress={() => {}}>
//               <IconSymbol name="heart" style={styles.heartIcon} size={24} color="white" />
//             </Pressable>
//           </View>
//         </View>
//         <View style={styles.propertyDetails}>
//           <ThemedText type="defaultSemiBold" style={styles.propertyTitle}>
//             {item.name}
//           </ThemedText>
//           <ThemedText type="caption" secondary>{item.location}</ThemedText>
//           <View style={styles.propertyFooter}>
//             <ThemedText type="caption" secondary>from ${item.price}</ThemedText>
//             <View style={styles.ratingContainer}>
//               <IconSymbol name="star.fill" size={12} color={theme.colors.warning} />
//               <ThemedText type="caption" secondary>4.88</ThemedText>
//             </View>
//           </View>
//         </View>
//       </Card>
//     </View>
//   </Link>
// ));

// function ExperiencesTab() {
//   const { theme } = useTheme();
//   const insets = useSafeAreaInsets();
//   const { setHideIcons } = useContext(HideIconContext);
//   // const { properties } = useProperties();

//   const onScroll = useCallback(
//     (e: NativeSyntheticEvent<NativeScrollEvent>) => {
//       setHideIcons(e.nativeEvent.contentOffset.y > 0);
//     },
//     [setHideIcons]
//   );

//   const renderItem = useCallback(
//     ({ item, index }:any) => {
//       if (item.type === 'header') {
//         return (
//           <View style={styles.sectionHeader}>
//             <Text style={[styles.sectionHeaderText, { color: theme.colors.text }]}>
//               Experiences in {item.title}
//             </Text>
//             <IconSymbol name="chevron.forward" style={styles.chevron} size={18} color={theme.colors.text} />
//           </View>
//         );
//       } else {
//         return (
//           <FlatList
//             data={item.data}
//             renderItem={({ item: experience, index }) => (
//               <ExperienceItem item={experience} index={index} section={item} theme={theme} />
//             )}
//             horizontal
//             showsHorizontalScrollIndicator={false}
//             initialNumToRender={3}
//             maxToRenderPerBatch={3}
//             windowSize={3}
//             getItemLayout={(data, index) => ({
//               length: 170,
//               offset: 170 * index,
//               index,
//             })}
//           />
//         );
//       }
//     },
//     [theme]
//   );

//   const getItemLayout = useCallback(
//     (data:any, index: any) => {
//       const isHeader = data[index].type === 'header';
//       return {
//         length: isHeader ? 48 : 180, // Approximate height for headers and items
//         offset: data.slice(0, index).reduce((sum:any, item:any) => sum + (item.type === 'header' ? 48 : 180), 0),
//         index,
//       };
//     },
//     []
//   );

//   return (
//     <ThemedView style={styles.container}>
//       <FlatList
//         data={flattenData(EXPERIENCES_DATA)}
//         renderItem={renderItem}
//         onScroll={onScroll}
//         scrollEventThrottle={16}
//         showsVerticalScrollIndicator={false}
//         initialNumToRender={5}
//         maxToRenderPerBatch={5}
//         windowSize={3}
//         getItemLayout={getItemLayout}
//         contentContainerStyle={[styles.flatListContent, { paddingTop: 10 }]}
//         ItemSeparatorComponent={() => <View style={styles.separator} />}
//       />
//     </ThemedView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, paddingHorizontal: 0 },
//   flatListContent: { paddingBottom: 100 },
//   separator: { height: 3 },
//   sectionHeader: { paddingVertical: 10, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 5 },
//   sectionHeaderText: { fontWeight: 'bold', fontSize: 16 },
//   chevron: { fontWeight: '900' },
//   propertyCard: { width: 170, padding: 0, marginRight: 12, borderRadius: 16, overflow: 'hidden' },
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

