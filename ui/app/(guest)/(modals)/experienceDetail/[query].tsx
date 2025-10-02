import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Line } from '@/components/ui/Line';
import StarRating from '@/components/ui/StarRating';
import { useTheme } from '@/theme/theme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image, ImageStyle } from 'expo-image';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { MapPin } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  Dimensions,
  DimensionValue,
  FlatList,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';

// Types based on DB schema
interface Address {
  id: number;
  street: string;
  city: { id: number; name: string; country: { id: number; name: string; code: string } };
  postal_code?: string;
  latitude?: number;
  longitude?: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  description?: string;
  phone?: string;
  address_id?: number;
}

interface ExperienceImage {
  id: number;
  url: string;
  caption?: string;
}

interface ExperienceItinerary {
  id: number;
  day: number;
  description: string;
  start_time?: string;
  end_time?: string;
  activity?: Activity[]
}

interface Activity {
  id: number;
  title: string;
  description?: string;
  duration_minutes?: number;
  thumbnail_url?: string;
  location?: string;
}

interface ExperienceFAQ {
  id: number;
  question: string;
  answer: string;
}

interface ExperienceReview {
  id: number;
  user: { id: number; name: string };
  rating: number;
  comment?: string;
  created_at: string;
}

interface Experience {
  id: number;
  host: User;
  title: string;
  brief_bio: string;
  category: string;
  years_of_experience: number;
  professional_title: string;
  price: number;
  group_size_min: number;
  group_size_max: number;
  duration_minutes: number;
  experience_overview: string;
  cancellation_policy?: string;
  address: Address;
  images: ExperienceImage[];
  itineraries: ExperienceItinerary[];
  faqs: ExperienceFAQ[];
  reviews: ExperienceReview[];
}

