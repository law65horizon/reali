// screens/ListView.tsx
import { PropertyCardSkeleton } from '@/components/ui/CardSkeleton';
import PropertyCard from '@/components/ui/PropertyCard';
import { EmptySearchState } from '@/components/ui/StateComponents';
import { usesearchRoomTypes } from '@/hooks/useSearchProp';
import { useSearchStore } from '@/stores';
import { useTheme } from '@/theme/theme';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useRef } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  StyleSheet,
  View
} from 'react-native';

const { width, height } = Dimensions.get('screen');

const FALLBACK_IMAGES = [
  'https://res.cloudinary.com/dajzo2zpq/image/upload/v1752247182/properties/wlf2uijbultztvqptnka.jpg',
];

interface PropertyCardProps {
  property: any;
  width_?: number;
}

// const PropertyCard = ({ property, width_ }: PropertyCardProps) => {
//   const { theme } = useTheme();
//   const { toggleFavorite, isFavorite } = useFavoritesStore();
//   const isFav = isFavorite(property.id);

//   const price = property?.price ?? 0;
//   const city = property?.address?.city || 'Unknown';
//   const country = property?.address?.country || '';
//   const type = (property?.category || property?.type || 'Home') as string;

//   const beds = property?.beds ?? ((price % 3) + 2);
//   const baths = property?.baths ?? ((price % 2) + 1);
//   const sqft = property?.sqft ?? (900 + (price % 5) * 120);

//   const tags: string[] = useMemo(() => {
//     const t: string[] = [];
//     if (price && price < 100) t.push('Deal');
//     if ((property?.images?.length || 0) > 1) t.push('3D Walkthrough');
//     if ((property?.status || 'ACTIVE') === 'PENDING') t.push('New');
//     return t;
//   }, [price, property]);

//   const images = property?.images?.map((i: any) => i.url) ;

//   const handleToggleFavorite = useCallback(() => {
//     toggleFavorite(property.id);
//   }, [property.id, toggleFavorite]);

//   return (
//     <Card elevated key={property.id} style={[styles.card, { backgroundColor: theme.colors.backgroundSec }]}>
//       <ImageCarousel
//         images={images}
//         imageHeight={220}
//         width={width_ || width - 20}
//         uri
//       />

//       <View style={styles.cardBody}>
//         <View style={{ flexDirection: 'row', alignItems: 'center' }}>
//           <View style={{ flex: 1 }}>
//             <ThemedText type="defaultSemiBold" style={styles.price}>
//               ${price?.toLocaleString?.() || price} {type === 'apartment' ? 'mo' : ''}
//             </ThemedText>

//             <View style={styles.row}>
//               <ThemedText type="body" secondary>
//                 {beds} beds
//               </ThemedText>
//               <View style={styles.dot} />
//               <ThemedText type="body" secondary>
//                 {baths} baths
//               </ThemedText>
//               <View style={styles.dot} />
//               <ThemedText type="body" secondary>
//                 {sqft} sq.ft
//               </ThemedText>
//             </View>
//           </View>
//           <Pressable onPress={handleToggleFavorite} hitSlop={8}>
//             <Entypo
//               name={isFav ? 'heart' : 'heart-outlined'}
//               color={isFav ? theme.colors.primary : theme.colors.text}
//               size={26}
//             />
//           </Pressable>
//         </View>

//         <View style={styles.rowBetween}>
//           <View style={styles.row}>
//             <MaterialCommunityIcons
//               name="map-marker"
//               size={16}
//               color={theme.colors.textSecondary}
//             />
//             <ThemedText type="caption" secondary>
//               {city}
//               {country ? `, ${country}` : ''}
//             </ThemedText>
//           </View>
//           <View style={[styles.typePill, { backgroundColor: theme.colors.border }]}>
//             <ThemedText type="caption">
//               {type.charAt(0).toUpperCase() + type.slice(1)}
//             </ThemedText>
//           </View>
//         </View>
//       </View>

