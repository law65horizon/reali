import { ThemedText } from '@/components/ThemedText';
import Card from '@/components/ui/Card';
import ImageCarousel from '@/components/ui/ImageCarousel';
import { useExperiences } from '@/hooks/useExperience';
import { useMapAnimation } from '@/hooks/useMapAnimation';
import { useTheme } from '@/theme/theme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import MapView from 'react-native-maps';
// import { ArrowLeft, ListFilter } from 'lucide-react-native';
import { Image } from 'expo-image';
import { ActivityIndicator, Dimensions, FlatList, Pressable, StyleSheet, View } from 'react-native';

const { width, height } = Dimensions.get('screen');
const CARD_PADDING = 16;
const IMAGE_SIZE = 100;

export default function ListView() {
    const navigation = useNavigation()
    // const {query} = useLocalSearchParams()
    const { query } = useLocalSearchParams();
    const [isModalVisible, setModalVisible] = useState(false)
    let parsedQuery;
    try {
      parsedQuery = query ? JSON.parse(query as string) : { type: 'experiences' };
    } catch (e) {
      console.error('Failed to parse query:', e);
      parsedQuery = { type: 'experiences' };
    }

    const scrollViewRef = useRef<FlatList>(null);
    const bottomSheetRef = useRef<BottomSheet>(null);
    const mapRef = useRef<MapView>(null);
    // console.log('sso',bottomSheetRef.current?.snapToIndex.arguments)


  // Snap points for bottom sheet (30%, 60%, 90%)
    const snapPoints = useMemo(() => ['18%', '50%', '100%'], []);
    // const snapPoints = useMemo(() => ['18%', '50%'], []);
    
    // console.warn('Search query params:', JSON.parse(query as string));
    const { data, loading, loadMore, error, hasNextPage, networkStatus } = useExperiences(parsedQuery)
    // const { data, loading, error, hasNextPage, networkStatus } = useGetData('experiences', JSON.parse(query as string))
    console.warn(loading, hasNextPage, error)
    const {theme} = useTheme()
    const images = [
    require('@/assets/images/image.png'),
    require('@/assets/images/living-room.jpg'),
    require('@/assets/images/image3.jpg'),
    require('@/assets/images/image.png'),
    require('@/assets/images/living-room.jpg'),
    ]

    const { onScroll } = useMapAnimation(scrollViewRef);

    const checkLoadingAndLoadMore = () => {
      if (!loading && hasNextPage) {
        console.warn('Loading more data...');
        loadMore();
      }
    }

    const renderItem = useCallback(
      ({ item }: { item: any }) => (
        <Card elevated style={styles.propertyCard}>
                            <ThemedText type='defaultSemiBold' style={styles.cardTitle}> {item?.title} </ThemedText>
                            {/* <ThemedText type='defaultSemiBold' style={styles.cardTitle}>Modern Apartment in City Center</ThemedText> */}
                            
                            <View style={styles.imageContainer}>
                                <ImageCarousel imageHeight={240} width={width-40} images={images} modal />
                            </View>

                            <Pressable onPress={() => router.push('/(guest)/(modals)/listing/[listing]')} style={styles.cardContent}>
                                <View style={styles.propertyInfo}>
                                    <ThemedText type='defaultSemiBold' style={styles.propertyTitle}>Room in {item?.address?.city}</ThemedText>
                                    <View style={styles.ratingContainer}>
                                        <MaterialCommunityIcons name='star' color={theme.colors.warning} size={16}/>
                                        <ThemedText type='body' style={styles.ratingText}>4.8 (6)</ThemedText>
                                    </View>
                                </View>
                                
                                <View style={styles.locationContainer}>
                                    <MaterialCommunityIcons name='map-marker' color={theme.colors.textSecondary} size={16} />
                                    <ThemedText type="caption" secondary>Beach getaway in {item.address?.country}</ThemedText>
                                    {/* <ThemedText type="caption" secondary>Beach getaway in Ton Fug</ThemedText> */}
                                </View>
                                
                                <View style={styles.priceContainer}>
                                    <ThemedText type='defaultSemiBold' style={styles.priceText}>${item?.price} USD / night</ThemedText>
                                </View>
                            </Pressable>
                        </Card>
      ), [theme]
    )

    const renderFooter = useCallback(() => {
        if (!hasNextPage) return null;
        return (
          <View style={styles.footer}>
            {loading ? (
              <ActivityIndicator size="small" color={theme.colors.text} />
            ) : (
              <Pressable  style={styles.loadMoreButton}>
                <ThemedText type="defaultSemiBold">Load More</ThemedText>
              </Pressable>
            )}
          </View>
        );
    }, [hasNextPage, loading]);

    return(
        <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
            {/* Header */}
            <Pressable 
              onPress={() => router.push({
                pathname: '/(guest)/(modals)/base_search/[query]',
                params: {query: JSON.stringify({type: parsedQuery.type})}
              })} 
                style={[styles.header, { backgroundColor: theme.colors.background, borderRadius: 30, borderWidth: 1, borderColor: theme.colors.border }]}
            >
                <Ionicons name="search" size={24} color={theme.colors.text} style={styles.backButton} />
                
                <Pressable 
                    style={[styles.filterButton, {backgroundColor: theme.colors.border, margin: 3}]}
                    accessibilityLabel="Filter results"
                    accessibilityRole="button"
                    onPress={() => router.push(parsedQuery?.type == 'experiences'? '/(guest)/(modals)/filter/experienceFilter' : '/(guest)/(modals)/filter/propertiesFilter')}
                    // onPress={() => setModalVisible(!isModalVisible)}
                >
                    {/* <ListFilter size={20} color={theme.colors.text}/> */}
                    {/* <Ionicons name='ios-funnel' /> */}
                    <Ionicons name="options-outline" size={24} color={theme.colors.text} />
                </Pressable>
                
                {/* <DraggableModal isVisible={isModalVisible} onClose={() => setModalVisible(!isModalVisible)} height={height*0.9} /> */}
                {/* <FilterModal filterType='properties' onSave={() => {}} visible={isModalVisible} onClose={() => setModalVisible(!isModalVisible)}  /> */}
            </Pressable>

            <Image source={require('@/assets/images/map.jpeg')} style={{flex:1,}} />

            <BottomSheet 
              ref={bottomSheetRef}
              index={0}
              snapPoints={snapPoints}
              enablePanDownToClose={false}
              handleStyle={{backgroundColor: theme.colors.background, borderTopLeftRadius: 15, borderTopRightRadius: 15}}
              handleIndicatorStyle={styles.handleIndicator}
              // style={{borderRadius:10}}
            >
              {/* Pinned Header */}
              <View style={[ {backgroundColor: theme.colors.background, zIndex: 100, marginBottom: 0, top: 0,height: 'auto', minHeight: 100, maxHeight: 100, position:'relative'}]}>
                {/* <View style={{flexDirection: 'row', alignItems: 'center', position: 'absolute', top: 0}}>
                  <Pressable><ThemedText>iosio</ThemedText></Pressable>
                </View>            */}
              </View>
              
              <BottomSheetFlatList
                data={data}
                renderItem={renderItem}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={() => <View style={[styles.listHeader, ]} />}
                initialNumToRender={10}
                style={{backgroundColor: theme.colors.background,}}
                keyExtractor={(item:any) => item.id}
                maxToRenderPerBatch={10}
                windowSize={5}
                ListEmptyComponent={() => (
                  <ActivityIndicator style={{ flex: 1, height: height / 2 }} size="large" color={theme.colors.text} animating={loading} />
                )}
                ListFooterComponent={renderFooter}
                // onScroll={onScroll}
                onEndReachedThreshold={0.5}
                onEndReached={() => checkLoadingAndLoadMore()}
                getItemLayout={(data:any, index:any) => ({
                  length: 400,
                  offset: 400 * index,
                  index,
                })}
            />
            </BottomSheet>
        </View>
    )
}