// Mock data (replace with API call in production)
const mockExperience: Experience = {
  id: 1,
  host: {
    id: 1,
    name: 'Jane Doe',
    email: 'jane@example.com',
    description: 'Passionate local guide with 10 years of experience.',
  },
  title: 'Culinary Tour of Lagos',
  brief_bio: 'Expert chef and food historian',
  category: 'Food & Drink',
  years_of_experience: 10,
  professional_title: 'Chef & Guide',
  price: 75.0,
  group_size_min: 2,
  group_size_max: 8,
  duration_minutes: 180,
  experience_overview: 'Explore the vibrant food scene of Lagos with a local chef...',
  cancellation_policy: 'Free cancellation up to 48 hours before the event.',
  address: {
    id: 1,
    street: '123 Market Street',
    city: { id: 1, name: 'Lagos', country: { id: 1, name: 'Nigeria', code: 'NG' } },
    latitude: 6.5244,
    longitude: 3.3792,
  },
  images: [
    { id: 1, url: require('@/assets/images/image.png'), caption: 'Local market' },
    { id: 2, url: require('@/assets/images/image.png'), caption: 'Cooking class' },
    { id: 3, url: require('@/assets/images/image.png'), caption: 'Food tasting' },
    { id: 4, url: require('@/assets/images/image.png'), caption: 'Group dining' },
  ],
  itineraries: [
    {
      id: 1,
      day: 1,
      description: 'Visit Lekki Market to discover fresh local ingredients.',
      start_time: '09:00',
      end_time: '11:00',
      activity: [
        {
          id: 1,
          title: 'Market Tour',
          description: 'Guided tour through Lekki Market to learn about spices and produce.',
          duration_minutes: 90,
          thumbnail_url: 'https://example.com/images/market-tour.jpg',
          location: 'Lekki Market, Lagos',
        },
        {
          id: 2,
          title: 'Ingredient Selection',
          description: 'Select fresh ingredients with the chef’s guidance.',
          duration_minutes: 30,
          thumbnail_url: 'https://example.com/images/ingredient-selection.jpg',
          location: 'Lekki Market, Lagos',
        },
      ],
    },
    {
      id: 2,
      day: 1,
      description: 'Hands-on cooking class to prepare authentic Nigerian dishes.',
      start_time: '11:30',
      end_time: '13:00',
      activity: [
        {
          id: 3,
          title: 'Cooking Egusi Soup',
          description: 'Learn to cook traditional Egusi soup with local techniques.',
          duration_minutes: 60,
          thumbnail_url: 'https://example.com/images/egusi-soup.jpg',
          location: 'Chef’s Kitchen Studio, Lagos',
        },
        {
          id: 4,
          title: 'Jollof Rice Masterclass',
          description: 'Master the art of Nigerian jollof rice.',
          duration_minutes: 30,
          thumbnail_url: 'https://example.com/images/jollof-rice.jpg',
          location: 'Chef’s Kitchen Studio, Lagos',
        },
      ],
    },
    {
      id: 3,
      day: 1,
      description: 'Enjoy a communal dining experience with your creations.',
      start_time: '13:30',
      end_time: '14:30',
      activity: [
        {
          id: 5,
          title: 'Group Dining',
          description: 'Savor your dishes with the group and share stories.',
          duration_minutes: 60,
          thumbnail_url: 'https://example.com/images/group-dining.jpg',
          location: 'Chef’s Kitchen Studio, Lagos',
        },
      ],
    },
  ],
  faqs: [
    {
      id: 1,
      question: 'What should I bring to the tour?',
      answer: 'Wear comfortable shoes, bring a reusable water bottle, and come with an appetite!',
    },
    {
      id: 2,
      question: 'Is the tour suitable for children?',
      answer: 'Yes, children above 10 are welcome, but please inform us in advance.',
    },
    {
      id: 3,
      question: 'Are dietary restrictions accommodated?',
      answer: 'Absolutely, please notify us of any dietary needs at least 48 hours in advance.',
    },
  ],
  reviews: [
    {
      id: 1,
      user: { id: 2, name: 'John Smith' },
      rating: 5,
      comment: 'An incredible experience! Jane’s knowledge of Nigerian cuisine is unmatched.',
      created_at: '2025-08-01T12:00:00Z',
    },
    {
      id: 2,
      user: { id: 3, name: 'Aisha Bello' },
      rating: 4,
      comment: 'Loved the cooking class, though the market was a bit crowded.',
      created_at: '2025-08-15T14:30:00Z',
    },
    {
      id: 3,
      user: { id: 4, name: 'Michael Chen' },
      rating: 5,
      comment: 'Best food tour I’ve ever done. Highly recommend!',
      created_at: '2025-09-01T09:00:00Z',
    },
  ],
};

// ImageCarousel Component (reused from previous conversation)
interface CarouselProps {
  images: string[];
  width?: DimensionValue;
  imageHeight?: DimensionValue;
  showNumber?: boolean;
  modal?: boolean;
  style?: ImageStyle;
  uri?: boolean;
}


const { width } = Dimensions.get('window');

