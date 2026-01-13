import { ThemedText } from '@/components/ThemedText';
import { Line } from '@/components/ui/Line';
import { useTheme } from '@/theme/theme';
import { Entypo } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useNavigation } from 'expo-router';
import { Dimensions, FlatList, Pressable, ScrollView, StyleSheet, View } from 'react-native';

const { width } = Dimensions.get('screen');
const CARD_PADDING = 16;
const IMAGE_SIZE = 100;

export default function NModal() {
    const navigation = useNavigation()
    const {theme} = useTheme()
    // const pa: any = useLocalSearchParams()
    
    const reviews = [
      {
        id: 1,
        name: 'Janne',
        location: 'Hagen, Germany',
        rating: 4,
        update: '4 days ago',
        review: `Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequatur magnam sit doloremque ipsam quas eos incidunt. Minima consectetur dolore libero reiciendis cumque ad voluptas. Sint vero excepturi consectetur ex voluptas officiis repudiandae voluptates facere ipsam accusamus laborum, consequuntur non recusandae.`,
        response: `Lorem ipsum dolor sit amet consectetur adipisicing elit. Nam totam magni distinctio! Provident, accusantium illo.`
      },
      {
        id: 2,
        name: 'Janne',
        location: 'Hagen, Germany',
        rating: 4,
        update: '4 days ago',
        review: `Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequatur magnam sit doloremque ipsam quas eos incidunt. Minima consectetur dolore libero reiciendis cumque ad voluptas. Sint vero excepturi consectetur ex voluptas officiis repudiandae voluptates facere ipsam accusamus laborum, consequuntur non recusandae.`,
        response: `Lorem ipsum dolor sit amet consectetur adipisicing elit. Nam totam magni distinctio! Provident, accusantium illo.`
      },
      {
        id: 3,
        name: 'Janne',
        location: 'Hagen, Germany',
        rating: 4,
        update: '4 days ago',
        review: `Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequatur magnam sit doloremque ipsam quas eos incidunt. Minima consectetur dolore libero reiciendis cumque ad voluptas. Sint vero excepturi consectetur ex voluptas officiis repudiandae voluptates facere ipsam accusamus laborum, consequuntur non recusandae.`,
      },
      {
        id: 4,
        name: 'Janne',
        location: 'Hagen, Germany',
        rating: 4,
        update: '4 days ago',
        review: `Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequatur magnam sit doloremque ipsam quas eos incidunt. Minima consectetur dolore libero reiciendis cumque ad voluptas. Sint vero excepturi consectetur ex voluptas officiis repudiandae voluptates facere ipsam accusamus laborum, consequuntur non recusandae.`,
        response: `Lorem ipsum dolor sit amet consectetur adipisicing elit. Nam totam magni distinctio! Provident, accusantium illo.`
      },
    ]

    return (
    <ScrollView style={[styles.container, {backgroundColor: theme.colors.background}]} contentContainerStyle={{ paddingBottom: 20 }}>
      {/* Header Card */}
      <Pressable onPress={() => navigation.goBack()} style={{flex: 1, alignItems: 'flex-end', padding: 20}}>
        <Entypo name='cross' size={24} color={theme.colors.text} />
      </Pressable>

      <FlatList 
        data={reviews}
        scrollEnabled={false}
        renderItem={({item}) => (
          <View style={{flex: 1, gap: 3}}>
            <View style={{flexDirection: 'row', alignItems: 'center', }}>
              <Image source={require('@/assets/images/guest-avatar.jpg')} style={{width: 70, height: 70, padding: 0, margin: 0}} />
              <View>
                <ThemedText style={{fontFamily: 'bold'}}> {item.name} </ThemedText>
                <ThemedText> {item.location} </ThemedText>
              </View>
            </View>

            <View style={{flexDirection: 'row', alignItems: 'center', gap: 2, }}>
              <ThemedText>
                {'★'.repeat(item.rating)}
              </ThemedText>
              <Entypo name='dot-single' color={theme.colors.text} />
              <ThemedText> {item.update} </ThemedText>
            </View>

            <View>
              <ThemedText> {item.review} </ThemedText>

              {item.response && 
              <View style={{alignItems: 'flex-end'}}>
                <View style={{gap: 3, width: '90%'}}>
                  <ThemedText>Response from {item.name} </ThemedText>
                  <ThemedText style={{textIndent: '20', }}> {item.response} </ThemedText>

                  <View style={{flexDirection: 'row', gap: 2, alignItems: 'center'}}>
                    <Image source={require('@/assets/images/guest-avatar.jpg')} style={{width: 30, height: 30}} />
                    {/* <ThemedText>.</ThemedText> */}
                    <Entypo name='dot-single' color={theme.colors.text} />
                    <ThemedText> {item.update} </ThemedText>
                  </View>
                </View>
              </View>
              }
            </View>
          </View>
        )}

        ItemSeparatorComponent={() => (
          <Line style={{borderBottomWidth: 1, marginVertical: 20}} />
        )}
        ListFooterComponent={() => (
          <Pressable style={{flex: 1, alignItems: 'center', justifyContent: 'center', padding: 10, borderRadius: 10, backgroundColor: theme.colors.border}}>
            <ThemedText style={{color: theme.colors.background}}>Load more reviews</ThemedText>
          </Pressable>
        )}
        ListFooterComponentStyle={{marginVertical: 30}}
        ListHeaderComponent={() => (
          <ThemedText style={{fontSize: 22, fontWeight: '700'}}> {reviews.length} reviews from guests </ThemedText>
        )}
        ListHeaderComponentStyle={{marginVertical: 20}}
      />
      
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, padding: 20},
  card: { 
    margin: CARD_PADDING, 
    borderRadius: 12, padding: CARD_PADDING,
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2},
    shadowOpacity: 0.2,
    marginTop: 30,
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
  sub: { fontSize: 14, color: '#666' },
  stats: { flexDirection: 'column', justifyContent: 'space-between', marginTop: 16 },
  statItem: { flex: 1 },
  statValue: { fontSize: 18, fontWeight: 'bold' },
  statLabel: { fontSize: 12, color: '#666' },
  section: { marginVertical: 8, marginHorizontal: CARD_PADDING },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  infoText: { marginLeft: 8, fontSize: 14, flex: 1 },
  footerText: { fontStyle: 'italic', marginTop: 8, color: '#444' },
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
  reviewLoc: { fontSize: 12, color: '#666' },
  reviewText: { marginTop: 4, fontSize: 14 },
  reviewMeta: { marginTop: 4, fontSize: 12, color: 'black' },
  link: { marginTop: 8, textDecorationLine: 'underline', fontSize: 15 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 3, marginTop: 10 },
  gridItem: { width: (width - CARD_PADDING *2) / 2 - 8, alignItems: 'center', marginBottom: 12, flexDirection: 'row'},
  gridText: { fontSize: 12, marginTop: 4, textAlign: 'center' },
  listingCard: { width: width * 0.4, marginRight: 12, marginTop: 12},
  listingImage: { width: '100%', height: 180, borderRadius: 8 },
  listingTitle: { fontWeight: 'bold', marginTop: 8 },
  listingSub: { fontSize: 12, color: '#666' },
  listingMeta: { fontSize: 12, color: '#666', marginTop: 4 },
});