const styles = StyleSheet.create({
  bottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    // marginTop: 50,
    // height: 
    // position: 'absolute',
    // top: 0,
    // left: 0,
    // right: 0,
    zIndex: 10,
  },
  saveSearchButton: { backgroundColor: 'blue', color: 'white', padding: 8, borderRadius: 20 },
  handleIndicator: { backgroundColor: 'gray', width: 40, height: 4 },
  // bottomNav: { flexDirection: 'row', justifyContent: 'space-around', position: 'absolute', bottom: 0, width: '100%', backgroundColor: 'white', padding: 10, borderTopWidth: 1, borderColor: '#eee' },
  navItem: { alignItems: 'center' },
  container: {
    flex: 1,
    // paddingTop: 10
    // backgroundColor: 'transparent',
  },
  header: {
    position: 'absolute',
    top: 55,
    left: 15,
    right: 15,
    zIndex: 1000,
    width: width-30,
    // paddingTop: 45,
    // paddingHorizontal: 5,
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
  searchContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    shadowOffset: { width: 0, height: 1},
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 6,
  },
  searchTitle: {
    fontWeight: '600',
    marginBottom: 2,
  },
  filterButton: {
    padding: 5,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    flex: 1,
    marginTop: 120,
  },
  listContent: {
    paddingHorizontal: 10,
    paddingBottom: 100,
    marginTop: 40
  },
  listHeader: {
    // height: 16,
    // paddingTop: 50
  },
  separator: {
    height: 16,
  },
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
  footer: { padding: 20, alignItems: 'center' },
  loadMoreButton: { padding: 10, backgroundColor: 'red', borderRadius: 8 },
});



