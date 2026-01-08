import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Line } from '@/components/ui/Line';
import { useTheme } from '@/theme/theme';
import { Entypo, FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useNavigation } from 'expo-router';
import { Dimensions, FlatList, Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('screen');
const CARD_PADDING = 16;
const IMAGE_SIZE = 100;

export default function HostProfile() {
    const navigation = useNavigation()
    const {theme} = useTheme()
   const infoItems = [
  { icon: () => <MaterialCommunityIcons name="school" size={20} color={theme.colors.text} />, text: 'Where I went to school: Paris I SORBONNE, Paris XI ORSAY' },
  { icon: () => <Entypo name="map" size={20} color={theme.colors.text} />, text: "Where I’ve always wanted to go: CANADA" },
  { icon: () => <FontAwesome5 name="briefcase" size={20} color={theme.colors.text} />, text: 'My work: Engineer' },
  { icon: () => <MaterialCommunityIcons name="home-edit" size={20} color={theme.colors.text} />, text: 'What makes my home unique: Value for money' },
  { icon: () => <Ionicons name="briefcase" size={20} color={theme.colors.text} />, text: 'Fun fact: Good people make life enjoyable!' },
  { icon: () => <FontAwesome5 name="music" size={20} color={theme.colors.text} />, text: 'Favourite song in school:: Win Dyusan du groupe IDLESCLUB' },
  { icon: () => <MaterialCommunityIcons name="clock-outline" size={20} color={theme.colors.text} />, text: 'I spend too much time: Lecture, Musique, Football, Voyages' },
  { icon: () => <MaterialCommunityIcons name="chat-outline" size={20} color={theme.colors.text} />, text: 'Speaks English and French' },
  { icon: () => <Ionicons name="book-outline" size={20} color={theme.colors.text} />, text: 'My biography title: The best comes to the patient.' },
  { icon: () => <Entypo name="heart-outlined" size={20} color={theme.colors.text} />, text: 'I’m obsessed with: Music, poetry, writing, and composition' },
  { icon: () => <MaterialCommunityIcons name="map-marker-outline" size={20} color={theme.colors.text} />, text: 'Lives in Paris, France' },
  { icon: () => <FontAwesome5 name="coffee" size={20} color={theme.colors.text} />, text: 'What’s for breakfast: Crescent butter and milk coffee...' },
  { icon: () => <Ionicons name="shield-checkmark-outline" size={20} color={theme.colors.text} />, text: 'Identity verified' },
  { icon: () => <MaterialCommunityIcons name="office-building" size={20} color={theme.colors.text} />, text: 'Business' },
];

const reviews = [
  { id: '1', name: 'Pablo', location: 'Pergamino, Argentina', text: 'Excellent room and bathrooms always clean.', rating: 5, time: '20 hours ago', avatar: require('@/assets/images/host-avatar.jpg') },
  { id: '2', name: 'Pablo', location: 'Pergamino, Argentina', text: 'Excellent room and bathrooms always clean.', rating: 5, time: '20 hours ago', avatar: require('@/assets/images/host-avatar.jpg') },
  { id: '3', name: 'Pablo', location: 'Pergamino, Argentina', text: 'Excellent room and bathrooms always clean.', rating: 5, time: '20 hours ago', avatar: require('@/assets/images/host-avatar.jpg') },
  { id: '4', name: 'Pablo', location: 'Pergamino, Argentina', text: 'Excellent room and bathrooms always clean.', rating: 5, time: '20 hours ago', avatar: require('@/assets/images/host-avatar.jpg') },
  { id: '5', name: 'Pablo', location: 'Pergamino, Argentina', text: 'Excellent room and bathrooms always clean.', rating: 5, time: '20 hours ago', avatar: require('@/assets/images/host-avatar.jpg') },
  // add more reviews
];

const interests = [
  { id: '1', icon: () => <MaterialCommunityIcons name="hammer-screwdriver" size={24} color={theme.colors.text} />, label: 'Building things' },
  { id: '2', icon: () => <MaterialCommunityIcons name="movie" size={24} color={theme.colors.text} />, label: 'Films' },
  { id: '3', icon: () => <MaterialCommunityIcons name="soccer" size={24} color={theme.colors.text} />, label: 'Football' },
  { id: '4', icon: () => <MaterialCommunityIcons name="flower" size={24} color={theme.colors.text} />, label: 'Gardening' },
  { id: '5', icon: () => <MaterialCommunityIcons name="hiking" size={24} color={theme.colors.text} />, label: 'Hiking' },
  { id: '6', icon: () => <MaterialCommunityIcons name="karate" size={24} color={theme.colors.text} />, label: 'Karate' },
  { id: '7', icon: () => <MaterialCommunityIcons name="meditation" size={24} color={theme.colors.text} />, label: 'Meditation' },
  { id: '8', icon: () => <Ionicons name="book-outline" size={24} color={theme.colors.text} />, label: 'Reading' },
  { id: '9', icon: () => <FontAwesome5 name="microphone-alt" size={24} color={theme.colors.text} />, label: 'Singing' },
  { id: '10', icon: () => <MaterialCommunityIcons name="airplane" size={24} color={theme.colors.text} />, label: 'Travel' },
  { id: '11', icon: () => <MaterialCommunityIcons name="walk" size={24} color={theme.colors.text} />, label: 'Walking' },
  { id: '12', icon: () => <MaterialCommunityIcons name="pencil" size={24} color={theme.colors.text} />, label: 'Writing' },
];

const listings = [
  { id: '1', title: 'Hotel', subtitle: 'Single room in a Hotel in center of Paris', rating: 4.65, reviews: 23, image: require('@/assets/images/image3.jpg') },
  { id: '2', title: 'Hotel', subtitle: 'Single room b Hotel PARIS city centre EG15', rating: 4.57, reviews: 7, image: require('@/assets/images/image3.jpg') },
  { id: '3', title: 'Hotel', subtitle: 'Single room ...', rating: 4.95, reviews: 12, image: require('@/assets/images/image3.jpg') },
];
    return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
      {/* Header Card */}
      <ThemedView>
      <Pressable onPress={() => navigation.goBack()} style={{flex: 1, alignItems: 'flex-end', padding: 20}}>
        <Entypo name='cross' size={24} color={theme.colors.text} />
      </Pressable>
      <View style={[styles.card, {backgroundColor: theme.colors.background, shadowColor: theme.mode === 'dark' ? '#fff': '#000'}]}>
        <View style={{flexDirection: 'column'}}>
           <Image source={require('@/assets/images/host-avatar.jpg')} style={styles.avatar} />
           <View style={styles.headerInfo}>
              <ThemedText style={styles.name}>Madjid</ThemedText>
              <ThemedText secondary style={styles.sub}>Host</ThemedText>
            </View>
        </View>
        <View style={styles.stats} >
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>151</ThemedText>
            <ThemedText secondary style={styles.statLabel}>Reviews</ThemedText>
          </View>
          <Line style={{borderBottomWidth: 1, marginVertical: 3, borderColor: theme.colors.textSecondary}} />
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>4.73 ★</ThemedText>
            <ThemedText secondary style={styles.statLabel}>Rating</ThemedText>
          </View>
          <Line style={{borderBottomWidth: 1, marginVertical: 3, borderColor: theme.colors.textSecondary}} />
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>5</ThemedText>
            <ThemedText secondary style={styles.statLabel}>Months hosting</ThemedText>
          </View>
        </View>
      </View>

      {/* Info List */}
      <View style={[styles.section, {gap: 5}]}>
        {infoItems.map((item, idx) => (
          <View key={idx} style={styles.infoRow}>
            {item.icon()}
            <ThemedText style={styles.infoText}>{item.text}</ThemedText>
          </View>
        ))}
        <ThemedText secondary style={styles.footerText}>Kindness solves all the difficulties.</ThemedText>
      </View>

      {/* Reviews Carousel */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Madjid’s reviews</ThemedText>
        <FlatList
          data={reviews}
          keyExtractor={i => i.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.reviewCard}>
              <View style={[ {flexDirection: 'row', gap: 3, alignItems: 'center'}]}>
                <Image source={item.avatar} style={styles.reviewAvatar} />
                <ThemedText style={styles.reviewName}>{item.name}</ThemedText>
              </View>
              <ThemedText style={styles.reviewMeta}>★★★★★ · {item.time}</ThemedText>
              <ThemedText secondary style={styles.reviewLoc}>{item.location}</ThemedText>
              <ThemedText secondary numberOfLines={2} style={styles.reviewText}>{item.text}</ThemedText>
            </View>
          )}
        />
        <Pressable onPress={() => router.push('/reviews/[modal]')} style={{flex: 1, justifyContent: 'center', marginTop: 20, alignItems: 'center', padding: 15, borderRadius: 20, backgroundColor: theme.colors.border} }>
          <ThemedText style={{color: theme.mode !== 'dark' ? 'white' : 'black'}}>Show more reviews</ThemedText>
        </Pressable>
      </View>

      {/* Interests Grid */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Madjid’s interests</ThemedText>
        <View style={styles.grid}>
          {interests.map(i => (
            <View key={i.id} style={[styles.gridItem, {gap:4, alignItems: 'center'}]}>
              {i.icon()}
              <ThemedText style={styles.gridText}>{i.label}</ThemedText>
            </View>
          ))}
        </View>
      </View>

      {/* Listings Carousel */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Madjid’s listings</ThemedText>
        <FlatList
          data={listings}
          keyExtractor={i => i.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.listingCard}>
              <Image source={item.image} style={styles.listingImage} />
              <ThemedText style={styles.listingTitle}>{item.title}</ThemedText>
              <ThemedText secondary style={styles.listingSub}>{item.subtitle}</ThemedText>
              <ThemedText secondary style={styles.listingMeta}>★ {item.rating} · {item.reviews} reviews</ThemedText>
            </View>
          )}
        />
        <TouchableOpacity>
          <ThemedText style={styles.link}>Show all {listings.length} listings</ThemedText>
        </TouchableOpacity>
      </View>

      <View style={{justifyContent: 'space-between', flex: 1, flexDirection: 'row', marginVertical: 30, marginHorizontal: 20}}>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 3}}>
            <Ionicons name='flag-outline' size={24} color={theme.colors.text} />
            <ThemedText>Report Madjid</ThemedText>
        </View>
        <Ionicons name='arrow-back' size={24} color={theme.colors.text}/>
      </View>
      </ThemedView>
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, },
  card: { 
     margin: CARD_PADDING, 
    borderRadius: 12, padding: CARD_PADDING,
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowOffset: { width: 0, height: 2},
    shadowOpacity: 0.2,
    marginTop: 10,
    paddingLeft: 60,
    shadowRadius: 4,
    elevation: 5
  },
  avatar: { width: IMAGE_SIZE, height: IMAGE_SIZE, borderRadius: IMAGE_SIZE / 2 },
  headerInfo: {
    flex:1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { fontSize: 24, fontWeight: 'bold' },
  sub: { fontSize: 14,  },
  stats: { flexDirection: 'column', justifyContent: 'space-between', marginTop: 16 },
  statItem: { flex: 1 },
  statValue: { fontSize: 18, fontWeight: 'bold' },
  statLabel: { fontSize: 12,  },
  section: { marginVertical: 8, marginHorizontal: CARD_PADDING },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  infoText: { marginLeft: 8, fontSize: 14, flex: 1 },
  footerText: { fontStyle: 'italic', marginTop: 8,  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  reviewCard: { 
    width: width * 0.896, padding: 12, marginRight: 12, 
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'gray',
    height: 200
    // borderRightWidth: 2
  },
  reviewAvatar: { width: 60, height: 60, borderRadius: 20 },
  reviewName: { fontWeight: 'bold', marginTop: 8 },
  reviewLoc: { fontSize: 12,  },
  reviewText: { marginTop: 4, fontSize: 14 },
  reviewMeta: { marginTop: 4, fontSize: 12, },
  link: { marginTop: 8, textDecorationLine: 'underline', fontSize: 15 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 3, marginTop: 10 },
  gridItem: { width: (width - CARD_PADDING *2) / 2 - 8, alignItems: 'center', marginBottom: 12, flexDirection: 'row'},
  gridText: { fontSize: 12, marginTop: 4, textAlign: 'center' },
  listingCard: { width: width * 0.4, marginRight: 12, marginTop: 12},
  listingImage: { width: '100%', height: 180, borderRadius: 8 },
  listingTitle: { fontWeight: 'bold', marginTop: 8 },
  listingSub: { fontSize: 12, },
  listingMeta: { fontSize: 12,  marginTop: 4 },
});
