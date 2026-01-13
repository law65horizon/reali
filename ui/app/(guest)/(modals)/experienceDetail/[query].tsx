import { ThemedText } from '@/components/ThemedText';
import { Line } from '@/components/ui/Line';
import AmenitiesModal from '@/components/ui/PropertiesFeatures';
import StarRating from '@/components/ui/StarRating';
import { ErrorState } from '@/components/ui/StateComponents';
import { useGetProperty } from '@/hooks/useSearchProp';
import { useFavoritesStore } from '@/stores';
import { useTheme } from '@/theme/theme';
import { formatDate, timeDifference } from '@/utils/formatDate';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const propertyData = {
  images: [
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
    'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800',
  ],
  title: 'Modern Downtown Loft',
  type: 'Entire home',
  rating: 4.9,
  reviewCount: 127,
  beds: 2,
  bathrooms: 2,
  guests: 4,
  price: 180,
  location: 'Downtown Los Angeles, CA',
  host: {
    name: 'Sarah Johnson',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    joined: 'Joined in 2019',
    verified: true,
  },
  description: 'Welcome to this stunning modern loft in the heart of downtown! This beautifully designed space features floor-to-ceiling windows with breathtaking city views, an open-concept living area, and high-end finishes throughout.\n\nThe space is perfect for professionals, couples, or small families looking to experience the vibrant city life. You\'ll be within walking distance of world-class restaurants, entertainment venues, and cultural attractions.',
  amenities: [
    { icon: 'wifi', name: 'WiFi', type: 'MaterialIcons' },
    { icon: 'kitchen', name: 'Kitchen', type: 'MaterialIcons' },
    { icon: 'ac-unit', name: 'Air conditioning', type: 'MaterialIcons' },
    { icon: 'tv', name: 'TV', type: 'MaterialIcons' },
    { icon: 'local-parking', name: 'Free parking', type: 'MaterialIcons' },
    { icon: 'pool', name: 'Pool', type: 'MaterialIcons' },
    { icon: 'fitness-center', name: 'Gym', type: 'MaterialIcons' },
    { icon: 'elevator', name: 'Elevator', type: 'MaterialIcons' },
  ],
  reviews: [
    {
      user: 'Michael Chen',
      rating: 5,
      date: 'March 2024',
      comment: 'Absolutely loved our stay! The location was perfect and the apartment exceeded our expectations.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    },
    {
      user: 'Emma Rodriguez',
      rating: 5,
      date: 'February 2024',
      comment: 'Beautiful space with amazing views. Sarah was a wonderful host and very responsive.',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
    },
  ],
  rules: [
    'Check-in: After 3:00 PM',
    'Checkout: 11:00 AM',
    'No smoking',
    'No pets',
    'No parties or events',
    'Suitable for children and infants',
  ],
};

const PropertyDetailsScreen = () => {
  const { theme } = useTheme();
  const {query} = useLocalSearchParams()
  const colors = theme.colors;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const scrollViewRef = useRef(null);
  const navigation = useNavigation()
  const [amenitiesModal, showAmenitiesModal] = useState(false)
  const { toggleFavorite, isFavorite } = useFavoritesStore();  

  // console.log({query})
  const {data, loading, error, refetch} = useGetProperty(parseInt(`${query}`))
  // const [isFav, setFav] = useState(isFavorite(data?.id))
  const isFav = () => isFavorite(data?.id);


  const handleToggleFavorite = useCallback(() => {
    toggleFavorite(data?.id);
  }, [data?.id, toggleFavorite]);

  
  console.log({data: data?.property?.realtor.created_at})
  // console.log({p: property.amenities, error})


  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this amazing property: ${propertyData.title}`,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const renderStars = (rating:any) => {
    return [...Array(5)].map((_, i) => (
      <Ionicons
        key={i}
        name={i < Math.floor(rating) ? 'star' : 'star-outline'}
        size={14}
        color={colors.warning || '#F59E0B'}
      />
    ));
  };

  if (!loading && (error || !data)) {
    return <ErrorState onRetry={refetch} retryText='Refetch'/>
  }

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }  
  // const isFav = () => isFavorite(data?.id);

  // console.log(isFav)



  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />
      
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Image Gallery */}
        <View style={styles.imageGallery}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setCurrentImageIndex(index);
            }}
            scrollEventThrottle={16}
          >
            {propertyData.images.map((image, index) => (
              <Image
                key={index}
                source={{ uri: image }}
                style={styles.image}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
          
          {/* Image Indicators */}
          <View style={styles.imageIndicators}>
            {propertyData.images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  {
                    backgroundColor: currentImageIndex === index ? '#FFFFFF' : 'rgba(255,255,255,0.5)',
                  },
                ]}
              />
            ))}
          </View>

          {/* Header Buttons */}
          <View style={styles.headerButtons}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
                <Ionicons name="share-outline" size={22} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerButton} onPress={() => handleToggleFavorite()}>
                <Ionicons name={isFav() ? "heart": "heart-outline"} size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Property Overview */}
        <View style={[styles.section, { backgroundColor: colors.background }]}>
          <Text style={[styles.title, { color: colors.text }]}>
            {data.name}
          </Text>
          
          <View style={styles.overviewRow}>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color={colors.warning || '#F59E0B'} />
              <Text style={[styles.rating, { color: colors.text }]}>
                {propertyData.rating}
              </Text>
              <Text style={[styles.reviewCount, { color: colors.textSecondary }]}>
                ({propertyData.reviewCount} reviews)
              </Text>
            </View>
            <Text style={[styles.location, { color: colors.textSecondary }]}>
              {data.property.address?.city}, {data.property.address?.country}
            </Text>
          </View>

          <View style={[styles.detailsRow, { borderTopColor: colors.border }]}>
            <View style={styles.detailItem}>
              <Ionicons name="people-outline" size={20} color={colors.icon} />
              <Text style={[styles.detailText, { color: colors.text }]}>
                {data.capacity} guests
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="bed-outline" size={20} color={colors.icon} />
              <Text style={[styles.detailText, { color: colors.text }]}>
                {data.bedCount} beds
              </Text>
            </View>
            <View style={styles.detailItem}>
              <MaterialIcons name="bathtub" size={20} color={colors.icon} />
              <Text style={[styles.detailText, { color: colors.text }]}>
                {data.bathroomCount} baths
              </Text>
            </View>
          </View>
        </View>

        {/* Divider */}
        <View style={[styles.divider, { borderBottomColor: colors.border }]} />

        {/* Host Information */}
        <View style={[styles.section, { backgroundColor: colors.background }]}>
          <View style={styles.hostHeader}>
            <View style={styles.hostInfo}>
              <Image
                source={{ uri: propertyData.host.image }}
                style={styles.hostImage}
              />
              <View>
                <View style={styles.hostNameRow}>
                  <Text style={[styles.hostName, { color: colors.text }]}>
                    Hosted by {data.property.realtor.name}
                  </Text>
                  {propertyData.host.verified && (
                    <MaterialIcons name="verified" size={16} color={colors.accent} />
                  )}
                </View>
                <Text style={[styles.hostJoined, { color: colors.textSecondary }]}>
                  {/* {propertyData.host.joined} */} Joined in {formatDate({timeStamp: data?.property?.realtor.created_at, extract: {year: true}})}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.contactButton, { borderColor: colors.border }]}
            >
              <Text style={[styles.contactButtonText, { color: colors.text }]}>
                Contact
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.divider, { borderBottomColor: colors.border }]} />

        <View style={[styles.section, { gap: 15,}]}>
          <View style={{flexDirection: 'row', alignItems:'center', gap: 10,}}>                          
            <Image source={require('@/assets/images/host-avatar.jpg')} style={{width: 50, height: 50, borderRadius: '50%'}} />
            <View style={{justifyContent: 'space-between', flexWrap: 'wrap', flex:1}}>
              <ThemedText type='defaultSemiBold'>Hosted by {data.property.realtor.name}</ThemedText>
              <ThemedText secondary style={{flexShrink: 1, width: '100%'}}>Superhost • {timeDifference(data?.property?.realtor.created_at)} hosting </ThemedText>
            </View>
          </View>
          <View style={{flexDirection: 'row', alignItems:'center', gap: 10,}}>                          
            <Ionicons name='home-outline' size={40} color={theme.colors.text} />
            <View style={{justifyContent: 'space-between', flexWrap: 'wrap', flex:1}}>
              <ThemedText style={{textTransform: 'capitalize'}} type='defaultSemiBold'>{data.property.property_type} </ThemedText>
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
        
        <View style={[styles.divider, { borderBottomColor: colors.border }]} />

        {/* Description */}
        <View style={[styles.section, { backgroundColor: colors.background }]}>
          {/* <Text style={[styles.sectionTitle, { color: colors.text }]}>
            About this place
          </Text> */}
          <Text style={[styles.description, { color: colors.text }]}>
            {data.description?.length! < 20? data.description : propertyData.description}
          </Text>

          {true && <TouchableOpacity
            style={[styles.showMoreButton, { backgroundColor: colors.border, borderWidth: 0 }]}
            onPress={() => setShowAllAmenities(!showAllAmenities)}
          >
            <Text style={[styles.showMoreText, { color: colors.text }]}>
              Show more
            </Text>
          </TouchableOpacity>}
        </View>

        <View style={[styles.divider, { borderBottomColor: colors.border }]} />

        {/* Amenities */}
        <View style={[styles.section, { backgroundColor: colors.background }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            What this place offers
          </Text>
          <View style={styles.amenitiesGrid}>
            {/* {(showAllAmenities ? propertyData.amenities : propertyData.amenities.slice(0, 6)).map((amenity, index) => (
              <View key={index} style={styles.amenityItem}>
                <Text style={[styles.amenityText, { color: colors.text }]}>
                  {amenity.name}
                </Text>
              </View>
            ))} */}
            {(data?.amenities)?.map((amenity:string, index: number) => (
              <View key={index} style={styles.amenityItem}>
                {/* <MaterialIcons name={amenity.icon} size={24} color={colors.icon} /> */}
                <Text style={[styles.amenityText, { color: colors.text }]}>
                  {amenity}
                </Text>
              </View>
            ))}
          </View>
          {propertyData.amenities.length > 6 && (
            <TouchableOpacity
              style={[styles.showMoreButton, { borderColor: colors.border }]}
              onPress={() => setShowAllAmenities(!showAllAmenities)}
            >
              <Text style={[styles.showMoreText, { color: colors.text }]}>
                {showAllAmenities ? 'Show less' : `Show all ${propertyData.amenities.length} amenities`}
              </Text>
            </TouchableOpacity>
          )}

          <AmenitiesModal isVisible={showAllAmenities} onClose={() => setShowAllAmenities(false)} />
        </View>

        <View style={[styles.divider, { borderBottomColor: colors.border }]} />

        {/* Reviews */}
        <View style={[styles.section, { backgroundColor: colors.background }]}>
          <View style={styles.reviewsHeader}>
            <View style={styles.ratingLarge}>
              <Ionicons name="star" size={20} color={colors.warning || '#F59E0B'} />
              <Text style={[styles.ratingLargeText, { color: colors.text }]}>
                {propertyData.rating}
              </Text>
              <Text style={[styles.reviewCountLarge, { color: colors.textSecondary }]}>
                · {propertyData.reviewCount} reviews
              </Text>
            </View>
          </View>

          {propertyData.reviews.map((review, index) => (
            <View key={index} style={styles.reviewItem}>
              <View style={styles.reviewHeader}>
                <Image source={{ uri: review.avatar }} style={styles.reviewAvatar} />
                <View style={styles.reviewHeaderText}>
                  <Text style={[styles.reviewUser, { color: colors.text }]}>
                    {review.user}
                  </Text>
                  <Text style={[styles.reviewDate, { color: colors.textSecondary }]}>
                    {review.date}
                  </Text>
                </View>
              </View>
              <View style={styles.reviewStars}>
                {renderStars(review.rating)}
              </View>
              <Text style={[styles.reviewComment, { color: colors.textSecondary }]}>
                {review.comment}
              </Text>
            </View>
          ))}

          <TouchableOpacity style={[styles.showMoreButton, { borderColor: colors.border }]}>
            <Text style={[styles.showMoreText, { color: colors.text }]}>
              Show all {propertyData.reviewCount} reviews
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.divider, { borderBottomColor: colors.border }]} />

        {/* Location */}
        <View style={[styles.section, { backgroundColor: colors.background }]}>
          <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>
            Where you'll be
          </Text>
          <ThemedText style={{paddingTop: 10, paddingBottom: 15}}>{data.property.address?.city + ", " + data.property.address?.country} </ThemedText>
          <View style={[styles.mapPlaceholder, { backgroundColor: colors.backgroundSec }]}>
            <MaterialIcons name="location-on" size={40} color={colors.primary} />
            <Text style={[styles.mapText, { color: colors.textSecondary }]}>
              {data.property.address?.city + ", " + data.property.address?.country}
            </Text>
          </View>
        </View>

        <View style={[styles.divider, { borderBottomColor: colors.border }]} />

        {/* host Information */}
        <View style={[styles.section, { backgroundColor: colors.background }]}>
          <ThemedText style={[styles.sectionTitle]}>Hosted by {data.property.realtor.name}</ThemedText>

          <TouchableOpacity onPress={() => router.push('/host_profile/[]')} style={[styles.shadow, {width: '98%', height: 230, borderRadius: 20, borderWidth: 0, padding: 20, paddingHorizontal: 30, flexDirection: 'row', 
            backgroundColor: theme.mode == 'dark'? theme.colors.backgroundSec: theme.colors.background,
          }]}>
            <View style={{height: '100%', width: '40%', justifyContent: 'center', alignItems:'center', }}>
              <Image
                source={require('@/assets/images/host-avatar.jpg')} // Replace with actual host image
                style={styles.hostAvatar}
              />
              <ThemedText type='title'>{data.property.realtor.name}</ThemedText>
              <ThemedText type='defaultSemiBold'>SuperHost</ThemedText>
            </View>
            <Line orientation='vertical' style={{marginHorizontal: 40}} />
            <View style={{ justifyContent: 'space-evenly'}}>
              <View>
                <ThemedText type='subtitle'>3.5</ThemedText>
                <StarRating rating={3.5} />
              </View>
              <View>
                {timeDifference(data?.property?.realtor.created_at).split(' ').map((f, index) => (<React.Fragment key={index}>
                  {
                    f.length <= 2 
                      ? <ThemedText type='subtitle'>{f}</ThemedText>
                      : <ThemedText type='defaultSemiBold' style={{color: theme.colors.textSecondary, textTransform: 'capitalize'}}>{f}</ThemedText>
                  }
                </React.Fragment>
                ))}
              </View>
              <View>
                <ThemedText type='subtitle'>321</ThemedText>
                <ThemedText type='defaultSemiBold' style={{color: theme.colors.textSecondary}}>Reviews</ThemedText>
              </View>
            </View>
          </TouchableOpacity>

          <ThemedText type='body' style={{paddingTop: 20, paddingBottom: 10}}>
            Hi, I'm Andrea, a citizen of the world, I love to travel, meeting people and different cultures. Since 2015 I joined Airbnb and I appreciate its philosophy, I had a great time, I have memories of friends in the countries where I used it. When my parents passed away, I found myself the owner of two houses and I am offering my available accommodation in what used to be my grandparents’ house. 
          </ThemedText>

          <View style={{gap: 5}}>
            <ThemedText type='defaultSemiBold' >Andrea is a Superhost</ThemedText>
            <ThemedText secondary >
              Superhosts are experienced, highly rated hosts who are committed to providing great stays for guests.
            </ThemedText>
            <ThemedText secondary>Response rate: 100%</ThemedText>
            <ThemedText secondary>Responds within an hour</ThemedText>
          </View>

          <TouchableOpacity
            style={[styles.showMoreButton, { backgroundColor: colors.border, borderWidth: 0 }]}
            onPress={() => setShowAllAmenities(!showAllAmenities)}
          >
            <Text style={[styles.showMoreText, { color: colors.text }]}>
              Message {propertyData.host.name.split(' ')[0]}
            </Text>
          </TouchableOpacity>
        </View>

        {/* House Rules */}
        {/* <View style={[styles.section, { backgroundColor: colors.background }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Things to know
          </Text>
          {propertyData.rules.map((rule, index) => (
            <View key={index} style={styles.ruleItem}>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={colors.success}
              />
              <Text style={[styles.ruleText, { color: colors.textSecondary }]}>
                {rule}
              </Text>
            </View>
          ))}
        </View> */}

        {/* Bottom Spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Sticky Booking Bar */}
      <View style={[styles.bookingBar, { 
        backgroundColor: colors.card,
        borderTopColor: colors.border,
        shadowColor: colors.shadow,
      }]}>
        <View style={styles.priceContainer}>
          <Text style={[styles.price, { color: colors.text }]}>
            ${data.derivedPrice || data.basePrice}
            <Text style={[styles.priceLabel, { color: colors.textSecondary, textTransform: 'capitalize' }]}>
              {' '}/ {data?.duration}
            </Text>
          </Text>
          <View style={styles.priceRating}>
            <Ionicons name="checkbox-sharp" size={14} color={colors.accent} />
            <Text style={[styles.priceRatingText, { color: colors.text }]}>
              Free cancellation
            </Text>
          </View>
        </View>
        {/* <TouchableOpacity onPress={() => console.log('sisoi')} */}
        <TouchableOpacity 
          onPress={() => router.push({
            pathname: '/(guest)/(modals)/reserve/[query]',
            params: {query: data.id}
          })}
          // onPress={() => router.push('/ge')}
          style={[styles.reserveButton, { backgroundColor: colors.primary }]}
        >
          <Text style={styles.reserveButtonText}>Check availability</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  imageGallery: {
    height: height * 0.4,
    position: 'relative',
  },
  image: {
    width: width,
    height: height * 0.4,
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  headerButtons: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 8,
  },
  overviewRow: {
    marginBottom: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  rating: {
    fontSize: 15,
    fontWeight: '600',
  },
  reviewCount: {
    fontSize: 14,
  },
  location: {
    fontSize: 14,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 20,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 15,
  },
  divider: {
    borderBottomWidth: 1,
    marginHorizontal: 20
  },
  hostHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hostInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  hostImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  hostNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  hostName: {
    fontSize: 16,
    fontWeight: '600',
  },
  hostJoined: {
    fontSize: 13,
    marginTop: 2,
  },
  contactButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  contactButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
  },
  amenitiesGrid: {
    gap: 16,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  amenityText: {
    fontSize: 15,
  },
  showMoreButton: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  showMoreText: {
    fontSize: 15,
    fontWeight: '600',
  },
  reviewsHeader: {
    marginBottom: 20,
  },
  ratingLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingLargeText: {
    fontSize: 18,
    fontWeight: '700',
  },
  reviewCountLarge: {
    fontSize: 16,
  },
  reviewItem: {
    marginBottom: 24,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  reviewHeaderText: {
    flex: 1,
  },
  reviewUser: {
    fontSize: 15,
    fontWeight: '600',
  },
  reviewDate: {
    fontSize: 13,
    marginTop: 2,
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: 8,
  },
  reviewComment: {
    fontSize: 14,
    lineHeight: 20,
  },
  mapPlaceholder: {
    height: 200,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  mapText: {
    fontSize: 15,
    fontWeight: '500',
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  ruleText: {
    fontSize: 15,
    flex: 1,
  },
  bookingBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 40,
    // borderTopWidth: 1,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  priceContainer: {
    flex: 1,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
  },
  priceLabel: {
    fontSize: 14,
    fontWeight: '400',
  },
  priceRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  priceRatingText: {
    fontSize: 13,
    fontWeight: '600',
  },
  reserveButton: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 15,
    marginLeft: 12,
  },
  reserveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  hostAvatar: {
    width: 110,
    height: 110,
    borderRadius: '50%',
  },
  shadow: {
    shadowOffset: { width: 0, height: 0},
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowColor: '#000',
    elevation: 6,
  },
});

export default PropertyDetailsScreen;