// import DraggableModal from '@/components/DraggableModal';
// import { ThemedText } from '@/components/ThemedText';
// import Card from '@/components/ui/Card';
// import ImageCarousel from '@/components/ui/ImageCarousel';
// import { useExperiences } from '@/hooks/useExperience';
// import { useMapAnimation } from '@/hooks/useMapAnimation';
// import { useTheme } from '@/theme/theme';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import BottomSheet from '@gorhom/bottom-sheet';
// import { router, useLocalSearchParams, useNavigation } from 'expo-router';
// import { ArrowLeft, ListFilter } from 'lucide-react-native';
// import { useCallback, useMemo, useRef, useState } from 'react';
// import MapView from 'react-native-maps';
// // import { ArrowLeft, ListFilter } from 'lucide-react-native';
// import { Image } from 'expo-image';
// import { ActivityIndicator, Dimensions, FlatList, Pressable, StyleSheet, View } from 'react-native';

// const { width, height } = Dimensions.get('screen');
// const CARD_PADDING = 16;
// const IMAGE_SIZE = 100;

// export default function ListView() {
//     const navigation = useNavigation()
//     // const {query} = useLocalSearchParams()
//     const { query } = useLocalSearchParams();
//     const [isModalVisible, setModalVisible] = useState(false)
//     let parsedQuery;
//     try {
//       parsedQuery = query ? JSON.parse(query as string) : { type: 'experiences' };
//     } catch (e) {
//       console.error('Failed to parse query:', e);
//       parsedQuery = { type: 'experiences' };
//     }
//     const scrollViewRef = useRef<FlatList>(null);
//     const bottomSheetRef = useRef<BottomSheet>(null);
//     const mapRef = useRef<MapView>(null);

//   // Snap points for bottom sheet (30%, 60%, 90%)
//     const snapPoints = useMemo(() => ['18%', '80%', '70%'], []);
    
//     // console.warn('Search query params:', JSON.parse(query as string));
//     const { data, loading, loadMore, error, hasNextPage, networkStatus } = useExperiences(parsedQuery)
//     // const { data, loading, error, hasNextPage, networkStatus } = useGetData('experiences', JSON.parse(query as string))
//     console.warn(loading, hasNextPage, error)
//     const {theme} = useTheme()
//     const images = [
//     require('@/assets/images/image.png'),
//     require('@/assets/images/living-room.jpg'),
//     require('@/assets/images/image3.jpg'),
//     require('@/assets/images/image.png'),
//     require('@/assets/images/living-room.jpg'),
//     ]

//     const { onScroll } = useMapAnimation(scrollViewRef);

//     const checkLoadingAndLoadMore = () => {
//       if (!loading && hasNextPage) {
//         console.warn('Loading more data...');
//         loadMore();
//       }
//     }

//     const renderItem = useCallback(
//       ({ item }: { item: any }) => (
//         <Card elevated style={styles.propertyCard}>
//                             <ThemedText type='defaultSemiBold' style={styles.cardTitle}> {item?.title} </ThemedText>
//                             {/* <ThemedText type='defaultSemiBold' style={styles.cardTitle}>Modern Apartment in City Center</ThemedText> */}
                            
//                             <View style={styles.imageContainer}>
//                                 <ImageCarousel imageHeight={240} width={width-40} images={images} modal />
//                             </View>

//                             <Pressable onPress={() => router.push('/(guest)/(modals)/listing/[listing]')} style={styles.cardContent}>
//                                 <View style={styles.propertyInfo}>
//                                     <ThemedText type='defaultSemiBold' style={styles.propertyTitle}>Room in {item?.address?.city}</ThemedText>
//                                     <View style={styles.ratingContainer}>
//                                         <MaterialCommunityIcons name='star' color={theme.colors.warning} size={16}/>
//                                         <ThemedText type='body' style={styles.ratingText}>4.8 (6)</ThemedText>
//                                     </View>
//                                 </View>
                                
