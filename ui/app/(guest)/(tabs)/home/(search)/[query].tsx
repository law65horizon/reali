// screens/ListView.tsx
import PropertyMapView from '@/components/map/Propertymapview';
import { PropertyCardSkeleton } from '@/components/ui/CardSkeleton';
import PropertyCard from '@/components/ui/PropertyCard';
import { EmptySearchState } from '@/components/ui/StateComponents';
import { usesearchRoomTypes } from '@/hooks/useSearchProp';
import { useFilterStore } from '@/stores/useFilterStore';
import { useTheme } from '@/theme/theme';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
 
const { width, height } = Dimensions.get('screen');

interface CircleArea {
  latitude: number;
  longitude: number;
  radius: number;
}

export default function ListView() {
  const { theme } = useTheme();
  const { query } = useLocalSearchParams();

  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['18%', '50%', '100%'], []);

  // ── Query params ─────────────────────────────────────────────────────────
  const parsedQuery = useMemo(() => {
    try {
      return query ? JSON.parse(query as string) : {};
    } catch {
      return {};
    }
  }, [query]);

  const variables = useFilterStore((state) => state.variables);

  // ── Circle geo-filter state ───────────────────────────────────────────────
  // When the user draws a circle on the map we merge {lat, lng, radius} into
  // the query variables so the existing hook re-fetches automatically.
  const [geoFilter, setGeoFilter] = useState<CircleArea | null>(null);

  const geoVariables = useMemo(() => {
    if (!geoFilter) return variables ?? undefined;
    return {
      ...(variables ?? {}),
      lat: geoFilter.latitude,
      lng: geoFilter.longitude,
      // Convert metres → kilometres if your API expects km; remove the
      // division if it expects metres.
      radius: parseFloat((geoFilter.radius / 1000).toFixed(2)),
    };
  }, [geoFilter, variables]);

  const handleCircleChange = useCallback((circle: CircleArea | null) => {
    setGeoFilter(circle);
    // When a circle is drawn, snap the list up so the user can see results
    if (circle) {
      bottomSheetRef.current?.snapToIndex(1); // 50%
    }
  }, []);

  // ── Data fetching ─────────────────────────────────────────────────────────
  const {
    properties: data,
    loading,
    hasMore: hasNextPage,
    fetchMore: loadMore,
    totalCount,
    isRefetching,
    refetch,
    error,
  } = usesearchRoomTypes({
    pageSize: 10,
    skip: false,
    query: parsedQuery,
    // variables: variables,
  });

  const checkLoadingAndLoadMore = useCallback(() => {
    if (!loading && !isRefetching && hasNextPage) {
      loadMore();
    }
  }, [loading, isRefetching, hasNextPage, loadMore]);

  // ── Render helpers ────────────────────────────────────────────────────────
  const renderItem = useCallback(
    ({ item }: any) => <PropertyCard property={item} />,
    []
  );

  const keyExtractor = useCallback((item: any) => item.id, []);

  const ListEmptyComponent = useCallback(() => {
    if (loading) {
      return (
        <ActivityIndicator
          style={{ flex: 1, height: height / 2 }}
          size="large"
          color={theme.colors.text}
        />
      );
    }
    return <EmptySearchState actionText="Retry Search" onAction={refetch} />;
  }, [loading, theme.colors.text]);

  const ListFooterComponent = useCallback(() => {
    if (!hasNextPage || !data.length) return null;
    return (
      <View style={{ marginVertical: 15 }}>
        <PropertyCardSkeleton width_={width - 20} />
      </View>
    );
  }, [hasNextPage, data.length]);

  const ItemSeparatorComponent = useCallback(
    () => <View style={styles.separator} />,
    []
  );

  // ── Full-screen loading state ─────────────────────────────────────────────
  if (loading && !data) {
    return (
      <View style={styles.container}>
        {[0, 1, 2].map((item) => (
          <PropertyCardSkeleton key={item} width_={width - 20} />
        ))}
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* ── Search / Filter header (floats above map) ── */}
      <Pressable
        onPress={() =>
          router.push({
            pathname: '/(guest)/(modals)/base_search/[query]',
            params: { query: JSON.stringify({ type: parsedQuery.type }) },
          })
        }
        style={[
          styles.header,
          {
            backgroundColor: theme.colors.background,
            borderRadius: 30,
            borderWidth: 1,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <Ionicons
          name="search"
          size={24}
          color={theme.colors.text}
          style={styles.backButton}
        />
        <Pressable
          style={[
            styles.filterButton,
            { backgroundColor: theme.colors.border, margin: 3 },
          ]}
          accessibilityLabel="Filter results"
          accessibilityRole="button"
          onPress={() =>
            router.push(
              parsedQuery?.type === 'experiences'
                ? '/(guest)/(modals)/filter/experienceFilter'
                : '/(guest)/(modals)/filter/FilterScreen'
            )
          }
        >
          <Ionicons name="options-outline" size={24} color={theme.colors.text} />
        </Pressable>
      </Pressable>

      {/* ── Google Map (replaces static map.jpeg) ── */}
      <PropertyMapView
        properties={data ?? []}
        onCircleChange={handleCircleChange}
      />

      {/* ── Bottom sheet list ── */}
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose={false}
        handleStyle={{
          backgroundColor: theme.colors.background,
          borderTopLeftRadius: 15,
          borderTopRightRadius: 15,
        }}
        handleIndicatorStyle={styles.handleIndicator}
      >
        <View
          style={{ paddingTop: 90, backgroundColor: theme.colors.background }}
        />
        <BottomSheetFlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          ItemSeparatorComponent={ItemSeparatorComponent}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={ListEmptyComponent}
          ListFooterComponent={ListFooterComponent}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          onEndReachedThreshold={0.5}
          onEndReached={checkLoadingAndLoadMore}
          getItemLayout={(data: any, index: any) => ({
            length: 320,
            offset: 320 * index,
            index,
          })}
          style={{ backgroundColor: theme.colors.background }}
        />
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  handleIndicator: {
    backgroundColor: 'gray',
    width: 40,
    height: 4,
  },
  container: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 55,
    left: 15,
    right: 15,
    zIndex: 1000,
    width: width - 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButton: {
    padding: 5,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 10,
    paddingBottom: 100,
    paddingTop: 16,
  },
  separator: {
    height: 16,
  },
});

// // screens/ListView.tsx
// import { PropertyCardSkeleton } from '@/components/ui/CardSkeleton';
// import PropertyCard from '@/components/ui/PropertyCard';
// import { EmptySearchState } from '@/components/ui/StateComponents';
// import { usesearchRoomTypes } from '@/hooks/useSearchProp';
// import { useFilterStore } from '@/stores/useFilterStore';
// import { useTheme } from '@/theme/theme';
// import { Ionicons } from '@expo/vector-icons';
// import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet';
// import { Image } from 'expo-image';
// import { router, useLocalSearchParams } from 'expo-router';
// import { useCallback, useEffect, useMemo, useRef } from 'react';
// import {
//   ActivityIndicator,
//   Dimensions,
//   Pressable,
//   StyleSheet,
//   View
// } from 'react-native';

// const { width, height } = Dimensions.get('screen');

// const FALLBACK_IMAGES = [
//   'https://res.cloudinary.com/dajzo2zpq/image/upload/v1752247182/properties/wlf2uijbultztvqptnka.jpg',
// ];

// interface PropertyCardProps {
//   property: any;
//   width_?: number;
// }

// // const PropertyCard = ({ property, width_ }: PropertyCardProps) => {
// //   const { theme } = useTheme();
// //   const { toggleFavorite, isFavorite } = useFavoritesStore();
// //   const isFav = isFavorite(property.id);

// //   const price = property?.price ?? 0;
// //   const city = property?.address?.city || 'Unknown';
// //   const country = property?.address?.country || '';
// //   const type = (property?.category || property?.type || 'Home') as string;

// //   const beds = property?.beds ?? ((price % 3) + 2);
// //   const baths = property?.baths ?? ((price % 2) + 1);
// //   const sqft = property?.sqft ?? (900 + (price % 5) * 120);

// //   const tags: string[] = useMemo(() => {
// //     const t: string[] = [];
// //     if (price && price < 100) t.push('Deal');
// //     if ((property?.images?.length || 0) > 1) t.push('3D Walkthrough');
// //     if ((property?.status || 'ACTIVE') === 'PENDING') t.push('New');
// //     return t;
// //   }, [price, property]);

// //   const images = property?.images?.map((i: any) => i.url) ;

// //   const handleToggleFavorite = useCallback(() => {
// //     toggleFavorite(property.id);
// //   }, [property.id, toggleFavorite]);

// //   return (
// //     <Card elevated key={property.id} style={[styles.card, { backgroundColor: theme.colors.backgroundSec }]}>
// //       <ImageCarousel
// //         images={images}
// //         imageHeight={220}
// //         width={width_ || width - 20}
// //         uri
// //       />

// //       <View style={styles.cardBody}>
// //         <View style={{ flexDirection: 'row', alignItems: 'center' }}>
// //           <View style={{ flex: 1 }}>
// //             <ThemedText type="defaultSemiBold" style={styles.price}>
// //               ${price?.toLocaleString?.() || price} {type === 'apartment' ? 'mo' : ''}
// //             </ThemedText>

// //             <View style={styles.row}>
// //               <ThemedText type="body" secondary>
// //                 {beds} beds
// //               </ThemedText>
// //               <View style={styles.dot} />
// //               <ThemedText type="body" secondary>
// //                 {baths} baths
// //               </ThemedText>
// //               <View style={styles.dot} />
// //               <ThemedText type="body" secondary>
// //                 {sqft} sq.ft
// //               </ThemedText>
// //             </View>
// //           </View>
// //           <Pressable onPress={handleToggleFavorite} hitSlop={8}>
// //             <Entypo
// //               name={isFav ? 'heart' : 'heart-outlined'}
// //               color={isFav ? theme.colors.primary : theme.colors.text}
// //               size={26}
// //             />
// //           </Pressable>
// //         </View>

// //         <View style={styles.rowBetween}>
// //           <View style={styles.row}>
// //             <MaterialCommunityIcons
// //               name="map-marker"
// //               size={16}
// //               color={theme.colors.textSecondary}
// //             />
// //             <ThemedText type="caption" secondary>
// //               {city}
// //               {country ? `, ${country}` : ''}
// //             </ThemedText>
// //           </View>
// //           <View style={[styles.typePill, { backgroundColor: theme.colors.border }]}>
// //             <ThemedText type="caption">
// //               {type.charAt(0).toUpperCase() + type.slice(1)}
// //             </ThemedText>
// //           </View>
// //         </View>
// //       </View>

// //       {!!tags.length && (
// //         <View
// //           style={{
// //             position: 'absolute',
// //             top: 8,
// //             left: 8,
// //             flexDirection: 'row',
// //             gap: 10,
// //           }}
// //         >
// //           {tags.map((t, idx) => (
// //             <View
// //               key={`${property.id}-tag-${idx}`}
// //               style={[styles.tag, { backgroundColor: theme.colors.background }]}
// //             >
// //               <ThemedText type="caption">{t}</ThemedText>
// //             </View>
// //           ))}
// //         </View>
// //       )}
// //     </Card>
// //   );
// // };

// export default function ListView() {
//   const { theme } = useTheme();
//   const { query } = useLocalSearchParams();

//   const bottomSheetRef = useRef<BottomSheet>(null);
//   const snapPoints = useMemo(() => ['18%', '50%', '100%'], []);

//   // Parse query if needed
//   const parsedQuery = useMemo(() => {
//     try {
//       return query ? JSON.parse(query as string) : {};
//     } catch {
//       return {};
//     }
//   }, [query]);

//   console.log({parsedQuery})
//   const variables = useFilterStore((state) => state.variables)
//   // const setFilter = useFilterStore(state => state.setFilter)

//   // if(parsedQuery?.sale_status) setFilter('variables', {sale_status: })

//   useEffect(() => {
//     console.log('filter set',variables)
//   }, [variables])



//   // Use the properties hook with infinite scroll
//   const { 
//     properties:data, 
//     loading, 
//     hasMore: hasNextPage, 
//     fetchMore: loadMore, 
//     totalCount, 
//     isRefetching, 
//     refetch, error 
//   } = usesearchRoomTypes({pageSize: 10, skip: false, query: parsedQuery, variables: variables??undefined});

//   console.log({data: data?.length})
// // console.log({dos: data[1]?.images})

//   console.log({isRefetching})
 
//   const checkLoadingAndLoadMore = useCallback(() => {
//     if (!loading &&  !isRefetching && hasNextPage) {
//       console.log('Loading more properties...');
//       loadMore();
//     }
//   }, [loading, isRefetching, hasNextPage, loadMore]);

//   const renderItem = useCallback(
//     // console.log()
//     // ({ item }: any) => <PropertyCardSkeleton width_={width-20} />,
//     ({ item }: any) => <PropertyCard property={item} />,
//     []
//   );

//   const keyExtractor = useCallback((item: any) => item.id, []);

//   const ListEmptyComponent = useCallback(() => {
//     if (loading) {
//       return (
//         <ActivityIndicator
//           style={{ flex: 1, height: height / 2 }}
//           size="large"
//           color={theme.colors.text}
//         />
//       );
//     }
//     // return (
//     //   <View style={{ padding: 32, alignItems: 'center', gap: 10 }}>
//     //     <ThemedText type="defaultSemiBold" >
//     //       No properties found
//     //     </ThemedText>
//     //     <ThemedText secondary>Try adjusting your filters</ThemedText>
//     //     <Button title='Retry' onPress={refetch}/>
//     //   </View>
//     // );
//     return (
//       <EmptySearchState actionText='Retry Search' onAction={refetch}/>
//     )
//   }, [loading, theme.colors.text]);

//   const ListFooterComponent = useCallback(() => {
//     if (!hasNextPage || !data.length) return null;
//     return (
//       <View style={{ marginVertical: 15, }}>
//         <PropertyCardSkeleton width_={width-20} />
//       </View>
//     );
//   }, [hasNextPage, data.length, theme.colors.text]);

//   const ItemSeparatorComponent = useCallback(
//     () => <View style={styles.separator} />,
//     []
//   );

//   if (loading && !data) {
//     return (
//       <View style={styles.container}>
//         {[0,1,2].map(item => (
//           <PropertyCardSkeleton width_={width-20} />
//         ))}
//       </View>
//     )
//   }

//   // if (error) {
//   //   return <ErrorState onRetry={refetch} retryText='Retry Search' />
//   // }

//   return (
//     <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
//       {/* Header */}
//       <Pressable
//         onPress={() =>
//           router.push({
//             pathname: '/(guest)/(modals)/base_search/[query]',
//             params: { query: JSON.stringify({ type: parsedQuery.type }) },
//           })
//         }
//         style={[
//           styles.header,
//           {
//             backgroundColor: theme.colors.background,
//             borderRadius: 30,
//             borderWidth: 1,
//             borderColor: theme.colors.border,
//           },
//         ]}
//       >
//         <Ionicons
//           name="search"
//           size={24}
//           color={theme.colors.text}
//           style={styles.backButton}
//         />

//         <Pressable
//           style={[
//             styles.filterButton,
//             { backgroundColor: theme.colors.border, margin: 3 },
//           ]}
//           accessibilityLabel="Filter results"
//           accessibilityRole="button"
//           onPress={() =>
//             router.push(
//               // true
//               parsedQuery?.type === 'experiences'
//                 ? '/(guest)/(modals)/filter/experienceFilter'
//                 : '/(guest)/(modals)/filter/FilterScreen'
//             )
//           }
//         >
//           <Ionicons name="options-outline" size={24} color={theme.colors.text} />
//         </Pressable>
//       </Pressable>

//       <Image source={require('@/assets/images/map.jpeg')} style={{ flex: 1 }} />

//       <BottomSheet
//         ref={bottomSheetRef}
//         index={0}
//         snapPoints={snapPoints}
//         enablePanDownToClose={false}
//         handleStyle={{
//           backgroundColor: theme.colors.background,
//           borderTopLeftRadius: 15,
//           borderTopRightRadius: 15,
//         }}
//         handleIndicatorStyle={styles.handleIndicator}
//       >
//         <View style={{paddingTop: 90, backgroundColor: theme.colors.background}} />
//         <BottomSheetFlatList
//           data={data}
//           renderItem={renderItem}
//           keyExtractor={keyExtractor}
//           ItemSeparatorComponent={ItemSeparatorComponent}
//           showsVerticalScrollIndicator={false}
//           contentContainerStyle={styles.listContent}
//           ListEmptyComponent={ListEmptyComponent}
//           ListFooterComponent={ListFooterComponent}
//           initialNumToRender={10}
//           maxToRenderPerBatch={10}
//           windowSize={5}
//           onEndReachedThreshold={0.5}
//           onEndReached={checkLoadingAndLoadMore}
//           getItemLayout={(data:any, index:any) => ({
//             length: 320,
//             offset: 320 * index,
//             index,
//           })}
//           style={{ backgroundColor: theme.colors.background }}
          
//         />
//       </BottomSheet>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   handleIndicator: {
//     backgroundColor: 'gray',
//     width: 40,
//     height: 4,
//   },
//   container: {
//     flex: 1,
//   },
//   header: {
//     position: 'absolute',
//     top: 55,
//     left: 15,
//     right: 15,
//     zIndex: 1000,
//     width: width - 30,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   backButton: {
//     paddingHorizontal: 10,
//     paddingVertical: 5,
//     borderRadius: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   filterButton: {
//     padding: 5,
//     borderRadius: 30,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   listContent: {
//     paddingHorizontal: 10,
//     paddingBottom: 100,
//     paddingTop: 16,
//   },
//   separator: {
//     height: 16,
//   },
//   card: {
//     borderRadius: 12,
//     overflow: 'hidden',
//     width: '100%',
//     paddingLeft: 0,
//     margin: 0,
//   },
//   cardBody: {
//     padding: 12,
//     gap: 6,
//   },
//   row: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//   },
//   rowBetween: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   dot: {
//     width: 3,
//     height: 3,
//     borderRadius: 3,
//     backgroundColor: 'rgba(140,140,140,0.6)',
//   },
//   price: {
//     fontSize: 18,
//   },
//   tag: {
//     paddingVertical: 4,
//     paddingHorizontal: 8,
//     borderRadius: 999,
//   },
//   typePill: {
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 999,
//   },
// });