//       {!!tags.length && (
//         <View
//           style={{
//             position: 'absolute',
//             top: 8,
//             left: 8,
//             flexDirection: 'row',
//             gap: 10,
//           }}
//         >
//           {tags.map((t, idx) => (
//             <View
//               key={`${property.id}-tag-${idx}`}
//               style={[styles.tag, { backgroundColor: theme.colors.background }]}
//             >
//               <ThemedText type="caption">{t}</ThemedText>
//             </View>
//           ))}
//         </View>
//       )}
//     </Card>
//   );
// };

export default function ListView() {
  const { theme } = useTheme();
  const { query } = useLocalSearchParams();
  const { filters } = useSearchStore();

  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['18%', '50%', '100%'], []);

  // Parse query if needed
  const parsedQuery = useMemo(() => {
    try {
      return query ? JSON.parse(query as string) : {};
    } catch {
      return {};
    }
  }, [query]);

  // Use the properties hook with infinite scroll
  const { properties:data, loading, hasMore: hasNextPage, fetchMore: loadMore, totalCount, isRefetching, refetch, error } = usesearchRoomTypes({pageSize: 10, skip: false});
// console.log({dos: data[1]?.images})

  console.log({isRefetching})

  const checkLoadingAndLoadMore = useCallback(() => {
    if (!loading &&  !isRefetching && hasNextPage) {
      console.log('Loading more properties...');
      loadMore();
    }
  }, [loading, isRefetching, hasNextPage, loadMore]);

  const renderItem = useCallback(
    // console.log()
    // ({ item }: any) => <PropertyCardSkeleton width_={width-20} />,
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
    // return (
    //   <View style={{ padding: 32, alignItems: 'center', gap: 10 }}>
    //     <ThemedText type="defaultSemiBold" >
    //       No properties found
    //     </ThemedText>
    //     <ThemedText secondary>Try adjusting your filters</ThemedText>
    //     <Button title='Retry' onPress={refetch}/>
    //   </View>
    // );
    return (
      <EmptySearchState actionText='Retry Search' onAction={refetch}/>
    )
  }, [loading, theme.colors.text]);

  const ListFooterComponent = useCallback(() => {
    if (!hasNextPage || !data.length) return null;
    return (
      <View style={{ marginVertical: 15, }}>
        <PropertyCardSkeleton width_={width-20} />
      </View>
    );
  }, [hasNextPage, data.length, theme.colors.text]);

  const ItemSeparatorComponent = useCallback(
    () => <View style={styles.separator} />,
    []
  );

  if (loading && !data) {
    return (
      <View style={styles.container}>
        {[0,1,2].map(item => (
          <PropertyCardSkeleton width_={width-20} />
        ))}
      </View>
    )
  }

  // if (error) {
  //   return <ErrorState onRetry={refetch} retryText='Retry Search' />
  // }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
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

      <Image source={require('@/assets/images/map.jpeg')} style={{ flex: 1 }} />

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
        <View style={{paddingTop: 90, backgroundColor: theme.colors.background}} />
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
          getItemLayout={(data:any, index:any) => ({
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
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    width: '100%',
    paddingLeft: 0,
    margin: 0,
  },
  cardBody: {
    padding: 12,
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 3,
    backgroundColor: 'rgba(140,140,140,0.6)',
  },
  price: {
    fontSize: 18,
  },
  tag: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 999,
  },
  typePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
});

// import { ThemedText } from '@/components/ThemedText';
// import Card from '@/components/ui/Card';
// import ImageCarousel from '@/components/ui/ImageCarousel';
// import { useTheme } from '@/theme/theme';
// import { Entypo, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
// import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet';
// import { router, useLocalSearchParams, useNavigation } from 'expo-router';
// import { useMemo, useRef } from 'react';
// // import { ArrowLeft, ListFilter } from 'lucide-react-native';
// import { useProperties } from '@/hooks/useProperties';
// import { Image } from 'expo-image';
// import { ActivityIndicator, Dimensions, FlatList, Pressable, StyleSheet, View } from 'react-native';