//                                 <View style={styles.locationContainer}>
//                                     <MaterialCommunityIcons name='map-marker' color={theme.colors.textSecondary} size={16} />
//                                     <ThemedText type="caption" secondary>Beach getaway in {item.address?.country}</ThemedText>
//                                     {/* <ThemedText type="caption" secondary>Beach getaway in Ton Fug</ThemedText> */}
//                                 </View>
                                
//                                 <View style={styles.priceContainer}>
//                                     <ThemedText type='defaultSemiBold' style={styles.priceText}>${item?.price} USD / night</ThemedText>
//                                 </View>
//                             </Pressable>
//                         </Card>
//       ), [theme]
//     )

//     const renderFooter = useCallback(() => {
//         if (!hasNextPage) return null;
//         return (
//           <View style={styles.footer}>
//             {loading ? (
//               <ActivityIndicator size="small" color={theme.colors.text} />
//             ) : (
//               <Pressable  style={styles.loadMoreButton}>
//                 <ThemedText type="defaultSemiBold">Load More</ThemedText>
//               </Pressable>
//             )}
//           </View>
//         );
//     }, [hasNextPage, loading]);

//     return(
//         <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
//             {/* Header */}
//             <View 
//                 style={[styles.header, { backgroundColor: theme.colors.header }]}
//             >
//                 <Pressable 
//                     onPress={() => navigation.goBack()} 
//                     style={styles.backButton}
//                     accessibilityLabel="Go back"
//                     accessibilityRole="button"
//                 >
//                     <ArrowLeft size={24} color={theme.colors.text} />
//                 </Pressable>
                
//                 <Pressable 
//                   onPress={() => router.push({
//                     pathname: '/(guest)/(modals)/base_search/[query]',
//                     params: {query: JSON.stringify({type: parsedQuery.type})}
//                   })} 
//                   style={[styles.searchContainer, {backgroundColor: theme.colors.card}]}
//                 >
//                     <ThemedText type="body" style={styles.searchTitle}>Search Results</ThemedText>
//                     <ThemedText type="caption" secondary>Showing properties in your area</ThemedText>
//                 </Pressable>
                
//                 <Pressable 
//                     style={styles.filterButton}
//                     accessibilityLabel="Filter results"
//                     accessibilityRole="button"
//                     onPress={() => setModalVisible(!isModalVisible)}
//                 >
//                     <ListFilter size={20} color={theme.colors.text}/>
//                 </Pressable>
//                 <DraggableModal isVisible={isModalVisible} onClose={() => setModalVisible(!isModalVisible)} height={height*0.9} />
//             </View>

//             <Image source={require('@/assets/images/map.jpeg')} style={{flex:1, width, height}} />

//             <FlatList 
//               data={data}
//               renderItem={renderItem}
//               ItemSeparatorComponent={() => <View style={styles.separator} />}
//               showsVerticalScrollIndicator={false}
//               contentContainerStyle={styles.listContent}
//               ListHeaderComponent={() => <View style={styles.listHeader} />}
//               initialNumToRender={10}
//               keyExtractor={(item) => item.id}
//               maxToRenderPerBatch={10}
//               windowSize={5}
//               ListEmptyComponent={() => (
//                 <ActivityIndicator style={{ flex: 1, height: height / 2 }} size="large" color={theme.colors.text} animating={loading} />
//               )}
//               ListFooterComponent={renderFooter}
//               onScroll={onScroll}
//               onEndReachedThreshold={0.5}
//               onEndReached={() => checkLoadingAndLoadMore()}
//               getItemLayout={(data, index) => ({
//                 length: 400,
//                 offset: 400 * index,
//                 index,
//               })}
//             />
//         </View>
//     )
// }


// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     paddingTop: 10
//     // backgroundColor: 'transparent',
//   },
//   header: {
//     position: 'absolute',
//     top: 10,
//     left: 0,
//     right: 0,
//     zIndex: 1000,
//     paddingTop: 45,
//     paddingBottom: 16,
//     paddingHorizontal: 5,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   backButton: {
//     padding: 10,
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
//     padding: 10,
//     borderRadius: 20,
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
//     marginTop: 100
//   },
//   listHeader: {
//     height: 16,
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
//   loadMoreButton: { padding: 10, backgroundColor: '#f0f0f0', borderRadius: 8 },
// });
