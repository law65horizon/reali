import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { IconSymbol } from '@/components/ui/IconSymbol';
import ImageCarousel from '@/components/ui/ImageCarousel';
import { useTheme } from '@/theme/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Image } from 'expo-image';
import { Link, router, useLocalSearchParams, useNavigation } from 'expo-router';
import React, { useRef } from 'react';
import { Animated, Dimensions, NativeScrollEvent, NativeSyntheticEvent, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

const { width, height } = Dimensions.get('screen');

export default function ListingDetail() {
  const navigation = useNavigation()
  const { listing } = useLocalSearchParams(); // Retrieve the dynamic parameter
  const decodedListing = decodeURIComponent(listing as string);
  const theme = useTheme().theme;
  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null)

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
      },
    }
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background, borderTopStartRadius: 20, borderTopEndRadius: 20 }}>
      <Animated.View
        style={[
          styles.header,
          {
            backgroundColor: scrollY.interpolate({
              inputRange: [0, imageHeight - headerHeight - 35],
              // outputRange: ['transparent', 'rgba(0, 0, 0, 0.)'],
              outputRange: ['transparent', [theme.colors.tint].toString()],
              extrapolate: 'clamp',
            }),
            borderBottomWidth: scrollY.interpolate({
              inputRange: [imageHeight - headerHeight, imageHeight - 35],
              outputRange: [0, 1],
              extrapolate: 'clamp',
            }),
            borderBottomColor: theme.colors.backgroundSec,
            top: 0,
            paddingTop: 40
          },
        ]}
      >
        <View style={{ flex: 1, justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row' }}>
          <TouchableOpacity onPress={() => (navigation.goBack())} style={{ padding: 8, borderRadius: 50, backgroundColor: 'rgba(245, 247, 250, 0.76)' }}>
            <IconSymbol name="arrow.left" color={'black'} size={24} />
          </TouchableOpacity>
          <View style={{ alignItems: 'center', gap: 10, flexDirection: 'row' }}>
            <View style={[styles.icon, { backgroundColor: 'rgba(245, 247, 250, 0.76)' }]}>
              <IconSymbol name="shared.with.you" color={'black'} />
            </View>
            <View style={[styles.icon, { backgroundColor: 'rgba(245, 247, 250, 0.76)' }]}>
              <IconSymbol name="shared.with.you" color={'black'} />
            </View>
          </View>
        </View>
      </Animated.View>
      <Animated.ScrollView
        // onScroll={Animated.event(
        //   [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        //   { useNativeDriver: false }
        // )}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        // style={{transform: [{scale}]}}
      >

        <ImageCarousel imageHeight={imageHeight} images={images} width={width} showNumber={true}/>
        {/* <View style={[styles.imageContainer, {borderTopRightRadius: 20}]}>
          <Animated.FlatList 
            data={images}
            renderItem={({item, index}) => (
              <View>
                <Image
                 source={item} 
                 style={{
                  width: width, 
                  height:imageHeight,
                  borderTopLeftRadius: 40,
                  borderTopRightRadius: 40
                }}
                />
                <View style={{position: 'absolute', bottom: 40, padding: 6, borderRadius: 5, right: 20,  backgroundColor: 'rgba(38, 38, 39, 0.76)'}}>
                  <Text style={{color: 'white'}} > {index + 1} / {images.length } </Text>
                </View>
              </View>
            )}
            // contentContainerStyle={{width}}
            horizontal
            pagingEnabled
          />
        </View> */}
        <View style={[styles.scrollView, ]}>
        {/* <ImageCarousel imageHeight={imageHeight} images={images} width={width} /> */}
          
          <ThemedView plain style={[styles.content, {backgroundColor: theme.colors.background}]}>
            <ThemedText type='title' style={styles.title}>Single room in 90 sm apartment</ThemedText>
            <ThemedText type='body' secondary style={styles.subtitle}>Room in Milan, Italy</ThemedText>
            <ThemedText type='caption' secondary style={styles.details}>1 single bed • Shared bathroom</ThemedText>
            
            <View style={styles.ratingContainer}>
              <View style={styles.ratingRow}>
                <MaterialCommunityIcons name='star' color={theme.colors.warning} size={16} />
                <ThemedText type='body' style={styles.ratingText}>4.81</ThemedText>
              </View>
              <View style={[styles.guestFavorite, { backgroundColor: theme.colors.backgroundSec }]}>
                <MaterialCommunityIcons name='leaf' color={theme.colors.primary} size={16} />
                <ThemedText type='caption' style={[styles.guestFavoriteText, {color: theme.colors.primary}]}>Guest favourite</ThemedText>
              </View>
              <ThemedText type='caption' secondary style={styles.reviews}>566 Reviews</ThemedText>
            </View>
            {/* <View style={styles.hostInfo}> */}
            <Link href={'/host_profile/[host_profile]'} style={[styles.hostInfo, ]}>
              <Image
                source={require('@/assets/images/host-avatar.jpg')} // Replace with actual host image
                style={styles.hostAvatar}
              />
              <View style={[styles.hostText, {paddingLeft: 10}]}>
                <ThemedText style={[styles.hostName, {color: theme.colors.textSecondary}]}>Hosted by Andrea</ThemedText>
                <ThemedText style={[styles.hostDetails, {color: theme.colors.textSecondary}]}>Superhost • 10 years hosting</ThemedText>
              </View>
              {/* <View style={styles.superhostBadge} /> */}
            </Link>
            {/* </View> */}
            <ThemedText secondary={true} style={styles.checkinNote}>Great check-in experience</ThemedText>
            <ThemedText secondary={true} style={styles.checkinSubtext}>Recent guests loved the smooth start to this stay.</ThemedText>
            <Card style={styles.rareFindBanner}>
              <View style={styles.rareFindContent}>
                <MaterialCommunityIcons name='fire' color={theme.colors.warning} size={20} />
                <ThemedText type='body' style={styles.rareFindText}>Rare find! This place is usually booked</ThemedText>
              </View>
            </Card>
            
            <View style={styles.priceSection}>
              <ThemedText type='heading' style={styles.price}>$40/night</ThemedText>
              <ThemedText type='caption' secondary style={styles.cancellation}>Free cancellation</ThemedText>
            </View>
            
            <Button 
              title="Reserve" 
              onPress={() => alert('Booking triggered')} 
              variant="primary" 
              size="large" 
              fullWidth
              style={styles.reserveButton}
            />

            {/* About this place */}
            <ThemedText style={styles.sectionTitle}>About this place</ThemedText>
            <ThemedText secondary style={[styles.sectionText,]}>
              I rent two rooms in a 90sm apartment, located at 4th floor without lift, at 100 mt of distance from underground MM3 Porto di Mare and 200 mt from Rogoredo, train and bus station. It was my grandma home, I lived there for 18 years, in the time I have almost renewed it completely. Thanks to Airbnb, in the last years, I have had the possibility to host hundreds guests from all over...
            </ThemedText>
            <Button 
              title="Show more" 
              onPress={() => router.push('/about/[about]')} 
              variant="outline" 
              size="medium" 
              style={styles.showMoreButton}
            />

            {/* Where you'll sleep */}
            <ThemedText style={styles.sectionTitle}>Where you'll sleep</ThemedText>
            <View style={styles.sleepInfo}>
              <View style={styles.sleepIcon}>
                {/* Placeholder for bed icon */}
                <Text>🛏️</Text>
              </View>
              <ThemedText secondary style={styles.sleepText}>Bedroom • 1 single bed</ThemedText>
            </View>

            {/* What this place offers */}
            <ThemedText style={styles.sectionTitle}>What this place offers</ThemedText>
            <View style={styles.amenities}>
              <ThemedText secondary style={styles.amenity}>• Lock on bedroom door</ThemedText>
              <ThemedText secondary style={styles.amenity}>• Kitchen</ThemedText>
              <ThemedText secondary style={styles.amenity}>• Wifi</ThemedText>
              <ThemedText secondary style={styles.amenity}>• TV</ThemedText>
              <ThemedText secondary style={styles.amenity}>• Washing machine</ThemedText>
            </View>
            <TouchableOpacity style={styles.showMore}>
              <ThemedText secondary style={styles.showMoreText}>Show all 36 amenities</ThemedText>
            </TouchableOpacity>

            {/* Where you'll be */}
            <ThemedText style={styles.sectionTitle}>Where you'll be</ThemedText>
            <Image
              source={require('@/assets/images/map.jpg')} // Replace with actual map image
              style={styles.mapImage}
            />
            <ThemedText secondary style={styles.mapNote}>Exact location provided after booking.</ThemedText >

            {/* Guest reviews */}
            <View style={styles.reviewSection}>
              <Text style={[styles.ratingLarge, {color: theme.colors.text}]}>4.81</Text>
              {/* <ThemedText style={styles.ratingLarge}>4.81</ThemedText> */}
              <View style={styles.guestFavorite}>
                <ThemedText style={styles.guestFavoriteText}>Guest favourite</ThemedText>
              </View>
              <ThemedText secondary style={styles.reviewSubtext}>This home is a guest favourite based on ratings, reviews and reliability</ThemedText>
              <View style={styles.reviewItem}>
                <Image
                  source={require('@/assets/images/guest-avatar.jpg')} // Replace with actual guest image
                  style={styles.guestAvatar}
                />
                <ThemedText secondary style={[styles.reviewText, {textIndent: '1'}]}>
                  Andrea's place was very good. Nice colony, nice house, nice room. 
                  It's very close to the metro station just 5 min walking. The city centre is very close from the apartment. H...
                </ThemedText>
              </View>
              <TouchableOpacity style={styles.showMore}>
                <ThemedText secondary style={styles.showMoreText}>Show more</ThemedText>
              </TouchableOpacity>
            </View>

            {/* Meet your host */}
            <ThemedText style={styles.sectionTitle}>Meet your host</ThemedText>
            <View style={styles.hostProfile}>
              <Image
                source={require('@/assets/images/host-avatar.jpg')} // Replace with actual host image
                style={styles.hostAvatar}
              />
              <View style={styles.hostStats}>
                <ThemedText secondary style={styles.hostStat}>709 Reviews</ThemedText>
                <ThemedText secondary style={styles.hostStat}>4.8 ★</ThemedText>
                <ThemedText secondary style={styles.hostStat}>10 Years hosting</ThemedText>
              </View>
            </View>
            <ThemedText secondary style={styles.hostBio}>
              Hi, I'm Andrea, a citizen of the world, I love to travel, meeting people and different cultures. Since 2015 I joined Airbnb and I appreciate its philosophy, I had a great time, I have memories of friends in the countries where I used it. When my parents passed away, I found myself the owner of two houses and I am offering my available accommodation in what used to be my grandparents’ house. An apartment on the southern outskirts of Milan, very well connected to the center, the Central station and the Rogoredo station. An apartment renovated and refurbished by me in the 18 years that I lived there, but which has kept the original spirit. My interests are not constant, I go to periods, I don’t have a fixed work commitment, usually I can guarantee the welcome with the maximum flexibility. I'm not much of a talker, but for whatever, I can make myself available. I don’t speak English fluently, but I’m able to let me understand, lo mismo por español...
            </ThemedText>
            <TouchableOpacity style={styles.showMore}>
              <ThemedText secondary style={styles.showMoreText}>Show more</ThemedText>
            </TouchableOpacity>

            {/* Host details and additional sections */}
            <View style={styles.hostDetailsSection}>
              <ThemedText style={styles.hostDetailsText}>Andrea is a Superhost</ThemedText>
              <ThemedText secondary style={styles.hostDetailsSubtext}>
                Superhosts are experienced, highly rated hosts who are committed to providing great stays for guests.
              </ThemedText>
              <ThemedText secondary style={styles.hostDetailsItem}>Response rate: 100%</ThemedText>
              <ThemedText secondary style={styles.hostDetailsItem}>Responds within an hour</ThemedText>
            </View>
            <Button 
              title="Message host" 
              onPress={() => {}} 
              variant="secondary" 
              size="medium" 
              fullWidth
              style={styles.messageButton}
            />
            <ThemedText style={styles.availability}>Availability</ThemedText>
            <ThemedText secondary style={styles.availabilityText}>22 - 24 Aug</ThemedText>
            <ThemedText style={styles.cancellationPolicy}>Cancellation policy</ThemedText>
            <ThemedText secondary style={styles.cancellationPolicyText}>Free cancellation before 21 Aug. Cancel before check-in on 22 Aug for a partial refund.</ThemedText>
            <ThemedText style={styles.houseRules}>House rules</ThemedText>
            <ThemedText secondary style={styles.houseRule}>1 guest maximum</ThemedText>
            <ThemedText secondary style={styles.houseRule}>Smoking is allowed</ThemedText>
            <TouchableOpacity style={styles.showMore}>
              <ThemedText secondary style={styles.showMoreText}>Show more</ThemedText>
            </TouchableOpacity>
            <ThemedText style={styles.safety}>Safety & property</ThemedText>
            <ThemedText secondary style={styles.safetyItem}>Carbon monoxide alarm</ThemedText>
            <ThemedText secondary style={styles.safetyItem}>Smoke alarm</ThemedText>
            <TouchableOpacity style={styles.showMore}>
              <ThemedText secondary style={styles.showMoreText}>Show more</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
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
    padding: 8,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
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
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    fontFamily: 'Roboto',
  },
  sectionText: {
    fontSize: 14,
    marginTop: 5,
    fontFamily: 'Roboto',
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
    marginTop: 10,
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
    fontSize: 12,
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