// const { width, height } = Dimensions.get('screen');
// const CARD_PADDING = 16;
// const IMAGE_SIZE = 100;

// type Property = any;

// const FALLBACK_IMAGES = [
//     'https://res.cloudinary.com/dajzo2zpq/image/upload/v1752247182/properties/wlf2uijbultztvqptnka.jpg',
//     'https://res.cloudinary.com/dajzo2zpq/image/upload/v1752247182/properties/wlf2uijbultztvqptnka.jpg',
//     'https://res.cloudinary.com/dajzo2zpq/image/upload/v1752247182/properties/wlf2uijbultztvqptnka.jpg',
//   ];

// const PropertyCard = ({ property, width_ }: { property: Property, width_?: number }) => {
//   const { theme } = useTheme();

//   const price = property?.price ?? 0;
//   const city = property?.address?.city || 'Unknown';
//   const country = property?.address?.country || '';
//   const type = (property?.category || property?.type || 'Home') as string;

//   const beds = property?.beds ?? ((price % 3) + 2);
//   const baths = property?.baths ?? ((price % 2) + 1);
//   const sqft = property?.sqft ?? (900 + (price % 5) * 120);

//   const tags: string[] = useMemo(() => {
//     const t: string[] = [];
//     if (price && price < 100) t.push('Deal');
//     if ((property?.images?.length || 0) > 1) t.push('3D Walkthrough');
//     if ((property?.status || 'ACTIVE') === 'PENDING') t.push('New');
//     return t;
//   }, [price, property]);

//   const images = (property?.images?.map((i: any) => i.url) || FALLBACK_IMAGES) as any;

//   return (
//     <Card elevated style={[styles.card, { backgroundColor: theme.colors.backgroundSec }]}>
//       <ImageCarousel images={FALLBACK_IMAGES} imageHeight={220} width={width_ || width - 20} uri />

//       <View style={styles.cardBody}>
//         <View style={{flexDirection:'row', alignItems: 'center'}}>
//           <View style={{flex:1}}>
//             <ThemedText type="defaultSemiBold" style={styles.price}>
//               ${price?.toLocaleString?.() || price} {type === 'apartment' ? 'mo' : ''}
//             </ThemedText>

//             <View style={styles.row}>
//               <ThemedText type="body" secondary>{beds} beds</ThemedText>
//               <View style={styles.dot} />
//               <ThemedText type="body" secondary>{baths} baths</ThemedText>
//               <View style={styles.dot} />
//               <ThemedText type="body" secondary>{sqft} sq.ft</ThemedText>
//             </View>
//           </View>
//           <View style={{flexDirection:'row', gap: 5}}>
//             <Entypo
//               name={true ? 'heart' : 'heart-outlined'}
//               color={true ? theme.colors.primary : theme.colors.text}
//               size={26} 
//             />
//             {/* <Entypo name="share-alternative" color={theme.colors.text} size={24} /> */}
//           </View>
//         </View>

//         <View style={styles.rowBetween}>
//           <View style={styles.row}>
//             <MaterialCommunityIcons name="map-marker" size={16} color={theme.colors.textSecondary} />
//             <ThemedText type="caption" secondary>{city}{country ? `, ${country}` : ''}</ThemedText>
//           </View>
//           <View style={[styles.typePill, { backgroundColor: theme.colors.border }]}> 
//             <ThemedText type="caption">{type.charAt(0).toUpperCase() + type.slice(1)}</ThemedText>
//           </View>
//         </View>

        
//       </View>
//       {!!tags.length && (
//           <View style={{position:'absolute', top: 8, left: 8, flexDirection: 'row', gap: 10}}>
//             {tags.map((t, idx) => (
//               <View key={`${property.id}-tag-${idx}`} style={[styles.tag, { backgroundColor: theme.colors.background }]}> 
//                 <ThemedText type="caption">{t}</ThemedText>
//               </View>
//             ))}
//           </View>
//         )}
//     </Card>
//   );
// };

