import DraggableModal from '@/components/DraggableModal';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import Button from '@/components/ui/Button';
import ImageCarousel from '@/components/ui/ImageCarousel';
import { Line } from '@/components/ui/Line';
import StarRating from '@/components/ui/StarRating';
import { useTheme } from '@/theme/theme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Animated, Dimensions, FlatList, NativeScrollEvent, NativeSyntheticEvent, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import AboutModal from '../about/[about]';

const { width, height } = Dimensions.get('screen');

export default function ListingDetail() {
  const navigation = useNavigation()
  const { listing } = useLocalSearchParams(); // Retrieve the dynamic parameter
  const decodedListing = decodeURIComponent(listing as string);
  const theme = useTheme().theme;
  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null)
  const [aboutModal, showAboutModal] = useState(false)
  const [featuresModal, showFeaturesModal] = useState(false)

  const headerHeight = 60; // Height of the header
  const imageHeight = 400; // Height of the top image

  const images = [
    require('@/assets/images/image.png'),
    require('@/assets/images/living-room.jpg'),
    require('@/assets/images/image3.jpg'),
    // Add more images up to 25
    // ...require('@/assets/images/image4.jpg'), etc.
  ]

  useFocusEffect(
    React.useCallback(() => {
      scrollY.setValue(0)
      isPulling.current = false
      // scrollRef.current?.scale
    }, [])
  )

  const lastScrollY = useRef(0);
  const isPulling = useRef(false);

  console.log(lastScrollY.current, 'isoisois')
  
  const scale = scrollY.interpolate({
    inputRange: [-100, 0], // Zoom out when pulling up to -100 pixels
    outputRange: [0.9, 1], // Scale from 90% to 100%
    extrapolate: 'clamp',
  });

  

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
      listener: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const currentScrollY = event.nativeEvent.contentOffset.y;
        const isAtTop = currentScrollY <= 0;

        if (currentScrollY < -130 && !isPulling.current) {
          isPulling.current = true;
          navigation.goBack();
        }

        lastScrollY.current = currentScrollY;
        // console.log('ops',lastScrollY.current)
      },
    }
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background, }}>
      <Animated.View
        style={[
          styles.header,
          {
            backgroundColor: scrollY.interpolate({
              inputRange: [0, imageHeight - headerHeight - 35],
              // outputRange: ['transparent', 'rgba(0, 0, 0, 0.)'],
              outputRange: ['transparent', [theme.colors.background].toString()],
              extrapolate: 'clamp',
            }),
            borderBottomWidth: scrollY.interpolate({
              inputRange: [imageHeight - headerHeight, imageHeight - 35],
              outputRange: [0, 1],
              extrapolate: 'clamp',
            }),
            borderBottomColor: theme.colors.backgroundSec,
            top: 0,
            paddingTop: scrollY.interpolate({
              inputRange: [-130, 0],
              outputRange: [165, 40],
              extrapolate: 'clamp'
            })
          },
        ]}
      >
        <View style={{ flex: 1, justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row' }}>
          <TouchableOpacity onPress={() => (navigation.goBack())} style={[styles.icon, { backgroundColor: theme.mode == 'dark' ? 'rgba(197, 202, 209, 0.76)': 'rgba(245, 247, 250, 0.76)'  }]}>
            <Ionicons name="arrow-back" color={'black'} size={22} />
          </TouchableOpacity>
          <View style={{ alignItems: 'center', gap: 10, flexDirection: 'row' }}>
            <TouchableOpacity onPress={() => router.push('/(guest)/(modals)/experienceDetail/[query]')} style={[styles.icon, { backgroundColor: theme.mode == 'dark' ? 'rgba(197, 202, 209, 0.76)': 'rgba(245, 247, 250, 0.76)'  }]}>
              <Ionicons name="share-outline" color={'black'} size={22}/>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.icon, { backgroundColor: theme.mode == 'dark' ? 'rgba(197, 202, 209, 0.76)': 'rgba(245, 247, 250, 0.76)'  }]}>
              <Ionicons name={true ? 'heart' : 'heart-outline'} color={theme.colors.error} size={22} />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
      <Animated.ScrollView
        onScroll={handleScroll}
        scrollEventThrottle={16}
        // indicatorStyle={{}}
        // style={{transform: [{scale}]}}
      >

        <ImageCarousel imageHeight={imageHeight} images={images} width={width} showNumber={true} modal />

        <View style={[styles.scrollView, ]}>
          
          <ThemedView plain style={[styles.content, {backgroundColor: theme.colors.background}]}>
            <ThemedText type='title' style={styles.title}>Single room in 90 sm apartment</ThemedText>
            <View style={{flexDirection: 'row', flex: 1, }}>
              <View style={{flex:1}}>
                <ThemedText type='body' secondary style={styles.subtitle}>Room in Milan, Italy,</ThemedText>
                <ThemedText type='body' secondary style={styles.subtitle}>City Country.</ThemedText>
                <ThemedText type='caption' secondary style={styles.details}>1 single bed • Shared bathroom</ThemedText>
              </View>
              <TouchableOpacity>
                <Image 
                  source={require('@/assets/images/map.jpg')} 
                  style={{width: 70, height: 70, borderRadius: 10, borderWidth: 2, borderColor: theme.colors.border}} 
                />
                <View style={{position: 'absolute', left: 0, top: 0, width: 70, height: 70, alignItems:'center', justifyContent: 'center' }}>
                  <Ionicons name='location-sharp' size={30} color={theme.colors.primary}/>
                </View>
              </TouchableOpacity>
            </View>
            
            {/* <View style={styles.ratingContainer}>
              <View style={styles.ratingRow}>
                <MaterialCommunityIcons name='star' color={theme.colors.warning} size={16} />
                <ThemedText type='body' style={styles.ratingText}>4.81</ThemedText>
              </View>
              <View style={[styles.guestFavorite, { backgroundColor: theme.colors.backgroundSec }]}>
                <MaterialCommunityIcons name='leaf' color={theme.colors.primary} size={16} />
                <ThemedText type='caption' style={[styles.guestFavoriteText, {color: theme.colors.primary}]}>Guest favourite</ThemedText>
              </View>
              <ThemedText type='caption' secondary style={styles.reviews}>566 Reviews</ThemedText>
            </View> */}

            {/* <View style={styles.hostInfo}> */}
            {/* <Link href={'/host_profile/[host_profile]'} style={[styles.hostInfo, ]}>
              <Image
                source={require('@/assets/images/host-avatar.jpg')} // Replace with actual host image
                style={styles.hostAvatar}
              />
              <View style={[styles.hostText, {paddingLeft: 10}]}>
                <ThemedText style={[styles.hostName, {color: theme.colors.textSecondary}]}>Hosted by Andrea</ThemedText>
                <ThemedText style={[styles.hostDetails, {color: theme.colors.textSecondary}]}>Superhost • 10 years hosting</ThemedText>
              </View>
            </Link> */}
            
            <View style={[styles.shadow1, {backgroundColor: theme.mode == 'dark'? theme.colors.backgroundSec: theme.colors.background, padding: 10, borderRadius: 12, gap: 10, marginTop: 15, borderWidth:0.5, borderColor:theme.colors.border}]}>
              <View style={{flexDirection: 'row', alignItems:'center', gap: 10, borderBottomWidth: 1, borderColor: theme.colors.border, paddingBottom: 5}}>                          
                <Image source={require('@/assets/images/host-avatar.jpg')} style={{width: 50, height: 50, borderRadius: '50%'}} />
                <View style={{justifyContent: 'space-between', flexWrap: 'wrap', flex:1}}>
                  <ThemedText type='defaultSemiBold'>Hosted by Andrea</ThemedText>
                  <ThemedText secondary style={{flexShrink: 1, width: '100%'}}>Superhost • 10 years hosting </ThemedText>
                </View>
              </View>
              <View style={{flexDirection: 'row', alignItems:'center', gap: 10, borderBottomWidth: 1, borderColor: theme.colors.border, paddingBottom: 5}}>                          
                <Ionicons name='home-outline' size={40} color={theme.colors.text} />
                <View style={{justifyContent: 'space-between', flexWrap: 'wrap', flex:1}}>
                  <ThemedText type='defaultSemiBold'>House</ThemedText>
                  <ThemedText secondary style={{flexShrink: 1, width: '100%'}}>You'll own the entire house </ThemedText>
                </View>
              </View>
              <View style={{flexDirection: 'row', alignItems:'center', gap: 10, borderBottomWidth: 0, borderColor: theme.colors.border, paddingBottom: 5}}>                          
                <Ionicons name='location-outline' size={40} color={theme.colors.text} />
                <View style={{justifyContent: 'space-between', flexWrap: 'wrap', flex:1}}>
                  <ThemedText type='defaultSemiBold'>Great check-in experience</ThemedText>
                  <ThemedText secondary style={{flexShrink: 1, width: '100%'}}>Recent guests loved the smooth start to this stay. </ThemedText>
                </View>
              </View>
            </View>
{/* 
            <Card style={styles.rareFindBanner}>
              <View style={styles.rareFindContent}>
                <MaterialCommunityIcons name='fire' color={theme.colors.warning} size={20} />
                <ThemedText type='body' style={styles.rareFindText}>Rare find! This place is usually booked</ThemedText>
              </View>
            </Card> */}
            
            {/* <View style={styles.priceSection}>
              <ThemedText type='heading' style={styles.price}>$40/night</ThemedText>
              <ThemedText type='caption' secondary style={styles.cancellation}>Free cancellation</ThemedText>
            </View> */}
            
            
            {/* About this place */}
            <ThemedText style={styles.sectionTitle}>About this place</ThemedText>
            <ThemedText type='body' style={[styles.sectionText, ]}>
              I rent two rooms in a 90sm apartment, located at 4th floor without lift, at 100 mt of distance from underground MM3 Porto di Mare and 200 mt from Rogoredo, train and bus station. It was my grandma home, I lived there for 18 years, in the time I have almost renewed it completely. Thanks to Airbnb, in the last years, I have had the possibility to host hundreds guests from all over...
            </ThemedText>
            <Button 
              title="Show more" 
              onPress={() => showAboutModal(true)} 
              // onPress={() => router.push('/about/[about]')} 
              variant="outline" 
              size="medium" 
              style={styles.showMoreButton}
            />

            {aboutModal && (
              <DraggableModal isVisible={aboutModal} onClose={() => showAboutModal(false)} backgroundColor={theme.colors.background} height={height * 0.8}>
                <AboutModal />
              </DraggableModal>
            )}

            {/* Where you'll sleep */}
            {/* <ThemedText style={styles.sectionTitle}>Where you'll sleep</ThemedText>
            <View style={styles.sleepInfo}>
              <View style={styles.sleepIcon}>
                <Text>🛏️</Text>
              </View>
              <ThemedText secondary style={styles.sleepText}>Bedroom • 1 single bed</ThemedText>
            </View> */}

            {/* What this place offers */}
            <View>
              <ThemedText style={styles.sectionTitle}>What this place offers</ThemedText>
              <View style={styles.amenities}>
                {/* <FeatureIcon feature='wifi' />
                <FeatureIcon feature='airConditioning' />
                <FeatureIcon feature='gym' />
                <FeatureIcon feature='parking' />
                // <FeatureIcon feature='pool' /> */}
              </View>
              <TouchableOpacity onPress={() => showFeaturesModal(true)} style={{marginTop: 10, alignItems:'center', justifyContent:'center', borderRadius: 12, paddingHorizontal: 20, paddingVertical: 12, backgroundColor: theme.colors.backgroundSec}}>
                <ThemedText type='defaultSemiBold' >Show all 36 amenities</ThemedText>
              </TouchableOpacity>

              {/* <PropertiesFeatures pid='1' isVisible={featuresModal} setModalVisible={showFeaturesModal} /> */}
            </View>

            {/* Where you'll be */}
            <ThemedText style={styles.sectionTitle}>Where you'll be</ThemedText>
            <Image
              source={require('@/assets/images/map.jpg')} // Replace with actual map image
              style={styles.mapImage}
            />
            <ThemedText secondary style={styles.mapNote}>Exact location provided after booking.</ThemedText >

            <Button 
              title="Book a Tour" 
              onPress={() => alert('Booking triggered')} 
              variant="primary" 
              size="medium" 
              fullWidth
              style={styles.reserveButton}
            />
            
            {/* Guest reviews */}
            <View >
                <ThemedText style={styles.sectionTitle}>Reviews</ThemedText>

              {/* <Text style={[styles.ratingLarge, {color: theme.colors.text}]}>4.81</Text> */}
              {/* <ThemedText style={styles.ratingLarge}>4.81</ThemedText> */}
              {/* <View style={styles.guestFavorite}>
                <ThemedText style={styles.guestFavoriteText}>Guest favourite</ThemedText>
              </View> */}
              <FlatList 
                data={[0,1,2,3,4,5]}
                renderItem={({index, item}) => (
                  <View style={[styles.shadow1, {padding: 15, borderRadius: 12, gap: 7, backgroundColor: theme.colors.background, width:index == 0 ?width-55: width-42, shadowColor: theme.colors.shadow, marginHorizontal: 5}]}>
                  <View style={{flexDirection: 'row', alignItems:'center', gap: 10, }}>
              
                    <Image source={require('@/assets/images/host-avatar.jpg')} style={{width: 45, height: 45, borderRadius: '50%'}} />
                    <View style={{justifyContent: 'space-between', flexWrap: 'wrap', flex:1}}>
                      <ThemedText type='defaultSemiBold'>{'Jack'} </ThemedText>
                      <ThemedText secondary>Denmark </ThemedText>
                    </View>
                  </View>
                  <View style={{flexDirection:'row', alignItems:'center', gap: 3}}>
                    <StarRating rating={4}/>
                    <MaterialCommunityIcons name='circle' color={theme.colors.textSecondary} size={5} />
                    <ThemedText>{'3 days ago'} </ThemedText>
                  </View>
                  <ThemedText style={{color: theme.colors.textSecondary}}> Lorem ipsum dolor sit amet consectetur adipisicing elit. Sequi, dicta. </ThemedText>
                </View>
                )}
                horizontal
                contentContainerStyle={{paddingBottom: 10, paddingTop: 20}}
                showsHorizontalScrollIndicator={false}
                pagingEnabled
              />
              {/* <ThemedText secondary style={styles.reviewSubtext}>This home is a guest favourite based on ratings, reviews and reliability</ThemedText> */}
              
              <Button 
                title="Show all" 
                onPress={() => router.push('/about/[about]')} 
                variant="outline" 
                size="medium" 
                style={styles.showMoreButton}
              />
            </View>

            {/* Meet your host */}
            <View style={{gap: 10, marginTop: 20}}>
              <ThemedText type='subtitle'>Meet your host</ThemedText>
              <TouchableOpacity onPress={() => router.push('/host_profile/[]')} style={[styles.shadow, {width: '98%', height: 230, borderRadius: 20, borderWidth: 0.2, padding: 20, paddingHorizontal: 30, flexDirection: 'row', 
               backgroundColor: theme.mode == 'dark'? theme.colors.backgroundSec: theme.colors.background, borderColor: theme.colors.textSecondary, gap: 0
              }]}>
                <View style={{height: '100%', width: '40%', justifyContent: 'center', alignItems:'center', }}>
                  <Image
                    source={require('@/assets/images/host-avatar.jpg')} // Replace with actual host image
                    style={styles.hostAvatar}
                  />
                  <ThemedText type='title'>Andrea</ThemedText>
                  <ThemedText type='defaultSemiBold'>SuperHost</ThemedText>
                </View>
                <Line orientation='vertical' style={{marginHorizontal: 40}} />
                <View style={{ justifyContent: 'space-evenly'}}>
                  <View>
                    <ThemedText type='subtitle'>3.5</ThemedText>
                    <StarRating rating={3.5} />
                  </View>
                  <View>
                    <ThemedText type='subtitle'>10</ThemedText>
                    <ThemedText type='defaultSemiBold' style={{color: theme.colors.textSecondary}}>Years</ThemedText>
                  </View>
                  <View>
                    <ThemedText type='subtitle'>321</ThemedText>
                    <ThemedText type='defaultSemiBold' style={{color: theme.colors.textSecondary}}>Reviews</ThemedText>
                  </View>
                </View>
              </TouchableOpacity>
              <ThemedText type='body' >
                Hi, I'm Andrea, a citizen of the world, I love to travel, meeting people and different cultures. Since 2015 I joined Airbnb and I appreciate its philosophy, I had a great time, I have memories of friends in the countries where I used it. When my parents passed away, I found myself the owner of two houses and I am offering my available accommodation in what used to be my grandparents’ house. An apartment on the southern outskirts of Milan, very well connected to the center, the Central station and the Rogoredo station. An apartment renovated and refurbished by me in the 18 years that I lived there, but which has kept the original spirit. My interests are not constant, I go to periods, I don’t have a fixed work commitment, usually I can guarantee the welcome with the maximum flexibility. I'm not much of a talker, but for whatever, I can make myself available. I don’t speak English fluently, but I’m able to let me understand, lo mismo por español...
              </ThemedText>

              {/* Host details and additional sections */}
              <View >
                <ThemedText type='defaultSemiBold' >Andrea is a Superhost</ThemedText>
                <ThemedText secondary style={styles.hostDetailsSubtext}>
                  Superhosts are experienced, highly rated hosts who are committed to providing great stays for guests.
                </ThemedText>
                <ThemedText secondary style={styles.hostDetailsItem}>Response rate: 100%</ThemedText>
                <ThemedText secondary style={styles.hostDetailsItem}>Responds within an hour</ThemedText>
              </View>
              <Button 
                title="Message Andrea" 
                onPress={() => {}} 
                variant="secondary" 
                size="medium" 
                fullWidth
              />
            </View>
            {/* <ThemedText style={styles.availability}>Availability</ThemedText>
            <ThemedText secondary style={styles.availabilityText}>22 - 24 Aug</ThemedText> */}
            <View style={{borderBottomWidth: 1, borderColor: theme.colors.border, paddingBottom: 10}}>
              <ThemedText style={styles.cancellationPolicy}>Cancellation policy</ThemedText>
              <ThemedText secondary style={styles.cancellationPolicyText}>Free cancellation before 21 Aug. Cancel before check-in on 22 Aug for a partial refund.</ThemedText>
            </View>
            {/* <ThemedText style={styles.houseRules}>House rules</ThemedText>
            <ThemedText secondary style={styles.houseRule}>1 guest maximum</ThemedText>
            <ThemedText secondary style={styles.houseRule}>Smoking is allowed</ThemedText>
            <TouchableOpacity style={styles.showMore}>
              <ThemedText secondary style={styles.showMoreText}>Show more</ThemedText>
            </TouchableOpacity> */}
            <View style={{borderBottomWidth: 1, borderColor: theme.colors.border, paddingBottom: 10}}>
              <ThemedText style={styles.safety}>Safety & property</ThemedText>
              <ThemedText secondary style={styles.safetyItem}>Carbon monoxide alarm</ThemedText>
              <ThemedText secondary style={styles.safetyItem}>Smoke alarm</ThemedText>
              <TouchableOpacity style={styles.showMore}>
                <ThemedText secondary style={styles.showMoreText}>Show more</ThemedText>
              </TouchableOpacity>
            </View>
          </ThemedView>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    shadowOffset: { width: 0, height: 0},
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowColor: '#000',
    elevation: 6,
  },
  shadow1: {
    shadowOffset: { width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 6,
    
  },
  container: {
    flex: 1,
    // backgroundColor: 'black',
  },
  header: {
    position: 'absolute',
    width: width,
    zIndex: 30,
    top: 30,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  icon: {
    padding: 6,
    borderRadius: 50,
  },
  imageContainer: {
    position: 'relative',
  },
  topImage: {
    width: width,
    height: 400,
    resizeMode: 'cover',
    zIndex: 1,
  },
  imageCounter: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    // color: '#8B4513',
    fontSize: 12,
    fontFamily: 'Roboto',
  },
  scrollView: {
    flex: 1,
    position: 'relative',
    zIndex: 2,
  },
  content: {
    top: -20,
    padding: 16,
    backgroundColor: 'white',
    width: width,
    borderTopEndRadius: 20,
    borderTopStartRadius: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
    fontFamily: 'Roboto',
  },
  subtitle: {
    fontSize: 14,
    // color: '#757575',
    marginTop: 5,
    fontFamily: 'Roboto',
  },
  details: {
    fontSize: 14,
    // color: '#757575',
    marginTop: 10,
    fontFamily: 'Roboto',
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'SpaceMono',
  },
  guestFavorite: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  guestFavoriteText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'SpaceMono',
  },
  reviews: {
    fontSize: 14,
    // color: '#757575',
    fontFamily: 'Roboto',
  },
  hostInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  hostAvatar: {
    width: 130,
    height: 130,
    borderRadius: '50%',
  },
  hostText: {
    flex: 1,
  },
  hostName: {
    fontSize: 14,
    fontFamily: 'Roboto',
  },
  hostDetails: {
    fontSize: 12,
    // color: '#757575',
    fontFamily: 'Roboto',
  },
  superhostBadge: {
    width: 10,
    height: 10,
    backgroundColor: '#D81B60',
    borderRadius: 5,
    position: 'absolute',
    top: 0,
    right: 0,
  },
  checkinNote: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 10,
    fontFamily: 'Roboto',
  },
  checkinSubtext: {
    fontSize: 12,
    marginTop: 5,
    fontFamily: 'Roboto',
  },
  rareFindBanner: {
    marginTop: 16,
    marginBottom: 16,
  },
  rareFindContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rareFindText: {
    fontSize: 14,
    fontFamily: 'SpaceMono',
    flex: 1,
  },
  priceSection: {
    marginBottom: 16,
  },
  showMoreButton: {
    marginTop: 16,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'SpaceMono',
    marginBottom: 4,
  },
  cancellation: {
    fontSize: 12,
    marginTop: 5,
    fontFamily: 'Roboto',
  },
  reserveButton: {
    marginTop: 16,
    marginBottom: 24,
  },
  reserveText: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: 'bold',
    fontFamily: 'Roboto',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    fontFamily: 'Roboto',
  },
  sectionText: {
    // fontSize: 14,
    marginTop: 5,
    // fontFamily: 'Roboto',
    // fontWeight: 500
  },
  showMore: {
    marginTop: 5,
  },
  showMoreText: {
    fontSize: 14,
    fontFamily: 'Roboto',
  },
  sleepInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  sleepIcon: {
    marginRight: 10,
  },
  sleepText: {
    fontSize: 14,
    fontFamily: 'Roboto',
  },
  amenities: {
    marginTop: 10,
  },
  amenity: {
    fontSize: 14,
    marginTop: 5,
    fontFamily: 'Roboto',
  },
  mapImage: {
    width: width - 32,
    height: 200,
    marginTop: 10,
    borderRadius: 8,
  },
  mapNote: {
    fontSize: 12,
    // color: '#757575',
    marginTop: 5,
    fontFamily: 'Roboto',
  },
  reviewSection: {
    marginTop: 20,
  },
  ratingLarge: {
    fontSize: 40,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'Roboto',
  },
  reviewSubtext: {
    fontSize: 14,
    // color: '#757575',
    textAlign: 'center',
    marginTop: 5,
    fontFamily: 'Roboto',
  },
  reviewItem: {
    // flexDirection: 'row',
    marginTop: 10,
  },
  guestAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  reviewText: {
    fontSize: 14,
    // color: '#757575',
    fontFamily: 'Roboto',
  },
  hostProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal:5,
    justifyContent: 'space-between'
  },
  hostStats: {
    marginLeft: 10,
  },
  hostStat: {
    fontSize: 14,
    // color: '#757575',
    fontFamily: 'Roboto',
  },
  hostBio: {
    fontSize: 14,
    // color: '#757575',
    marginTop: 10,
    fontFamily: 'Roboto',
  },
  hostDetailsSection: {
    marginTop: 20,
  },
  hostDetailsText: {
    fontSize: 14,
    fontFamily: 'Roboto',
  },
  hostDetailsSubtext: {
    fontSize: 14,
    // color: '#757575',
    marginTop: 5,
    fontFamily: 'Roboto',
  },
  hostDetailsItem: {
    fontSize: 14,
    // color: '#757575',
    marginTop: 5,
    fontFamily: 'Roboto',
  },
  messageButton: {
    marginTop: 16,
  },
  messageText: {
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'Roboto',
  },
  availability: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    fontFamily: 'Roboto',
  },
  availabilityText: {
    fontSize: 14,
    // color: '#757575',
    marginTop: 5,
    fontFamily: 'Roboto',
  },
  cancellationPolicy: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    fontFamily: 'Roboto',
  },
  cancellationPolicyText: {
    fontSize: 14,
    // color: '#757575',
    marginTop: 5,
    fontFamily: 'Roboto',
  },
  houseRules: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    fontFamily: 'Roboto',
  },
  houseRule: {
    fontSize: 14,
    // color: '#757575',
    marginTop: 5,
    fontFamily: 'Roboto',
  },
  safety: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    fontFamily: 'Roboto',
  },
  safetyItem: {
    fontSize: 14,
    // color: '#757575',
    marginTop: 5,
    fontFamily: 'Roboto',
  },
});