// ExperienceDetailScreen Component
const ExperienceDetailScreen = () => {
  const { theme } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [experience, setExperience] = useState<Experience | null>(null);
  const navigation = useNavigation()
  const [collapsedSections, setCollapsedSections] = useState({
    overview: true,
    itinerary: true,
    faqs: true,
  });

  // Simulate fetching data based on id (replace with API call)
  useEffect(() => {
    // Fetch experience data using id
    setExperience(mockExperience); // Replace with API call
  }, [id]);

  if (!experience) {
    return <ThemedView style={styles.container}><ThemedText>Loading...</ThemedText></ThemedView>;
  }

  const toggleSection = (section: keyof typeof collapsedSections) => {
    setCollapsedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const averageRating = experience.reviews.length
    ? (experience.reviews.reduce((sum, review) => sum + review.rating, 0) / experience.reviews.length).toFixed(1)
    : 'No reviews';

    // return(
    //   <Appss />
    // )
  return (
    <ThemedView style={{flex:1, paddingTop: 50, paddingHorizontal: 16, }}>
      <View style={{flexDirection: 'row', alignItems:'center', justifyContent: 'space-between', paddingBottom: 5, borderBottomWidth: 1, borderColor: theme.colors.border}}>
        <TouchableOpacity onPress={() => {if (navigation.canGoBack()) navigation.goBack()}} style={{zIndex:10}}>
          <Ionicons name='arrow-back' color={theme.colors.text} size={30} />
        </TouchableOpacity>
        <ThemedText style={{ zIndex: 1,flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '600', position: 'absolute', width: width-32, }}> {mockExperience.category} in Taulser </ThemedText>
        <View style={{flexDirection: 'row', gap: 10, alignItems: 'center'}}>
          <Ionicons name='share-outline' color={theme.colors.text} size={28} />
          <Ionicons name={true ? 'heart' : 'heart-outline'} color={theme.colors.primary} size={28} />
        </View>
      </View>

      <ScrollView style={{paddingTop: 5,}} contentContainerStyle={{paddingBottom: 50}} showsVerticalScrollIndicator={false}>
        <View style={{gap: 3, paddingBottom: 10}}>
          <Image
            source={{uri: 'https://res.cloudinary.com/dajzo2zpq/image/upload/v1752247182/properties/wlf2uijbultztvqptnka.jpg'}}
            style={{width: '100%', borderTopLeftRadius: 12, borderTopRightRadius: 12, height: 160}}
            contentFit='cover'
          />
          <View style={{ flexDirection: 'row', gap: 3, alignItems: 'center', }}>
            <Image
              source={{uri: 'https://res.cloudinary.com/dajzo2zpq/image/upload/v1752247182/properties/wlf2uijbultztvqptnka.jpg'}}
              style={{ flex: 1, borderBottomLeftRadius: 12, height: 140}}
              contentFit='cover'
            />
            <Image
              source={{uri: 'https://res.cloudinary.com/dajzo2zpq/image/upload/v1752247182/properties/wlf2uijbultztvqptnka.jpg'}}
              style={{flex: 1, borderBottomRightRadius: 12, height: 140}}
              contentFit='cover'
            />
          </View>
          {/* <MaterialCommunityIcons name='arrow-expand' color={theme.colors.text} size={28} style={[styles.shadow, {position:'absolute', bottom: 10, right: 10, padding: 7, }]} /> */}
          <MaterialCommunityIcons name='arrow-expand' color={theme.colors.text} size={24} style={[styles.shadow, {position:'absolute', bottom: 20, right: 10, padding: 5, borderRadius: '50%', backgroundColor: theme.colors.background}]} />
        </View>
        
        {/* <View style={{paddingTop: 10, }}> */}

          <View style={[ {padding: 10, borderRadius: 12, gap: 10, backgroundColor: theme.colors.backgroundSec}]}>
            <View>
              <ThemedText type='subtitle'> {mockExperience.title} </ThemedText>
              <ThemedText style={{borderBottomWidth: 1, borderColor: theme.colors.border, paddingBottom: 5}}> {mockExperience.experience_overview} </ThemedText>
            </View>

            <View style={{flexDirection: 'row', alignItems:'center', gap: 10, borderBottomWidth: 1, borderColor: theme.colors.border, paddingBottom: 5}}>
              
              <Image source={require('@/assets/images/host-avatar.jpg')} style={{width: 50, height: 50, borderRadius: '50%'}} />
              <View style={{justifyContent: 'space-between', flexWrap: 'wrap', flex:1}}>
                <ThemedText type='defaultSemiBold'>{mockExperience.host.name}. {mockExperience.professional_title} </ThemedText>
                <ThemedText style={{flexShrink: 1, width: '100%'}}>{mockExperience.host.description} </ThemedText>
              </View>
            </View>

            <View style={{flexDirection: 'row', alignItems:'center', gap: 10,}}>
              <View style={[styles.shadow, {padding: 5, backgroundColor: theme.colors.backgroundSec, borderRadius: 12}]}><MapPin size={40} color={theme.colors.text}/></View>
              {/* <Image source={require('@/assets/images/map.jpg')} style={[styles.shadow, {width: 50, height: 50, borderRadius: 15,backgroundColor: 'white', shadowColor: '#fff'}]} /> */}
              <View style={{justifyContent: 'space-between', flexWrap: 'wrap', flex:1}}>
                <ThemedText type='defaultSemiBold'>{mockExperience.address.city.name}. Delta </ThemedText>
                <ThemedText>{mockExperience.address.city.country.name} </ThemedText>
              </View>
            </View>
          </View>
          

          <Line orientation='horizontal' style={{marginVertical: 10}} />

          <View>
            <ThemedText type='subtitle' style={{paddingBottom: 10}}>What you'll do </ThemedText>
            {[0,1,2,3].map((item, index) => (
              <View key={index} style={{flexDirection: 'row', alignItems:'center', gap: 10, marginVertical: 5}} >
                {/* <View style={[styles.shadow, {padding: 0, backgroundColor: theme.colors.backgroundSec, borderRadius: 12}]}> */}
                  <Image source={require('@/assets/images/map.jpg')} style={{width: 70, height: 70, borderRadius: 12}} />
                {/* </View> */}
                <View style={{justifyContent: 'space-evenly', flexWrap: 'wrap', flex:1, height: 70}}>
                  <ThemedText type='defaultSemiBold'>{mockExperience?.itineraries[0]?.activity![0].title} </ThemedText>
                  <ThemedText secondary style={styles.description}>{mockExperience?.itineraries[0]?.activity![0].description} </ThemedText>
                </View>
              </View>
            ))}
          </View>

          <Line orientation='horizontal' style={{marginVertical: 10,}} />


          <View>
            <ThemedText type='subtitle' style={{paddingBottom: 15}}>Where you'll be</ThemedText>
            <View>
              <Image source={require('@/assets/images/map.jpg')} style={{width: '100%', height: 400, borderRadius: 25}} />
            </View>
            <ThemedText type='defaultSemiBold' style={{textAlign:'center', paddingVertical: 5}}>{mockExperience.address.city.name} Delta State . {mockExperience.address.city.country.name} </ThemedText>

          </View>

          <Line orientation='horizontal' style={{marginVertical: 10,}} />

          <View>
            <ThemedText type='subtitle' style={{paddingBottom: 15}}>Reviews & Reviews </ThemedText>
            <FlatList 
              data={mockExperience.reviews}
              renderItem={({item, index}) => (
                <View style={[ {padding: 15, borderRadius: 12, gap: 7, backgroundColor: theme.colors.background2, width:width*0.869, shadowColor: theme.colors.shadow}]}>
                  <View style={{flexDirection: 'row', alignItems:'center', gap: 10, }}>
              
                    <Image source={require('@/assets/images/host-avatar.jpg')} style={{width: 45, height: 45, borderRadius: '50%'}} />
                    <View style={{justifyContent: 'space-between', flexWrap: 'wrap', flex:1}}>
                      <ThemedText type='defaultSemiBold'>{item.user.name} </ThemedText>
                      <ThemedText secondary>{mockExperience.address.city.country.name} </ThemedText>
                    </View>
                  </View>
                  <View style={{flexDirection:'row', alignItems:'center', gap: 3}}>
                    <StarRating rating={item.rating}/>
                    <MaterialCommunityIcons name='circle' color={theme.colors.textSecondary} size={5} />
                    <ThemedText>{'3 days ago'} </ThemedText>
                  </View>
                  <ThemedText style={{color: theme.colors.textSecondary}}>{item.comment} </ThemedText>
                </View>
              )}
              keyExtractor={(index) => index.id.toString()}
              pagingEnabled
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{gap: 10, }}
            />
            <TouchableOpacity style={{padding: 10, backgroundColor: theme.colors.background2, marginVertical: 10, justifyContent:'center', alignItems:'center', borderRadius: 16}}>
              <ThemedText type='defaultSemiBold'>Show More</ThemedText>
            </TouchableOpacity>
          </View>

          <Line orientation='horizontal' style={{marginVertical: 10,}} />

          <View >
            <ThemedText type='subtitle' style={{paddingBottom: 15}}>Availability </ThemedText>

            {/* <View style={{overflow: 'scroll', flexDirection: 'row', alignItems:'center', gap: 10}}>
              {[0,1,2,3].map((item, index) => (
                <View key={index} style={{padding: 10, borderRadius: 12, borderWidth: 1, width: 200,  borderColor: theme.colors.border}}>

                </View>
              ))}
            </View> */}

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{gap: 10}}
              snapToInterval={200 + 10} // Item width + gap
              snapToAlignment="start"
              decelerationRate="fast"
            >
              {[0, 1, 2, 3].map((item, index) => (
                <View
                  key={index}
                  style={[styles.shadow1, { padding: 10, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border, width: 200, gap: 10 }]} // Adjusted width for partial visibility
                >
                  <View>
                    <ThemedText type='defaultSemiBold' style={{fontSize: 16}}>Wednesday,</ThemedText>
                    <ThemedText type='defaultSemiBold' style={{fontSize: 16}}>September 2nd</ThemedText>
                  </View>
                  <ThemedText secondary>10AM - 12AM</ThemedText>
                  <ThemedText secondary type='defaultSemiBold'>7 spots Available</ThemedText>
                  
                </View>
              ))}
            </ScrollView>
          </View>

          <Line orientation='horizontal' style={{marginVertical: 10,}} />

          <View>
            <ThemedText type='subtitle' style={{paddingBottom: 15}}>Requirements </ThemedText>


          </View>

          <Line orientation='horizontal' style={{marginVertical: 10,}} />

          <View>
            <ThemedText type='subtitle' style={{paddingBottom: 15}}>About your host </ThemedText>

            <View style={{flexDirection: 'row', gap: 15, alignItems:'flex-end'}}>
              <TouchableOpacity style={[styles.shadow1, { marginLeft: 4, width: '43%', height: 160, justifyContent: 'center', alignItems: 'center', borderRadius: 20, backgroundColor: theme.colors.background}]}>
                <Image source={require('@/assets/images/host-avatar.jpg')} style={{width: 100, height: 100, borderRadius: '50%'}} />
              </TouchableOpacity>
              {/* 20 words */}
              <ThemedText style={{flexShrink:1, fontSize: 17}}><ThemedText type='defaultSemiBold'>Lorem ipsum dolor</ThemedText> sit amet consectetur adipisicing elit. Corrupti pariatur dolore dolorum possimus iste vel 
                excepturi quas facilis reiciendis recusandae.
              </ThemedText>
            </View>

            <ThemedText type='body' style={{paddingTop:10, fontSize: 16}}>
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Soluta quod voluptatibus adipisci earum ab porro. Sint assumenda facilis, obcaecati dolorem asperiores
               corrupti nisi cumque eveniet in, omnis dolorum suscipit rem maxime itaque illo velit necessitatibus veritatis, quam iusto delectus sequi nemo distinctio. Iste
                officiis minus molestias iusto laudantium vel libero!
            </ThemedText>

            <TouchableOpacity style={{padding: 10, backgroundColor: theme.colors.background2, marginVertical: 10, justifyContent:'center', alignItems:'center', borderRadius: 12}}>
              <ThemedText type='defaultSemiBold'>Message {mockExperience.host.name}</ThemedText>
            </TouchableOpacity>

          </View>

          <Line orientation='horizontal' style={{marginVertical: 10,}} />

        {/* </View> */}
      </ScrollView>
    </ThemedView>
  );

};

const styles = StyleSheet.create({
  title: {
    flexShrink: 1,
    width: '100%',
    textAlign: 'left',
    margin: 0,
    padding: 0,
  },
  description: {
    flexShrink: 1,
    width: '100%',
    textAlign: 'left',
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerButton: {
    padding: 8,
  },
  shadow: {
    shadowOffset: { width: 0, height: 1},
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 6,
  },
  shadow1: {
    shadowOffset: { width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 6,
    
  },
});

export default ExperienceDetailScreen;