// export default function ListView() {
//     const navigation = useNavigation()
//     // const {query} = useLocalSearchParams()
//     const { query } = useLocalSearchParams();
//     let parsedQuery;
//     try {
//       parsedQuery = query ? JSON.parse(query as string) : { type: 'experiences' };
//     } catch (e) {
//       console.error('Failed to parse query:', e);
//       parsedQuery = { type: 'experiences' };
//     }

//     const scrollViewRef = useRef<FlatList>(null);
//     const bottomSheetRef = useRef<BottomSheet>(null);
//     const snapPoints = useMemo(() => ['18%', '50%', '100%'], []);
//     // const snapPoints = useMemo(() => ['18%', '50%'], []);
//     const { data, loading, loadMore, error, hasNextPage, networkStatus } = useProperties(parsedQuery)
//     // console.warn(loading, hasNextPage, error, parsedQuery)
//     // console.log(data)
//     const {theme} = useTheme()
//     const images = [
//     require('@/assets/images/image.png'),
//     require('@/assets/images/living-room.jpg'),
//     require('@/assets/images/image3.jpg'),
//     require('@/assets/images/image.png'),
//     require('@/assets/images/living-room.jpg'),
//     ]

//     const checkLoadingAndLoadMore = () => {
//       if (!loading && hasNextPage) {
//         console.warn('Loading more data...');
//         loadMore();
//       }
//     }


//     return(
//         <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
//             {/* Header */}
//             <Pressable 
//               onPress={() => router.push({
//                 pathname: '/(guest)/(modals)/base_search/[query]',
//                 params: {query: JSON.stringify({type: parsedQuery.type})}
//               })} 
//                 style={[styles.header, { backgroundColor: theme.colors.background, borderRadius: 30, borderWidth: 1, borderColor: theme.colors.border }]}
//             >
//                 <Ionicons name="search" size={24} color={theme.colors.text} style={styles.backButton} />
                
//                 <Pressable 
//                     style={[styles.filterButton, {backgroundColor: theme.colors.border, margin: 3}]}
//                     accessibilityLabel="Filter results"
//                     accessibilityRole="button"
//                     onPress={() => router.push(parsedQuery?.type == 'experiences'? '/(guest)/(modals)/filter/experienceFilter' : '/(guest)/(modals)/filter/FilterScreen')}
//                     // onPress={() => setModalVisible(!isModalVisible)}
//                 >
//                     {/* <ListFilter size={20} color={theme.colors.text}/> */}
//                     {/* <Ionicons name='ios-funnel' /> */}
//                     <Ionicons name="options-outline" size={24} color={theme.colors.text} />
//                 </Pressable>
                
//                 {/* <DraggableModal isVisible={isModalVisible} onClose={() => setModalVisible(!isModalVisible)} height={height*0.9} /> */}
//                 {/* <FilterModal filterType='properties' onSave={() => {}} visible={isModalVisible} onClose={() => setModalVisible(!isModalVisible)}  /> */}
//             </Pressable>

//             <Image source={require('@/assets/images/map.jpeg')} style={{flex:1,}} />

//             <BottomSheet 
//               ref={bottomSheetRef}
//               index={0}
//               snapPoints={snapPoints}
//               enablePanDownToClose={false}
//               handleStyle={{backgroundColor: theme.colors.background, borderTopLeftRadius: 15, borderTopRightRadius: 15}}
//               handleIndicatorStyle={styles.handleIndicator}
//               // style={{borderRadius:10}}
//             >
//               {/* Pinned Header */}
//               <View style={[ {backgroundColor: theme.colors.background, zIndex: 100, marginBottom: 0, top: 0,height: 'auto', minHeight: 100, maxHeight: 100, position:'relative'}]}>
//                 {/* <View style={{flexDirection: 'row', alignItems: 'center', position: 'absolute', top: 0}}>
//                   <Pressable><ThemedText>iosio</ThemedText></Pressable>
//                 </View>            */}
//               </View>
              
//               <BottomSheetFlatList
//                 data={data}
//                 renderItem={({item}:any) => (<PropertyCard property={item} />)}
//                 ItemSeparatorComponent={() => <View style={styles.separator} />}
//                 showsVerticalScrollIndicator={false}
//                 contentContainerStyle={styles.listContent}
//                 ListHeaderComponent={() => <View style={[styles.listHeader, ]} />}
//                 initialNumToRender={10}
//                 style={{backgroundColor: theme.colors.background,}}
//                 keyExtractor={(item:any) => item.id}
//                 maxToRenderPerBatch={10}
//                 windowSize={5}
//                 ListEmptyComponent={() => (
//                   <ActivityIndicator style={{ flex: 1, height: height / 2 }} size="large" color={theme.colors.text} animating={loading} />
//                 )}
//                 // onScroll={onScroll}
//                 onEndReachedThreshold={0.5}
//                 onEndReached={() => checkLoadingAndLoadMore()}
//                 getItemLayout={(data:any, index:any) => ({
//                   length: 400,
//                   offset: 400 * index,
//                   index,
//                 })}
//             />
//             </BottomSheet>
//         </View>
//     )
// }


// const styles = StyleSheet.create({
//   bottomSheetHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 10,
//     // marginTop: 50,
//     // height: 
//     // position: 'absolute',
//     // top: 0,
//     // left: 0,
//     // right: 0,
//     zIndex: 10,
//   },
//   saveSearchButton: { backgroundColor: 'blue', color: 'white', padding: 8, borderRadius: 20 },
//   handleIndicator: { backgroundColor: 'gray', width: 40, height: 4 },
//   // bottomNav: { flexDirection: 'row', justifyContent: 'space-around', position: 'absolute', bottom: 0, width: '100%', backgroundColor: 'white', padding: 10, borderTopWidth: 1, borderColor: '#eee' },
//   navItem: { alignItems: 'center' },
//   container: {
//     flex: 1,
//     // paddingTop: 10
//     // backgroundColor: 'transparent',
//   },
//   header: {
//     position: 'absolute',
//     top: 55,
//     left: 15,
//     right: 15,
//     zIndex: 1000,
//     width: width-30,
//     // paddingTop: 45,
//     // paddingHorizontal: 5,
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
//   searchContainer: {
//     flex: 1,
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     paddingVertical: 10,
//     borderRadius: 25,
//     shadowOffset: { width: 0, height: 1},
//     shadowOpacity: 0.3,
//     shadowRadius: 3,
//     elevation: 6,
//   },
//   searchTitle: {
//     fontWeight: '600',
//     marginBottom: 2,
//   },
//   filterButton: {
//     padding: 5,
//     borderRadius: 30,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   listContainer: {
//     flex: 1,
//     marginTop: 120,
//   },
//   listContent: {
//     paddingHorizontal: 10,
//     paddingBottom: 100,
//     marginTop: 40
//   },
//   listHeader: {
//     // height: 16,
//     // paddingTop: 50
//   },
//   separator: {
//     height: 16,
//   },
//   propertyCard: {
//     marginBottom: 8,
//     padding: 10,
//     borderRadius: 16,
//     // overflow: 'hidden',
//   },
//   cardTitle: {
//     fontSize: 16,
//     marginBottom: 12,
//   },
//   imageContainer: {
//     marginBottom: 12,
//     borderRadius: 12,
//     flex: 1,
//     // backgroundColor: 'red',
//     overflow: 'hidden',
//   },
//   cardContent: {
//     gap: 8,
//   },
//   propertyInfo: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   propertyTitle: {
//     fontSize: 16,
//     flex: 1,
//   },
//   ratingContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 4,
//   },
//   ratingText: {
//     fontSize: 14,
//     fontWeight: '500',
//   },
//   locationContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 4,
//   },
//   priceContainer: {
//     alignItems: 'flex-start',
//   },
//   priceText: {
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   footer: { padding: 20, alignItems: 'center' },
//   loadMoreButton: { padding: 10, backgroundColor: 'red', borderRadius: 8 },
//   card: {
//     borderRadius: 12,
//     overflow: 'hidden',
//     width: '100%',
//     paddingLeft:0,
//     margin:0
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
